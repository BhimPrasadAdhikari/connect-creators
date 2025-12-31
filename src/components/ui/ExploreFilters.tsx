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
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground stroke-[3]" />
          <input
            type="text"
            placeholder="Search creators and topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-10 py-4 text-base border-3 border-brutal-black bg-card text-foreground rounded-none shadow-brutal-sm focus:outline-none focus:shadow-brutal transition-all placeholder:text-muted-foreground font-medium"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 border-2 border-brutal-black bg-accent-red text-white hover:bg-red-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Toggle (Mobile) */}
        <Button
          variant="outline"
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className="sm:hidden relative h-14 rounded-none border-3"
        >
          <SlidersHorizontal className="w-5 h-5 mr-2 stroke-[3]" />
          Filters
          {activeFiltersCount > 0 && (
            <span className="absolute -top-2 -right-2 w-6 h-6 bg-accent-yellow border-2 border-brutal-black text-foreground text-xs font-bold flex items-center justify-center">
              {activeFiltersCount}
            </span>
          )}
        </Button>

        {/* Sort Dropdown (Desktop) */}
        <div className="hidden sm:block relative min-w-[200px]">
          <select
            value={currentSort}
            onChange={(e) => updateFilters({ sort: e.target.value })}
            className="w-full appearance-none px-5 py-4 pr-10 border-3 border-brutal-black bg-card text-foreground rounded-none shadow-brutal-sm focus:outline-none focus:shadow-brutal cursor-pointer font-bold uppercase tracking-wide"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value} className="bg-card text-foreground">
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground stroke-[3] pointer-events-none" />
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => updateFilters({ category: category })}
            className={cn(
              "px-6 py-2.5 rounded-none text-sm font-bold uppercase tracking-wider whitespace-nowrap transition-all shrink-0 border-2 border-brutal-black",
              currentCategory === category
                ? "bg-primary text-white shadow-brutal-sm translate-x-[-2px] translate-y-[-2px]"
                : "bg-card text-foreground hover:bg-primary hover:text-white hover:shadow-brutal-sm"
            )}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Mobile Filter Panel */}
      {isFilterOpen && (
        <div className="sm:hidden p-4 bg-card border-3 border-brutal-black shadow-brutal space-y-4">
          <div>
            <label className="block text-sm font-bold text-foreground uppercase mb-2">
              Sort By
            </label>
            <select
              value={currentSort}
              onChange={(e) => updateFilters({ sort: e.target.value })}
              className="w-full px-4 py-3 border-2 border-brutal-black rounded-none bg-card text-foreground font-medium focus:outline-none focus:ring-0 focus:bg-accent-yellow/10"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value} className="bg-card text-foreground">
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
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <span className="text-foreground font-bold uppercase">Active filters:</span>
          {currentQuery && (
            <span className="inline-flex items-center gap-2 px-3 py-1 bg-primary text-white border-2 border-brutal-black font-bold rounded-none shadow-brutal-sm">
              Search: "{currentQuery}"
              <button onClick={() => setSearchQuery("")} className="hover:text-foreground">
                <X className="w-4 h-4 stroke-[3]" />
              </button>
            </span>
          )}
          {currentCategory !== "All" && (
            <span className="inline-flex items-center gap-2 px-3 py-1 bg-primary text-white border-2 border-brutal-black font-bold rounded-none shadow-brutal-sm">
              {currentCategory}
              <button onClick={() => updateFilters({ category: null })} className="hover:text-foreground">
                <X className="w-4 h-4 stroke-[3]" />
              </button>
            </span>
          )}
          {currentSort !== "popular" && (
            <span className="inline-flex items-center gap-2 px-3 py-1 bg-accent-yellow text-foreground border-2 border-brutal-black font-bold rounded-none shadow-brutal-sm">
              {sortOptions.find((o) => o.value === currentSort)?.label}
              <button onClick={() => updateFilters({ sort: null })} className="hover:text-white">
                <X className="w-4 h-4 stroke-[3]" />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
}
