import { Skeleton } from "@/components/ui/Skeleton";
import { Header } from "@/components/layout/Header";
import { Card, CardContent } from "@/components/ui";

export default function Loading() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Back link skeleton */}
          <Skeleton className="h-5 w-36 mb-6" />

          {/* Header */}
          <Skeleton className="h-8 w-56 mb-8" />

          {/* Summary Cards */}
          <div className="grid sm:grid-cols-2 gap-4 mb-8">
            {[1, 2].map((i) => (
              <Card key={i}>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <Skeleton className="w-12 h-12 rounded-lg" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-7 w-24" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Payment History Card */}
          <Card>
            <CardContent>
              <Skeleton className="h-6 w-40 mb-6" />
              
              {/* Table header */}
              <div className="grid grid-cols-5 gap-4 pb-3 border-b border-gray-200">
                {["Date", "Description", "Amount", "Status", ""].map((_, i) => (
                  <Skeleton key={i} className="h-4 w-16" />
                ))}
              </div>
              
              {/* Table rows */}
              <div className="divide-y divide-gray-100">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="grid grid-cols-5 gap-4 py-4">
                    <Skeleton className="h-4 w-20" />
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-3 w-12" />
                    </div>
                    <Skeleton className="h-6 w-20 rounded-full" />
                    <Skeleton className="h-8 w-8 rounded" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
