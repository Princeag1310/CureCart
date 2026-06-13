"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ChevronDown } from "lucide-react";

export function SortSelect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentSort = searchParams.get("sort") || "name-asc";

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSort = e.target.value;
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", newSort);
    params.set("page", "1"); // Reset to page 1 on sort change
    router.push(`/?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-3">
      <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Sort by</span>
      <div className="relative">
        <select
          id="sort"
          value={currentSort}
          onChange={handleSortChange}
          className="bg-zinc-50 border-0 text-sm font-bold text-zinc-800 rounded-lg py-2 px-3 focus:ring-2 focus:ring-emerald-500 cursor-pointer appearance-none pr-8"
        >
          <option value="name-asc">Name (A-Z)</option>
          <option value="name-desc">Name (Z-A)</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
      </div>
    </div>
  );
}
