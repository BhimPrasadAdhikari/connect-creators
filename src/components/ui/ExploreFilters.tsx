"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search, Filter, ChevronDown, X, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

interface ExploreFiltersProps {
  categories: string[];
  className?: string;
}

export function ExploreFilters({ categories, className }: ExploreFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Get current filter values from URL
  const currentQuery = searchParams.get("q") || "";
  const currentCategory = searchParams.get("category") || "All";
  const currentSort = searchParams.get("sort") || "popular";

  const [searchQuery, setSearchQuery] = useState(currentQuery);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Update URL with filters
  const updateFilters = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      
      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === "" || value === "All" || value === "popular") {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      });

      const queryString = params.toString();
      router.push(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery !== currentQuery) {
        updateFilters({ q: searchQuery });
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, currentQuery, updateFilters]);

  const sortOptions = [
    { value: "popular", label: "Most Popular" },
    { value: "new", label: "Newest" },
    { value: "price-low", label: "Price: Low to High" },
    { value: "price-high", label: "Price: High to Low" },
  ];

  const activeFiltersCount = 
    (currentCategory !== "All" ? 1 : 0) + 
    (currentSort !== "popular" ? 1 : 0);

  return (
    <div className={cn("space-y-4", className)}>
      {/* Search and Filter Row */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search creators and topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-10 py-4 text-base border-0 bg-white ring-1 ring-gray-100 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/10 focus:bg-gray-50 transition-all placeholder:text-gray-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Toggle (Mobile) */}
        <Button
          variant="outline"
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className="sm:hidden relative h-14 rounded-2xl border-gray-200"
        >
          <SlidersHorizontal className="w-5 h-5 mr-2" />
          Filters
          {activeFiltersCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-white text-xs rounded-full flex items-center justify-center">
              {activeFiltersCount}
            </span>
          )}
        </Button>

        {/* Sort Dropdown (Desktop) */}
        <div className="hidden sm:block relative min-w-[180px]">
          <select
            value={currentSort}
            onChange={(e) => updateFilters({ sort: e.target.value })}
            className="w-full appearance-none px-5 py-4 pr-10 border-0 bg-white ring-1 ring-gray-100 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/10 cursor-pointer text-gray-600 font-medium"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => updateFilters({ category: category })}
            className={cn(
              "px-5 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all shrink-0",
              currentCategory === category
                ? "bg-primary text-white shadow-md shadow-primary/25"
                : "bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900 border border-transparent hover:border-gray-200"
            )}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Mobile Filter Panel */}
      {isFilterOpen && (
        <div className="sm:hidden p-4 bg-white rounded-xl border border-gray-200 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sort By
            </label>
            <select
              value={currentSort}
              onChange={(e) => updateFilters({ sort: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {activeFiltersCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                updateFilters({ category: null, sort: null, q: null });
                setSearchQuery("");
              }}
              className="w-full"
            >
              Clear All Filters
            </Button>
          )}
        </div>
      )}

      {/* Active Filters Summary */}
      {(currentQuery || currentCategory !== "All" || currentSort !== "popular") && (
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="text-gray-500">Active filters:</span>
          {currentQuery && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
              Search: "{currentQuery}"
              <button onClick={() => setSearchQuery("")} className="ml-1">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {currentCategory !== "All" && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
              {currentCategory}
              <button onClick={() => updateFilters({ category: null })}>
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {currentSort !== "popular" && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
              {sortOptions.find((o) => o.value === currentSort)?.label}
              <button onClick={() => updateFilters({ sort: null })}>
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
}
