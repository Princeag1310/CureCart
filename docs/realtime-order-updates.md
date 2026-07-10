# Real-Time Order Status Updates — Engineering Decision Record

> This document is written for learning purposes. Every decision is explained from
> first principles so you understand *why*, not just *what*.

---

## 1. What problem are we actually solving?

Right now the flow looks like this:

```
Admin changes status in DB
        ↓
Nothing happens on the user's screen
        ↓
User has to reload /orders to see the change
```

We want this instead:

```
Admin changes status in DB
        ↓
Server detects the change
        ↓
Server pushes a message to the specific user
        ↓
User's screen updates without a reload
```

The core engineering challenge is: **HTTP is pull-only by default.**
A browser makes a request, gets a response, connection closes. The server
has no built-in way to initiate a message to the browser. Everything below
is about solving that one fundamental constraint.

---

## 2. The three ways to push data to a browser

Before picking a tool, understand the three primitives available:

### 2a. Polling (fake real-time)
```
Browser: "Any updates?" → Server: "No"   (every N seconds)
Browser: "Any updates?" → Server: "No"
Browser: "Any updates?" → Server: "Yes, here they are"
```
- Simple, works everywhere, no new dependencies
- Wastes resources — most requests return nothing
- Latency is at best equal to your poll interval
- **Not true real-time. Rejected for this feature.**

### 2b. Server-Sent Events (SSE)
```
Browser opens one long-lived HTTP connection
Server can push text messages down it at any time
Connection is one-directional: server → client only
```
- Built into every browser, no library needed on client
- One direction only — fine for notifications
- Works over HTTP/1.1 and HTTP/2
- Next.js App Router supports it natively via `ReadableStream`
- **Good fit. Evaluate further.**

### 2c. WebSockets
```
Browser and server perform an HTTP "upgrade" handshake
Result: a persistent, full-duplex TCP connection
Either side can send messages at any time
```
- Two-way communication (client can also send to server)
- Requires a separate, persistent server process
- **Next.js is stateless/serverless by design — WebSockets are a fundamental architectural mismatch**
- **Requires Socket.io or a managed service (Pusher, Ably)**
- Overkill for one-directional status notifications

---

## 3. The critical architectural question: Serverless vs. Stateful

This is the most important question for this codebase.

**Next.js App Router routes are serverless functions.** Each API call:
1. Spins up a fresh function instance
2. Handles the request
3. Shuts down

WebSockets need a **stateful, persistent process** — a server that lives
across many requests and holds open connections in memory. A serverless
function cannot do this. Each function instance is isolated and dies.

```
Serverless instance A  ──── user1's connection
Serverless instance B  ──── (no connections, handles a checkout request)
Serverless instance C  ──── user2's connection

When admin updates order → hits instance D (a new one)
Instance D has NO knowledge of instances A or C
It cannot reach user1 or user2
```

This is why Socket.io (which requires a persistent Node.js server) does not
fit into a Next.js App Router project without a major architecture change
(adding a separate Express/Node process, custom server, etc.).

**SSE does not have this problem** because the connection lifetime is scoped
to a single request handler. The browser holds the connection open, the
serverless function streams responses for as long as it lives. When the
function instance is recycled, the browser reconnects automatically.

---

## 4. The notification delivery problem

Even with SSE, there is a subtlety: when admin updates order X (owned by
user Y), how does the SSE handler for user Y's connection know to send a
message?

The SSE handler is just waiting. The admin PUT hits a completely different
function instance. They share no in-process memory.

**The bridge is the database.**

Two patterns:

### Pattern A: DB Polling inside the SSE stream (simple)
```
User opens SSE connection
Server: every 3 seconds, query DB for this user's latest order statuses
If anything changed since last check, send it down the stream
```
- No extra infrastructure
- Still "polling" but the poll is server-side — client gets instant push
- 3-second lag is acceptable for order status
- Works on Vercel/serverless with one caveat: function timeout limits

