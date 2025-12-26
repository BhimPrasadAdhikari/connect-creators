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
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search creators and topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-10 py-4 text-base border border-border bg-card text-foreground rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-muted-foreground"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Toggle (Mobile) */}
        <Button
          variant="outline"
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className="sm:hidden relative h-14 rounded-2xl"
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
            className="w-full appearance-none px-5 py-4 pr-10 border border-border bg-card text-foreground rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer font-medium"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value} className="bg-card text-foreground">
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
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
                : "bg-card text-muted-foreground hover:bg-muted hover:text-foreground border border-border"
            )}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Mobile Filter Panel */}
      {isFilterOpen && (
        <div className="sm:hidden p-4 bg-card rounded-xl border border-border space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Sort By
            </label>
            <select
              value={currentSort}
              onChange={(e) => updateFilters({ sort: e.target.value })}
              className="w-full px-4 py-3 border border-border rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
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
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="text-muted-foreground">Active filters:</span>
          {currentQuery && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-full">
              Search: "{currentQuery}"
              <button onClick={() => setSearchQuery("")} className="ml-1">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {currentCategory !== "All" && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-full">
              {currentCategory}
              <button onClick={() => updateFilters({ category: null })}>
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {currentSort !== "popular" && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-full">
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
