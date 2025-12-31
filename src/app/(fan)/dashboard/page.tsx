import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { Compass, Package, Download, ShoppingBag, CreditCard, Star } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { Avatar, Card, CardContent, PostCard, Button } from "@/components/ui";
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
    <div className="p-4 sm:p-6 lg:p-12 max-w-7xl mx-auto space-y-12">
      {/* Welcome */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-primary text-white p-8 border-3 border-brutal-black shadow-brutal relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="font-display text-4xl sm:text-5xl font-bold mb-3 tracking-tight">
            Welcome back, {session.user.name?.split(" ")[0]}!
          </h1>
          <p className="font-mono text-lg text-white/90 max-w-xl">
            Here&apos;s the latest exclusive content from your favorite creators.
          </p>
        </div>
        <div className="absolute right-0 top-0 h-full w-1/3 bg-card/10 skew-x-[-20deg] translate-x-12 z-0"></div>
        <div className="relative z-10">
          <Link href="/explore">
            <Button variant="brutal" className="bg-card text-primary border-primary hover:bg-card/90 text-lg py-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <Compass className="w-5 h-5 mr-2" />
              Explore Creators
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Feed - Main Column (8 cols) */}
        <div className="lg:col-span-8 space-y-8">
          <div className="flex items-center gap-4 border-b-4 border-brutal-black pb-4 mb-8">
            <h2 className="font-display text-3xl font-bold uppercase">Your Feed</h2>
            <div className="px-3 py-1 bg-accent-yellow border-2 border-brutal-black font-mono font-bold text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              LATEST POSTS
            </div>
          </div>

          {feed.length === 0 ? (
            <div className="bg-secondary/10 border-3 border-brutal-black border-dashed p-12 text-center">
              <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6 border-3 border-brutal-black border-dashed">
                <Compass className="w-10 h-10 text-primary" />
              </div>
              <h3 className="font-display text-2xl font-bold mb-2">It's quiet in here...</h3>
              <p className="font-mono text-muted-foreground mb-8 max-w-md mx-auto">
                No posts yet. Subscribe to your favorite creators to start seeing their exclusive content!
              </p>
              <Link href="/explore">
                <Button variant="brutal-accent" size="lg">
                  Find Creators
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-8">
              {feed.map((post) => (
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
              ))}
            </div>
          )}
        </div>

        {/* Sidebar - Subscriptions & Purchases (4 cols) */}
        <div className="lg:col-span-4 space-y-12">
          {/* Subscriptions */}
          <div className="space-y-6">
            <h2 className="font-display text-2xl font-bold uppercase border-b-4 border-brutal-black pb-2 inline-block">
              Subscriptions
            </h2>

            {subscriptions.length === 0 ? (
              <Card variant="brutal" className="bg-muted border-dashed border-2">
                <CardContent className="text-center py-6 px-4">
                  <Star className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                  <p className="font-mono text-sm text-muted-foreground font-bold">No active subscriptions.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {subscriptions.map((sub) => (
                  <Link key={sub.id} href={`/creator/${sub.creatorUsername}`} className="block group">
                    <Card variant="brutal" className="group-hover:translate-x-[-2px] group-hover:translate-y-[-2px] group-hover:shadow-brutal transition-all">
                      <CardContent className="p-4 flex items-center gap-3">
                        <div className="relative shrink-0">
                          <Avatar
                            src={sub.creatorAvatar}
                            name={sub.creatorName}
                            size="md"
                          />
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-accent-green rounded-full border-2 border-brutal-black"></div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-display font-bold text-lg text-foreground truncate group-hover:text-primary transition-colors">
                            {sub.creatorName}
                          </p>
                          <p className="font-mono text-xs font-bold text-muted-foreground uppercase">{sub.tierName} • ₹{sub.tierPrice / 100}/mo</p>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* My Purchases */}
          <div className="space-y-6">
            <h2 className="font-display text-2xl font-bold uppercase flex items-center gap-2 border-b-4 border-brutal-black pb-2 inline-block">
              My Purchases
            </h2>

            {purchases.length === 0 ? (
              <Card variant="brutal" className="bg-muted border-dashed border-2">
                <CardContent className="text-center py-6 px-4">
                  <ShoppingBag className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                  <p className="font-mono text-sm text-muted-foreground font-bold mb-3">No purchases yet.</p>
                  <Link
                    href="/explore"
                    className="font-mono text-xs font-bold text-primary hover:underline uppercase"
                  >
                    Browse Digital Products →
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {purchases.map((purchase) => (
                  <Card key={purchase.id} variant="brutal" className="hover:shadow-brutal hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-accent-purple/20 border-2 border-brutal-black flex items-center justify-center flex-shrink-0 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                          <Package className="w-5 h-5 text-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <Link
                            href={`/products/${purchase.product.id}`}
                            className="font-display font-bold text-foreground hover:text-primary truncate block"
                          >
                            {purchase.product.title}
                          </Link>
                          <p className="font-mono text-xs text-muted-foreground mb-3">
                            by {purchase.product.creatorName}
                          </p>
                          
                          <a
                            href={purchase.product.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-foreground text-background font-mono text-xs font-bold border-2 border-brutal-black shadow-brutal-sm hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all"
                          >
                            <Download className="w-3 h-3" />
                            DOWNLOAD
                          </a>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Promo/Feature */}
          <div className="bg-gradient-to-br from-accent-pink to-accent-purple p-6 border-3 border-brutal-black shadow-brutal">
            <h3 className="font-display font-bold text-2xl text-white mb-2 uppercase">Discover More</h3>
            <p className="font-mono text-sm text-white/90 font-bold mb-4">
              Find new creators and exclusive content.
            </p>
            <Link href="/explore">
              <Button className="w-full font-bold border-2 border-brutal-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all bg-card text-foreground hover:bg-card/90">
                Explore Now
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
