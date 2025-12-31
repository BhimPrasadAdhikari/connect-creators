import Link from "next/link";
import { getServerSession } from "next-auth";
import { Users, Calendar, CreditCard, Compass } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { Card, CardContent, Avatar, Button } from "@/components/ui";
import prisma from "@/lib/prisma";

async function getSubscriptions(userId: string) {
  const subscriptions = await prisma.subscription.findMany({
    where: {
      fanId: userId,
      status: "ACTIVE",
    },
    include: {
      tier: true,
      creator: {
        include: {
          user: {
            select: {
              name: true,
              image: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return subscriptions;
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

export default async function SubscriptionsPage() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string })?.id;

  if (!userId) {
    return null; // Layout handles redirect
  }

  const subscriptions = await getSubscriptions(userId);

  return (
    <div className="p-6 lg:p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8 border-b-4 border-brutal-black pb-6">
          <h1 className="text-3xl lg:text-5xl font-black text-foreground flex items-center gap-3 font-display uppercase tracking-tight">
             <div className="w-12 h-12 bg-accent-blue border-3 border-brutal-black flex items-center justify-center shadow-brutal-sm">
                <Users className="w-7 h-7 text-brutal-black" strokeWidth={2.5} />
             </div>
             Subscriptions
          </h1>
          <Link
            href="/explore"
          >
            <Button variant="brutal" className="hidden sm:flex bg-brutal-black text-brutal-white hover:bg-card hover:text-brutal-black">
                <Compass className="w-4 h-4 mr-2" />
                Explore Creators
            </Button>
          </Link>
        </div>

        {subscriptions.length === 0 ? (
          <Card variant="brutal" className="bg-card">
            <CardContent className="text-center py-20 px-8">
              <div className="w-24 h-24 bg-accent-blue border-4 border-brutal-black flex items-center justify-center mx-auto mb-6 shadow-brutal">
                 <Users className="w-12 h-12 text-brutal-black" strokeWidth={2.5} />
              </div>
              <h2 className="text-3xl font-black text-foreground mb-4 font-display uppercase">
                No Active Subscriptions
              </h2>
              <p className="text-muted-foreground font-medium text-lg mb-8 max-w-md mx-auto">
                You haven&apos;t subscribed to any creators yet. Explore and find creators you love!
              </p>
              <Link
                href="/explore"
              >
                 <Button variant="brutal" size="lg" className="bg-primary text-white hover:bg-card hover:text-brutal-black">
                   Start Exploring
                 </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {subscriptions.map((sub) => (
              <Card key={sub.id} variant="brutal" className="hover:translate-x-[-4px] hover:translate-y-[-4px] transition-transform">
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row items-start gap-6">
                    <Link href={`/creator/${sub.creator.username}`} className="flex-shrink-0">
                         <div className="border-4 border-brutal-black rounded-full overflow-hidden w-20 h-20 shadow-brutal-sm">
                            <Avatar
                                src={sub.creator.user.image}
                                name={sub.creator.displayName || sub.creator.user.name || "Creator"}
                                size="lg"
                            />
                         </div>
                    </Link>

                    <div className="flex-1 min-w-0 w-full">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
                          <Link
                            href={`/creator/${sub.creator.username}`}
                            className="block"
                          >
                            <h3 className="text-2xl font-black text-foreground hover:underline decoration-4 underline-offset-4 decoration-accent-blue font-display uppercase">
                              {sub.creator.displayName || sub.creator.user.name}
                            </h3>
                            <p className="text-sm font-bold font-mono text-muted-foreground">
                              @{sub.creator.username}
                            </p>
                          </Link>
                          
                          <div className="flex gap-2">
                             <Link href={`/creator/${sub.creator.username}`}>
                                <Button variant="outline" size="sm" className="border-2 border-brutal-black font-bold h-9">
                                View Profile
                                </Button>
                            </Link>
                             <Button
                                variant="ghost"
                                size="sm"
                                className="text-accent-red font-bold hover:bg-accent-red/10 border-2 border-transparent hover:border-accent-red h-9"
                              >
                                Cancel
                              </Button>
                          </div>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4 mt-4">
                         <div className="bg-secondary/10 p-3 border-2 border-brutal-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                             <div className="text-xs font-black uppercase text-muted-foreground mb-1">Tier</div>
                             <div className="flex items-center gap-2 font-bold text-foreground">
                                <span className="w-2 h-2 rounded-full bg-accent-green"></span>
                                {sub.tier.name}
                             </div>
                         </div>
                         
                         <div className="bg-secondary/10 p-3 border-2 border-brutal-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                             <div className="text-xs font-black uppercase text-muted-foreground mb-1">Price</div>
                             <div className="flex items-center gap-2 font-bold text-foreground">
                                <CreditCard className="w-4 h-4 text-primary" />
                                {formatPrice(sub.tier.price)}/mo
                             </div>
                         </div>
                      </div>

                      {sub.endDate && (
                        <div className="flex items-center gap-2 mt-3 text-sm font-mono font-bold text-muted-foreground bg-card w-fit px-2 border border-brutal-black/20">
                          <Calendar className="w-4 h-4" />
                          Renews on{" "}
                          {new Date(sub.endDate).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            <Card variant="brutal" className="bg-brutal-black text-brutal-white border-white border-4 mt-8">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <p className="font-bold font-display uppercase text-lg tracking-wide">
                      Total Monthly Spend
                    </p>
                    <p className="text-sm font-mono text-gray-400">
                      across {subscriptions.length} active subscription{subscriptions.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <p className="text-4xl font-black text-accent-green font-display">
                    {formatPrice(
                      subscriptions.reduce((total, sub) => total + sub.tier.price, 0)
                    )}
                    <span className="text-lg font-bold text-white ml-2">/mo</span>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
