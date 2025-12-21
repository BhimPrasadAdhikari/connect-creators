import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import {
  CheckCircle,
  Instagram,
  Youtube,
  Twitter,
  Link as LinkIcon,
  MessageCircle,
  Package,
  Heart,
  Users,
  FileText,
  Download,
} from "lucide-react";
import { Avatar, Card, CardContent, TierCard, PostCard, Button, Badge } from "@/components/ui";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

interface PageProps {
  params: Promise<{ username: string }>;
}

// Fetch creator by username
async function getCreator(username: string) {
  const creator = await prisma.creatorProfile.findUnique({
    where: { username },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
      tiers: {
        where: { isActive: true },
        orderBy: { price: "asc" },
      },
      posts: {
        where: { isPublished: true },
        orderBy: { createdAt: "desc" },
        take: 10,
        include: {
          requiredTier: true,
        },
      },
      digitalProducts: {
        where: { isActive: true },
        orderBy: { createdAt: "desc" },
        take: 6,
      },
      _count: {
        select: {
          subscriptions: {
            where: { status: "ACTIVE" },
          },
          posts: true,
          digitalProducts: true,
        },
      },
    },
  });

  return creator;
}

// Fetch user's subscriptions and purchases for this creator
async function getUserPurchaseStatus(userId: string | null, creatorId: string, productIds: string[]) {
  if (!userId) {
    return {
      subscribedTierIds: new Set<string>(),
      purchasedProductIds: new Set<string>(),
    };
  }

  const [subscriptions, purchases] = await Promise.all([
    prisma.subscription.findMany({
      where: {
        fanId: userId,
        creatorId: creatorId,
        status: "ACTIVE",
      },
      select: { tierId: true },
    }),
    prisma.purchase.findMany({
      where: {
        userId: userId,
        status: "COMPLETED",
        productId: { in: productIds },
      },
      select: { productId: true },
    }),
  ]);

  return {
    subscribedTierIds: new Set(subscriptions.map((s) => s.tierId)),
    purchasedProductIds: new Set(purchases.map((p) => p.productId).filter(Boolean) as string[]),
  };
}

// Parse social links
function getSocialIcon(key: string) {
  switch (key.toLowerCase()) {
    case "instagram":
      return Instagram;
    case "youtube":
      return Youtube;
    case "twitter":
      return Twitter;
    case "spotify":
      return Heart;
    default:
      return LinkIcon;
  }
}

