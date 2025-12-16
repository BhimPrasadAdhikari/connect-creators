import Link from "next/link";
import { Search, Filter } from "lucide-react";
import { Avatar, Badge, Card, CardContent, Button } from "@/components/ui";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import prisma from "@/lib/prisma";

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

// Fetch creators from database
async function getCreators() {
  const creators = await prisma.creatorProfile.findMany({
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
    orderBy: {
      createdAt: "desc",
    },
  });

  return creators.map((creator) => ({
    username: creator.username,
    name: creator.displayName || creator.user.name || creator.username,
    bio: creator.bio,
    image: creator.user.image,
    isVerified: creator.isVerified,
    subscriberCount: creator._count.subscriptions,
    startingPrice: creator.tiers[0]?.price || 9900,
    category: "Creator", // Could be added as a field later
  }));
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

export default async function ExplorePage() {
  const creators = await getCreators();

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

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search creators..."
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
          <Button variant="outline" className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters
          </Button>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-2 mb-8">
          {CATEGORIES.map((category, index) => (
            <button
              key={category}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                index === 0
                  ? "bg-blue-600 text-white"
                  : "bg-white border border-gray-200 text-gray-600 hover:border-blue-500 hover:text-blue-600"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Creators Grid */}
        {creators.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No creators found. Be the first to join!</p>
            <Link href="/signup?role=creator" className="text-blue-600 hover:underline mt-2 inline-block">
              Become a Creator
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {creators.map((creator) => (
              <Link key={creator.username} href={`/creator/${creator.username}`}>
                <Card className="h-full hover:shadow-lg transition-shadow">
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
      </div>

      {/* Footer */}
      <Footer />
    </main>
  );
}
