'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export function CheckoutButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
      });
      
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Checkout failed');
      }

      // Success! Redirect to an order confirmation page (we can build this later)
      alert("Order placed successfully!");
      router.push('/');
      router.refresh();
      
    } catch (error: any) {
      alert(`Checkout Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button 
      onClick={handleCheckout} 
      disabled={loading}
      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-6 text-lg rounded-xl shadow-md transition-all"
    >
      {loading ? 'Processing Secure Transaction...' : 'Proceed to Checkout'}
    </Button>
  );
}
