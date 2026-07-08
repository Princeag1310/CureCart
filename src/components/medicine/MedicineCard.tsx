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
      className="group flex flex-col bg-white dark:bg-zinc-950 rounded-2xl overflow-hidden hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:hover:shadow-[0_8px_30px_rgb(255,255,255,0.04)] transition-all duration-300 border border-gray-100 dark:border-zinc-800 h-full"
    >
      {/* Image Container - takes up top portion */}
      <Link href={`/medicine/${medicine.id}`} className="relative aspect-[4/3] w-full bg-white dark:bg-zinc-900 flex items-center justify-center p-4 border-b border-gray-50 dark:border-zinc-800 overflow-hidden block">
        {medicine.image ? (
          <Image
            src={medicine.image}
            alt={medicine.name}
            fill
            className="object-contain p-6 group-hover:scale-105 transition-transform duration-500 ease-out"
          />
        ) : (
          <div className="text-gray-300 dark:text-zinc-700 group-hover:scale-105 transition-transform duration-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
          </div>
        )}
        
        {/* Subtle Prescription Badge */}
        {medicine.requiresPrescription && (
          <div className="absolute top-3 left-3 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm text-zinc-800 dark:text-zinc-200 text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded border border-gray-200 dark:border-zinc-700 shadow-sm flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            Rx
          </div>
        )}

        {/* Out of stock overlay */}
        {medicine.stock === 0 && (
          <div className="absolute inset-0 bg-white/60 dark:bg-zinc-950/60 backdrop-blur-[2px] flex items-center justify-center pointer-events-none">
            <span className="bg-zinc-900 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">Out of Stock</span>
          </div>
        )}
      </Link>

      {/* Info Container */}
      <div className="p-4 flex flex-col flex-1">
        <Link href={`/medicine/${medicine.id}`} className="flex flex-col flex-1">
          <div className="flex justify-between items-start gap-2 mb-1">
            <h3 itemProp="name" className="font-bold text-[15px] text-gray-900 dark:text-zinc-100 line-clamp-2 leading-tight group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
              {medicine.name}
            </h3>
            <div className="flex flex-col items-end shrink-0">
              <span className="text-[9px] text-gray-400 dark:text-zinc-500 font-bold uppercase mb-0.5">MRP</span>
              <span itemProp="price" className="text-lg font-black text-emerald-600 dark:text-emerald-400 leading-none">₹{medicine.price.toFixed(2)}</span>
            </div>
          </div>
          
          <p className="text-[11px] font-semibold text-gray-400 dark:text-zinc-500 uppercase tracking-wider truncate mb-2">
            {medicine.manufacturer || 'General'}
          </p>

          {(medicine.packaging || medicine.composition) && (
            <div className="flex flex-wrap gap-1 mt-auto">
              {medicine.packaging && (
                 <span className="text-[10px] font-medium text-zinc-600 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded border border-zinc-200 dark:border-zinc-700">{medicine.packaging}</span>
              )}
              {medicine.composition && (
                 <span className="text-[10px] font-medium text-zinc-600 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded border border-zinc-200 dark:border-zinc-700 truncate max-w-[180px]">{medicine.composition}</span>
              )}
            </div>
          )}
          
          {/* Fill available space to push add to cart down */}
          <div className="flex-1 min-h-[1rem]"></div>
        </Link>
        
        <div className="mt-3 w-full border-t border-gray-50 dark:border-zinc-800 pt-3">
          <AddToCartForm medicineId={medicine.id} stock={medicine.stock} compact={true} />
        </div>
      </div>
    </div>
  );
}