### Pattern B: Pub/Sub (robust, production-grade)
```
Admin updates order → API route publishes event to Redis pub/sub channel
SSE handler subscribes to that channel → receives message immediately → sends to browser
```
- Zero lag
- Works across serverless instances
- Requires Redis (Upstash Redis is serverless-friendly, has a free tier)
- More moving parts

---

## 5. Decision: What to build for CureCart

Given:
- This is a learning project on Next.js App Router
- No existing Redis/pub-sub infrastructure  
- Vercel deployment (serverless)
- Order status updates happen infrequently (not high-frequency trading)
- You want to understand first principles

**Chosen approach: SSE with server-side DB polling (Pattern A)**

Rationale:
- Zero new dependencies
- Teaches the SSE primitive directly
- Honest latency (~3s) is fine for "your order has shipped"
- Can be upgraded to Redis pub/sub later without changing the client code
- Works correctly in a serverless environment

---

## 6. Exact questions to answer before writing any code

Work through these in order. Each one gates the next.

### Q1: What is the URL of the SSE endpoint?
```
GET /api/orders/stream
```
The browser will open a persistent connection to this URL.
It must be authenticated — only return events for the logged-in user's orders.

### Q2: What HTTP headers make a response SSE?
```
Content-Type: text/event-stream
Cache-Control: no-cache
Connection: keep-alive
```
Without `Content-Type: text/event-stream`, the browser treats it as a normal
response and does not activate the EventSource parsing logic.

### Q3: What does an SSE message look like on the wire?
```
data: {"orderId":"abc123","status":"SHIPPED"}\n\n
```
Rules:
- Lines starting with `data:` contain the payload
- Each message ends with TWO newlines (`\n\n`)
- You can send `event:` lines to name custom event types
- You can send `: comment` lines as keepalives (prevents proxy timeouts)

### Q4: How does the browser consume SSE?
```javascript
const source = new EventSource('/api/orders/stream');
source.onmessage = (event) => {
  const update = JSON.parse(event.data);
  // update the UI with update.orderId and update.status
};
source.onerror = () => {
  // browser auto-reconnects, but you can show a "reconnecting..." indicator
};
```
The browser **automatically reconnects** if the connection drops. This is built
into the EventSource spec, not something you implement.

### Q5: How does the SSE handler know what to send?
The handler must:
1. Get the authenticated user's ID from the session
2. Query the DB for their current order statuses
3. Encode that as the initial snapshot
4. Then, on a timer (every 3s), re-query and diff against last known state
5. If anything changed, send a `data:` message

The diff prevents sending redundant messages on every tick.

```
[tick 1] orders: [{id: "A", status: "PENDING"}]   → send initial snapshot
[tick 2] orders: [{id: "A", status: "PENDING"}]   → no change, send nothing
[tick 3] orders: [{id: "A", status: "PROCESSING"}] → CHANGED, send event
```

### Q6: What happens when the connection closes?
You must clean up the `setInterval` inside the SSE handler. Next.js App Router
streams support an `AbortSignal` on the request. Use `request.signal.addEventListener('abort', cleanup)`.

Without cleanup, you leak intervals and DB connections.

### Q7: How does the client update the UI without a page reload?
The `/orders` page is currently a **Server Component** that fetches data once.
To react to SSE events, you need a **Client Component** with local state.

The refactor is:
```
Before: Server Component renders order list directly
After:  Server Component fetches initial data, passes to Client Component
        Client Component displays the list AND subscribes to SSE
        On SSE message, update the matching order's status in local state
```

This is the same pattern as `OrdersTable` in the admin dashboard — initial
server fetch, client-side state mutations.

### Q8: Where does the admin status update trigger the notification?
The admin calls `PUT /api/admin/orders`. After the `prisma.order.update`
succeeds, the new status is now in the DB. The SSE handler's next poll
will detect it within 3 seconds. No changes needed to the admin route.

This is the beauty of the DB-polling approach: the admin side is completely
decoupled from the notification mechanism.

