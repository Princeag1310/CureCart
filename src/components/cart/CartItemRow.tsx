"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Minus, Plus, Trash2 } from "lucide-react";

interface CartItemRowProps {
  item: {
    id: string;
    quantity: number;
    medicine: {
      id: string;
      name: string;
      price: number;
      image: string | null;
      manufacturer: string | null;
      stock: number;
    };
  };
}

export function CartItemRow({ item }: CartItemRowProps) {
  const router = useRouter();
  const [isRemoving, setIsRemoving] = useState(false);
  const [optimisticQty, setOptimisticQty] = useState(item.quantity);
  const syncTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Keep local state in sync if server state updates externally
  useEffect(() => {
    setOptimisticQty(item.quantity);
  }, [item.quantity]);

  const handleUpdateQuantity = (newQuantity: number) => {
    if (newQuantity <= 0) return;
    if (newQuantity > item.medicine.stock) {
      alert(`Only ${item.medicine.stock} left in stock.`);
      return;
    }

    // 1. Optimistically update the UI instantly for a snappy feel (No blocking loading state!)
    setOptimisticQty(newQuantity);

    // 2. Clear any previously scheduled network request
    if (syncTimerRef.current) {
      clearTimeout(syncTimerRef.current);
    }

    // 3. Schedule the actual server sync after they finish clicking (Debounce)
    syncTimerRef.current = setTimeout(async () => {
      try {
        const res = await fetch("/api/cart", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ medicineId: item.medicine.id, quantity: newQuantity }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to update quantity");
        }

        window.dispatchEvent(new Event('cartUpdated'));
        // Only refresh the page routing data (for subtotal) once the final click is securely saved
        router.refresh();
      } catch (error: any) {
        alert(error.message);
        setOptimisticQty(item.quantity); // Revert on failure
      }
    }, 400); // Wait 400ms after the last click before hitting the database
  };

  const handleRemove = async () => {
    if (!confirm("Are you sure you want to remove this item from your cart?")) return;

    try {
      setIsRemoving(true);
      const res = await fetch(`/api/cart?medicineId=${item.medicine.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to remove item");
      }

      window.dispatchEvent(new Event('cartUpdated'));
      router.refresh();
      // Keep isRemoving true while Next.js re-fetches the page so the item stays dimmed
    } catch (error: any) {
      alert(error.message);
      setIsRemoving(false);
    }
  };

  return (
    <li className={`p-6 sm:p-8 flex items-center gap-6 transition-all duration-300 ${isRemoving ? 'opacity-30 scale-[0.98] pointer-events-none' : 'hover:bg-gray-50/50'}`}>
      <div className="flex-shrink-0 w-24 h-24 sm:w-28 sm:h-28 bg-gray-50 rounded-2xl flex items-center justify-center p-3 relative overflow-hidden">
        {item.medicine.image ? (
          <Image src={item.medicine.image} alt={item.medicine.name} fill className="object-contain p-2" />
        ) : (
          <div className="w-full h-full bg-gray-100 rounded-xl flex items-center justify-center text-gray-300">
            <span className="text-sm font-bold">No Image</span>
          </div>
        )}
      </div>
      <div className="flex-1 flex flex-col justify-center min-w-0">
        <div className="flex justify-between items-start gap-4">
          <div className="min-w-0">
            <h3 className="text-lg font-bold text-gray-900 truncate">{item.medicine.name}</h3>
            <p className="text-sm text-gray-400 font-medium mt-0.5">{item.medicine.manufacturer || 'Generic'}</p>
          </div>
          <p className="text-xl font-black text-gray-900 flex-shrink-0">₹{(item.medicine.price * optimisticQty).toFixed(2)}</p>
        </div>
        
        <div className="mt-5 flex items-center justify-between">
          <div className="flex items-center h-10 bg-gray-100 rounded-full overflow-hidden">
            <button 
              type="button"
              onClick={() => handleUpdateQuantity(optimisticQty - 1)}
              disabled={optimisticQty <= 1}
              className="w-10 h-full flex items-center justify-center text-gray-600 hover:bg-gray-200 disabled:opacity-30 transition-colors cursor-pointer disabled:cursor-not-allowed"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <div className="w-12 h-full flex items-center justify-center font-bold text-sm text-gray-900">
              {optimisticQty}
            </div>
            <button 
              type="button"
              onClick={() => handleUpdateQuantity(optimisticQty + 1)}
              disabled={optimisticQty >= item.medicine.stock}
              className="w-10 h-full flex items-center justify-center text-gray-600 hover:bg-gray-200 disabled:opacity-30 transition-colors cursor-pointer disabled:cursor-not-allowed"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
          
          <button 
            type="button" 
            onClick={handleRemove}
            className="text-sm font-semibold text-gray-400 hover:text-red-500 flex items-center gap-2 transition-all p-2 -mr-2 rounded-xl hover:bg-red-50 group"
          >
            <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
            <span className="hidden sm:inline">Remove</span>
          </button>
        </div>
        
        {optimisticQty >= item.medicine.stock && (
          <p className="text-xs text-orange-500 mt-3 font-semibold flex items-center gap-1">
            <span className="flex h-1.5 w-1.5 rounded-full bg-orange-400"></span>
            Max available stock reached
          </p>
        )}
      </div>
    </li>
  );
}
