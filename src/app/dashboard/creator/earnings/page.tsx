import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, TrendingUp, DollarSign, Users, Calendar, Info } from "lucide-react";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, Badge } from "@/components/ui";
import {
  calculateEarnings,
  checkPayoutEligibility,
  formatCurrency,
  PAYOUT_SCHEDULE,
} from "@/lib/pricing";

async function getEarningsData(userId: string) {
  const creator = await prisma.creatorProfile.findUnique({
    where: { userId },
    include: {
      subscriptions: {
        where: { status: "ACTIVE" },
        include: {
          tier: true,
          fan: { select: { name: true, image: true } },
        },
      },
      tipsReceived: {
        orderBy: { createdAt: "desc" },
        take: 10,
        include: {
          fromUser: { select: { name: true, image: true } },
        },
      },
      tiers: {
        include: {
          _count: { select: { subscriptions: true } },
        },
      },
    },
  });

  if (!creator) return null;

  // Calculate monthly recurring revenue
  let monthlyGross = 0;
  for (const sub of creator.subscriptions) {
    monthlyGross += sub.tier.price;
  }

  // Calculate earnings breakdown (using UPI as default)
  const earningsBreakdown = calculateEarnings(monthlyGross, "RAZORPAY_UPI", "STANDARD", "INR");

  // Calculate total tips this month
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const monthlyTips = await prisma.tip.aggregate({
    where: {
      toCreatorId: creator.id,
      createdAt: { gte: startOfMonth },
    },
    _sum: { amount: true },
    _count: true,
  });

  // Calculate all-time earnings (simplified - in real app, track in payments table)
  const allTimeEarnings = monthlyGross * 6; // Placeholder - would be from actual payment records

  // Check payout eligibility
  const payoutEligibility = checkPayoutEligibility(earningsBreakdown.netEarnings, "INR");

  return {
    creator,
    stats: {
      totalSubscribers: creator.subscriptions.length,
      monthlyGross,
      monthlyNet: earningsBreakdown.netEarnings,
      monthlyTips: monthlyTips._sum.amount || 0,
      tipCount: monthlyTips._count,
      allTimeEarnings,
    },
    earningsBreakdown,
    payoutEligibility,
    recentTips: creator.tipsReceived,
    tiers: creator.tiers,
  };
}

export default async function EarningsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id || session.user.role !== "CREATOR") {
    redirect("/login");
  }

  const data = await getEarningsData(session.user.id);

  if (!data) {
    redirect("/dashboard/creator");
  }

  const { stats, earningsBreakdown, payoutEligibility, recentTips, tiers } = data;

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Back Link */}
          <Link
            href="/dashboard/creator"
            className="inline-flex items-center text-gray-600 hover:text-blue-600 mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Dashboard
          </Link>

          <h1 className="text-2xl font-bold text-gray-900 mb-8">Earnings & Analytics</h1>

          {/* Overview Cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="py-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Active Subscribers</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalSubscribers}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="py-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Monthly Revenue</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(stats.monthlyGross, "INR")}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="py-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">You Earn</p>
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(stats.monthlyNet, "INR")}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="py-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
                    <span className="text-lg">💝</span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Tips This Month</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(stats.monthlyTips, "INR")}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Earnings Breakdown */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Monthly Earnings Breakdown</h2>
              
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Gross Revenue (from subscriptions)</span>
                  <span className="font-medium">{formatCurrency(earningsBreakdown.grossAmount, "INR")}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">
                    Payment Processing Fee ({earningsBreakdown.paymentFeePercentage}%)
                  </span>
                  <span className="text-red-600">
                    -{formatCurrency(earningsBreakdown.paymentFee, "INR")}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">
                    Platform Fee ({earningsBreakdown.platformCommissionPercentage}%)
                  </span>
                  <span className="text-red-600">
                    -{formatCurrency(earningsBreakdown.platformCommission, "INR")}
                  </span>
                </div>
                <div className="flex justify-between py-3 bg-green-50 -mx-6 px-6 rounded-b-lg">
                  <span className="font-semibold text-gray-900">Your Net Earnings</span>
                  <div className="text-right">
                    <span className="font-bold text-green-600 text-lg">
                      {formatCurrency(earningsBreakdown.netEarnings, "INR")}
                    </span>
                    <span className="text-sm text-gray-500 ml-2">
                      ({earningsBreakdown.creatorSharePercentage.toFixed(1)}% of gross)
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payout Status */}
          <Card className={`mb-8 ${payoutEligibility.eligible ? "border-green-300 bg-green-50" : ""}`}>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  payoutEligibility.eligible ? "bg-green-200" : "bg-gray-200"
                }`}>
                  <Calendar className={`w-6 h-6 ${payoutEligibility.eligible ? "text-green-600" : "text-gray-500"}`} />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">Payout Status</h3>
                  <p className="text-gray-600">{payoutEligibility.message}</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Payouts are processed {PAYOUT_SCHEDULE.frequency}, with a {PAYOUT_SCHEDULE.holdPeriod}-day hold period.
                  </p>
                </div>
                {payoutEligibility.eligible && (
                  <Badge variant="success">Eligible</Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Tier Performance */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Tier Performance</h2>
                <Link href="/dashboard/creator/tiers" className="text-blue-600 text-sm hover:underline">
                  Manage Tiers →
                </Link>
              </div>

              {tiers.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No tiers created yet.</p>
                  <Link href="/dashboard/creator/tiers" className="text-blue-600 hover:underline">
                    Create your first tier
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {tiers.map((tier) => {
                    const tierRevenue = tier.price * (tier._count?.subscriptions || 0);
                    return (
                      <div key={tier.id} className="flex items-center justify-between py-3 border-b last:border-0">
                        <div>
                          <p className="font-medium text-gray-900">{tier.name}</p>
                          <p className="text-sm text-gray-500">{formatCurrency(tier.price, "INR")}/month</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900">
                            {tier._count?.subscriptions || 0} subscribers
                          </p>
                          <p className="text-sm text-green-600">
                            {formatCurrency(tierRevenue, "INR")}/month
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Tips */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Tips</h2>

              {recentTips.length === 0 ? (
                <p className="text-center py-8 text-gray-500">No tips received yet.</p>
              ) : (
                <div className="space-y-3">
                  {recentTips.map((tip) => (
                    <div key={tip.id} className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center">
                          💝
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{tip.fromUser.name || "Anonymous"}</p>
                          {tip.message && (
                            <p className="text-sm text-gray-500">&quot;{tip.message}&quot;</p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-green-600">{formatCurrency(tip.amount, "INR")}</p>
                        <p className="text-xs text-gray-400">
                          {new Date(tip.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Info */}
          <div className="mt-8 flex items-start gap-3 text-sm text-gray-500">
            <Info className="w-5 h-5 mt-0.5" />
            <p>
              Earnings are calculated based on your current active subscribers and the default UPI payment method.
              Actual earnings may vary based on payment methods used by your fans.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
