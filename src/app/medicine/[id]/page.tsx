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
          <p className="text-xl text-blue-600 font-semibold mb-4">₹{medicine.price.toFixed(2)}</p>
          
          <div className="bg-blue-50 p-4 rounded-lg mb-6">
            <span className={`text-xs font-bold px-2 py-1 rounded-full ${medicine.requiresPrescription ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
              {medicine.requiresPrescription ? "Prescription Required" : "OTC Product"}
            </span>
            <p className="mt-3 text-gray-700 text-sm">{medicine.description || "No description available for this product."}</p>
          </div>

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
