import { getServerSession } from "next-auth/next";
import { authOptions } from "@/config/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/config/db";
import Link from "next/link";
import { CircleCheck, Package, MapPin, Phone } from "lucide-react";

export default async function OrderConfirmationPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const orderId = params.id;

  const order = await prisma.order.findUnique({
    where: { 
      id: orderId,
      userId: session.user.id // Security check to ensure they own the order
    },
    include: {
      items: {
        include: { medicine: true }
      }
    }
  });

  if (!order) {
    redirect("/"); // Or a custom 404 page
  }

  return (
    <main className="min-h-screen bg-gray-50/50 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-8">
        
        {/* Success Header */}
        <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-12 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 to-blue-50/30"></div>
          <div className="relative z-10">
            <div className="w-24 h-24 bg-gradient-to-br from-emerald-100 to-emerald-50 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg shadow-emerald-100">
              <CircleCheck className="w-12 h-12 text-emerald-500" />
            </div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-3">Order Confirmed!</h1>
            <p className="text-gray-500 font-medium mb-8 max-w-sm mx-auto">Thank you for your purchase. Your order has been successfully placed and is being processed.</p>
            
            <div className="inline-flex items-center gap-2 bg-gray-50 px-5 py-3 rounded-xl text-sm font-bold text-gray-600 border border-gray-100">
              <Package className="w-4 h-4" />
              Order ID: <span className="font-mono">{order.id}</span>
            </div>
          </div>
        </div>

        {/* Shipping & Order Summary */}
        <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
          <div className="p-8 border-b border-gray-100">
            <h2 className="text-lg font-black text-gray-900 mb-6">Shipping Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-2xl">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-gray-500" />
                </div>
                <p className="text-sm text-gray-700 font-medium leading-relaxed">
                  {order.shippingAddress || "No shipping address provided."}
                </p>
              </div>
              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-2xl">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                  <Phone className="w-5 h-5 text-gray-500" />
                </div>
                <p className="text-sm text-gray-700 font-medium">{order.contactPhone || "No phone provided."}</p>
              </div>
            </div>
          </div>

          <div className="p-8">
            <h2 className="text-lg font-black text-gray-900 mb-6">Order Summary</h2>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between items-center p-3 rounded-xl hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center overflow-hidden">
                      {item.medicine.image ? (
                        <img src={item.medicine.image} alt={item.medicine.name} className="w-full h-full object-contain p-1" />
                      ) : (
                        <Package className="w-5 h-5 text-gray-300" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">{item.medicine.name}</p>
                      <p className="text-xs text-gray-400 font-medium">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <p className="text-sm font-black text-gray-900">₹{(item.priceAtBuy * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-gray-100 flex justify-between items-baseline">
              <span className="text-lg font-black text-gray-900">Total Paid</span>
              <span className="text-2xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">₹{order.totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="flex justify-center gap-6 pt-4">
          <Link href="/orders" className="px-6 py-3 bg-white rounded-xl text-sm font-bold text-gray-700 shadow-[0_2px_10px_rgb(0,0,0,0.06)] hover:shadow-[0_4px_20px_rgb(0,0,0,0.1)] hover:-translate-y-0.5 transition-all">
            View All Orders
          </Link>
          <Link href="/" className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl text-sm font-bold text-white shadow-lg shadow-blue-500/25 hover:shadow-xl hover:-translate-y-0.5 transition-all">
            Continue Shopping
          </Link>
        </div>

      </div>
    </main>
  );
}
