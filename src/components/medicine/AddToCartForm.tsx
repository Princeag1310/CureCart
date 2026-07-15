"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

import { Minus, Plus, ShoppingCart } from "lucide-react";

export function AddToCartForm({ medicineId, stock, compact = false }: { medicineId: string, stock: number, compact?: boolean }) {
  const sessionObj = useSession();
  // In some Next.js 15/React 19 SSR edge cases, NextAuth v4 useSession() returns undefined instead of throwing
  const session = sessionObj?.data;
  const status = sessionObj?.status || "loading";

  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);

  const increment = () => {
    if (quantity < stock) setQuantity(q => q + 1);
  };

  const decrement = () => {
    if (quantity > 1) setQuantity(q => q - 1);
  };

  const handleAddToCart = async () => {
    if (status === "unauthenticated" || (!session && status !== "loading")) {
      router.push("/login");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ medicineId, quantity }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to add to cart");
      }

      window.dispatchEvent(new Event('cartUpdated'));

      // Redirect to cart page upon success
      router.push("/cart");
    } catch (error: any) {
      console.error(error);
      alert(error.message || "Failed to add to cart. Please try again.");
      setLoading(false);
    }
  };

  if (stock === 0) {
    return (
      <div className="w-full text-center py-4 px-6 bg-red-50 text-red-600 rounded-xl font-bold border border-red-100 text-sm">
        Out of Stock
      </div>
    );
  }

  return (
    <div className={`flex w-full gap-2 ${compact ? 'flex-row' : 'flex-col sm:flex-row'}`}>
      <div className={`flex items-center justify-between bg-gray-50 rounded-lg overflow-hidden shrink-0 border border-gray-200 ${compact ? 'h-9 w-24' : 'h-10 w-28'}`}>
        <button 
          type="button"
          onClick={decrement}
          disabled={quantity <= 1 || loading}
          aria-label="Decrease quantity"
          className="w-full h-full flex items-center justify-center text-gray-500 hover:bg-gray-200 hover:text-gray-900 disabled:opacity-30 transition-colors"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>
        <div className="w-full h-full flex items-center justify-center font-bold text-sm text-gray-900 bg-white">
          {quantity}
        </div>
        <button 
          type="button"
          onClick={increment}
          disabled={quantity >= stock || loading}
          aria-label="Increase quantity"
          className="w-full h-full flex items-center justify-center text-gray-500 hover:bg-gray-200 hover:text-gray-900 disabled:opacity-30 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>
      
      <Button 
        onClick={handleAddToCart} 
        disabled={loading}
        className={`w-full flex-1 bg-zinc-900 hover:bg-emerald-600 text-white transition-colors duration-300 font-bold rounded-lg shadow-sm border-0 flex items-center justify-center gap-2 ${compact ? 'h-9 text-xs px-2' : 'h-10 text-sm'}`}
      >
        {loading ? (
          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
        ) : (
          <ShoppingCart className={compact ? "w-3.5 h-3.5" : "w-4 h-4"} />
        )}
        {loading ? (compact ? "" : "Adding...") : (compact ? "Add" : "Add to Cart")}
      </Button>
    </div>
  );
}
