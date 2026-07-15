import { getServerSession } from "next-auth/next";
import { authOptions } from "@/config/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/config/db";
import Link from "next/link";
import { MapPin, Phone, Pen, CircleAlert, ShieldCheck } from "lucide-react";
import { PaymentButton } from "./PaymentButton";

export default async function CheckoutPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      carts: {
        include: {
          items: {
            include: { medicine: true }
          }
        }
      }
    }
  });

  if (!user) redirect("/login");

  const activeCart = user.carts[0];

  if (!activeCart || activeCart.items.length === 0) {
    redirect("/cart");
  }

  const subtotal = activeCart.items.reduce((total, item) => total + (item.medicine.price * item.quantity), 0);
  const totalAmount = subtotal;

  const fullAddress = [user.address, user.city, user.state, user.zipCode].filter(Boolean).join(", ");
  const isProfileComplete = Boolean(user.phone && user.address && user.city && user.state && user.zipCode);

  return (
    <main className="min-h-screen bg-gray-50/50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-4 mb-12">
          {["Cart", "Checkout", "Payment"].map((step, i) => (
            <div key={step} className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                i <= 1 ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25' : 'bg-gray-200 text-gray-500'
              }`}>
                {i + 1}
              </div>
              <span className={`text-sm font-semibold hidden sm:inline ${i <= 1 ? 'text-gray-900' : 'text-gray-400'}`}>{step}</span>
              {i < 2 && <div className={`w-12 h-0.5 rounded-full ${i < 1 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>}
            </div>
          ))}
        </div>

        <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-10">Checkout</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Shipping & Items */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-black text-gray-900 flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-sm font-black">1</span>
                  Shipping Details
                </h2>
                <Link href="/profile/edit" className="text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1.5 transition-colors">
                  <Pen className="w-4 h-4" /> Edit
                </Link>
              </div>

              {isProfileComplete ? (
                <div className="space-y-4">
                  <div className="flex items-start gap-4 p-5 bg-blue-50/50 rounded-2xl border border-blue-100/50">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{user.name}</p>
                      <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                        {user.address}<br/>
                        {user.city}, {user.state} {user.zipCode}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 p-5 bg-gray-50 rounded-2xl">
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                      <Phone className="w-5 h-5 text-gray-500" />
                    </div>
                    <p className="text-sm text-gray-700 font-medium">{user.phone}</p>
                  </div>
                </div>
              ) : (
                <div className="bg-red-50 text-red-700 p-8 rounded-2xl border border-red-100 flex flex-col items-center text-center space-y-4">
                  <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center">
                    <CircleAlert className="w-7 h-7 text-red-500" />
                  </div>
                  <div>
                    <h3 className="font-black text-red-900">Incomplete Shipping Profile</h3>
                    <p className="text-sm mt-1 text-red-600">You must provide a valid shipping address and phone number before payment.</p>
                  </div>
                  <Link href="/profile/edit" className="bg-red-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-500/25 hover:-translate-y-0.5">
                    Add Shipping Details
                  </Link>
                </div>
              )}
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
              <h2 className="text-xl font-black text-gray-900 flex items-center gap-3 mb-6">
                <span className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-sm font-black">2</span>
                Order Items
              </h2>
              <div className="space-y-4">
                {activeCart.items.map((item) => (
                  <div key={item.id} className="flex justify-between items-center p-4 rounded-2xl hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-4">
                      {item.medicine.image ? (
                        <img src={item.medicine.image} alt={item.medicine.name} className="w-16 h-16 object-contain rounded-xl bg-gray-50 p-1" />
                      ) : (
                        <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center">
                          <span className="text-gray-300 text-xs font-bold">No Img</span>
                        </div>
                      )}
                      <div>
                        <h3 className="font-bold text-gray-900">{item.medicine.name}</h3>
                        <p className="text-sm text-gray-400 font-medium">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <p className="font-black text-gray-900">₹{(item.medicine.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary & Payment */}
          <div className="lg:col-span-1">
            <div className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] sticky top-32">
              <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6">Order Summary</h2>
              
              <div className="space-y-4 text-sm mb-8">
                <div className="flex justify-between text-gray-600 font-medium">
                  <span>Subtotal</span>
                  <span className="text-gray-900 font-bold">₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600 font-medium">
                  <span>Shipping</span>
                  <span className="text-emerald-600 font-bold">Free</span>
                </div>
                
                <div className="pt-4 border-t border-gray-100 flex justify-between items-baseline">
                  <span className="text-lg font-black text-gray-900">Total</span>
                  <span className="text-3xl font-black text-gray-900">₹{totalAmount.toFixed(2)}</span>
                </div>
              </div>

              {isProfileComplete ? (
                <PaymentButton />
              ) : (
                <button disabled className="w-full bg-gray-200 text-gray-400 font-bold py-5 rounded-2xl cursor-not-allowed text-sm">
                  Complete Profile to Pay
                </button>
              )}
              
              <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-400 font-medium">
                <ShieldCheck className="w-4 h-4" />
                Secured by Razorpay
              </div>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
