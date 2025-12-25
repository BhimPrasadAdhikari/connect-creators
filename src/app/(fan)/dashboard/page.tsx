import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { Compass, Package, Download, ShoppingBag } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { Avatar, Card, CardContent, PostCard } from "@/components/ui";
import prisma from "@/lib/prisma";

async function getDashboardData(userId: string) {
  const subscriptions = await prisma.subscription.findMany({
    where: {
      fanId: userId,
      status: "ACTIVE",
    },
    include: {
      tier: true,
      creator: {
        include: {
          user: {
            select: {
              name: true,
              image: true,
            },
          },
          posts: {
            where: { isPublished: true },
            orderBy: { createdAt: "desc" },
            take: 5,
            include: {
              requiredTier: true,
            },
          },
        },
      },
    },
  });

  const purchases = await prisma.purchase.findMany({
    where: {
      userId,
      status: "COMPLETED",
    },
    include: {
      product: {
        include: {
          creator: {
            include: {
              user: { select: { name: true, image: true } },
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  const feed = subscriptions.flatMap((sub) =>
    sub.creator.posts.map((post) => ({
      ...post,
      creatorName: sub.creator.displayName || sub.creator.user.name || sub.creator.username,
      creatorUsername: sub.creator.username,
      creatorAvatar: sub.creator.user.image,
      hasAccess: !post.isPaid || !post.requiredTier || sub.tier.price >= post.requiredTier.price,
    }))
  );

  feed.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return {
    subscriptions: subscriptions.map((sub) => ({
      id: sub.id,
      tierName: sub.tier.name,
      tierPrice: sub.tier.price,
      creatorName: sub.creator.displayName || sub.creator.user.name || sub.creator.username,
      creatorUsername: sub.creator.username,
      creatorAvatar: sub.creator.user.image,
      endDate: sub.endDate,
    })),
    feed: feed.slice(0, 10),
    purchases: purchases.filter(p => p.product).map((p) => ({
      id: p.id,
      amount: p.amount,
      currency: p.currency,
      createdAt: p.createdAt,
      product: {
        id: p.product!.id,
        title: p.product!.title,
        fileUrl: p.product!.fileUrl,
        fileType: p.product!.fileType,
        creatorName: p.product!.creator.displayName || p.product!.creator.user.name || p.product!.creator.username,
        creatorUsername: p.product!.creator.username,
      },
    })),
  };
}

export default async function FanDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const userId = (session.user as { id?: string }).id;
  const userRole = (session.user as { role?: string }).role;

  if (!userId) {
    redirect("/login");
  }

  if (userRole === "CREATOR") {
    redirect("/dashboard/creator");
  }

  const { subscriptions, feed, purchases } = await getDashboardData(userId);

  return (
    <div className="p-6 lg:p-8">
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Welcome back, {session.user.name?.split(" ")[0]}!
        </h1>
        <p className="text-gray-600">
          Here&apos;s what&apos;s new from your subscribed creators.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Feed */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold text-gray-900">Your Feed</h2>

          {feed.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-gray-500 mb-4">
                  No posts yet. Subscribe to creators to see their content here!
                </p>
                <Link
                  href="/explore"
                  className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Compass className="w-4 h-4 mr-2" />
                  Explore Creators
                </Link>
              </CardContent>
            </Card>
          ) : (
            feed.map((post) => (
              <PostCard
                key={post.id}
                title={post.title}
                content={post.content}
                createdAt={post.createdAt}
                isLocked={!post.hasAccess}
                mediaUrl={post.mediaUrl || undefined}
                tierName={post.requiredTier?.name}
                creator={{
                  name: post.creatorName,
                  username: post.creatorUsername,
                  avatar: post.creatorAvatar || undefined,
                }}
              />
            ))
          )}
        </div>

        {/* Subscriptions Sidebar */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-gray-900">Your Subscriptions</h2>

          {subscriptions.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-gray-500 text-sm">No active subscriptions yet.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {subscriptions.map((sub) => (
                <Link key={sub.id} href={`/creator/${sub.creatorUsername}`}>
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="py-4">
                      <div className="flex items-center gap-3">
                        <Avatar
                          src={sub.creatorAvatar}
                          name={sub.creatorName}
                          size="md"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">
                            {sub.creatorName}
                          </p>
                          <p className="text-sm text-gray-500">{sub.tierName}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-blue-600">
                            ₹{sub.tierPrice / 100}/mo
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}

          {/* My Purchases */}
          <div className="space-y-6" id="purchases">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-purple-500" />
              My Purchases
            </h2>

            {purchases.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-gray-500 text-sm">No purchases yet.</p>
                  <Link
                    href="/explore"
                    className="text-blue-600 text-sm hover:underline mt-2 inline-block"
                  >
                    Browse products →
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {purchases.map((purchase) => (
                  <Card key={purchase.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Package className="w-5 h-5 text-purple-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <Link
                            href={`/products/${purchase.product.id}`}
                            className="font-medium text-gray-900 hover:text-purple-600 truncate block"
                          >
                            {purchase.product.title}
                          </Link>
                          <p className="text-sm text-gray-500">
                            by {purchase.product.creatorName}
                          </p>
                        </div>
                        <a
                          href={purchase.product.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors"
                        >
                          <Download className="w-4 h-4" />
                          Download
                        </a>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
