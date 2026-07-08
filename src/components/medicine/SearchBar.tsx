'use client';

import { useState, useEffect, useRef, FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    if (val.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    timeoutRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/medicine/autocomplete?q=${encodeURIComponent(val.trim())}`);
        if (res.ok) {
          const data = await res.json();
          setSuggestions(data);
          setShowSuggestions(true);
        }
      } catch (err) {
        console.error("Failed to fetch suggestions", err);
      }
    }, 300); // 300ms debounce
  };

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    setShowSuggestions(false);
    if (query.trim()) {
      router.push(`/?q=${encodeURIComponent(query.trim())}`);
    } else {
      router.push('/');
    }
  };

  return (
    <div className="w-full max-w-3xl relative mx-auto" ref={containerRef}>
      <form onSubmit={handleSearch} className="flex w-full items-center relative z-10 group">
        <div className="relative w-full">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="absolute left-6 top-1/2 h-6 w-6 -translate-y-1/2 text-zinc-400 group-focus-within:text-emerald-500 transition-colors"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <Input
            type="text"
            placeholder="Search for medicines, health products..."
            className="pl-16 pr-36 py-8 text-lg rounded-2xl border border-zinc-200 shadow-sm bg-white focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-0 focus-visible:border-emerald-500 w-full transition-all hover:border-zinc-300 placeholder:text-zinc-400 font-medium"
            value={query}
            onChange={handleInputChange}
            onFocus={() => {
              if (suggestions.length > 0) setShowSuggestions(true);
            }}
          />
          <Button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl px-8 py-6 bg-zinc-900 hover:bg-emerald-600 text-white text-base font-bold shadow-sm hover:shadow-md transition-all border-0">
            Search
          </Button>
        </div>
      </form>

      {/* Autocomplete Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50 text-left">
          <ul className="divide-y divide-gray-50 max-h-80 overflow-y-auto">
            {suggestions.map((item) => (
              <li key={item.id}>
                <Link 
                  href={`/medicine/${item.id}`}
                  onClick={() => {
                  setShowSuggestions(false);
                  setQuery('');
                    }}
                  className="flex items-start justify-between px-4 py-3 hover:bg-zinc-50 transition-colors w-full"
                >
                  <div className="flex flex-col flex-1 pr-4">
                    <span className="text-sm font-bold text-zinc-900 leading-snug text-left line-clamp-2">{item.name}</span>
                    {item.category && <span className="text-xs text-zinc-500 mt-1 text-left">{item.category}</span>}
                  </div>
                  <span className="text-sm font-black text-emerald-600 shrink-0 mt-0.5">₹{item.price}</span>
                </Link>
              </li>
            ))}
          </ul>
          <div className="px-4 py-2 bg-gray-50 text-xs text-center text-gray-500 border-t border-gray-100">
            Press Enter or click Search for more results
          </div>
        </div>
      )}
    </div>
  );
}
