import { MedicineService } from "@/services/medicine.service";
import { MedicineCard } from "@/components/medicine/MedicineCard";
import { SearchBar } from "@/components/medicine/SearchBar";
import { AIFallbackSearch } from "@/components/medicine/AIFallbackSearch";
import { SortSelect } from "@/components/medicine/SortSelect";
import Link from "next/link";
import { Suspense } from "react";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedParams = await searchParams;
  const page = typeof resolvedParams.page === 'string' ? parseInt(resolvedParams.page) : 1;
  const category = typeof resolvedParams.category === 'string' ? resolvedParams.category : null;
  const query = typeof resolvedParams.q === 'string' ? resolvedParams.q : null;
  const letter = typeof resolvedParams.letter === 'string' ? resolvedParams.letter : null;
  const sort = typeof resolvedParams.sort === 'string' ? resolvedParams.sort : null;
  const limit = 20;

  const currentPage = page;

  const result = await MedicineService.searchMedicines(query || undefined, page, category || undefined, sort || undefined, letter || undefined);
  const { data: medicines, totalCount } = result;
  const totalPages = Math.ceil(totalCount / limit);

  // If no medicines found for a direct search query, we show the AI Fallback
  const showFallback = query && medicines.length === 0;

  const buildUrl = (updates: Record<string, string | number | null>) => {
    const params = new URLSearchParams();
    if (page > 1) params.set("page", page.toString());
    if (category) params.set("category", category);
    if (query) params.set("q", query);
    if (letter) params.set("letter", letter);
    if (sort) params.set("sort", sort);
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null) params.delete(key);
      else params.set(key, value.toString());
    });
    
    return `/?${params.toString()}`;
  };

  const alphabet = Array.from('ABCDEFGHIJKLMNOPQRSTUVWXYZ');
  const categoriesList = ['All', 'Prescription Drugs', 'OTC Products', 'Protein Supplements', 'Hair Care', 'Skin Care'];

  return (
    <main className="min-h-screen bg-white dark:bg-zinc-950 flex flex-col items-center pt-20">
      
      {/* Minimal Hero Section */}
      {!query && !category && !letter && (
        <section className="bg-white dark:bg-zinc-950 border-b border-gray-100 dark:border-zinc-800">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 text-center">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight leading-tight mb-3">
              Modern healthcare. <span className="text-emerald-600">Delivered instantly.</span>
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium mb-6">
              Search over 10,000+ verified medicines. AI-powered prescription checks and 10-minute delivery to your door.
            </p>
            
            {/* Main Search Bar */}
            <div className="max-w-xl mx-auto px-4">
              <SearchBar initialQuery="" />
            </div>
          </div>
        </section>
      )} {/* Main Content Layout */}
      <section className="w-full max-w-[1400px] px-4 sm:px-6 lg:px-8 pb-24 flex flex-col md:flex-row gap-10">
        
        {/* Minimalist Sidebar */}
        <aside className="w-full md:w-56 flex-shrink-0">
          <div className="sticky top-28">
            <h3 className="text-xs font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-4 px-3">Browse Categories</h3>
            <ul className="space-y-1">
              {categoriesList.map(catName => {
                const isActive = catName === 'All' ? !category : category === catName;
                return (
                  <li key={catName}>
                    <Link 
                      href={buildUrl({ category: catName === 'All' ? null : catName, page: 1, letter: null })} 
                      className={`block px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                        isActive 
                          ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400' 
                          : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-zinc-100'
                      }`}
                    >
                      {catName}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </aside>

        {/* Product Grid Area */}
        <div className="flex-1 min-w-0">
          
          {/* Header Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="text-xl font-black text-zinc-900 dark:text-white">
                {query ? `Search results for "${query}"` : category ? category : 'All Products'}
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium mt-1">
                Showing {totalCount > 0 ? ((currentPage - 1) * limit) + 1 : 0}-{Math.min(currentPage * limit, totalCount)} of {totalCount} items
              </p>
            </div>
            
            {/* Dynamic Sort Component */}
            <SortSelect />
          </div>

          {/* Alphabet Filter - Clean Pills */}
          {!query && (
            <div className="mb-8 w-full overflow-x-auto pb-2 scrollbar-hide border-b border-gray-100 dark:border-zinc-800">
              <div className="flex gap-2 min-w-max pb-4">
                <Link 
                  href={buildUrl({ letter: null, page: 1 })}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors border ${
                    !letter 
                      ? 'bg-zinc-900 dark:bg-white border-zinc-900 dark:border-white text-white dark:text-zinc-900' 
                      : 'bg-white dark:bg-transparent border-gray-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-400 dark:hover:border-zinc-600'
                  }`}
                >
                  All
                </Link>
                {alphabet.map((char) => (
                  <Link
                    key={char}
                    href={buildUrl({ letter: char, page: 1 })}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors border ${
                      letter === char 
                        ? 'bg-zinc-900 dark:bg-white border-zinc-900 dark:border-white text-white dark:text-zinc-900' 
                        : 'bg-white dark:bg-transparent border-gray-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-400 dark:hover:border-zinc-600'
                    }`}
                  >
                    {char}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* AI Fallback or Grid */}
          {showFallback ? (
            <AIFallbackSearch query={query} />
          ) : (
            <>
              {medicines.length === 0 ? (
                <div className="text-center py-20">
                  <p className="text-xl font-bold text-zinc-800 dark:text-zinc-200">No products found</p>
                  <p className="text-zinc-500 dark:text-zinc-400 mt-2">Try adjusting your category or search query.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                  {medicines.map((medicine) => (
                    <MedicineCard key={medicine.id} medicine={medicine} />
                  ))}
                </div>
              )}

              {/* Minimalist Pagination */}
              {totalPages > 1 && (
                <div className="mt-16 flex justify-center items-center gap-1.5">
                  {currentPage > 1 && (
                    <Link href={buildUrl({ page: currentPage - 1 })} className="px-4 py-2 text-sm font-bold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors">
                      ←
                    </Link>
                  )}
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 3)
                    .map((pageNum, index, array) => {
                      const showEllipsis = index > 0 && pageNum - array[index - 1] > 1;
                      return (
                        <div key={pageNum} className="flex gap-1.5 items-center">
                          {showEllipsis && <span className="px-2 text-zinc-400 dark:text-zinc-600 font-bold">...</span>}
                          <Link 
                            href={buildUrl({ page: pageNum })}
                            className={`min-w-[36px] h-9 flex items-center justify-center font-bold text-sm rounded-lg transition-colors ${
                              currentPage === pageNum 
                                ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900' 
                                : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                            }`}
                          >
                            {pageNum}
                          </Link>
                        </div>
                      );
                    })
                  }

                  {currentPage < totalPages && (
                    <Link href={buildUrl({ page: currentPage + 1 })} className="px-4 py-2 text-sm font-bold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors">
                      →
                    </Link>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </main>
  );
}

// Ensure currentPage is derived properly for the pagination logic above
const getCurrentPage = (searchParams: any) => {
  return typeof searchParams.page === 'string' ? parseInt(searchParams.page) : 1;
};
