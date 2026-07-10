import { getServerSession } from "next-auth/next";
import { authOptions } from "@/config/auth";
import { redirect } from "next/navigation";
import { OrderService } from "@/services/order.service";
import { OrdersList } from "@/components/orders/OrdersList";
import Link from "next/link";

// Always fetch fresh data — no stale cache on an orders page.
export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const orders = await OrderService.getUserOrders(session.user.id);

  return (
    <main className="min-h-screen bg-gray-50/50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight">
              Order History
            </h1>
            <p className="text-gray-500 font-medium mt-1">
              {orders.length} {orders.length === 1 ? "order" : "orders"} placed
            </p>
          </div>
          <Link
            href="/profile"
            className="text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-1"
          >
            ← Back to Profile
          </Link>
        </div>

        {/*
          Server fetches the initial snapshot; OrdersList takes over
          from here and subscribes to /api/orders/stream for live updates.
        */}
        <OrdersList initialOrders={orders} />
      </div>
    </main>
  );
}
