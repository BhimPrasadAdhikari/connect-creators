import Link from "next/link";
import { Button, SkeletonCreatorCard, SkeletonGrid, CreatorCard } from "@/components/ui";
import { ExploreFilters } from "@/components/ui/ExploreFilters";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import prisma from "@/lib/prisma";
import { Suspense } from "react";

// Enable ISR - revalidate every 60 seconds for fresh data with caching
export const revalidate = 60;

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
    select: {
      username: true,
      displayName: true,
      bio: true,
      isVerified: true,
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
        select: {
          price: true,
        },
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
    take: 12, // Limit initial load for performance
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
    <main className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header - Neubrutalist Style */}
        {/* Page Header - Neubrutalist Style */}
        {/* Page Header - Neubrutalist Style */}
        <div className="relative mb-12 py-12 px-4 bg-primary border-4 border-brutal-black text-white overflow-hidden">
           {/* Background Pattern */}
          <div className="absolute inset-0 opacity-20" 
               style={{ backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
          </div>

          <div className="relative z-10 text-center">
            <div className="inline-block transform -rotate-2 mb-6">
              <span className="bg-card text-foreground border-3 border-brutal-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] px-6 py-2 font-black uppercase tracking-widest text-sm sm:text-base">
                Starting at ₹99/month
              </span>
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black mb-6 font-display uppercase tracking-tighter text-white drop-shadow-[6px_6px_0px_rgba(0,0,0,1)]">
              Explore Creators
            </h1>
            
            <div className="max-w-2xl mx-auto bg-brutal-black/20 p-6 border-2 border-white/20 backdrop-blur-sm transform rotate-1">
              <p className="text-lg sm:text-xl font-bold font-mono text-white/90 leading-relaxed">
                Support creators you love. Join their exclusive communities.
              </p>
            </div>
          </div>
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
      <Footer />
    </main>
  );
}

// Separate component for data fetching
async function CreatorsContent({ filters }: { filters: { q?: string; category?: string; sort?: string } }) {
  const creators = await getCreators(filters);

  return (
    <>
      {creators.length === 0 ? (
        <div className="text-center py-12 border-3 border-dashed border-border">
          <p className="text-muted-foreground mb-4 text-lg">
            {filters.q ? `No creators found for "${filters.q}"` : "No creators found. Be the first to join!"}
          </p>
          {filters.q ? (
            <Link href="/explore">
              <Button variant="brutal">Clear Search</Button>
            </Link>
          ) : (
            <Link href="/signup?role=creator">
              <Button variant="brutal-accent">Become a Creator</Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {creators.map((creator) => (
            <CreatorCard
              key={creator.username}
              username={creator.username}
              name={creator.name}
              bio={creator.bio}
              image={creator.image}
              isVerified={creator.isVerified}
              subscriberCount={creator.subscriberCount}
              startingPrice={formatPrice(creator.startingPrice)}
            />
          ))}
        </div>
      )}

      {/* Load More */}
      {creators.length > 0 && (
        <div className="text-center mt-12">
          <Button variant="brutal" size="lg">
            Load More Creators
          </Button>
        </div>
      )}
    </>
  );
}

