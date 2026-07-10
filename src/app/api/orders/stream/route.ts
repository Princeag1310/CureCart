import { NextRequest } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/config/auth";
import { prisma } from "@/config/db";
import type { OrderStatusEvent } from "@/types/orders";

// Edge runtime: no 10-second serverless timeout — streams live as long as
// the browser keeps the connection open.
export const runtime = "edge";

// How often (ms) we query the DB to detect status changes.
const POLL_INTERVAL_MS = 4_000;

// Keepalive comment sent every interval to prevent proxies / load-balancers
// from closing an idle connection. Browsers ignore SSE comment lines.
const KEEPALIVE = ": keepalive\n\n";

/**
 * Encodes one SSE data frame.
 * Format spec: https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events
 */
function sseMessage(payload: OrderStatusEvent): string {
  return `data: ${JSON.stringify(payload)}\n\n`;
}

/**
 * Fetches only the id+status pairs for a user's orders.
 * Selecting the minimum columns keeps each poll cheap.
 */
async function fetchOrderStatuses(
  userId: string
): Promise<Map<string, string>> {
  const rows = await prisma.order.findMany({
    where: { userId },
    select: { id: true, status: true },
  });

  return new Map(rows.map((r) => [r.id, r.status]));
}

export async function GET(req: NextRequest) {
  // ── Auth ────────────────────────────────────────────────────────────────────
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const userId = session.user.id;

  // ── Stream setup ────────────────────────────────────────────────────────────
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      // Snapshot of statuses from the previous tick. We only push an event
      // when something in this map changes — no noise, no redundant renders.
      let lastKnown = await fetchOrderStatuses(userId);

      // Send the full initial snapshot so the client doesn't have to wait
      // one full poll interval before seeing anything.
      for (const [orderId, status] of lastKnown) {
        controller.enqueue(
          encoder.encode(sseMessage({ orderId, status: status as OrderStatusEvent["status"] }))
        );
      }

      // ── Polling loop ────────────────────────────────────────────────────────
      const timer = setInterval(async () => {
        // If the browser disconnected, stop polling immediately.
        if (req.signal.aborted) {
          clearInterval(timer);
          controller.close();
          return;
        }

        try {
          const current = await fetchOrderStatuses(userId);

          let hadChanges = false;

          for (const [orderId, status] of current) {
            if (lastKnown.get(orderId) !== status) {
              // Something changed — push exactly this one event.
              controller.enqueue(
                encoder.encode(
                  sseMessage({ orderId, status: status as OrderStatusEvent["status"] })
                )
              );
              hadChanges = true;
            }
          }

          // Only update the snapshot when we actually found a change.
          // This avoids reassigning the map every tick.
          if (hadChanges) lastKnown = current;
        } catch {
          // DB blip — send a keepalive so the connection stays open and
          // we retry on the next tick rather than crashing the stream.
          controller.enqueue(encoder.encode(KEEPALIVE));
        }
      }, POLL_INTERVAL_MS);

      // ── Cleanup on disconnect ───────────────────────────────────────────────
      // AbortSignal fires when the browser closes the tab, navigates away,
      // or calls eventSource.close(). Without this, the interval leaks.
      req.signal.addEventListener("abort", () => {
        clearInterval(timer);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      // Prevents Nginx / Vercel edge from buffering the stream.
      "X-Accel-Buffering": "no",
    },
  });
}
