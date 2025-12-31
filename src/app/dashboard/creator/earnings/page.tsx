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
        <h1 className="font-display text-display-sm font-bold text-foreground mb-8">Earnings & Analytics</h1>

        {/* Overview Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card variant="brutal" className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 border-2 border-brutal-black bg-primary/20 flex items-center justify-center shadow-brutal-sm">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <span className="text-sm text-foreground font-bold font-mono">SUBSCRIBERS</span>
            </div>
            <p className="font-display text-3xl font-bold text-foreground">{stats.totalSubscribers}</p>
          </Card>

          <Card variant="brutal" className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 border-2 border-brutal-black bg-accent-green/10 flex items-center justify-center shadow-brutal-sm">
                <DollarSign className="w-5 h-5 text-accent-green" />
              </div>
              <span className="text-sm text-foreground font-bold font-mono">REVENUE</span>
            </div>
            <p className="font-display text-3xl font-bold text-foreground">{formatCurrency(stats.monthlyGross, "INR")}</p>
          </Card>

          <Card variant="brutal" className="p-6 bg-accent-yellow/10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 border-2 border-brutal-black bg-purple-500/10 flex items-center justify-center shadow-brutal-sm">
                <TrendingUp className="w-5 h-5 text-purple-500" />
              </div>
              <span className="text-sm text-foreground font-bold font-mono uppercase">Your Earnings</span>
            </div>
            <p className="font-display text-3xl font-bold text-accent-green">{formatCurrency(stats.monthlyNet, "INR")}</p>
          </Card>

          <Card variant="brutal" className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 border-2 border-brutal-black bg-pink-500/10 flex items-center justify-center shadow-brutal-sm">
                <span className="text-lg">💝</span>
              </div>
              <span className="text-sm text-foreground font-bold font-mono">TIPS</span>
            </div>
            <p className="font-display text-3xl font-bold text-foreground">{formatCurrency(stats.monthlyTips, "INR")}</p>
          </Card>
        </div>

        {/* Earnings Breakdown */}
        <Card variant="brutal" className="p-8 mb-8">
          <h2 className="font-display text-xl font-bold text-foreground mb-6">Monthly Earnings Breakdown</h2>

          <div className="space-y-3 font-mono text-sm">
            <div className="flex justify-between py-3 border-b-2 border-dotted border-brutal-black">
              <span className="text-muted-foreground uppercase">Gross Revenue (from subscriptions)</span>
              <span className="font-bold text-foreground">{formatCurrency(earningsBreakdown.grossAmount, "INR")}</span>
            </div>
            <div className="flex justify-between py-3 border-b-2 border-dotted border-brutal-black">
              <span className="text-muted-foreground uppercase">
                Payment Processing Fee ({earningsBreakdown.paymentFeePercentage}%)
              </span>
              <span className="text-accent-red font-bold">-{formatCurrency(earningsBreakdown.paymentFee, "INR")}</span>
            </div>
            <div className="flex justify-between py-3 border-b-2 border-dotted border-brutal-black">
              <span className="text-muted-foreground uppercase">
                Platform Fee ({earningsBreakdown.platformCommissionPercentage}%)
              </span>
              <span className="text-accent-red font-bold">-{formatCurrency(earningsBreakdown.platformCommission, "INR")}</span>
            </div>
            <div className="flex justify-between py-4 bg-accent-green/10 -mx-8 px-8 border-t-2 border-brutal-black">
              <span className="font-bold text-foreground uppercase text-base">Your Net Earnings</span>
              <div className="text-right">
                <span className="font-display font-bold text-accent-green text-xl">{formatCurrency(earningsBreakdown.netEarnings, "INR")}</span>
                <span className="block text-xs text-muted-foreground mt-1">
                  ({earningsBreakdown.creatorSharePercentage.toFixed(1)}% of gross)
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Payout Status */}
        <div className={`border-3 border-brutal-black shadow-brutal-sm p-6 mb-8 rounded-none ${payoutEligibility.eligible ? "bg-accent-green/10" : "bg-card"}`}>
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 border-2 border-brutal-black flex items-center justify-center shadow-brutal-sm ${payoutEligibility.eligible ? "bg-accent-green/20" : "bg-muted"}`}>
              <Calendar className={`w-6 h-6 ${payoutEligibility.eligible ? "text-accent-green" : "text-muted-foreground"}`} />
            </div>
            <div className="flex-1">
              <h3 className="font-display font-bold text-foreground text-lg uppercase">Payout Status</h3>
              <p className="text-muted-foreground font-medium">{payoutEligibility.message}</p>
              <p className="text-sm text-muted-foreground mt-2 font-mono">
                Payouts are processed {PAYOUT_SCHEDULE.frequencies[PAYOUT_SCHEDULE.defaultFrequency].name.toLowerCase()}, with a {PAYOUT_SCHEDULE.holdPeriod}-day hold period.
              </p>
            </div>
            {payoutEligibility.eligible && 
              <span className="bg-accent-green text-white px-3 py-1 border-2 border-brutal-black font-bold text-sm shadow-brutal-sm uppercase">Eligible</span>
            }
          </div>
        </div>

        {/* Tier Performance */}
        <Card variant="brutal" className="p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-xl font-bold text-foreground">Tier Performance</h2>
            <Link href="/dashboard/creator/tiers" className="text-primary font-bold hover:underline font-mono text-sm uppercase">
              Manage Tiers →
            </Link>
          </div>

          {tiers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No tiers created yet.</p>
              <Link href="/dashboard/creator/tiers" className="text-primary hover:underline font-bold">
                Create your first tier
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {tiers.map((tier) => {
                const tierRevenue = tier.price * (tier._count?.subscriptions || 0);
                return (
                  <div key={tier.id} className="flex items-center justify-between py-4 border-b-2 border-brutal-black last:border-0">
                    <div>
                      <p className="font-display font-bold text-foreground">{tier.name}</p>
                      <p className="text-sm text-muted-foreground font-mono">{formatCurrency(tier.price, "INR")}/month</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-foreground">{tier._count?.subscriptions || 0} subscribers</p>
                      <p className="text-sm text-accent-green font-mono font-bold">{formatCurrency(tierRevenue, "INR")}/month</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Recent Tips */}
        <Card variant="brutal" className="p-8">
          <h2 className="font-display text-xl font-bold text-foreground mb-6">Recent Tips</h2>

          {recentTips.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground font-mono">No tips received yet.</p>
          ) : (
            <div className="space-y-4">
              {recentTips.map((tip) => (
                <div key={tip.id} className="flex items-center justify-between py-3 border-b border-dashed border-brutal-black last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-pink-500/10 border-2 border-brutal-black flex items-center justify-center shadow-brutal-sm">💝</div>
                    <div>
                      <p className="font-bold text-foreground">{tip.fromUser.name || "Anonymous"}</p>
                      {tip.message && <p className="text-sm text-muted-foreground italic">&quot;{tip.message}&quot;</p>}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-accent-green font-mono">{formatCurrency(tip.amount, "INR")}</p>
                    <p className="text-xs text-muted-foreground font-mono">{new Date(tip.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Info */}
        <div className="mt-8 flex items-start gap-3 text-sm text-muted-foreground bg-secondary/10 p-4 border-2 border-brutal-black border-dashed">
          <Info className="w-5 h-5 mt-0.5 text-secondary" />
          <p className="font-mono">
            Earnings are calculated based on your current active subscribers and the default UPI payment method.
            Actual earnings may vary based on payment methods used by your fans.
          </p>
        </div>
    </div>
  );
}