### Q9: What are the Vercel/serverless limits to be aware of?
Vercel Hobby plan has a **10-second max duration** for serverless functions.
A persistent SSE stream cannot run on the Hobby plan without workarounds.

Solutions:
- **Vercel Pro** has a 5-minute streaming limit (sufficient for order pages)
- **Edge Runtime** can stream indefinitely on Vercel (use `export const runtime = 'edge'` on the SSE route)
- **Self-hosted** — no limit
- **Fallback to polling** on the client if SSE is not supported or times out

For local development, there is no limit.

### Q10: How do you prevent the SSE endpoint from being a DoS vector?
Each open SSE connection holds a DB polling interval. If 10,000 users have
the orders page open, that's 10,000 DB queries every 3 seconds.

Mitigations:
- Only open the SSE connection when the user is on the orders page (close on `beforeunload`)
- Increase the poll interval (5-10s instead of 3s)
- Gate connection with Arcjet rate limiting (already in the project)
- Future: switch to Redis pub/sub, which scales to any number of subscribers

---

## 7. Implementation plan (the build order)

```
Step 1: Create GET /api/orders/stream
  - Auth check → 401 if not logged in
  - Return a ReadableStream with Content-Type: text/event-stream
  - Inside the stream: setInterval to poll DB every 3s
  - Diff against last known state, send data: messages on change
  - Clean up interval on request abort signal

Step 2: Convert /orders/page.tsx
  - Keep server component for initial data fetch
  - Extract list rendering into a new Client Component: OrdersList
  - OrdersList accepts initialOrders as prop
  - OrdersList opens EventSource on mount, closes on unmount
  - On message: find matching order in state, update its status

Step 3: Add visual feedback
  - Animated status badge transition when status changes
  - Optional: toast notification "Order #ABC is now SHIPPED"

Step 4: Test the full loop
  - Open /orders in browser (as user)
  - Open /admin/orders in another tab (as admin)
  - Change status in admin → watch user page update within 3s
```

---

## 8. The upgrade path (when you outgrow DB polling)

When the app has real traffic, replace Step 1 with this:

```
PUT /api/admin/orders
  ↓
prisma.order.update(...)  ← same as now
  ↓
redis.publish(`orders:${userId}`, JSON.stringify({ orderId, status }))  ← new

GET /api/orders/stream
  ↓
redis.subscribe(`orders:${session.user.id}`)  ← replaces setInterval
  ↓
On message: forward to SSE stream  ← same output format
```

The **client code does not change at all.** This is why picking the right
abstraction boundary (SSE as the client-facing primitive) matters.
Upstash Redis offers a serverless-compatible REST API with free tier.

---

## 9. Why not Pusher?

Pusher is a managed WebSocket service that abstracts away the stateful server
problem. It works well but:
- Adds a third-party dependency and cost
- Hides the underlying mechanism (bad for learning)
- Requires an API key and outbound network call from your API route
- Free tier is limited to 100 simultaneous connections

SSE teaches the same concept with zero external dependencies and is the
right tool for one-directional server → client notifications.

If you need **bidirectional** real-time (e.g., collaborative features,
live chat, multiplayer) — that's when WebSockets/Pusher become justified.
Order status updates are strictly one-directional.

---

## 10. Quick reference: SSE vs WebSocket vs Polling

| | Polling | SSE | WebSocket |
|---|---|---|---|
| Direction | client pulls | server pushes | both |
| Protocol | HTTP | HTTP | WS (upgrade) |
| Browser API | `fetch` + `setInterval` | `EventSource` | `WebSocket` |
| Auto-reconnect | manual | ✅ built-in | manual |
| Next.js App Router fit | ✅ | ✅ | ❌ needs custom server |
| Vercel serverless fit | ✅ | ✅ (with edge runtime) | ❌ |
| New dependencies | none | none | socket.io |
| Right for order status | wasteful | ✅ | overkill |

---

*The code implementation follows the decisions in this document.
Start with Step 1 from section 7 and verify each step works before moving on.*
