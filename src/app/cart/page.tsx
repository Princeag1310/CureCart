import { getServerSession } from "next-auth/next";
import { authOptions } from "@/config/auth";
import { CartService } from "@/services/cart.service";
import { redirect } from "next/navigation";
import Image from "next/image";
import { CheckoutButton } from "./CheckoutButton";

export const dynamic = 'force-dynamic';

export default async function CartPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const cart = await CartService.getCart(session.user.id);
  const items = cart.items || [];
  
  const subtotal = items.reduce((acc, item) => acc + (item.medicine.price * item.quantity), 0);

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-8">Your Shopping Cart</h1>

        {items.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl shadow-sm border border-gray-100">
            <svg className="mx-auto h-16 w-16 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h2 className="text-xl font-medium text-gray-900 mb-2">Your cart is empty</h2>
            <p className="text-gray-500">Looks like you haven't added any medicines yet.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <ul className="divide-y divide-gray-200">
              {items.map((item) => (
                <li key={item.id} className="p-6 flex items-center">
                  <div className="flex-shrink-0 w-24 h-24 bg-gray-50 rounded-lg flex items-center justify-center p-2 relative">
                    {item.medicine.image ? (
                      <Image src={item.medicine.image} alt={item.medicine.name} fill className="object-contain" />
                    ) : (
                      <svg className="h-10 w-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                      </svg>
                    )}
                  </div>
                  <div className="ml-6 flex-1 flex flex-col justify-center">
                    <div className="flex justify-between">
                      <h3 className="text-lg font-medium text-gray-900">{item.medicine.name}</h3>
                      <p className="text-lg font-bold text-gray-900">₹{(item.medicine.price * item.quantity).toFixed(2)}</p>
                    </div>
                    <p className="mt-1 text-sm text-gray-500">{item.medicine.manufacturer || 'Generic'}</p>
                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center text-sm text-gray-600">
                        Qty: {item.quantity}
                      </div>
                      <button type="button" className="text-sm font-medium text-red-600 hover:text-red-500 transition-colors">
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            
            <div className="bg-gray-50 p-6 border-t border-gray-200">
              <div className="flex justify-between text-base font-medium text-gray-900 mb-4">
                <p>Subtotal</p>
                <p>₹{subtotal.toFixed(2)}</p>
              </div>
              <p className="text-sm text-gray-500 mb-6">Shipping and taxes calculated at checkout.</p>
              <CheckoutButton />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
