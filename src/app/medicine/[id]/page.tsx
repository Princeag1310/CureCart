import { prisma } from "@/config/db";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import HealthBotClient from "./HealthBotClient";
import { AddToCartForm } from "@/components/medicine/AddToCartForm";
import { DynamicMedicalDetails } from "@/components/medicine/DynamicMedicalDetails";

export default async function MedicineDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const medicine = await prisma.medicine.findUnique({
    where: { id: resolvedParams.id }
  });

  if (!medicine) {
    notFound();
  }

  return (
    <div className="container mx-auto py-10 px-4">
      {/* Breadcrumb / Category Info */}
      <div className="text-sm text-gray-500 mb-6">
        Home &gt; {medicine.category || "General"} &gt; {medicine.subCategory || "Medicine"} &gt; {medicine.name}
      </div>

      <div className="flex flex-col md:flex-row gap-10">
        {/* Left Side: Medicine Image & Details */}
        <div className="md:w-1/2">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex justify-center items-center h-96 mb-6">
            {medicine.image ? (
              <Image src={medicine.image} alt={medicine.name} width={300} height={300} className="object-contain" />
            ) : (
              <div className="w-full h-full bg-blue-50 rounded-xl flex items-center justify-center text-blue-300">
                <span className="text-2xl font-bold">Rx</span>
              </div>
            )}
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{medicine.name}</h1>
          <div className="flex items-center gap-3 mb-4">
            <p className="text-2xl text-blue-600 font-bold">₹{medicine.price.toFixed(2)}</p>
            <span className={`text-xs font-bold px-3 py-1 rounded-full ${medicine.requiresPrescription ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-green-100 text-green-700 border border-green-200'}`}>
              {medicine.requiresPrescription ? "Prescription Required" : "OTC Product"}
            </span>
          </div>
          
          {/* Parsed Description Details */}
          {(() => {
            const desc = medicine.description || "";
            const mMatch = desc.match(/Manufactured by (.*?)(?:\. Packaging:|\. Salt Composition:|$)/i);
            const pMatch = desc.match(/Packaging: (.*?)(?:\. Salt Composition:|$)/i);
            const sMatch = desc.match(/Salt Composition: (.*)$/i);
            
            const manufacturer = mMatch ? mMatch[1].trim() : null;
            const packaging = pMatch ? pMatch[1].trim() : null;
            const composition = sMatch ? sMatch[1].trim() : null;

            if (manufacturer || packaging || composition) {
              return (
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 mb-8">
                  <h3 className="font-semibold text-gray-900 mb-4 text-sm uppercase tracking-wider">Product Information</h3>
                  <div className="space-y-3">
                    {manufacturer && (
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2 border-b border-gray-200/60 last:border-0 last:pb-0">
                        <span className="text-gray-500 text-sm font-medium">Manufacturer</span>
                        <span className="text-gray-900 font-medium text-sm text-left sm:text-right">{manufacturer}</span>
                      </div>
                    )}
                    {composition && (
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2 border-b border-gray-200/60 last:border-0 last:pb-0">
                        <span className="text-gray-500 text-sm font-medium">Salt Composition</span>
                        <span className="text-gray-900 font-medium text-sm text-left sm:text-right">{composition}</span>
                      </div>
                    )}
                    {packaging && (
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2 border-b border-gray-200/60 last:border-0 last:pb-0">
                        <span className="text-gray-500 text-sm font-medium">Packaging</span>
                        <span className="text-gray-900 font-medium text-sm text-left sm:text-right">{packaging}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            }

            return (
              <div className="bg-gray-50 border border-gray-200 p-4 rounded-xl mb-8">
                <h3 className="font-semibold text-gray-900 mb-2 text-sm uppercase tracking-wider">Description</h3>
                <p className="text-gray-700 text-sm leading-relaxed">{desc || "No description available for this product."}</p>
              </div>
            );
          })()}

          <div className="flex gap-4">
            <AddToCartForm medicineId={medicine.id} />
          </div>

          <DynamicMedicalDetails medicineId={medicine.id} medicineName={medicine.name} />
        </div>

        {/* Right Side: AI Medical Assistant */}
        <div className="md:w-1/2">
          <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 h-full flex flex-col">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-2">
              🤖 Medical AI Assistant
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              Ask questions about {medicine.name}. Our AI uses only verified data from FDA, WHO, and Mayo Clinic.
            </p>
            
            <HealthBotClient medicineName={medicine.name} />
          </div>
        </div>
      </div>
    </div>
  );
}
