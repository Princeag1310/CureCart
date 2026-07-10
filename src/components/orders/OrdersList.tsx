"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { OrderWithItems, OrderStatusEvent } from "@/types/orders";
import type { OrderStatus } from "@prisma/client";

// ── Status badge ─────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<OrderStatus, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  PROCESSING: "bg-amber-100 text-amber-700",
  SHIPPED: "bg-blue-100 text-blue-700",
  DELIVERED: "bg-emerald-100 text-emerald-700",
  CANCELLED: "bg-red-100 text-red-700",
};

function StatusBadge({
  status,
  updated,
}: {
  status: OrderStatus;
  updated: boolean;
}) {
  return (
    <span
      className={`
        inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full
        text-xs font-black uppercase tracking-wider
        transition-all duration-500
        ${STATUS_STYLES[status]}
        ${updated ? "ring-2 ring-offset-2 ring-blue-400 scale-105" : ""}
      `}
    >
      {updated && (
        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping inline-block" />
      )}
      {status}
    </span>
  );
}

// ── Connection indicator ──────────────────────────────────────────────────────

type ConnectionState = "connecting" | "connected" | "error";

function ConnectionDot({ state }: { state: ConnectionState }) {
  const label: Record<ConnectionState, string> = {
    connecting: "Connecting…",
    connected: "Live updates on",
    error: "Reconnecting…",
  };
  const dot: Record<ConnectionState, string> = {
    connecting: "bg-amber-400 animate-pulse",
    connected: "bg-emerald-400",
    error: "bg-red-400 animate-pulse",
  };

  return (
    <span className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
      <span className={`w-2 h-2 rounded-full ${dot[state]}`} />
      {label[state]}
    </span>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

interface Props {
  initialOrders: OrderWithItems[];
}

export function OrdersList({ initialOrders }: Props) {
  const [orders, setOrders] = useState<OrderWithItems[]>(initialOrders);
  const [connectionState, setConnectionState] =
    useState<ConnectionState>("connecting");

  // Track which order IDs were updated in the last tick so we can flash
  // the badge. We store them in a ref + state pair: the ref for the timer
  // handle, the state to trigger a re-render.
  const [recentlyUpdated, setRecentlyUpdated] = useState<Set<string>>(
    new Set()
  );
  const flashTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(
    new Map()
  );

  // Apply a temporary "flash" ring to the status badge, auto-clearing after 3s.
  function flashOrder(orderId: string) {
    // Clear any pending timer for this order before creating a new one.
    const existing = flashTimers.current.get(orderId);
    if (existing) clearTimeout(existing);

    setRecentlyUpdated((prev) => new Set(prev).add(orderId));

    const timer = setTimeout(() => {
      setRecentlyUpdated((prev) => {
        const next = new Set(prev);
        next.delete(orderId);
        return next;
      });
      flashTimers.current.delete(orderId);
    }, 3_000);

    flashTimers.current.set(orderId, timer);
  }

  useEffect(() => {
    const source = new EventSource("/api/orders/stream");

    source.onopen = () => setConnectionState("connected");

    source.onmessage = (evt: MessageEvent<string>) => {
      const update: OrderStatusEvent = JSON.parse(evt.data);

      setOrders((prev) =>
        prev.map((order) =>
          order.id === update.orderId
            ? { ...order, status: update.status }
            : order
        )
      );

      flashOrder(update.orderId);
    };

    source.onerror = () => {
      // EventSource auto-reconnects. We just reflect the current state.
      setConnectionState("error");
      // Reset to "connecting" quickly so the label feels responsive.
      setTimeout(() => setConnectionState("connecting"), 1_000);
    };

    return () => {
      source.close();
      // Cancel all pending flash timers on unmount.
      flashTimers.current.forEach(clearTimeout);
    };
  }, []);

  // ── Empty state ─────────────────────────────────────────────────────────────

  if (orders.length === 0) {
    return (
      <div className="bg-white p-16 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col items-center text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-purple-50/30" />
        <div className="relative z-10">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-10 w-10 text-gray-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              />
            </svg>
          </div>
          <h3 className="text-2xl font-black text-gray-900 mb-3">
            No orders yet
          </h3>
          <p className="text-gray-500 font-medium max-w-sm mx-auto mb-8">
            You haven&apos;t placed any orders yet. Once you checkout, your
            orders will appear here.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-xl hover:-translate-y-0.5 transition-all"
          >
            Browse Medicines →
          </Link>
        </div>
      </div>
    );
  }

  // ── Order list ──────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Live indicator sits next to the order count in the parent page,
          but we render it here so it's co-located with the SSE logic. */}
      <div className="flex justify-end">
        <ConnectionDot state={connectionState} />
      </div>

      {orders.map((order) => (
        <div
          key={order.id}
          className="bg-white overflow-hidden rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all"
        >
          {/* Order header */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100/50 px-8 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
              <div>
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">
                  Order Placed
                </p>
                <p className="text-sm font-bold text-gray-900 mt-0.5">
                  {new Date(order.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">
                  Total
                </p>
                <p className="text-sm font-black text-gray-900 mt-0.5">
                  ₹{order.totalAmount.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">
                  Order ID
                </p>
                <p className="text-sm font-bold text-gray-900 font-mono mt-0.5">
                  #{order.id.slice(-8).toUpperCase()}
                </p>
              </div>
            </div>

            <StatusBadge
              status={order.status}
              updated={recentlyUpdated.has(order.id)}
            />
          </div>

          {/* Items */}
          <div className="p-8">
            <ul className="divide-y divide-gray-100">
              {order.items.map((item) => (
                <li
                  key={item.id}
                  className="py-5 first:pt-0 last:pb-0 flex items-center"
                >
                  <div className="flex-shrink-0 h-16 w-16 relative bg-gray-50 rounded-xl overflow-hidden">
                    {item.medicine.image ? (
                      <Image
                        src={item.medicine.image}
                        alt={item.medicine.name}
                        fill
                        className="object-contain p-1"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-gray-300">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6 w-6"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="ml-5 flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <Link
                          href={`/medicine/${item.medicine.id}`}
                          className="font-bold text-gray-900 hover:text-blue-600 transition-colors"
                        >
                          {item.medicine.name}
                        </Link>
                        <p className="text-sm text-gray-400 font-medium mt-0.5">
                          {item.medicine.manufacturer}
                        </p>
                      </div>
                      <p className="font-black text-gray-900">
                        ₹{(item.priceAtBuy * item.quantity).toFixed(2)}
                      </p>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-400 font-medium">
                      <span>Qty: {item.quantity}</span>
                      <span>₹{item.priceAtBuy.toFixed(2)} each</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ))}
    </div>
  );
}
