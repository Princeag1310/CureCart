"use client";

import { useEffect, useState } from "react";
import { CircleAlert, Activity, Info, TriangleAlert, Sparkles } from "lucide-react";

interface MedicalDetails {
  uses?: string[];
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
      <div className="mt-8 bg-red-50 dark:bg-red-950/30 p-5 rounded-2xl text-red-600 dark:text-red-400 text-sm font-medium flex items-center gap-3 border border-red-100 dark:border-red-900/40">
        <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/40 flex items-center justify-center flex-shrink-0">
          <CircleAlert className="w-5 h-5 text-red-500" />
        </div>
        Failed to load medical details. Please try again later.
      </div>
    );
  }

  if (loading || !details) {
    return (
      <div className="mt-8 space-y-6">
        <div className="h-6 bg-gray-100 dark:bg-zinc-800 rounded-full w-1/3 animate-pulse"></div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-100 dark:bg-zinc-800 rounded-full w-full animate-pulse"></div>
          <div className="h-4 bg-gray-100 dark:bg-zinc-800 rounded-full w-5/6 animate-pulse"></div>
          <div className="h-4 bg-gray-100 dark:bg-zinc-800 rounded-full w-4/6 animate-pulse"></div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
          <div className="h-28 bg-gray-50 dark:bg-zinc-900 rounded-2xl animate-pulse"></div>
          <div className="h-28 bg-gray-50 dark:bg-zinc-900 rounded-2xl animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-10 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

      {/* How To Use */}
      <div className="bg-white dark:bg-zinc-900 p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none">
        <h3 className="text-lg font-black text-gray-900 dark:text-zinc-50 flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-950/40 flex items-center justify-center">
            <Info className="w-5 h-5 text-blue-600" />
          </div>
          How to Use {medicineName}
        </h3>
        <p className="text-gray-600 dark:text-zinc-300 text-sm leading-relaxed font-medium pl-12">
          {details.howToUse}
        </p>
      </div>

      {/* Primary Uses / Diseases */}
      {details.uses && details.uses.length > 0 && (
        <div className="bg-gradient-to-br from-emerald-50/80 to-emerald-50/30 dark:from-emerald-950/20 dark:to-emerald-950/10 p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none border border-emerald-100/50 dark:border-emerald-900/30">
          <h3 className="text-base font-black text-gray-900 dark:text-zinc-50 flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-full bg-emerald-100 dark:bg-emerald-950/40 flex items-center justify-center">
              <Activity className="w-5 h-5 text-emerald-600" />
            </div>
            Primary Uses & Treatment
          </h3>
          <ul className="space-y-3 pl-12">
            {details.uses.map((use, i) => (
              <li key={i} className="text-sm text-gray-700 dark:text-zinc-300 font-medium flex items-start gap-3">
                <span className="mt-1.5 w-2 h-2 rounded-full bg-emerald-400 shrink-0"></span>
                {use}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* Side Effects */}
        {details.sideEffects?.length > 0 && (
          <div className="bg-gradient-to-br from-orange-50/80 to-orange-50/30 dark:from-orange-950/20 dark:to-orange-950/10 p-8 rounded-3xl border border-orange-100/50 dark:border-orange-900/30 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none">
            <h3 className="text-base font-black text-gray-900 dark:text-zinc-50 flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-full bg-orange-100 dark:bg-orange-950/40 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-orange-600" />
              </div>
              Side Effects
            </h3>
            <ul className="space-y-3 pl-12">
              {details.sideEffects.map((effect, i) => (
                <li key={i} className="text-sm text-gray-700 dark:text-zinc-300 font-medium flex items-start gap-3">
                  <span className="mt-1.5 w-2 h-2 rounded-full bg-orange-400 shrink-0"></span>
                  {effect}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Warnings & Interactions */}
        <div className="space-y-6">
          {details.warnings?.length > 0 && (
            <div className="bg-gradient-to-br from-red-50/80 to-red-50/30 dark:from-red-950/20 dark:to-red-950/10 p-8 rounded-3xl border border-red-100/50 dark:border-red-900/30 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none">
              <h3 className="text-base font-black text-gray-900 dark:text-zinc-50 flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-full bg-red-100 dark:bg-red-950/40 flex items-center justify-center">
                  <TriangleAlert className="w-5 h-5 text-red-600" />
                </div>
                Warnings
              </h3>
              <ul className="space-y-3 pl-12">
                {details.warnings.map((warning, i) => (
                  <li key={i} className="text-sm text-gray-700 dark:text-zinc-300 font-medium flex items-start gap-3">
                    <span className="mt-1.5 w-2 h-2 rounded-full bg-red-400 shrink-0"></span>
                    {warning}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {details.interactions?.length > 0 && (
            <div className="bg-gradient-to-br from-purple-50/80 to-purple-50/30 dark:from-purple-950/20 dark:to-purple-950/10 p-8 rounded-3xl border border-purple-100/50 dark:border-purple-900/30 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none">
              <h3 className="text-base font-black text-gray-900 dark:text-zinc-50 flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-full bg-purple-100 dark:bg-purple-950/40 flex items-center justify-center">
                  <CircleAlert className="w-5 h-5 text-purple-600" />
                </div>
                Interactions
              </h3>
              <ul className="space-y-3 pl-12">
                {details.interactions.map((interaction, i) => (
                  <li key={i} className="text-sm text-gray-700 dark:text-zinc-300 font-medium flex items-start gap-3">
                    <span className="mt-1.5 w-2 h-2 rounded-full bg-purple-400 shrink-0"></span>
                    {interaction}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Disclaimer */}
      <p className="text-xs text-gray-400 dark:text-zinc-600 italic text-center mt-8 font-medium">
        Disclaimer: This information is AI-generated and not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician.
      </p>
    </div>
  );
}