"use client";

import { useEffect, useState } from "react";
import { AlertCircle, Activity, Info, AlertTriangle } from "lucide-react";

interface MedicalDetails {
  howToUse: string;
  sideEffects: string[];
  interactions: string[];
  warnings: string[];
}

export function DynamicMedicalDetails({ medicineId, medicineName }: { medicineId: string, medicineName: string }) {
  const [details, setDetails] = useState<MedicalDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await fetch(`/api/medicine/${medicineId}/details`);
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setDetails(data);
      } catch (err) {
        console.error(err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [medicineId]);

  if (error) {
    return (
      <div className="mt-8 bg-red-50 border border-red-100 p-4 rounded-xl text-red-600 text-sm flex items-center gap-2">
        <AlertCircle className="w-4 h-4" />
        Failed to load medical details. Please try again later.
      </div>
    );
  }

  if (loading || !details) {
    return (
      <div className="mt-8 space-y-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          <div className="h-4 bg-gray-200 rounded w-4/6"></div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
          <div className="h-24 bg-gray-100 rounded-xl"></div>
          <div className="h-24 bg-gray-100 rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* How To Use */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-3">
          <Info className="w-5 h-5 text-blue-500" />
          How to Use {medicineName}
        </h3>
        <p className="text-gray-700 text-sm leading-relaxed">
          {details.howToUse}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Side Effects */}
        {details.sideEffects?.length > 0 && (
          <div className="bg-orange-50/50 p-6 rounded-2xl border border-orange-100/50">
            <h3 className="text-base font-bold text-orange-800 flex items-center gap-2 mb-3">
              <Activity className="w-4 h-4 text-orange-500" />
              Common Side Effects
            </h3>
            <ul className="space-y-2">
              {details.sideEffects.map((effect, i) => (
                <li key={i} className="text-sm text-orange-700 flex items-start gap-2">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-orange-400 shrink-0"></span>
                  {effect}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Warnings & Interactions */}
        <div className="space-y-6">
          {details.warnings?.length > 0 && (
            <div className="bg-red-50 p-6 rounded-2xl border border-red-100">
              <h3 className="text-base font-bold text-red-800 flex items-center gap-2 mb-3">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                Important Warnings
              </h3>
              <ul className="space-y-2">
                {details.warnings.map((warning, i) => (
                  <li key={i} className="text-sm text-red-700 flex items-start gap-2">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-red-400 shrink-0"></span>
                    {warning}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {details.interactions?.length > 0 && (
            <div className="bg-purple-50 p-6 rounded-2xl border border-purple-100">
              <h3 className="text-base font-bold text-purple-800 flex items-center gap-2 mb-3">
                <AlertCircle className="w-4 h-4 text-purple-500" />
                Key Interactions
              </h3>
              <ul className="space-y-2">
                {details.interactions.map((interaction, i) => (
                  <li key={i} className="text-sm text-purple-700 flex items-start gap-2">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-purple-400 shrink-0"></span>
                    {interaction}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
      
      {/* Disclaimer */}
      <p className="text-xs text-gray-400 italic text-center mt-8">
        Disclaimer: This information is AI-generated and not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician.
      </p>
    </div>
  );
}
