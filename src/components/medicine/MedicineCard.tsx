import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export interface MedicineProps {
  id: string;
  name: string;
  description: string | null;
  manufacturer: string | null;
  price: number;
  requiresPrescription: boolean;
  image: string | null;
}

export function MedicineCard({ medicine }: { medicine: MedicineProps }) {
  return (
    <Card itemScope itemType="http://schema.org/Product" className="overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col h-full bg-white border-gray-100">
      <Link href={`/medicine/${medicine.id}`} className="relative aspect-square w-full bg-gray-50 flex items-center justify-center p-4 group">
        {medicine.image ? (
          <Image
            src={medicine.image}
            alt={medicine.name}
            fill
            className="object-contain p-4 group-hover:scale-105 transition-transform"
          />
        ) : (
          <div className="text-gray-300 group-hover:scale-105 transition-transform">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
          </div>
        )}
        
        {medicine.requiresPrescription && (
          <div className="absolute top-2 left-2 bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded-full z-10">
            Rx Required
          </div>
        )}
      </Link>

      <CardContent className="flex-1 p-4">
        <Link href={`/medicine/${medicine.id}`}>
          <h3 itemProp="name" className="font-semibold text-lg text-gray-900 line-clamp-1 hover:text-blue-600 transition-colors">{medicine.name}</h3>
        </Link>
        <p itemProp="brand" className="text-xs text-gray-500 mt-1">{medicine.manufacturer || 'Unknown Manufacturer'}</p>
        
        <div className="mt-4 flex items-center justify-between">
          <div>
            <span className="text-xl font-bold text-gray-900">₹</span>
            <span itemProp="price" className="text-xl font-bold text-gray-900">{medicine.price.toFixed(2)}</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white transition-colors">
          Add to Cart
        </Button>
      </CardFooter>
    </Card>
  );
}
