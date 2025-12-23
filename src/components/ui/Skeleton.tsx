import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
  variant?: "text" | "circular" | "rectangular";
  width?: string | number;
  height?: string | number;
  animate?: boolean;
}

export function Skeleton({
  className,
  variant = "rectangular",
  width,
  height,
  animate = true,
}: SkeletonProps) {
  const variantStyles = {
    text: "rounded",
    circular: "rounded-full",
    rectangular: "rounded-lg",
  };

  return (
    <div
      className={cn(
        "bg-gray-200",
        animate && "animate-pulse",
        variantStyles[variant],
        className
      )}
      style={{
        width: typeof width === "number" ? `${width}px` : width,
        height: typeof height === "number" ? `${height}px` : height,
      }}
    />
  );
}

// Preset skeleton components for common use cases

export function SkeletonText({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          variant="text"
          height={16}
          width={i === lines - 1 ? "80%" : "100%"}
        />
      ))}
    </div>
  );
}

export function SkeletonAvatar({ size = "md" }: { size?: "sm" | "md" | "lg" | "xl" }) {
  const sizes = {
    sm: 32,
    md: 40,
    lg: 48,
    xl: 64,
  };

  return <Skeleton variant="circular" width={sizes[size]} height={sizes[size]} />;
}

export function SkeletonButton({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const heights = {
    sm: 36,
    md: 44,
    lg: 52,
  };

  const widths = {
    sm: 80,
    md: 120,
    lg: 160,
  };

  return <Skeleton width={widths[size]} height={heights[size]} />;
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn("p-6 bg-white rounded-xl border border-gray-200", className)}>
      <div className="flex items-start gap-4 mb-4">
        <SkeletonAvatar size="lg" />
        <div className="flex-1 space-y-2">
          <Skeleton height={20} width="60%" />
          <Skeleton height={16} width="40%" />
        </div>
      </div>
      <SkeletonText lines={3} />
      <div className="flex items-center gap-2 mt-4">
        <SkeletonButton size="sm" />
        <SkeletonButton size="sm" />
      </div>
    </div>
  );
}

export function SkeletonCreatorCard() {
  return (
    <div className="p-6 bg-white rounded-xl border border-gray-200">
      <div className="flex items-start gap-4 mb-4">
        <SkeletonAvatar size="lg" />
        <div className="flex-1 space-y-2">
          <Skeleton height={20} width="70%" />
          <Skeleton height={14} width="40%" />
        </div>
      </div>
      <SkeletonText lines={2} className="mb-4" />
      <div className="flex items-center justify-between mb-4">
        <Skeleton height={24} width={60} />
        <Skeleton height={20} width={80} />
      </div>
      <div className="pt-4 border-t border-gray-100">
        <Skeleton height={16} width="50%" />
      </div>
    </div>
  );
}

export function SkeletonPost() {
  return (
    <div className="p-6 bg-white rounded-xl border border-gray-200">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <SkeletonAvatar />
        <div className="flex-1 space-y-2">
          <Skeleton height={16} width="30%" />
          <Skeleton height={14} width="20%" />
        </div>
        <Skeleton height={24} width={60} />
      </div>

      {/* Title */}
      <Skeleton height={24} width="80%" className="mb-4" />

      {/* Content */}
      <SkeletonText lines={4} className="mb-4" />

      {/* Image placeholder */}
      <Skeleton height={200} className="mb-4" />

      {/* Footer */}
      <div className="flex items-center gap-4">
        <Skeleton height={32} width={32} variant="circular" />
        <Skeleton height={32} width={32} variant="circular" />
        <Skeleton height={32} width={32} variant="circular" />
      </div>
    </div>
  );
}

export function SkeletonHeader() {
  return (
    <div className="h-16 px-4 sm:px-6 lg:px-8 border-b border-gray-200 bg-white">
      <div className="flex items-center justify-between h-full container mx-auto">
        <div className="flex items-center gap-2">
          <Skeleton variant="rectangular" width={32} height={32} />
          <Skeleton height={24} width={150} />
        </div>
        <div className="hidden md:flex items-center gap-6">
          <Skeleton height={20} width={100} />
          <Skeleton height={20} width={100} />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton height={40} width={100} />
          <SkeletonAvatar size="sm" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonDashboard() {
  return (
    <div className="p-8 space-y-8">
      {/* Welcome section */}
      <div>
        <Skeleton height={32} width="40%" className="mb-2" />
        <Skeleton height={20} width="60%" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-6 bg-white rounded-xl border border-gray-200">
            <Skeleton height={16} width="50%" className="mb-4" />
            <Skeleton height={36} width="40%" />
          </div>
        ))}
      </div>

      {/* Feed */}
      <div className="space-y-6">
        <Skeleton height={24} width={120} />
        <SkeletonPost />
        <SkeletonPost />
        <SkeletonPost />
      </div>
    </div>
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gray-50 p-4 border-b border-gray-200">
        <div className="flex items-center gap-4">
          <Skeleton height={16} width="20%" />
          <Skeleton height={16} width="30%" />
          <Skeleton height={16} width="15%" />
          <Skeleton height={16} width="20%" />
        </div>
      </div>

      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="p-4 border-b border-gray-100 last:border-b-0">
          <div className="flex items-center gap-4">
            <SkeletonAvatar size="sm" />
            <Skeleton height={16} width="25%" />
            <Skeleton height={16} width="15%" />
            <Skeleton height={16} width="20%" />
          </div>
        </div>
      ))}
    </div>
  );
}

