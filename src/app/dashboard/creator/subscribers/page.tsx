import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { Users, DollarSign, MessageCircle } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { Card, CardContent, Avatar, Badge, Button } from "@/components/ui";
import prisma from "@/lib/prisma";

async function getCreatorSubscribers(userId: string) {
  const creatorProfile = await prisma.creatorProfile.findUnique({
    where: { userId },
    include: {
      user: {
        select: { name: true, email: true, image: true },
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

  const subscribersByTier = creatorData.tiers.map((tier) => ({
    tier,
    subscribers: creatorData.subscriptions.filter((sub) => sub.tierId === tier.id),
  }));

  return (
    <div className="p-6 lg:p-12 max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Subscribers</h1>
            <p className="text-gray-600">
              {creatorData.subscriptions.length} active subscriber
              {creatorData.subscriptions.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <div className="bg-white p-6 rounded-3xl border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900">
                  {creatorData.subscriptions.length}
                </p>
                <p className="text-sm text-gray-500">Total Subscribers</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900">
                  {formatPrice(totalMRR)}
                </p>
                <p className="text-sm text-gray-500">Monthly Revenue</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900">
                  {creatorData.subscriptions.length > 0
                    ? formatPrice(Math.round(totalMRR / creatorData.subscriptions.length))
                    : "₹0"}
                </p>
                <p className="text-sm text-gray-500">Avg. per Subscriber</p>
              </div>
            </div>
          </div>
        </div>

        {/* Subscribers by Tier */}
        {subscribersByTier.map(({ tier, subscribers }) => (
          <div key={tier.id} className="mb-6 bg-white rounded-3xl border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-50">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-bold text-gray-900">{tier.name}</h2>
                <Badge variant="success">
                  {subscribers.length} subscriber{subscribers.length !== 1 ? "s" : ""}
                </Badge>
              </div>
              <p className="font-bold text-blue-600">{formatPrice(tier.price)}/mo</p>
            </div>

            {subscribers.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No subscribers in this tier yet</p>
            ) : (
              <div className="divide-y divide-gray-50">
                {subscribers.map((sub) => (
                  <div key={sub.id} className="flex items-center justify-between p-5 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <Avatar src={sub.fan.image} name={sub.fan.name || "Fan"} size="md" />
                      <div>
                        <p className="font-semibold text-gray-900">{sub.fan.name || "Anonymous"}</p>
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
          </div>
        ))}

        {creatorData.subscriptions.length === 0 && (
          <div className="bg-white rounded-3xl border border-gray-100 text-center py-16">
            <Users className="w-12 h-12 mx-auto text-gray-300 mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">No Subscribers Yet</h2>
            <p className="text-gray-500 mb-6">Share your profile to start growing your subscriber base!</p>
            <Link href={`/creator/${creatorData.username}`}>
              <Button>View Public Profile</Button>
            </Link>
          </div>
        )}
    </div>
  );
}
