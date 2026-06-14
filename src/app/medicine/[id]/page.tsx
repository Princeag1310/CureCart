import { prisma } from "@/config/db";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Metadata } from "next";
import { Button } from "@/components/ui/button";
import HealthBotClient from "./HealthBotClient";
import { AddToCartForm } from "@/components/medicine/AddToCartForm";
import { DynamicMedicalDetails } from "@/components/medicine/DynamicMedicalDetails";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const medicine = await prisma.medicine.findUnique({
    where: { id: resolvedParams.id }
  });

  if (!medicine) return { title: 'Not Found | CureCart' };

  return {
    title: `${medicine.name} - Buy Online | CureCart`,
    description: `Buy ${medicine.name} by ${medicine.manufacturer || 'General'}. Check verified medical details, side effects, and uses.`,
  };
}

export default async function MedicineDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const medicine = await prisma.medicine.findUnique({
    where: { id: resolvedParams.id }
  });

  if (!medicine) {
    notFound();
  }

  return (
    <div className="container mx-auto pt-24 pb-12 px-4 max-w-7xl">
      {/* Breadcrumb */}
      <div className="text-xs font-bold text-zinc-400 mb-8 flex items-center gap-2 uppercase tracking-widest">
        <span className="hover:text-zinc-900 cursor-pointer transition-colors">Home</span> 
        <span className="text-zinc-300">/</span> 
        <span className="hover:text-zinc-900 cursor-pointer transition-colors">{medicine.category || "General"}</span> 
        <span className="text-zinc-300">/</span> 
        <span className="text-zinc-900">{medicine.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Side: Medicine Image & AI Assistant */}
        <div className="lg:col-span-4 flex flex-col gap-8">
          <div className="bg-white rounded-[2rem] p-8 flex justify-center items-center h-80 border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] overflow-hidden group">
            {medicine.image ? (
              <Image 
                src={medicine.image} 
                alt={medicine.name} 
                fill 
                className="object-contain p-4 group-hover:scale-105 transition-transform duration-500 ease-out" 
              />
            ) : (
              <div className="w-full h-full rounded-xl flex items-center justify-center text-zinc-300">
                <span className="text-lg font-bold">No Image</span>
              </div>
            )}
          </div>

          {/* AI Medical Assistant Widget */}
          <div className="bg-white rounded-[2rem] border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] overflow-hidden flex flex-col">
            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-5 text-white">
              <h2 className="text-base font-bold flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
                AI Assistant
              </h2>
              <p className="text-[11px] text-emerald-50 font-medium opacity-90 leading-relaxed">
                Instant, verified answers about {medicine.name}.
              </p>
            </div>
            
            <div className="p-4 bg-gray-50/50">
              <HealthBotClient medicineName={medicine.name} />
            </div>
          </div>
        </div>

        {/* Right Side: Details & Actions */}
        <div className="lg:col-span-8 flex flex-col">
          <div className="mb-6">
            {medicine.requiresPrescription && (
              <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 border border-amber-200 text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-full mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                Prescription Required
              </span>
            )}
            <h1 className="text-2xl md:text-3xl font-black text-zinc-900 mb-2 tracking-tight">{medicine.name}</h1>
            <p className="text-sm text-zinc-500 font-medium">By {medicine.manufacturer || "Unknown Manufacturer"}</p>
          </div>

          <div className="flex items-baseline gap-3 mb-8">
            <p className="text-3xl font-black text-zinc-900 tracking-tighter">₹{medicine.price.toFixed(2)}</p>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Inclusive of all taxes</p>
          </div>
          
          <div className="bg-white rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 mb-10">
            <AddToCartForm medicineId={medicine.id} stock={medicine.stock} />
            {medicine.stock < 10 && medicine.stock > 0 && (
              <p className="text-sm font-medium text-orange-600 mt-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
                Hurry, only {medicine.stock} left in stock!
              </p>
            )}
          </div>

          {/* Parsed Details */}
          {(() => {
            const packaging = medicine.packaging;
            const composition = medicine.composition;

            if (packaging || composition) {
              return (
                <div className="mb-12">
                  <h3 className="text-xl font-bold text-zinc-900 mb-6 flex items-center gap-2">
                    Key Information
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {composition && (
                      <div className="bg-zinc-50 rounded-2xl p-6 border border-gray-100">
                        <span className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">Salt Composition</span>
                        <span className="text-zinc-900 font-medium text-sm">{composition}</span>
                      </div>
                    )}
                    {packaging && (
                      <div className="bg-zinc-50 rounded-2xl p-6 border border-gray-100">
                        <span className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">Packaging</span>
                        <span className="text-zinc-900 font-medium text-sm">{packaging}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            }
            return null;
          })()}

          <DynamicMedicalDetails medicineId={medicine.id} medicineName={medicine.name} />
        </div>
      </div>
    </div>
  );
}
