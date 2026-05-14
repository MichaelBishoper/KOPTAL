"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MagnifyingGlassIcon } from "@heroicons/react/24/solid";
import { searchProductsAndCategories } from "@/lib";

export default function SearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Update results as user types
  useEffect(() => {
    if (query.trim()) {
      const searchResults = searchProductsAndCategories(query);
      setResults(searchResults);
      setIsOpen(true);
    } else {
      setResults([]);
      setIsOpen(false);
    }
  }, [query]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!(event.target instanceof Node)) return;
      if (!containerRef.current?.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (query.trim()) {
        // Navigate to marketplace with search query
        router.push(`/customer/marketplace?search=${encodeURIComponent(query)}`);
        setQuery("");
        setIsOpen(false);
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  return (
    <div className="w-full max-w-3xl relative" ref={containerRef}>
      <div className="relative">
        <input
          ref={inputRef}
          aria-label="search"
          placeholder="Search products or categories..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full rounded-full h-8 pl-12 pr-4 bg-white text-sm placeholder-gray-400 border-0 shadow-sm outline-none focus:ring-2 focus:ring-[#01A49E] focus:ring-offset-0"
        />
        {/* Search icon on the left */}
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#01A49E]">
          <MagnifyingGlassIcon className="h-6 w-6 text-[#01A49E]" aria-hidden="true" />
        </div>
      </div>

      {/* Dropdown results */}
      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto z-50">
          {results.map((result, idx) => (
            <div
              key={idx}
              onClick={() => {
                if (result.type === "product") {
                  router.push(`/customer/product/${result.productId}`);
                } else {
                  router.push(`/customer/marketplace?search=${encodeURIComponent(result.name)}`);
                }
                setQuery("");
                setIsOpen(false);
              }}
              className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition"
            >
              <div className="flex items-center gap-3 justify-between w-full">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className={`px-2 py-1 rounded text-xs font-semibold whitespace-nowrap ${
                    result.type === "category"
                      ? "bg-[#01A49E]/20 text-[#01A49E]"
                      : "bg-blue-100 text-blue-700"
                  }`}>
                    {result.type === "category" ? "Category" : "Product"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{result.name}</p>
                    {result.category && (
                      <p className="text-xs text-gray-500 truncate">in {result.category}</p>
                    )}
                    {result.price && (
                      <p className="text-xs text-gray-600">Rp {result.price.toLocaleString()}</p>
                    )}
                  </div>
                </div>
                {result.tenantName && result.type === "product" && (
                  <div className="text-right whitespace-nowrap ml-2">
                    <p className="text-xs font-semibold text-gray-700">{result.tenantName}</p>
                    <p className="text-xs text-gray-500">📍 {result.location}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No results message */}
      {isOpen && query.trim() && results.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-4 text-center text-gray-500 text-sm">
          No products or categories found
        </div>
      )}
    </div>
  );
}
