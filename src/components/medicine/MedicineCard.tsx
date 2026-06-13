import Image from 'next/image';
import Link from 'next/link';
import { AddToCartForm } from './AddToCartForm';

export interface MedicineProps {
  id: string;
  name: string;
  description: string | null;
  manufacturer: string | null;
  price: number;
  requiresPrescription: boolean;
  image: string | null;
  stock: number;
  packaging?: string | null;
  composition?: string | null;
}

export function MedicineCard({ medicine }: { medicine: MedicineProps }) {
  return (
    <div 
      itemScope 
      itemType="http://schema.org/Product" 
      className="group flex flex-col bg-white rounded-2xl overflow-hidden hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 border border-gray-100 h-full"
    >
      {/* Image Container - takes up top portion */}
      <Link href={`/medicine/${medicine.id}`} className="relative aspect-square w-full bg-zinc-50 flex items-center justify-center p-6 border-b border-gray-50 overflow-hidden block">
        {medicine.image ? (
          <Image
            src={medicine.image}
            alt={medicine.name}
            fill
            className="object-contain p-6 group-hover:scale-105 transition-transform duration-500 ease-out"
          />
        ) : (
          <div className="text-gray-300 group-hover:scale-105 transition-transform duration-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
          </div>
        )}
        
        {/* Subtle Prescription Badge */}
        {medicine.requiresPrescription && (
          <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-zinc-800 text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded border border-gray-200 shadow-sm flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            Rx
          </div>
        )}

        {/* Out of stock overlay */}
        {medicine.stock === 0 && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center pointer-events-none">
            <span className="bg-zinc-900 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">Out of Stock</span>
          </div>
        )}
      </Link>

      {/* Info Container */}
      <div className="p-5 flex flex-col flex-1">
        <Link href={`/medicine/${medicine.id}`} className="flex flex-col flex-1">
          <h3 itemProp="name" className="font-bold text-base text-gray-900 line-clamp-2 leading-snug group-hover:text-emerald-700 transition-colors">
            {medicine.name}
          </h3>
          
          <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mt-2 truncate">
            {medicine.manufacturer || 'General'}
          </p>

          {(medicine.packaging || medicine.composition) && (
            <div className="mt-3 flex flex-col gap-1.5 border-t border-gray-50 pt-3">
              {medicine.packaging && (
                <div className="flex items-start gap-2">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mt-0.5 w-10 shrink-0">Pack</span>
                  <p className="text-xs font-medium text-zinc-700 line-clamp-1">{medicine.packaging}</p>
                </div>
              )}
              {medicine.composition && (
                <div className="flex items-start gap-2">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mt-0.5 w-10 shrink-0">Comp</span>
                  <p className="text-xs font-medium text-zinc-700 line-clamp-2 leading-snug">{medicine.composition}</p>
                </div>
              )}
            </div>
          )}
          
          {/* Fill available space to push price down */}
          <div className="flex-1 min-h-[1rem]"></div>

          <div className="mt-4 flex items-end justify-between border-t border-gray-50 pt-4">
            <div>
              <p className="text-[10px] text-gray-400 font-medium mb-0.5">PRICE</p>
              <span itemProp="price" className="text-xl font-black text-gray-900">₹{medicine.price.toFixed(2)}</span>
            </div>
          </div>
        </Link>
        
        <div className="mt-4 w-full">
          <AddToCartForm medicineId={medicine.id} stock={medicine.stock} />
        </div>
      </div>
    </div>
  );
}
