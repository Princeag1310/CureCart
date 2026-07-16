"use client";

import { useEffect, useState } from "react";
import { MedicineCard } from "./MedicineCard";
import { Bot, CircleAlert } from "lucide-react";

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
      <div className="flex flex-col items-center justify-center py-20 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl border border-blue-100/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-200/20 rounded-full blur-3xl"></div>
        <div className="relative z-10 text-center">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Bot className="h-10 w-10 text-blue-600 animate-bounce" />
          </div>
          <h3 className="text-2xl font-black text-gray-900 mb-3">AI is searching the web...</h3>
          <p className="text-gray-600 font-medium max-w-md mx-auto leading-relaxed">
            We couldn&apos;t find &quot;{query}&quot; in our database. Asking Gemini to find it and import it directly into CureCart!
          </p>
          <div className="flex items-center justify-center gap-1 mt-6">
            <span className="w-2.5 h-2.5 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></span>
            <span className="w-2.5 h-2.5 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></span>
            <span className="w-2.5 h-2.5 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-gradient-to-br from-red-50 to-orange-50 rounded-3xl border border-red-100/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
          <CircleAlert className="h-10 w-10 text-red-500" />
        </div>
        <h3 className="text-2xl font-black text-gray-900 mb-3">Search Failed</h3>
        <p className="text-red-600 font-medium max-w-md mx-auto text-center leading-relaxed">
          {error}
        </p>
      </div>
    );
  }

  if (medicine) {
    return (
      <div className="space-y-6">
        <div className={`px-6 py-4 rounded-2xl flex items-center gap-3 shadow-[0_2px_10px_rgb(0,0,0,0.06)] ${
          medicine._source === "db_corrected" 
            ? "bg-blue-50 border border-blue-100 text-blue-800" 
            : "bg-emerald-50 border border-emerald-100 text-emerald-800"
        }`}>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
            medicine._source === "db_corrected" ? "bg-blue-100" : "bg-emerald-100"
          }`}>
            <Bot className={`w-5 h-5 ${medicine._source === "db_corrected" ? "text-blue-600" : "text-emerald-600"}`} />
          </div>
          <p className="text-sm font-semibold">
            {medicine._source === "db_corrected" ? (
              <>
                Did you mean <strong className="font-black">{medicine._correctedQuery}</strong>? We corrected your spelling and found it!
              </>
            ) : (
              <>
                Success! Our AI found <strong className="font-black">{medicine.name}</strong> on the web and added it to our catalog for you.
              </>
            )}
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
