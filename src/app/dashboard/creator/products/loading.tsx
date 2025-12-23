import { ProductCardSkeleton } from "@/components/ui/Skeleton";
import { Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="p-6 lg:p-12 max-w-5xl mx-auto">
      <div className="flex items-end justify-between mb-12">
        <div>
          <Skeleton height={36} width={200} className="mb-2" />
          <Skeleton height={20} width={280} />
        </div>
        <Skeleton height={44} width={130} className="rounded-2xl" />
      </div>
      <div className="space-y-4">
        <ProductCardSkeleton />
        <ProductCardSkeleton />
        <ProductCardSkeleton />
      </div>
    </div>
  );
}
