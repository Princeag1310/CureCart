"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function AddToCartForm({ medicineId }: { medicineId: string }) {
  const sessionObj = useSession();
  // In some Next.js 15/React 19 SSR edge cases, NextAuth v4 useSession() returns undefined instead of throwing
  const session = sessionObj?.data;
  const status = sessionObj?.status || "loading";

  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);

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
        throw new Error("Failed to add to cart");
      }

      // Redirect to cart page upon success
      router.push("/cart");
    } catch (error) {
      console.error(error);
      alert("Failed to add to cart. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="flex w-full items-center gap-2">
      <select
        value={quantity}
        onChange={(e) => setQuantity(Number(e.target.value))}
        className="h-10 w-20 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
        disabled={loading}
      >
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
          <option key={num} value={num}>
            {num}
          </option>
        ))}
      </select>
      
      <Button 
        onClick={handleAddToCart} 
        disabled={loading}
        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white transition-colors h-10"
      >
        {loading ? "Adding..." : "Add to Cart"}
      </Button>
    </div>
  );
}
