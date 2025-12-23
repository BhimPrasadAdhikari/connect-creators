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
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-72 bg-white hidden lg:block">
        <div className="flex flex-col h-full px-6 py-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 mb-10 px-2">
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/20">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900 tracking-tight">
              CreatorConnect
            </span>
          </Link>

          {/* Navigation */}
          <nav className="flex-1 space-y-1">
            <Link
              href="/dashboard/creator"
              className="flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-gray-900 text-white font-medium transition-all shadow-md shadow-gray-900/5"
            >
              <Home className="w-5 h-5" />
              Overview
            </Link>
            <div className="pt-6 pb-2 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Content
            </div>
            <Link
              href="/dashboard/creator/posts"
              className="flex items-center gap-3 px-4 py-3 rounded-2xl text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-medium transition-colors"
            >
              <FileText className="w-5 h-5" />
              Posts
            </Link>
            <Link
              href="/dashboard/creator/products"
              className="flex items-center gap-3 px-4 py-3 rounded-2xl text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-medium transition-colors"
            >
              <Package className="w-5 h-5" />
              Products
            </Link>
            <Link
              href="/dashboard/creator/subscribers"
              className="flex items-center gap-3 px-4 py-3 rounded-2xl text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-medium transition-colors"
            >
              <Users className="w-5 h-5" />
              Subscribers
            </Link>
            
            <div className="pt-6 pb-2 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Account
            </div>
            <Link
              href="/dashboard/creator/earnings"
              className="flex items-center gap-3 px-4 py-3 rounded-2xl text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-medium transition-colors"
            >
              <DollarSign className="w-5 h-5" />
              Earnings
            </Link>
            <Link
              href="/messages"
              className="flex items-center gap-3 px-4 py-3 rounded-2xl text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-medium transition-colors"
            >
              <MessageCircle className="w-5 h-5" />
              Messages
            </Link>
            <Link
              href="/dashboard/creator/settings"
              className="flex items-center gap-3 px-4 py-3 rounded-2xl text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-medium transition-colors"
            >
              <Settings className="w-5 h-5" />
              Settings
            </Link>
          </nav>

          {/* User Profile */}
          <div className="pt-6 mt-6 border-t border-gray-100">
            <div className="flex items-center gap-3 px-2 mb-4">
              <Avatar src={profile.user.image} name={profile.user.name || ""} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-gray-900 truncate">
                  {profile.displayName || profile.user.name}
                </p>
                <Link 
                  href={`/creator/${profile.username}`}
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium block truncate"
                >
                  View Profile ↗
                </Link>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-72 min-h-screen">
        {/* Mobile Header */}
        <header className="lg:hidden sticky top-0 bg-white/80 backdrop-blur-md border-b border-gray-100 z-30 px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-gray-900">CreatorConnect</span>
            </Link>
            <Avatar src={profile.user.image} name={profile.user.name || ""} size="sm" />
          </div>
        </header>

        <div className="p-6 lg:p-12 max-w-7xl mx-auto">
          {/* Welcome & Quick Actions */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Good afternoon, {profile.displayName || profile.user.name}
              </h1>
              <p className="text-gray-500 text-lg">
                Here's what's happening with your content today.
              </p>
            </div>
            <Link
              href="/dashboard/creator/posts/new"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-2xl hover:bg-black transition-all shadow-lg shadow-gray-900/10 font-medium"
            >
              <Plus className="w-5 h-5" />
              Create Post
            </Link>
          </div>

          {/* Stats Grid - Minimalist */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <div className="bg-white p-6 rounded-3xl border border-gray-100 hover:border-gray-200 transition-colors">
              <div className="flex items-center gap-3 mb-4 text-gray-500">
                <div className="p-2 bg-blue-50 rounded-xl text-blue-600">
                   <Users className="w-5 h-5" />
                </div>
                <span className="font-medium">Total Subscribers</span>
              </div>
              <p className="text-4xl font-bold text-gray-900 tracking-tight">
                {stats.subscribers}
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-gray-100 hover:border-gray-200 transition-colors">
              <div className="flex items-center gap-3 mb-4 text-gray-500">
                 <div className="p-2 bg-green-50 rounded-xl text-green-600">
                   <DollarSign className="w-5 h-5" />
                </div>
                <span className="font-medium">Monthly Revenue</span>
              </div>
              <p className="text-4xl font-bold text-gray-900 tracking-tight">
                {formatPrice(stats.mrr)}
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-gray-100 hover:border-gray-200 transition-colors">
              <div className="flex items-center gap-3 mb-4 text-gray-500">
                <div className="p-2 bg-purple-50 rounded-xl text-purple-600">
                   <FileText className="w-5 h-5" />
                </div>
                <span className="font-medium">Published Posts</span>
              </div>
              <p className="text-4xl font-bold text-gray-900 tracking-tight">
                {stats.posts}
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-gray-100 hover:border-gray-200 transition-colors">
              <div className="flex items-center gap-3 mb-4 text-gray-500">
                 <div className="p-2 bg-amber-50 rounded-xl text-amber-600">
                   <TrendingUp className="w-5 h-5" />
                </div>
                <span className="font-medium">All Time Earnings</span>
              </div>
              <p className="text-4xl font-bold text-gray-900 tracking-tight">
                {formatPrice(stats.totalEarnings)}
              </p>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Recent Posts */}
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-6 px-1">
                <h2 className="text-xl font-bold text-gray-900">Recent Posts</h2>
                <Link
                  href="/dashboard/creator/posts"
                  className="text-sm font-medium text-gray-500 hover:text-gray-900"
                >
                  View All
                </Link>
              </div>

              <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden">
                {profile.posts.length === 0 ? (
                  <div className="text-center py-12 px-6">
                    <p className="text-gray-500 mb-4">You haven't posted anything yet.</p>
                    <Link
                      href="/dashboard/creator/posts/new"
                      className="text-blue-600 font-medium hover:underline"
                    >
                      Create your first post
                    </Link>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-50">
                    {profile.posts.map((post) => (
                      <div
                        key={post.id}
                        className="flex items-center gap-5 p-5 hover:bg-gray-50 transition-colors group"
                      >
                         <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0 text-gray-400 group-hover:bg-white group-hover:shadow-sm transition-all">
                             <FileText className="w-6 h-6" />
                         </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 truncate mb-1 text-lg">
                            {post.title}
                          </h3>
                          <div className="flex items-center gap-3 text-sm text-gray-500">
                             <span>
                                {new Date(post.createdAt).toLocaleDateString("en-IN", {
                                  day: "numeric",
                                  month: "short",
                                })}
                             </span>
                             {post.isPaid && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700">
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
                    <h2 className="text-xl font-bold text-gray-900">New Fans</h2>
                    <Link
                      href="/dashboard/creator/subscribers"
                      className="text-sm font-medium text-gray-500 hover:text-gray-900"
                    >
                      View All
                    </Link>
                  </div>

                  <div className="bg-white rounded-3xl border border-gray-100 p-6">
                    {profile.subscriptions.length === 0 ? (
                      <div className="text-center py-6">
                        <p className="text-gray-500 text-sm">
                          No subscribers yet.
                        </p>
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
                              <p className="font-bold text-gray-900 truncate text-sm">
                                {sub.fan.name || "Anonymous"}
                              </p>
                              <p className="text-xs text-gray-500 bg-gray-100 inline-block px-2 py-0.5 rounded-full mt-1">{sub.tier.name}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
               </div>

               {/* Quick Actions / Tiers */}
               <div className="bg-blue-600 rounded-3xl p-6 text-white">
                  <h3 className="font-bold text-lg mb-2">Membership Tiers</h3>
                  <p className="text-blue-100 text-sm mb-6">
                     You have {profile.tiers.length} active tiers.
                  </p>
                  <Link 
                     href="/dashboard/creator/tiers"
                     className="block w-full text-center py-3 bg-white text-blue-600 rounded-xl font-bold hover:bg-blue-50 transition-colors"
                  >
                     Manage Tiers
                  </Link>
               </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
