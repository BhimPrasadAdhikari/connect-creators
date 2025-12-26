import { SkeletonGrid, SkeletonCreatorCard } from "@/components/ui/Skeleton";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export default function Loading() {
  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <div className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header skeleton */}
          <div className="mb-8">
            <div className="h-10 w-48 bg-gray-200 animate-pulse rounded-lg mb-2" />
            <div className="h-5 w-96 bg-gray-100 animate-pulse rounded" />
          </div>

          {/* Filters skeleton */}
          <div className="flex gap-3 mb-8 overflow-x-auto pb-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-10 w-24 bg-gray-200 animate-pulse rounded-full flex-shrink-0" />
            ))}
          </div>

          {/* Grid skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <SkeletonCreatorCard key={i} />
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
