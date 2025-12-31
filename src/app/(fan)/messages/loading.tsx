import { Skeleton, MessageSkeleton } from "@/components/ui/Skeleton";
import { Header } from "@/components/layout/Header";
import { Card, CardContent } from "@/components/ui";

export default function Loading() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Back link */}
          <Skeleton className="h-5 w-36 mb-6" />
          
          {/* Title */}
          <Skeleton className="h-8 w-32 mb-8" />

          {/* Messages layout */}
          <div className="grid md:grid-cols-3 gap-4 h-[600px]">
            {/* Conversations List */}
            <Card className="md:col-span-1">
              <CardContent className="p-0">
                <MessageSkeleton />
                <MessageSkeleton />
                <MessageSkeleton />
                <MessageSkeleton />
              </CardContent>
            </Card>

            {/* Messages View */}
            <Card className="md:col-span-2 flex flex-col">
              <CardContent className="p-4 flex-1">
                <div className="flex items-center gap-3 pb-4 border-b">
                  <Skeleton className="w-10 h-10 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                
                <div className="flex-1 py-6 space-y-4">
                  <div className="flex justify-start">
                    <Skeleton className="h-16 w-48 rounded-lg" />
                  </div>
                  <div className="flex justify-end">
                    <Skeleton className="h-12 w-40 rounded-lg" />
                  </div>
                  <div className="flex justify-start">
                    <Skeleton className="h-20 w-56 rounded-lg" />
                  </div>
                </div>
                
                <div className="flex gap-2 pt-4 border-t">
                  <Skeleton className="flex-1 h-10 rounded-lg" />
                  <Skeleton className="w-10 h-10 rounded-lg" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
