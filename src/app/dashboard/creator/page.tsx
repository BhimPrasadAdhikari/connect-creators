import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { FileText, Users, DollarSign, TrendingUp, Plus } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { Avatar, Button } from "@/components/ui";
import prisma from "@/lib/prisma";

async function getCreatorData(userId: string) {
  const creatorProfile = await prisma.creatorProfile.findUnique({
    where: { userId },
    include: {
      user: {
        select: {
          name: true,
          email: true,
          image: true,
        },
      },
      tiers: {
        where: { isActive: true },
        orderBy: { price: "asc" },
      },
      posts: {
        orderBy: { createdAt: "desc" },
        take: 5,
      },
      subscriptions: {
        where: { status: "ACTIVE" },
        include: {
          tier: true,
          fan: {
            select: {
              name: true,
              image: true,
            },
          },
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

  if (!creatorProfile) return null;

  const payments = await prisma.payment.findMany({
    where: {
      subscription: {
        creatorId: creatorProfile.id,
      },
      status: "COMPLETED",
    },
    select: {
      creatorEarnings: true,
    },
  });

  const totalEarnings = payments.reduce((sum, p) => sum + p.creatorEarnings, 0);
  const mrr = creatorProfile.subscriptions.reduce(
    (sum, sub) => sum + sub.tier.price,
    0
  );

  return {
    profile: creatorProfile,
    stats: {
      subscribers: creatorProfile._count.subscriptions,
      posts: creatorProfile._count.posts,
      totalEarnings,
      mrr,
    },
  };
}

function formatPrice(amountInPaise: number): string {
  const amount = amountInPaise / 100;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export default async function CreatorDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const userId = (session.user as { id?: string }).id;
  if (!userId) {
    redirect("/login");
  }

  const data = await getCreatorData(userId);

  if (!data) {
    redirect("/dashboard");
  }

  const { profile, stats } = data;

  return (
    <div className="p-4 sm:p-6 lg:p-12 max-w-7xl mx-auto">
        {/* Welcome & Quick Actions */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 sm:gap-6 mb-8 sm:mb-12">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-1 sm:mb-2">
              Welcome back, {profile.displayName || profile.user.name}
            </h1>
            <p className="text-muted-foreground text-base sm:text-lg">
              Here's what's happening with your content today.
            </p>
          </div>
          <Link
            href="/dashboard/creator/posts/new"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-foreground text-background rounded-2xl hover:opacity-90 transition-all shadow-lg font-medium"
          >
            <Plus className="w-5 h-5" />
            Create Post
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-card p-6 rounded-3xl border border-border hover:border-primary/20 transition-colors">
            <div className="flex items-center gap-3 mb-4 text-muted-foreground">
              <div className="p-2 bg-primary/10 rounded-xl text-primary">
                <Users className="w-5 h-5" />
              </div>
              <span className="font-medium">Total Subscribers</span>
            </div>
            <p className="text-4xl font-bold text-foreground tracking-tight">
              {stats.subscribers}
            </p>
          </div>

          <div className="bg-card p-6 rounded-3xl border border-border hover:border-accent-green/20 transition-colors">
            <div className="flex items-center gap-3 mb-4 text-muted-foreground">
              <div className="p-2 bg-accent-green/10 rounded-xl text-accent-green">
                <DollarSign className="w-5 h-5" />
              </div>
              <span className="font-medium">Monthly Revenue</span>
            </div>
            <p className="text-4xl font-bold text-foreground tracking-tight">
              {formatPrice(stats.mrr)}
            </p>
          </div>

          <div className="bg-card p-6 rounded-3xl border border-border hover:border-purple-500/20 transition-colors">
            <div className="flex items-center gap-3 mb-4 text-muted-foreground">
              <div className="p-2 bg-purple-500/10 rounded-xl text-purple-500">
                <FileText className="w-5 h-5" />
              </div>
              <span className="font-medium">Published Posts</span>
            </div>
            <p className="text-4xl font-bold text-foreground tracking-tight">
              {stats.posts}
            </p>
          </div>

          <div className="bg-card p-6 rounded-3xl border border-border hover:border-amber-500/20 transition-colors">
            <div className="flex items-center gap-3 mb-4 text-muted-foreground">
              <div className="p-2 bg-amber-500/10 rounded-xl text-amber-500">
                <TrendingUp className="w-5 h-5" />
              </div>
              <span className="font-medium">All Time Earnings</span>
            </div>
            <p className="text-4xl font-bold text-foreground tracking-tight">
              {formatPrice(stats.totalEarnings)}
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Recent Posts */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6 px-1">
              <h2 className="text-xl font-bold text-foreground">Recent Posts</h2>
              <Link
                href="/dashboard/creator/posts"
                className="text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                View All
              </Link>
            </div>

            <div className="bg-card rounded-3xl border border-border overflow-hidden">
              {profile.posts.length === 0 ? (
                <div className="text-center py-12 px-6">
                  <p className="text-muted-foreground mb-4">You haven't posted anything yet.</p>
                  <Link
                    href="/dashboard/creator/posts/new"
                    className="text-primary font-medium hover:underline"
                  >
                    Create your first post
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {profile.posts.map((post) => (
                    <div
                      key={post.id}
                      className="flex items-center gap-5 p-5 hover:bg-muted transition-colors group"
                    >
                      <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center flex-shrink-0 text-muted-foreground group-hover:bg-card group-hover:shadow-sm transition-all">
                        <FileText className="w-6 h-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground truncate mb-1 text-lg">
                          {post.title}
                        </h3>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <span>
                            {new Date(post.createdAt).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                            })}
                          </span>
                          {post.isPaid && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-accent-green/10 text-accent-green">
                              Premium
                            </span>
                          )}
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100">
                        Edit
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar Column */}
          <div className="space-y-8">
            {/* Recent Subscribers */}
            <div>
              <div className="flex items-center justify-between mb-6 px-1">
                <h2 className="text-xl font-bold text-foreground">New Fans</h2>
                <Link
                  href="/dashboard/creator/subscribers"
                  className="text-sm font-medium text-muted-foreground hover:text-foreground"
                >
                  View All
                </Link>
              </div>

              <div className="bg-card rounded-3xl border border-border p-6">
                {profile.subscriptions.length === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-muted-foreground text-sm">No subscribers yet.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {profile.subscriptions.slice(0, 5).map((sub) => (
                      <div key={sub.id} className="flex items-center gap-4">
                        <Avatar
                          src={sub.fan.image}
                          name={sub.fan.name || "Fan"}
                          size="md"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-foreground truncate text-sm">
                            {sub.fan.name || "Anonymous"}
                          </p>
                          <p className="text-xs text-muted-foreground bg-muted inline-block px-2 py-0.5 rounded-full mt-1">
                            {sub.tier.name}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions / Tiers */}
            <div className="bg-primary rounded-3xl p-6 text-white">
              <h3 className="font-bold text-lg mb-2">Membership Tiers</h3>
              <p className="text-primary-100 text-sm mb-6">
                You have {profile.tiers.length} active tiers.
              </p>
              <Link
                href="/dashboard/creator/tiers"
                className="block w-full text-center py-3 bg-white text-primary rounded-xl font-bold hover:bg-primary-50 transition-colors"
              >
                Manage Tiers
              </Link>
            </div>
          </div>
        </div>
    </div>
  );
}
