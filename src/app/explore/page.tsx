import Link from "next/link";
import { Avatar, Badge, Card, CardContent, Button, SkeletonCreatorCard, SkeletonGrid } from "@/components/ui";
import { ExploreFilters } from "@/components/ui/ExploreFilters";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
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
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header transparent />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Explore Creators
          </h1>
          <p className="text-gray-600 max-w-xl mx-auto">
            Discover amazing creators from Nepal & India. Subscribe to access exclusive content.
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

      {/* Footer */}
      <Footer />

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />
    </main>
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
            <Link key={creator.username} href={`/creator/${creator.username}`}>
              <Card variant="interactive">
                <CardContent>
                  <div className="flex items-start gap-4 mb-4">
                    <Avatar
                      src={creator.image}
                      name={creator.name}
                      size="lg"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {creator.name}
                        </h3>
                        {creator.isVerified && (
                          <div className="w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center shrink-0">
                            <svg
                              className="w-2.5 h-2.5 text-white"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">
                        @{creator.username}
                      </p>
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {creator.bio || "Creator on CreatorConnect"}
                  </p>

                  <div className="flex items-center justify-between">
                    <Badge variant="default">{creator.category}</Badge>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">From</p>
                      <p className="font-semibold text-blue-600">
                        {formatPrice(creator.startingPrice)}/mo
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-sm text-gray-500">
                      <span className="font-medium text-gray-900">
                        {creator.subscriberCount.toLocaleString()}
                      </span>{" "}
                      subscribers
                    </p>
                  </div>
                </CardContent>
              </Card>
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
