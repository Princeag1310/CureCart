import { MedicineService } from '@/services/medicine.service';
import { MedicineCard } from '@/components/medicine/MedicineCard';
import { SearchBar } from '@/components/medicine/SearchBar';
import { SortSelect } from '@/components/medicine/SortSelect';
import { AIFallbackSearch } from '@/components/medicine/AIFallbackSearch';
import Link from 'next/link';

export const dynamic = 'force-dynamic'; // Ensure we fetch fresh data

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string; category?: string; sort?: string }>;
}) {
  const resolvedParams = await searchParams;
  const query = resolvedParams.q;
  const category = resolvedParams.category;
  const sort = resolvedParams.sort || 'name-asc';
  const currentPage = Number(resolvedParams.page) || 1;
  const medicines = await MedicineService.searchMedicines(query, currentPage, category, sort);

  const buildUrl = (overrides: { page?: number, category?: string | null, sort?: string }) => {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    
    const cat = overrides.category !== undefined ? overrides.category : category;
    if (cat) params.set('category', cat);
    
    const srt = overrides.sort !== undefined ? overrides.sort : sort;
    if (srt) params.set('sort', srt);
    
    const pg = overrides.page !== undefined ? overrides.page : currentPage;
    if (pg > 1) params.set('page', pg.toString());
    
    return `/?${params.toString()}`;
  };

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center">
      
      {/* Hero Section */}
      <section className="w-full bg-gradient-to-b from-blue-50 to-white py-16 px-4 flex flex-col items-center justify-center border-b border-gray-100">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 text-center tracking-tight mb-4">
          Your AI-Powered Pharmacy
        </h1>
        <p className="text-lg text-gray-600 text-center max-w-2xl mb-10">
          Find any medicine, get automated interactions warnings, and have your prescriptions delivered right to your door.
        </p>
        <SearchBar />
      </section>

      {/* Catalog Section */}
      <section className="w-full max-w-7xl px-4 py-12 flex flex-col md:flex-row gap-8">
        
        {/* Categories Sidebar */}
        <aside className="w-full md:w-64 flex-shrink-0">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm sticky top-24">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Categories</h3>
            <ul className="space-y-3">
              {['All', 'Prescription Drugs', 'OTC Products', 'Protein Supplements', 'Hair Care', 'Skin Care'].map(catName => {
                const isActive = catName === 'All' ? !category : category === catName;
                return (
                  <li key={catName}>
                    <Link 
                      href={buildUrl({ category: catName === 'All' ? null : catName, page: 1 })} 
                      className={`font-medium transition-colors ${isActive ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'}`}
                    >
                      {catName}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </aside>

        {/* Medicines Grid */}
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
            <h2 className="text-2xl font-bold text-gray-900">
              {query ? `Search results for "${query}"` : category ? category : 'Popular Medicines'}
              <span className="text-gray-500 text-sm ml-4 font-normal">{medicines.length} items on page</span>
            </h2>
            <div className="flex items-center gap-4">
              {(query || category || sort !== 'name-asc') && (
                <Link href="/" className="text-sm text-blue-600 hover:underline font-medium">Clear Filters</Link>
              )}
              <SortSelect />
            </div>
          </div>

        {medicines.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {medicines.map((medicine) => (
              <MedicineCard key={medicine.id} medicine={medicine} />
            ))}
          </div>
        ) : query ? (
          <AIFallbackSearch query={query} />
        ) : (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-xl font-semibold text-gray-900">No medicines found</h3>
            <p className="text-gray-500 mt-2 text-center max-w-md">
              We couldn't find any exact matches. Try selecting a different category.
            </p>
          </div>
        )}

        {/* Pagination Controls */}
        {medicines.length > 0 && (
          <div className="mt-12 flex justify-center items-center gap-4">
            {currentPage > 1 && (
              <Link 
                href={buildUrl({ page: currentPage - 1 })}
                className="px-6 py-2.5 bg-white border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
              >
                Previous
              </Link>
            )}
            <span className="text-gray-500 font-medium">Page {currentPage}</span>
            {medicines.length === 24 && (
              <Link 
                href={buildUrl({ page: currentPage + 1 })}
                className="px-6 py-2.5 bg-blue-600 border border-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
              >
                Next Page
              </Link>
            )}
          </div>
        )}
        </div>
      </section>
      
    </main>
  );
}
