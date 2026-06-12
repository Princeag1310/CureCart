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
    <div className="w-full max-w-2xl relative" ref={containerRef}>
      <form onSubmit={handleSearch} className="flex w-full items-center space-x-2 relative z-10">
        <div className="relative flex-1">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <Input
            type="text"
            placeholder="Search for medicines, health products, or conditions..."
            className="pl-10 py-6 text-base rounded-full border-gray-300 shadow-sm focus-visible:ring-blue-500 w-full"
            value={query}
            onChange={handleInputChange}
            onFocus={() => {
              if (suggestions.length > 0) setShowSuggestions(true);
            }}
          />
        </div>
        <Button type="submit" className="rounded-full px-8 py-6 bg-blue-600 hover:bg-blue-700 text-base font-semibold transition-all shadow-md hover:shadow-lg">
          Search
        </Button>
      </form>

      {/* Autocomplete Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50">
          <ul className="divide-y divide-gray-50 max-h-80 overflow-y-auto">
            {suggestions.map((item) => (
              <li key={item.id}>
                <Link 
                  href={`/medicine/${item.id}`}
                  onClick={() => {
                    setShowSuggestions(false);
                    setQuery(item.name);
                  }}
                  className="block px-4 py-3 hover:bg-gray-50 transition-colors flex items-center justify-between"
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-900">{item.name}</span>
                    {item.category && <span className="text-xs text-gray-500 mt-0.5">{item.category}</span>}
                  </div>
                  <span className="text-sm font-semibold text-blue-600">₹{item.price}</span>
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
