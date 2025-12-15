import Link from "next/link";
import { notFound } from "next/navigation";
import {
  CheckCircle,
  Instagram,
  Youtube,
  Twitter,
  Link as LinkIcon,
} from "lucide-react";
import { Avatar, Card, CardContent, TierCard, PostCard } from "@/components/ui";
import { Header } from "@/components/layout/Header";
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
    default:
      return LinkIcon;
  }
}

export default async function CreatorProfilePage({ params }: PageProps) {
  const { username } = await params;
  const creator = await getCreator(username);

  if (!creator) {
    notFound();
  }

  const displayName = creator.displayName || creator.user.name || creator.username;
  const socialLinks = (creator.socialLinks as Record<string, string>) || {};

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header transparent />

      {/* Cover Image */}
      <div className="h-48 sm:h-64 bg-gradient-to-r from-blue-600 to-blue-400 relative">
        {creator.coverImage && (
          <img
            src={creator.coverImage}
            alt="Cover"
            className="w-full h-full object-cover"
          />
        )}
      </div>

      {/* Profile Info */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-end gap-4 mb-8">
          <Avatar
            src={creator.user.image}
            name={displayName}
            size="xl"
            className="ring-4 ring-white"
          />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold text-gray-900">{displayName}</h1>
              {creator.isVerified && (
                <CheckCircle className="w-6 h-6 text-blue-600 fill-blue-600" />
              )}
            </div>
            <p className="text-gray-600">@{creator.username}</p>
          </div>

          {/* Stats */}
          <div className="flex gap-6">
            <div className="text-center">
              <p className="text-xl font-bold text-gray-900">
                {creator._count.subscriptions}
              </p>
              <p className="text-sm text-gray-500">Subscribers</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-gray-900">
                {creator._count.posts}
              </p>
              <p className="text-sm text-gray-500">Posts</p>
            </div>
          </div>
        </div>

        {/* Bio & Social Links */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
          <p className="text-gray-700 mb-4">{creator.bio || "Welcome to my page!"}</p>

          {/* Social Links */}
          {Object.keys(socialLinks).length > 0 && (
            <div className="flex flex-wrap gap-3">
              {Object.entries(socialLinks).map(([key, url]) => {
                const IconComponent = getSocialIcon(key);
                return (
                  <a
                    key={key}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                  >
                    <IconComponent className="w-4 h-4" />
                    <span className="text-sm capitalize">{key}</span>
                  </a>
                );
              })}
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Subscription Tiers */}
          <div className="lg:col-span-1 order-2 lg:order-1">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Subscription Tiers
            </h2>
            <div className="space-y-4">
              {creator.tiers.map((tier, index) => (
                <TierCard
                  key={tier.id}
                  name={tier.name}
                  price={tier.price}
                  currency={tier.currency}
                  description={tier.description || ""}
                  benefits={tier.benefits}
                  isPopular={index === 1}
                  ctaHref={`/checkout/${tier.id}`}
                />
              ))}
            </div>
          </div>

          {/* Posts Feed */}
          <div className="lg:col-span-2 order-1 lg:order-2">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Posts</h2>
            {creator.posts.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <p className="text-gray-500">No posts yet. Check back soon!</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {creator.posts.map((post) => (
                  <PostCard
                    key={post.id}
                    title={post.title}
                    content={post.content}
                    createdAt={post.createdAt}
                    isLocked={post.isPaid}
                    mediaUrl={post.mediaUrl || undefined}
                    mediaType={post.mediaType as "image" | "video" | "audio" | undefined}
                    tierName={post.requiredTier?.name}
                    creator={{
                      name: displayName,
                      username: creator.username,
                      avatar: creator.user.image || undefined,
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer Spacing */}
      <div className="h-20" />
    </main>
  );
}
