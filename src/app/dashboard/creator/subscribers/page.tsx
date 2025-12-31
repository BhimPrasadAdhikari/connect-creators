import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { Users, DollarSign, MessageCircle, Star } from "lucide-react";
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
    <div className="p-4 sm:p-6 lg:p-12 max-w-6xl mx-auto space-y-12">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-4xl font-bold text-foreground mb-2">Subscribers</h1>
            <p className="font-mono text-muted-foreground">
              <span className="font-bold text-primary">{creatorData.subscriptions.length}</span> active subscriber
              {creatorData.subscriptions.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <Card variant="brutal" className="hover:translate-x-[-4px] hover:translate-y-[-4px] hover:shadow-brutal transition-all">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 border-3 border-brutal-black bg-accent-blue/20 flex items-center justify-center shadow-brutal-sm">
                  <Users className="w-7 h-7 text-accent-blue" />
                </div>
                <div>
                  <p className="font-display text-3xl font-bold text-foreground">
                    {creatorData.subscriptions.length}
                  </p>
                  <p className="font-mono text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Subscribers</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card variant="brutal" className="hover:translate-x-[-4px] hover:translate-y-[-4px] hover:shadow-brutal transition-all bg-accent-green/5">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 border-3 border-brutal-black bg-accent-green flex items-center justify-center shadow-brutal-sm">
                  <DollarSign className="w-7 h-7 text-white" />
                </div>
                <div>
                  <p className="font-display text-3xl font-bold text-foreground">
                    {formatPrice(totalMRR)}
                  </p>
                  <p className="font-mono text-xs font-bold text-muted-foreground uppercase tracking-wider">Monthly Revenue</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card variant="brutal" className="hover:translate-x-[-4px] hover:translate-y-[-4px] hover:shadow-brutal transition-all">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 border-3 border-brutal-black bg-accent-purple/20 flex items-center justify-center shadow-brutal-sm">
                  <Star className="w-7 h-7 text-accent-purple" />
                </div>
                <div>
                  <p className="font-display text-3xl font-bold text-foreground">
                    {creatorData.subscriptions.length > 0
                      ? formatPrice(Math.round(totalMRR / creatorData.subscriptions.length))
                      : "₹0"}
                  </p>
                  <p className="font-mono text-xs font-bold text-muted-foreground uppercase tracking-wider">Avg. per Subscriber</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Subscribers by Tier */}
        {subscribersByTier.map(({ tier, subscribers }) => (
          <div key={tier.id} className="mb-8">
            <div className="flex items-center justify-between mb-4 border-b-4 border-brutal-black pb-2">
              <div className="flex items-center gap-3">
                <h2 className="font-display text-2xl font-bold text-foreground uppercase">{tier.name}</h2>
                <Badge className="bg-primary text-white border-2 border-brutal-black rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-mono">
                  {subscribers.length} subscriber{subscribers.length !== 1 ? "s" : ""}
                </Badge>
              </div>
              <p className="font-display font-bold text-xl text-primary">{formatPrice(tier.price)}<span className="text-sm text-muted-foreground font-mono font-normal">/mo</span></p>
            </div>

            {subscribers.length === 0 ? (
              <div className="bg-secondary/10 border-2 border-dashed border-brutal-black p-8 text-center">
                <p className="font-mono text-muted-foreground font-bold">No subscribers in this tier yet.</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {subscribers.map((sub) => (
                  <Card key={sub.id} variant="brutal" className="hover:shadow-brutal-sm transition-all group">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="border-2 border-brutal-black rounded-full overflow-hidden shrink-0 group-hover:scale-105 transition-transform">
                          <Avatar src={sub.fan.image} name={sub.fan.name || "Fan"} size="md" />
                        </div>
                        <div>
                          <p className="font-display font-bold text-foreground group-hover:text-primary transition-colors">{sub.fan.name || "Anonymous"}</p>
                          <p className="font-mono text-xs text-muted-foreground">
                            Subscribed{" "}
                            {new Date(sub.createdAt).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="hover:bg-primary hover:text-white border-2 border-transparent hover:border-brutal-black transition-all">
                        <MessageCircle className="w-4 h-4" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        ))}

        {creatorData.subscriptions.length === 0 && (
          <div className="bg-card border-3 border-brutal-black shadow-brutal p-12 text-center">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6 border-3 border-brutal-black">
              <Users className="w-10 h-10 text-muted-foreground" />
            </div>
            <h2 className="font-display text-2xl font-bold text-foreground mb-2">No Subscribers Yet</h2>
            <p className="font-mono text-muted-foreground mb-8 max-w-md mx-auto">
              Share your profile to start growing your subscriber base!
            </p>
            <Link href={`/creator/${creatorData.username}`}>
              <Button variant="brutal-accent" size="lg">
                View Public Profile
              </Button>
            </Link>
          </div>
        )}
    </div>
  );
}
