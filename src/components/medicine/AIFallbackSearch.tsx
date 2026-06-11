"use client";

import { useEffect, useState } from "react";
import { MedicineCard } from "./MedicineCard";
import { Bot, AlertCircle } from "lucide-react";

export function AIFallbackSearch({ query }: { query: string }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [medicine, setMedicine] = useState<any | null>(null);

  useEffect(() => {
    const scrapeAI = async () => {
      try {
        const res = await fetch('/api/medicine/scrape', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query })
        });
        const data = await res.json();
        
        if (!res.ok) {
          throw new Error(data.error || "Failed to find medicine");
        }
        
        setMedicine(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    scrapeAI();
  }, [query]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-blue-50/50 rounded-2xl border border-blue-100 shadow-sm animate-pulse">
        <Bot className="h-16 w-16 text-blue-500 mb-4 animate-bounce" />
        <h3 className="text-xl font-semibold text-blue-900">AI is searching the web...</h3>
        <p className="text-blue-600 mt-2 text-center max-w-md">
          We couldn't find "{query}" in our local database. Asking Gemini to find it and import it directly into CureCart!
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-red-50/50 rounded-2xl border border-red-100 shadow-sm">
        <AlertCircle className="h-16 w-16 text-red-400 mb-4" />
        <h3 className="text-xl font-semibold text-red-900">Search Failed</h3>
        <p className="text-red-600 mt-2 text-center max-w-md">
          {error}
        </p>
      </div>
    );
  }

  if (medicine) {
    return (
      <div className="space-y-6">
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-xl flex items-center gap-3">
          <Bot className="w-5 h-5 text-green-600" />
          <p className="text-sm font-medium">
            Success! Our AI found <strong>{medicine.name}</strong> on the web and dynamically added it to our catalog for you.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <MedicineCard medicine={medicine} />
        </div>
      </div>
    );
  }

  return null;
}
