import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { FileText, Users, DollarSign, TrendingUp, Plus, ChevronRight, Sparkles, Zap, Target } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { 
  Avatar, 
  Button,
  BentoGrid,
  BentoCell,
  BentoHeader,
  BentoContent,
  BentoTitle,
  BentoDescription,
  TrustBadge,
  TrustBadgeGroup,
} from "@/components/ui";
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
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Welcome Header with Neubrutalist Style */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 lg:gap-6 mb-6">
          <div>
            <h1 className="font-display text-display-sm lg:text-display font-bold text-foreground mb-2">
              Welcome back, {profile.displayName || profile.user.name}
            </h1>
            <p className="text-muted-foreground text-lg">
              Here's what's happening with your content today.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <TrustBadgeGroup>
              <TrustBadge type="verified" size="sm" />
              <TrustBadge type="live" size="sm" />
            </TrustBadgeGroup>
          </div>
        </div>
        
        {/* Quick Action - Brutal Style */}
        <Link href="/dashboard/creator/posts/new">
          <Button variant="brutal-accent" size="lg" className="gap-2">
            <Plus className="w-5 h-5" />
            Create New Post
          </Button>
        </Link>
      </div>

      {/* Main Bento Grid Dashboard */}
      <BentoGrid cols={4} gap="lg">
        
        {/* Featured Stats Row - Span Full Width */}
        <BentoCell span={4} variant="brutal">
          <BentoContent className="py-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
              {/* Subscribers Stat */}
              <div className="text-center lg:text-left">
                <div className="flex items-center justify-center lg:justify-start gap-2 mb-2">
                  <div className="p-2 bg-primary/20 border-2 border-brutal-black">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  <span className="font-mono text-xs uppercase tracking-wide text-muted-foreground">
                    Subscribers
                  </span>
                </div>
                <p className="font-display text-display-sm lg:text-display font-bold text-foreground">
                  {stats.subscribers}
                </p>
              </div>
              
              {/* Monthly Revenue */}
              <div className="text-center lg:text-left">
                <div className="flex items-center justify-center lg:justify-start gap-2 mb-2">
                  <div className="p-2 bg-secondary/10 border-2 border-brutal-black">
                    <DollarSign className="w-5 h-5 text-secondary" />
                  </div>
                  <span className="font-mono text-xs uppercase tracking-wide text-muted-foreground">
                    Monthly
                  </span>
                </div>
                <p className="font-display text-display-sm lg:text-display font-bold text-foreground">
                  {formatPrice(stats.mrr)}
                </p>
              </div>
              
              {/* Posts */}
              <div className="text-center lg:text-left">
                <div className="flex items-center justify-center lg:justify-start gap-2 mb-2">
                  <div className="p-2 bg-accent-purple/10 border-2 border-brutal-black">
                    <FileText className="w-5 h-5 text-accent-purple" />
                  </div>
                  <span className="font-mono text-xs uppercase tracking-wide text-muted-foreground">
                    Posts
                  </span>
                </div>
                <p className="font-display text-display-sm lg:text-display font-bold text-foreground">
                  {stats.posts}
                </p>
              </div>
              
              {/* All Time Earnings */}
              <div className="text-center lg:text-left">
                <div className="flex items-center justify-center lg:justify-start gap-2 mb-2">
                  <div className="p-2 bg-accent/10 border-2 border-brutal-black">
                    <TrendingUp className="w-5 h-5 text-accent" />
                  </div>
                  <span className="font-mono text-xs uppercase tracking-wide text-muted-foreground">
                    Lifetime
                  </span>
                </div>
                <p className="font-display text-display-sm lg:text-display font-bold text-foreground">
                  {formatPrice(stats.totalEarnings)}
                </p>
              </div>
            </div>
          </BentoContent>
        </BentoCell>

        {/* Recent Posts - Span 2 columns */}
        <BentoCell span={2} variant="brutal" rowSpan={2}>
          <BentoHeader>
            <div className="flex items-center justify-between">
              <BentoTitle display>Recent Posts</BentoTitle>
              <Link
                href="/dashboard/creator/posts"
                className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                View All <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </BentoHeader>
          <BentoContent>
            {profile.posts.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed border-border">
                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground mb-3">No posts yet</p>
                <Link href="/dashboard/creator/posts/new">
                  <Button variant="brutal" size="sm">
                    Create First Post
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {profile.posts.map((post) => (
                  <div
                    key={post.id}
                    className="flex items-start gap-4 p-4 border-2 border-brutal-black bg-brutal-cream hover:shadow-brutal-sm transition-shadow cursor-pointer"
                  >
                    <div className="w-10 h-10 border-2 border-brutal-black bg-muted flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-foreground truncate mb-1">
                        {post.title}
                      </h4>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-muted-foreground font-mono">
                          {new Date(post.createdAt).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                          })}
                        </span>
                        {post.isPaid && (
                          <span className="px-2 py-0.5 border-2 border-brutal-black bg-secondary text-white text-[10px] font-bold uppercase">
                            Premium
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </BentoContent>
        </BentoCell>

        {/* Smart Discovery Preview */}
        <BentoCell span={2} variant="glass-brutal">
          <BentoHeader>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-accent" />
              <BentoTitle>Smart Discovery</BentoTitle>
            </div>
            <BentoDescription>AI-powered brand matching coming soon</BentoDescription>
          </BentoHeader>
          <BentoContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 border-2 border-brutal-black bg-card">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-primary" />
                  <span className="text-xs font-mono uppercase text-muted-foreground">
                    Match Score
                  </span>
                </div>
                <p className="font-display text-h1 font-bold text-primary">--</p>
              </div>
              <div className="p-4 border-2 border-brutal-black bg-card">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4 text-secondary" />
                  <span className="text-xs font-mono uppercase text-muted-foreground">
                    Est. ROI
                  </span>
                </div>
                <p className="font-display text-h1 font-bold text-secondary">--</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-4 text-center">
              Complete your profile to unlock AI recommendations
            </p>
          </BentoContent>
        </BentoCell>

        {/* New Fans */}
        <BentoCell span={2} variant="brutal">
          <BentoHeader>
            <div className="flex items-center justify-between">
              <BentoTitle>New Fans</BentoTitle>
              <Link
                href="/dashboard/creator/subscribers"
                className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                View All <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </BentoHeader>
          <BentoContent>
            {profile.subscriptions.length === 0 ? (
              <div className="text-center py-6 border-2 border-dashed border-border">
                <Users className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No subscribers yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {profile.subscriptions.slice(0, 4).map((sub) => (
                  <div key={sub.id} className="flex items-center gap-3 p-2 hover:bg-muted transition-colors">
                    <Avatar
                      src={sub.fan.image}
                      name={sub.fan.name || "Fan"}
                      size="sm"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground text-sm truncate">
                        {sub.fan.name || "Anonymous"}
                      </p>
                      <span className="text-xs font-mono text-muted-foreground">
                        {sub.tier.name}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </BentoContent>
        </BentoCell>

        {/* Membership Tiers CTA */}
        <BentoCell span={2} variant="brutal" className="bg-primary">
          <BentoContent className="h-full flex flex-col justify-between">
            <div>
              <h3 className="font-display text-h2 font-bold text-white mb-2">
                Membership Tiers
              </h3>
              <p className="text-primary-100 text-sm mb-4">
                You have {profile.tiers.length} active tier{profile.tiers.length !== 1 ? 's' : ''}.
                Optimize your pricing to maximize revenue.
              </p>
            </div>
            <Link href="/dashboard/creator/tiers">
              <Button 
                variant="brutal" 
                className="w-full bg-card text-primary hover:bg-brutal-cream"
              >
                Manage Tiers
              </Button>
            </Link>
          </BentoContent>
        </BentoCell>

        {/* Quick Actions */}
        <BentoCell span={2} variant="brutal">
          <BentoHeader>
            <BentoTitle>Quick Actions</BentoTitle>
          </BentoHeader>
          <BentoContent>
            <div className="grid grid-cols-2 gap-3">
              <Link href="/dashboard/creator/earnings">
                <Button variant="brutal" size="sm" fullWidth className="justify-start">
                  <DollarSign className="w-4 h-4 mr-2" />
                  Earnings
                </Button>
              </Link>
              <Link href="/dashboard/creator/settings">
                <Button variant="brutal" size="sm" fullWidth className="justify-start">
                  <Users className="w-4 h-4 mr-2" />
                  Settings
                </Button>
              </Link>
              <Link href="/dashboard/creator/products">
                <Button variant="brutal" size="sm" fullWidth className="justify-start">
                  <FileText className="w-4 h-4 mr-2" />
                  Products
                </Button>
              </Link>
              <Link href="/dashboard/creator/payouts">
                <Button variant="brutal" size="sm" fullWidth className="justify-start">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Payouts
                </Button>
              </Link>
            </div>
          </BentoContent>
        </BentoCell>

      </BentoGrid>
    </div>
  );
}

