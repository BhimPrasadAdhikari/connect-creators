import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import {
  Heart,
  Settings,
  LogOut,
  Home,
  FileText,
  Users,
  DollarSign,
  TrendingUp,
  Plus,
  Package,
  MessageCircle,
} from "lucide-react";
import { authOptions } from "@/lib/auth";
import { Avatar, Card, CardContent, Button, Badge } from "@/components/ui";
import prisma from "@/lib/prisma";

// Fetch creator dashboard data
async function getCreatorData(userId: string) {
  const creatorProfile = await prisma.creatorProfile.findUnique({
    where: { userId },
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

  // Calculate total earnings
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

  // Calculate monthly recurring revenue (MRR)
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
    // User is not a creator, redirect to regular dashboard
    redirect("/dashboard");
  }

  const { profile, stats } = data;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 z-40 hidden lg:block">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-gray-200">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-semibold text-gray-900">
                CreatorConnect
              </span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            <Link
              href="/dashboard/creator"
              className="flex items-center gap-3 px-4 py-3 rounded-lg bg-blue-50 text-blue-600 font-medium"
            >
              <Home className="w-5 h-5" />
              Dashboard
            </Link>
            <Link
              href="/dashboard/creator/posts"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50"
            >
              <FileText className="w-5 h-5" />
              Posts
            </Link>
            <Link
              href="/dashboard/creator/products"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50"
            >
              <Package className="w-5 h-5" />
              Products
            </Link>
            <Link
              href="/messages"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50"
            >
              <MessageCircle className="w-5 h-5" />
              Messages
            </Link>
            <Link
              href="/dashboard/creator/subscribers"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50"
            >
              <Users className="w-5 h-5" />
              Subscribers
            </Link>
            <Link
              href="/dashboard/creator/earnings"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50"
            >
              <DollarSign className="w-5 h-5" />
              Earnings
            </Link>
            <Link
              href="/dashboard/creator/settings"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50"
            >
              <Settings className="w-5 h-5" />
              Settings
            </Link>
          </nav>

          {/* Profile preview link */}
          <div className="px-4 py-2">
            <Link
              href={`/creator/${profile.username}`}
              className="flex items-center justify-center gap-2 px-4 py-2 text-sm text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50"
            >
              View Public Profile
            </Link>
          </div>

          {/* User */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center gap-3 mb-3">
              <Avatar src={profile.user.image} name={profile.user.name || ""} />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">
                  {profile.displayName || profile.user.name}
                </p>
                <p className="text-sm text-gray-500 truncate">
                  @{profile.username}
                </p>
              </div>
            </div>
            <Link
              href="/api/auth/signout"
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 min-h-screen">
        {/* Mobile Header */}
        <header className="lg:hidden sticky top-0 bg-white border-b border-gray-200 z-30 px-4 py-3">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold text-gray-900">Creator Studio</span>
            </Link>
            <Avatar src={profile.user.image} name={profile.user.name || ""} />
          </div>
        </header>

        <div className="p-6 lg:p-8">
          {/* Welcome & Quick Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">
                Creator Dashboard
              </h1>
              <p className="text-gray-600">
                Welcome back, {profile.displayName || profile.user.name}!
              </p>
            </div>
            <Link
              href="/dashboard/creator/posts/new"
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              New Post
            </Link>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="py-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.subscribers}
                    </p>
                    <p className="text-sm text-gray-500">Subscribers</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="py-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatPrice(stats.mrr)}
                    </p>
                    <p className="text-sm text-gray-500">Monthly Revenue</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="py-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                    <FileText className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.posts}
                    </p>
                    <p className="text-sm text-gray-500">Total Posts</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="py-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-amber-100 flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatPrice(stats.totalEarnings)}
                    </p>
                    <p className="text-sm text-gray-500">Total Earnings</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Recent Posts */}
            <Card>
              <CardContent>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">Recent Posts</h2>
                  <Link
                    href="/dashboard/creator/posts"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    View All
                  </Link>
                </div>

                {profile.posts.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">No posts yet</p>
                    <Link
                      href="/dashboard/creator/posts/new"
                      className="text-blue-600 hover:underline"
                    >
                      Create your first post
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {profile.posts.map((post) => (
                      <div
                        key={post.id}
                        className="flex items-start gap-4 p-4 rounded-lg bg-gray-50"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium text-gray-900 truncate">
                              {post.title}
                            </h3>
                            {post.isPaid && (
                              <Badge variant="accent">Paid</Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-500">
                            {new Date(post.createdAt).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Subscription Tiers */}
            <Card>
              <CardContent>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Subscription Tiers
                  </h2>
                  <Link
                    href="/dashboard/creator/tiers"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Manage
                  </Link>
                </div>

                {profile.tiers.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">No tiers created yet</p>
                    <Link
                      href="/dashboard/creator/tiers/new"
                      className="text-blue-600 hover:underline"
                    >
                      Create a tier
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {profile.tiers.map((tier) => (
                      <div
                        key={tier.id}
                        className="flex items-center justify-between p-4 rounded-lg bg-gray-50"
                      >
                        <div>
                          <h3 className="font-medium text-gray-900">{tier.name}</h3>
                          <p className="text-sm text-gray-500">
                            {tier.benefits.length} benefits
                          </p>
                        </div>
                        <p className="font-semibold text-blue-600">
                          {formatPrice(tier.price)}/mo
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Subscribers */}
            <Card className="lg:col-span-2">
              <CardContent>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Recent Subscribers
                  </h2>
                  <Link
                    href="/dashboard/creator/subscribers"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    View All
                  </Link>
                </div>

                {profile.subscriptions.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">
                      No subscribers yet. Share your profile to start growing!
                    </p>
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {profile.subscriptions.slice(0, 6).map((sub) => (
                      <div
                        key={sub.id}
                        className="flex items-center gap-3 p-4 rounded-lg bg-gray-50"
                      >
                        <Avatar
                          src={sub.fan.image}
                          name={sub.fan.name || "Fan"}
                          size="md"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">
                            {sub.fan.name || "Anonymous"}
                          </p>
                          <p className="text-sm text-gray-500">{sub.tier.name}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