// Format price helper
function formatPrice(amountInPaise: number): string {
  const amount = amountInPaise / 100;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export default async function CreatorProfilePage({ params }: PageProps) {
  const { username } = await params;
  const creator = await getCreator(username);
  const session = await getServerSession(authOptions);

  if (!creator) {
    notFound();
  }

  const userId = (session?.user as { id?: string })?.id || null;
  const productIds = creator.digitalProducts.map((p) => p.id);
  const { subscribedTierIds, purchasedProductIds } = await getUserPurchaseStatus(
    userId,
    creator.id,
    productIds
  );

  const displayName = creator.displayName || creator.user.name || creator.username;
  const socialLinks = (creator.socialLinks as Record<string, string>) || {};
  const isOwner = session?.user?.id === creator.user.id;

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Header />

      {/* Cover Image Section */}
      <div className="relative">
        <div className="h-56 sm:h-72 lg:h-80 w-full overflow-hidden">
          {creator.coverImage ? (
            <img
              src={creator.coverImage}
              alt="Cover"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-600 via-blue-500 to-purple-600" />
          )}
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        </div>

        {/* Profile Card - overlapping cover */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative -mt-24 sm:-mt-32 bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row gap-6">
              {/* Avatar */}
              <div className="flex-shrink-0 -mt-20 sm:-mt-24">
                <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full border-4 border-white shadow-lg overflow-hidden bg-gray-200">
                  {creator.user.image ? (
                    <img
                      src={creator.user.image}
                      alt={displayName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-4xl font-bold">
                      {displayName.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
              </div>

              {/* Info */}
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                        {displayName}
                      </h1>
                      {creator.isVerified && (
                        <CheckCircle className="w-6 h-6 text-blue-500 fill-blue-500" />
                      )}
                    </div>
                    <p className="text-gray-500 mb-3">@{creator.username}</p>

                    {/* Bio */}
                    <p className="text-gray-700 max-w-xl leading-relaxed">
                      {creator.bio || "Welcome to my page! Subscribe to access exclusive content."}
                    </p>
                  </div>

                  {/* Stats */}
                  <div className="flex gap-6 sm:gap-8">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Users className="w-4 h-4 text-gray-400" />
                        <p className="text-2xl font-bold text-gray-900">
                          {creator._count.subscriptions}
                        </p>
                      </div>
                      <p className="text-sm text-gray-500">Subscribers</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <FileText className="w-4 h-4 text-gray-400" />
                        <p className="text-2xl font-bold text-gray-900">
                          {creator._count.posts}
                        </p>
                      </div>
                      <p className="text-sm text-gray-500">Posts</p>
                    </div>
                  </div>
                </div>

                {/* Social Links & Actions */}
                <div className="flex flex-wrap items-center gap-3 mt-6">
                  {/* Social Links */}
                  {Object.entries(socialLinks).map(([key, url]) => {
                    const IconComponent = getSocialIcon(key);
                    return (
                      <a
                        key={key}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all hover:scale-105"
                      >
                        <IconComponent className="w-4 h-4" />
                        <span className="text-sm font-medium capitalize">{key}</span>
                      </a>
                    );
                  })}

                  {/* Spacer */}
                  <div className="flex-1" />

                  {/* Action Buttons */}
                  {!isOwner && (
                    <Link
                      href={`/messages?creator=${creator.id}`}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gray-900 text-white hover:bg-gray-800 transition-colors font-medium"
                    >
                      <MessageCircle className="w-4 h-4" />
                      Message
                    </Link>
                  )}
                  {isOwner && (
                    <Link
                      href="/dashboard/creator"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors font-medium"
                    >
                      Edit Profile
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Tiers & Products */}
          <div className="lg:col-span-1 space-y-8">
            {/* Subscription Tiers */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Heart className="w-5 h-5 text-pink-500" />
                Support {displayName.split(" ")[0]}
              </h2>

              {creator.tiers.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center text-gray-500">
                    No subscription tiers available yet.
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-5">
                  {creator.tiers.map((tier, index) => (
                    <div
                      key={tier.id}
                      className={`relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 ${
                        index === 0 
                          ? "ring-2 ring-blue-500 shadow-blue-100" 
                          : "border border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      {/* Popular badge - inside card */}
                      {index === 0 && (
                        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-center py-2 text-sm font-semibold">
                          ⭐ Most Popular
                        </div>
                      )}
                      
                      <div className="p-6">
                        <h3 className="font-bold text-xl text-gray-900 mb-2">
                          {tier.name}
                        </h3>
                        <div className="flex items-baseline gap-1 mb-4">
                          <span className="text-3xl font-bold text-gray-900">
                            {formatPrice(tier.price)}
                          </span>
                          <span className="text-gray-500">/month</span>
                        </div>
                        
                        {tier.description && (
                          <p className="text-gray-600 mb-5 pb-5 border-b border-gray-100">
                            {tier.description}
                          </p>
                        )}
                        
                        <ul className="space-y-3 mb-6">
                          {tier.benefits.map((benefit: string, i: number) => (
                            <li key={i} className="flex items-start gap-3 text-gray-700">
                              <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <CheckCircle className="w-3.5 h-3.5 text-green-600" />
                              </div>
                              <span>{benefit}</span>
                            </li>
                          ))}
                        </ul>
                        
                        {subscribedTierIds.has(tier.id) ? (
                          <div className="space-y-2">
                            <div className="flex items-center justify-center gap-2 py-3.5 rounded-xl bg-green-100 text-green-800 font-semibold">
                              <CheckCircle className="w-5 h-5" />
                              You're Subscribed
                            </div>
                            <Link
                              href="/subscriptions"
                              className="block w-full text-center py-2 text-sm text-gray-600 hover:text-gray-900"
                            >
                              Manage subscription →
                            </Link>
                          </div>
                        ) : (
                          <Link
                            href={`/checkout/${tier.id}`}
                            className={`block w-full text-center py-3.5 rounded-xl font-semibold transition-all duration-200 ${
                              index === 0
                                ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-500/25"
                                : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                            }`}
                          >
                            Subscribe Now
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Digital Products */}
            {creator.digitalProducts && creator.digitalProducts.length > 0 && (
              <div className="mt-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Package className="w-5 h-5 text-purple-500" />
                  Digital Products
                </h2>
                <div className="space-y-3">
                  {creator.digitalProducts.map((product) => (
                    <div
                      key={product.id}
                      className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md hover:border-purple-200 transition-all"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 truncate">
                            {product.title}
                          </h3>
                          {product.description && (
                            <p className="text-sm text-gray-500 line-clamp-2 mt-1">
                              {product.description}
                            </p>
                          )}
                          {product.fileType && (
                            <span className="inline-block mt-2 px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full font-medium">
                              {product.fileType.toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div className="text-right flex-shrink-0">
                          {purchasedProductIds.has(product.id) ? (
                            <>
                              <div className="flex items-center gap-1 text-green-600 font-semibold mb-1">
                                <CheckCircle className="w-4 h-4" />
                                Owned
                              </div>
                              <Link
                                href={`/products/${product.id}`}
                                className="text-sm text-purple-600 hover:underline font-medium flex items-center gap-1"
                              >
                                <Download className="w-3 h-3" />
                                View →
                              </Link>
                            </>
                          ) : (
                            <>
                              <p className="font-bold text-lg text-purple-600">
                                {formatPrice(product.price)}
                              </p>
                              <Link
                                href={`/products/${product.id}`}
                                className="text-sm text-purple-600 hover:underline font-medium"
                              >
                                Buy Now →
                              </Link>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Send a Message (for non-owners) */}
            {!isOwner && (
              <div className="mt-6">
                <Link
                  href={`/messages?creator=${creator.id}`}
                  className="flex items-center justify-center gap-3 w-full py-4 rounded-xl bg-gradient-to-r from-gray-900 to-gray-800 text-white font-semibold hover:from-gray-800 hover:to-gray-700 transition-all shadow-lg"
                >
                  <MessageCircle className="w-5 h-5" />
                  Send a Message
                </Link>
              </div>
            )}
          </div>

          {/* Right Column - Posts */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-500" />
              Posts
            </h2>

            {creator.posts.length === 0 ? (
              <Card>
                <CardContent className="py-16 text-center">
                  <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No posts yet. Check back soon!</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {creator.posts.map((post) => (
                  <div
                    key={post.id}
                    className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    {/* Post Header */}
                    <div className="p-5">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200">
                          {creator.user.image ? (
                            <img
                              src={creator.user.image}
                              alt={displayName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                              {displayName.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">{displayName}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(post.createdAt).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </p>
                        </div>
                        {post.isPaid && (
                          <Badge variant="accent">
                            {post.requiredTier?.name || "Premium"}
                          </Badge>
                        )}
                      </div>

                      <Link href={`/post/${post.id}`}>
                        <h3 className="text-lg font-bold text-gray-900 hover:text-blue-600 transition-colors mb-2">
                          {post.title}
                        </h3>
                      </Link>

                      {/* Content preview or locked state */}
                      {post.isPaid ? (
                        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-6 text-center border border-gray-200">
                          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-200 flex items-center justify-center">
                            <Heart className="w-6 h-6 text-gray-400" />
                          </div>
                          <p className="text-gray-600 mb-4">
                            Subscribe to unlock this content
                          </p>
                          <Link
                            href={`/checkout/${creator.tiers[0]?.id}`}
                            className="inline-block px-5 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                          >
                            Subscribe from {creator.tiers[0] ? formatPrice(creator.tiers[0].price) : "₹99"}/mo
                          </Link>
                        </div>
                      ) : (
                        <p className="text-gray-700 line-clamp-3">{post.content}</p>
                      )}
                    </div>

                    {/* Post Media */}
                    {post.mediaUrl && !post.isPaid && (
                      <div className="border-t border-gray-100">
                        {post.mediaType === "image" && (
                          <img
                            src={post.mediaUrl}
                            alt={post.title}
                            className="w-full max-h-96 object-cover"
                          />
                        )}
                        {post.mediaType === "video" && (
                          <video
                            src={post.mediaUrl}
                            controls
                            className="w-full max-h-96"
                          />
                        )}
                      </div>
                    )}

                    {/* Post Footer */}
                    <div className="px-5 py-3 bg-gray-50 border-t border-gray-100">
                      <Link
                        href={`/post/${post.id}`}
                        className="text-blue-600 text-sm font-medium hover:underline"
                      >
                        View full post →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
