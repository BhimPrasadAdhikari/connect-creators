import Link from "next/link";
import { Users as UsersIcon } from "lucide-react";
import { Avatar, Button, SkeletonCreatorCard, SkeletonGrid } from "@/components/ui";
import { ExploreFilters } from "@/components/ui/ExploreFilters";
import prisma from "@/lib/prisma";
import { Suspense } from "react";

// Helper function to format price
function formatPrice(amountInPaise: number): string {
  const amount = amountInPaise / 100;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// Fetch creators from database with filtering
async function getCreators(filters: {
  q?: string;
  category?: string;
  sort?: string;
}) {
  const { q, sort } = filters;
  
  // Build orderBy based on sort
  let orderBy: Record<string, string> = { createdAt: "desc" };
  if (sort === "new") {
    orderBy = { createdAt: "desc" };
  } else if (sort === "price-low" || sort === "price-high") {
    // Will sort after fetch since price is in related table
    orderBy = { createdAt: "desc" };
  }

  const creators = await prisma.creatorProfile.findMany({
    where: q ? {
      OR: [
        { displayName: { contains: q, mode: "insensitive" } },
        { username: { contains: q, mode: "insensitive" } },
        { bio: { contains: q, mode: "insensitive" } },
      ],
    } : undefined,
    include: {
      user: {
        select: {
          name: true,
          image: true,
        },
      },
      tiers: {
        where: { isActive: true },
        orderBy: { price: "asc" },
        take: 1,
      },
      _count: {
        select: {
          subscriptions: {
            where: { status: "ACTIVE" },
          },
        },
      },
    },
    orderBy,
  });

  let mappedCreators = creators.map((creator) => ({
    username: creator.username,
    name: creator.displayName || creator.user.name || creator.username,
    bio: creator.bio,
    image: creator.user.image,
    isVerified: creator.isVerified,
    subscriberCount: creator._count.subscriptions,
    startingPrice: creator.tiers[0]?.price || 9900,
    category: "Creator",
  }));

  // Apply price sorting
  if (sort === "price-low") {
    mappedCreators.sort((a, b) => a.startingPrice - b.startingPrice);
  } else if (sort === "price-high") {
    mappedCreators.sort((a, b) => b.startingPrice - a.startingPrice);
  } else if (sort === "popular") {
    mappedCreators.sort((a, b) => b.subscriberCount - a.subscriberCount);
  }

  return mappedCreators;
}

const CATEGORIES = [
  "All",
  "Art",
  "Technology",
  "Fitness",
  "Music",
  "Food",
  "Travel",
  "Education",
  "Lifestyle",
];

interface PageProps {
  searchParams: Promise<{ q?: string; category?: string; sort?: string }>;
}

export default async function ExplorePage({ searchParams }: PageProps) {
  const params = await searchParams;
  
  return (
    <div className="p-6 lg:p-8">
      {/* Page Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Explore Creators
        </h1>
        <p className="text-gray-600 max-w-xl mx-auto">
          Support creators you love. Join their exclusive communities.
          Starting at just ₹99/month.
        </p>
      </div>

      {/* Filters */}
      <ExploreFilters categories={CATEGORIES} className="mb-8" />

      {/* Creators Grid with Suspense */}
      <Suspense 
        key={JSON.stringify(params)} 
        fallback={<SkeletonGrid count={9} component={SkeletonCreatorCard} />}
      >
        <CreatorsContent filters={params} />
      </Suspense>
    </div>
  );
}

// Separate component for data fetching
async function CreatorsContent({ filters }: { filters: { q?: string; category?: string; sort?: string } }) {
  const creators = await getCreators(filters);

  return (
    <>
      {creators.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-2">
            {filters.q ? `No creators found for "${filters.q}"` : "No creators found. Be the first to join!"}
          </p>
          {filters.q ? (
            <Link href="/explore" className="text-blue-600 hover:underline">
              Clear search
            </Link>
          ) : (
            <Link href="/signup?role=creator" className="text-blue-600 hover:underline">
              Become a Creator
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {creators.map((creator) => (
            <Link key={creator.username} href={`/creator/${creator.username}`} className="block group">
              <div className="h-full p-5 rounded-3xl bg-white border border-transparent hover:border-gray-200 hover:shadow-lg transition-all duration-300">
                <div className="flex items-start gap-4 mb-4">
                  <div className="relative">
                    <Avatar
                      src={creator.image}
                      name={creator.name}
                      size="lg"
                      className="w-16 h-16 ring-4 ring-gray-50 group-hover:ring-white transition-all"
                    />
                    {creator.isVerified && (
                      <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5">
                        <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0 pt-1">
                    <h3 className="font-bold text-gray-900 truncate text-lg group-hover:text-blue-600 transition-colors">
                      {creator.name}
                    </h3>
                    <p className="text-sm text-gray-500 font-medium">
                      @{creator.username}
                    </p>
                  </div>
                </div>

                <p className="text-gray-600 text-sm mb-6 line-clamp-2 leading-relaxed min-h-[40px]">
                  {creator.bio || "Creator on CreatorConnect. Join to see their exclusive content."}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-gray-50 group-hover:border-gray-100 transition-colors">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <UsersIcon className="w-4 h-4" />
                    <span className="font-semibold text-gray-900">{creator.subscriberCount.toLocaleString()}</span>
                  </div>
                  
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-bold group-hover:bg-blue-600 group-hover:text-white transition-all">
                    <span>{formatPrice(creator.startingPrice)}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Load More */}
      {creators.length > 0 && (
        <div className="text-center mt-12">
          <Button variant="outline" size="lg">
            Load More Creators
          </Button>
        </div>
      )}
    </>
  );
}
