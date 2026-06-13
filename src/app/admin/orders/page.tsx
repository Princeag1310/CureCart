import { prisma } from "@/config/db";
import { OrdersTable } from "@/components/admin/OrdersTable";

export const dynamic = 'force-dynamic';

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: true,
      items: true
    }
  });

  return (
    <div className="max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Order Fulfillment</h1>
        <p className="text-gray-500 mt-1">Manage user orders and update shipping statuses.</p>
      </div>

      <OrdersTable initialOrders={orders} />
    </div>
  );
}
