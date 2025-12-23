import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { TrendingUp, DollarSign, Users, Calendar, Info } from "lucide-react";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
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
      user: { select: { name: true, email: true, image: true } },
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

  let monthlyGross = 0;
  for (const sub of creator.subscriptions) {
    monthlyGross += sub.tier.price;
  }

  const earningsBreakdown = calculateEarnings(monthlyGross, "RAZORPAY_UPI", "STANDARD", "INR");

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

  const allTimeEarnings = monthlyGross * 6;
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

  const { creator, stats, earningsBreakdown, payoutEligibility, recentTips, tiers } = data;

  return (
    <div className="p-4 sm:p-6 lg:p-12 max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Earnings & Analytics</h1>

        {/* Overview Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-white p-6 rounded-3xl border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-sm text-gray-500 font-medium">Active Subscribers</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.totalSubscribers}</p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
              <span className="text-sm text-gray-500 font-medium">Monthly Revenue</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{formatCurrency(stats.monthlyGross, "INR")}</p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
              <span className="text-sm text-gray-500 font-medium">Your Earnings</span>
            </div>
            <p className="text-3xl font-bold text-green-600">{formatCurrency(stats.monthlyNet, "INR")}</p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-pink-100 rounded-xl flex items-center justify-center">
                <span className="text-lg">💝</span>
              </div>
              <span className="text-sm text-gray-500 font-medium">Tips This Month</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{formatCurrency(stats.monthlyTips, "INR")}</p>
          </div>
        </div>

        {/* Earnings Breakdown */}
        <div className="bg-white rounded-3xl border border-gray-100 p-8 mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Monthly Earnings Breakdown</h2>

          <div className="space-y-3">
            <div className="flex justify-between py-3 border-b border-gray-50">
              <span className="text-gray-600">Gross Revenue (from subscriptions)</span>
              <span className="font-medium">{formatCurrency(earningsBreakdown.grossAmount, "INR")}</span>
            </div>
            <div className="flex justify-between py-3 border-b border-gray-50">
              <span className="text-gray-600">
                Payment Processing Fee ({earningsBreakdown.paymentFeePercentage}%)
              </span>
              <span className="text-red-600">-{formatCurrency(earningsBreakdown.paymentFee, "INR")}</span>
            </div>
            <div className="flex justify-between py-3 border-b border-gray-50">
              <span className="text-gray-600">
                Platform Fee ({earningsBreakdown.platformCommissionPercentage}%)
              </span>
              <span className="text-red-600">-{formatCurrency(earningsBreakdown.platformCommission, "INR")}</span>
            </div>
            <div className="flex justify-between py-4 bg-green-50 -mx-8 px-8 rounded-b-3xl">
              <span className="font-bold text-gray-900">Your Net Earnings</span>
              <div className="text-right">
                <span className="font-bold text-green-600 text-xl">{formatCurrency(earningsBreakdown.netEarnings, "INR")}</span>
                <span className="text-sm text-gray-500 ml-2">
                  ({earningsBreakdown.creatorSharePercentage.toFixed(1)}% of gross)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Payout Status */}
        <div className={`bg-white rounded-3xl border p-6 mb-8 ${payoutEligibility.eligible ? "border-green-300 bg-green-50" : "border-gray-100"}`}>
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${payoutEligibility.eligible ? "bg-green-200" : "bg-gray-200"}`}>
              <Calendar className={`w-6 h-6 ${payoutEligibility.eligible ? "text-green-600" : "text-gray-500"}`} />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900">Payout Status</h3>
              <p className="text-gray-600">{payoutEligibility.message}</p>
              <p className="text-sm text-gray-500 mt-2">
                Payouts are processed {PAYOUT_SCHEDULE.frequency}, with a {PAYOUT_SCHEDULE.holdPeriod}-day hold period.
              </p>
            </div>
            {payoutEligibility.eligible && <Badge variant="success">Eligible</Badge>}
          </div>
        </div>

        {/* Tier Performance */}
        <div className="bg-white rounded-3xl border border-gray-100 p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900">Tier Performance</h2>
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
                  <div key={tier.id} className="flex items-center justify-between py-4 border-b border-gray-50 last:border-0">
                    <div>
                      <p className="font-medium text-gray-900">{tier.name}</p>
                      <p className="text-sm text-gray-500">{formatCurrency(tier.price, "INR")}/month</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">{tier._count?.subscriptions || 0} subscribers</p>
                      <p className="text-sm text-green-600">{formatCurrency(tierRevenue, "INR")}/month</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Tips */}
        <div className="bg-white rounded-3xl border border-gray-100 p-8">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Recent Tips</h2>

          {recentTips.length === 0 ? (
            <p className="text-center py-8 text-gray-500">No tips received yet.</p>
          ) : (
            <div className="space-y-4">
              {recentTips.map((tip) => (
                <div key={tip.id} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">💝</div>
                    <div>
                      <p className="font-medium text-gray-900">{tip.fromUser.name || "Anonymous"}</p>
                      {tip.message && <p className="text-sm text-gray-500">&quot;{tip.message}&quot;</p>}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">{formatCurrency(tip.amount, "INR")}</p>
                    <p className="text-xs text-gray-400">{new Date(tip.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="mt-8 flex items-start gap-3 text-sm text-gray-500">
          <Info className="w-5 h-5 mt-0.5" />
          <p>
            Earnings are calculated based on your current active subscribers and the default UPI payment method.
            Actual earnings may vary based on payment methods used by your fans.
          </p>
        </div>
    </div>
  );
}
