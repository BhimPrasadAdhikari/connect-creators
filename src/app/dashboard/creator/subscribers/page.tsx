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
  Package,
  MessageCircle,
} from "lucide-react";
import { authOptions } from "@/lib/auth";
import { Card, CardContent, Avatar, Badge, Button } from "@/components/ui";
import prisma from "@/lib/prisma";

async function getCreatorSubscribers(userId: string) {
  const creatorProfile = await prisma.creatorProfile.findUnique({
    where: { userId },
    include: {
      user: {
        select: { name: true, image: true },
      },
      subscriptions: {
        where: { status: "ACTIVE" },
        include: {
          tier: true,
          fan: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
              createdAt: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      },
      tiers: {
        where: { isActive: true },
        orderBy: { price: "asc" },
      },
    },
  });

  return creatorProfile;
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

export default async function SubscribersPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const userId = (session.user as { id?: string }).id;
  if (!userId) {
    redirect("/login");
  }

  const creatorData = await getCreatorSubscribers(userId);

  if (!creatorData) {
    redirect("/dashboard");
  }

  const totalMRR = creatorData.subscriptions.reduce(
    (sum, sub) => sum + sub.tier.price,
    0
  );

  // Group subscribers by tier
  const subscribersByTier = creatorData.tiers.map((tier) => ({
    tier,
    subscribers: creatorData.subscriptions.filter((sub) => sub.tierId === tier.id),
  }));

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
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50"
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
              className="flex items-center gap-3 px-4 py-3 rounded-lg bg-blue-50 text-blue-600 font-medium"
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

          {/* User */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center gap-3 mb-3">
              <Avatar src={creatorData.user.image} name={creatorData.user.name || ""} />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">
                  {creatorData.displayName || creatorData.user.name}
                </p>
                <p className="text-sm text-gray-500 truncate">
                  @{creatorData.username}
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
              <span className="font-semibold text-gray-900">Subscribers</span>
            </Link>
            <Avatar src={creatorData.user.image} name={creatorData.user.name || ""} />
          </div>
        </header>

        <div className="p-6 lg:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">
                Subscribers
              </h1>
              <p className="text-gray-600">
                {creatorData.subscriptions.length} active subscriber
                {creatorData.subscriptions.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardContent className="py-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {creatorData.subscriptions.length}
                    </p>
                    <p className="text-sm text-gray-500">Total Subscribers</p>
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
                      {formatPrice(totalMRR)}
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
                    <DollarSign className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {creatorData.subscriptions.length > 0
                        ? formatPrice(Math.round(totalMRR / creatorData.subscriptions.length))
                        : "₹0"}
                    </p>
                    <p className="text-sm text-gray-500">Avg. per Subscriber</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Subscribers by Tier */}
          {subscribersByTier.map(({ tier, subscribers }) => (
            <Card key={tier.id} className="mb-6">
              <CardContent>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <h2 className="text-lg font-semibold text-gray-900">
                      {tier.name}
                    </h2>
                    <Badge variant="success">
                      {subscribers.length} subscriber{subscribers.length !== 1 ? "s" : ""}
                    </Badge>
                  </div>
                  <p className="font-semibold text-blue-600">
                    {formatPrice(tier.price)}/mo
                  </p>
                </div>

                {subscribers.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">
                    No subscribers in this tier yet
                  </p>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {subscribers.map((sub) => (
                      <div
                        key={sub.id}
                        className="flex items-center justify-between py-4"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar
                            src={sub.fan.image}
                            name={sub.fan.name || "Fan"}
                            size="md"
                          />
                          <div>
                            <p className="font-medium text-gray-900">
                              {sub.fan.name || "Anonymous"}
                            </p>
                            <p className="text-sm text-gray-500">
                              Subscribed{" "}
                              {new Date(sub.createdAt).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          <MessageCircle className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}

          {creatorData.subscriptions.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <Users className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                <h2 className="text-lg font-semibold text-gray-900 mb-2">
                  No Subscribers Yet
                </h2>
                <p className="text-gray-500 mb-6">
                  Share your profile to start growing your subscriber base!
                </p>
                <Link href={`/creator/${creatorData.username}`}>
                  <Button>View Public Profile</Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