// Grid of skeleton cards
export function SkeletonGrid({
  count = 6,
  component = SkeletonCard,
  className,
}: {
  count?: number;
  component?: React.ComponentType<{ className?: string }>;
  className?: string;
}) {
  const Component = component;
  
  return (
    <div className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <Component key={i} />
      ))}
    </div>
  );
}

// Product card skeleton for products management page
export function ProductCardSkeleton() {
  return (
    <div className="p-4 bg-white rounded-xl border border-gray-200">
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <Skeleton height={20} width="50%" />
            <Skeleton height={20} width={60} />
          </div>
          <Skeleton height={24} width={80} />
          <Skeleton height={16} width="70%" />
          <div className="flex gap-4 pt-2">
            <Skeleton height={14} width={60} />
            <Skeleton height={14} width={80} />
          </div>
        </div>
        <Skeleton height={36} width={36} />
      </div>
    </div>
  );
}

// Tiers page skeleton
export function TiersPageSkeleton() {
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <Skeleton height={24} width={160} />
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton height={32} width={200} />
          <Skeleton height={20} width={250} />
        </div>
        <Skeleton height={40} width={100} />
      </div>
      <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
        <Skeleton height={80} width="100%" />
      </div>
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-4 bg-white rounded-xl border border-gray-200">
            <div className="flex items-start justify-between">
              <div className="space-y-2 flex-1">
                <Skeleton height={20} width="30%" />
                <Skeleton height={28} width={80} />
                <Skeleton height={16} width="60%" />
              </div>
              <div className="flex gap-2">
                <Skeleton height={36} width={36} />
                <Skeleton height={36} width={36} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Message skeleton for messages/chat page
export function MessageSkeleton() {
  return (
    <div className="flex items-start gap-3 py-3">
      <SkeletonAvatar size="sm" />
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <Skeleton height={14} width={100} />
          <Skeleton height={12} width={60} />
        </div>
        <Skeleton height={16} width="80%" />
        <Skeleton height={16} width="50%" />
      </div>
    </div>
  );
}

// Subscribers page skeleton
export function SubscribersPageSkeleton() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <Skeleton height={36} width={200} className="mb-2" />
        <Skeleton height={20} width={160} />
      </div>

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-gray-100">
            <div className="flex items-center gap-4">
              <Skeleton height={48} width={48} className="rounded-xl" />
              <div className="flex-1">
                <Skeleton height={14} width={80} className="mb-2" />
                <Skeleton height={28} width={60} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Subscriber List */}
      <div className="space-y-4">
        <Skeleton height={24} width={150} className="mb-4" />
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-white p-4 rounded-2xl border border-gray-100 flex items-center gap-4">
            <SkeletonAvatar size="md" />
            <div className="flex-1">
              <Skeleton height={18} width={120} className="mb-1" />
              <Skeleton height={14} width={180} />
            </div>
            <div className="text-right">
              <Skeleton height={20} width={70} className="mb-1" />
              <Skeleton height={14} width={90} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Earnings page skeleton
export function EarningsPageSkeleton() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <Skeleton height={36} width={250} />

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <Skeleton height={40} width={40} className="rounded-xl" />
              <Skeleton height={14} width={100} />
            </div>
            <Skeleton height={32} width={90} />
          </div>
        ))}
      </div>

      {/* Breakdown Section */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-gray-100">
          <Skeleton height={24} width={150} className="mb-6" />
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex justify-between">
                <Skeleton height={16} width={120} />
                <Skeleton height={16} width={80} />
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-gray-100">
          <Skeleton height={24} width={130} className="mb-6" />
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <SkeletonAvatar size="sm" />
                <div className="flex-1">
                  <Skeleton height={14} width={100} />
                </div>
                <Skeleton height={14} width={60} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Settings page skeleton
export function SettingsPageSkeleton() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <Skeleton height={36} width={200} />

      <div className="grid md:grid-cols-4 gap-6">
        {/* Navigation */}
        <nav className="md:col-span-1">
          <div className="bg-white rounded-2xl border border-gray-100 p-2">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3">
                <Skeleton height={20} width={20} className="rounded" />
                <Skeleton height={16} width={80} />
              </div>
            ))}
          </div>
        </nav>

        {/* Content */}
        <div className="md:col-span-3">
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <Skeleton height={24} width={150} className="mb-6" />
            <div className="space-y-4">
              <div>
                <Skeleton height={14} width={100} className="mb-2" />
                <Skeleton height={44} width="100%" className="rounded-lg" />
              </div>
              <div>
                <Skeleton height={14} width={80} className="mb-2" />
                <Skeleton height={44} width="100%" className="rounded-lg" />
              </div>
              <div>
                <Skeleton height={14} width={40} className="mb-2" />
                <Skeleton height={100} width="100%" className="rounded-lg" />
              </div>
              <div className="flex justify-end pt-4">
                <Skeleton height={44} width={140} className="rounded-lg" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Posts page skeleton
export function PostsPageSkeleton() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <Skeleton height={36} width={140} className="mb-2" />
          <Skeleton height={20} width={200} />
        </div>
        <Skeleton height={44} width={130} className="rounded-2xl" />
      </div>

      {/* Posts Grid */}
      <div className="space-y-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-gray-100">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Skeleton height={24} width={60} className="rounded-full" />
                  <Skeleton height={14} width={100} />
                </div>
                <Skeleton height={22} width="70%" className="mb-2" />
                <Skeleton height={16} width="90%" />
              </div>
              <div className="flex gap-2">
                <Skeleton height={36} width={36} className="rounded-lg" />
                <Skeleton height={36} width={36} className="rounded-lg" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
