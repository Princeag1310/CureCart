'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

// Helper to load external scripts dynamically
function loadScript(src: string) {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => {
      resolve(true);
    };
    script.onerror = () => {
      resolve(false);
    };
    document.body.appendChild(script);
  });
}

export function CheckoutButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleCheckout = async () => {
    setLoading(true);
    try {
      // 1. Load Razorpay Script
      const res = await loadScript('https://checkout.razorpay.com/v1/checkout.js');
      if (!res) {
        throw new Error('Razorpay SDK failed to load. Are you online?');
      }

      // 2. Call backend checkout API to create order
      const response = await fetch('/api/checkout', {
        method: 'POST',
      });
      
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Checkout failed');
      }

      // 3. Initialize Razorpay Modal
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_placeholder", 
        amount: data.order.totalAmount * 100,
        currency: "INR",
        name: "CureCart",
        description: "Medical Order Transaction",
        order_id: data.razorpayOrderId,
        handler: function (response: any) {
          // Success! Redirect to an order confirmation page
          alert(`Payment Successful! Payment ID: ${response.razorpay_payment_id}`);
          router.push('/');
          router.refresh();
        },
        theme: {
          color: "#2563eb", // blue-600 to match our branding
        },
      };

      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.open();
      
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
