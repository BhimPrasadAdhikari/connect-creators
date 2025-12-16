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
      _count: {
        select: {
          subscriptions: {
            where: { status: "ACTIVE" },
          },
          posts: true,
        },
      },
    },
  });

  return creator;
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
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
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
                <div className="space-y-4">
                  {creator.tiers.map((tier, index) => (
                    <div
                      key={tier.id}
                      className={`relative bg-white rounded-xl border-2 p-5 transition-all hover:shadow-lg ${
                        index === 0 ? "border-blue-500 shadow-md" : "border-gray-200"
                      }`}
                    >
                      {index === 0 && (
                        <Badge
                          variant="accent"
                          className="absolute -top-2 left-4 text-xs"
                        >
                          Most Popular
                        </Badge>
                      )}
                      <h3 className="font-bold text-lg text-gray-900 mb-1">
                        {tier.name}
                      </h3>
                      <p className="text-2xl font-bold text-blue-600 mb-3">
                        {formatPrice(tier.price)}
                        <span className="text-sm font-normal text-gray-500">/month</span>
                      </p>
                      {tier.description && (
                        <p className="text-sm text-gray-600 mb-4">{tier.description}</p>
                      )}
                      <ul className="space-y-2 mb-5">
                        {tier.benefits.map((benefit, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                            <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                            {benefit}
                          </li>
                        ))}
                      </ul>
                      <Link
                        href={`/checkout/${tier.id}`}
                        className={`block w-full text-center py-3 rounded-lg font-semibold transition-colors ${
                          index === 0
                            ? "bg-blue-600 text-white hover:bg-blue-700"
                            : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                        }`}
                      >
                        Subscribe
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
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
