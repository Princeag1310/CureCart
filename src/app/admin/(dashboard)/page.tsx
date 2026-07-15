import { prisma } from "@/config/db";
import { Package, ShoppingCart, DollarSign, CircleAlert } from "lucide-react";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  // Aggregate data for dashboard
  const totalRevenueResult = await prisma.order.aggregate({
    _sum: { totalAmount: true },
    where: { status: { not: "CANCELLED" } }
  });
  const totalRevenue = totalRevenueResult._sum.totalAmount || 0;

  const activeOrdersCount = await prisma.order.count({
    where: { status: { in: ["PENDING", "PROCESSING", "SHIPPED"] } }
  });

  const lowStockCount = await prisma.medicine.count({
    where: { stock: { lt: 10 } }
  });

  const totalMedicines = await prisma.medicine.count();

  const recentOrders = await prisma.order.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: { user: true }
  });

  const lowStockMedicines = await prisma.medicine.findMany({
    where: { stock: { lt: 10 } },
    take: 5,
    orderBy: { stock: "asc" }
  });

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Dashboard Overview</h1>
        <p className="text-gray-500 mt-1">Here's what's happening in your pharmacy today.</p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-start gap-4">
          <div className="p-3 bg-green-100 text-green-600 rounded-lg shrink-0">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Revenue</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">₹{totalRevenue.toFixed(2)}</h3>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm flex items-start gap-4">
          <div className="p-3 bg-emerald-100 text-emerald-600 rounded-lg shrink-0">
            <ShoppingCart className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-zinc-500">Active Orders</p>
            <h3 className="text-2xl font-bold text-zinc-900 mt-1">{activeOrdersCount}</h3>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-start gap-4">
          <div className="p-3 bg-red-100 text-red-600 rounded-lg shrink-0">
            <CircleAlert className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Low Stock Items</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">{lowStockCount}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-start gap-4">
          <div className="p-3 bg-indigo-100 text-indigo-600 rounded-lg shrink-0">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Medicines</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">{totalMedicines}</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
            <Link href="/admin/orders" className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">View all</Link>
          </div>
          <div className="p-0 flex-1">
            {recentOrders.length === 0 ? (
              <div className="p-6 text-center text-gray-500">No orders found.</div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {recentOrders.map(order => (
                  <li key={order.id} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                    <div>
                      <p className="font-medium text-gray-900">{order.user.name}</p>
                      <p className="text-sm text-gray-500">Order #{order.id.slice(-6).toUpperCase()}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">₹{order.totalAmount.toFixed(2)}</p>
                      <span className={`inline-block px-2.5 py-1 mt-1 text-xs font-semibold rounded-full 
                        ${order.status === 'DELIVERED' ? 'bg-green-100 text-green-700' : 
                          order.status === 'CANCELLED' ? 'bg-red-100 text-red-700' : 
                          'bg-yellow-100 text-yellow-700'}`}>
                        {order.status}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-red-50/50">
            <h2 className="text-lg font-semibold text-red-900 flex items-center gap-2">
              <CircleAlert className="w-5 h-5 text-red-600" />
              Low Stock Alerts
            </h2>
            <Link href="/admin/inventory" className="text-sm text-red-600 hover:text-red-700 font-medium">Manage</Link>
          </div>
          <div className="p-0 flex-1">
            {lowStockMedicines.length === 0 ? (
              <div className="p-6 text-center text-gray-500">All inventory is fully stocked!</div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {lowStockMedicines.map(medicine => (
                  <li key={medicine.id} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                    <div>
                      <p className="font-medium text-gray-900 line-clamp-1">{medicine.name}</p>
                      <p className="text-sm text-gray-500">{medicine.manufacturer || "Generic"}</p>
                    </div>
                    <div className="text-right shrink-0 ml-4">
                      <p className={`font-bold text-lg ${medicine.stock === 0 ? 'text-red-600' : 'text-orange-500'}`}>
                        {medicine.stock} left
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
