import Link from "next/link";
import { getServerSession } from "next-auth";
import { Users, Calendar, CreditCard } from "lucide-react";
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
    <div className="p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-foreground">My Subscriptions</h1>
          <Link
            href="/explore"
            className="inline-flex items-center justify-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
          >
            Explore Creators
          </Link>
        </div>

        {subscriptions.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-lg font-semibold text-foreground mb-2">
                No Active Subscriptions
              </h2>
              <p className="text-muted-foreground mb-6">
                You haven&apos;t subscribed to any creators yet. Explore and find creators you love!
              </p>
              <Link
                href="/explore"
                className="inline-flex items-center justify-center px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
              >
                Explore Creators
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {subscriptions.map((sub) => (
              <Card key={sub.id}>
                <CardContent>
                  <div className="flex items-start gap-4">
                    <Link href={`/creator/${sub.creator.username}`}>
                      <Avatar
                        src={sub.creator.user.image}
                        name={sub.creator.displayName || sub.creator.user.name || "Creator"}
                        size="lg"
                      />
                    </Link>

                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/creator/${sub.creator.username}`}
                        className="block"
                      >
                        <h3 className="font-semibold text-foreground hover:text-primary transition-colors">
                          {sub.creator.displayName || sub.creator.user.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          @{sub.creator.username}
                        </p>
                      </Link>

                      <div className="flex items-center gap-4 mt-3 text-sm">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <CreditCard className="w-4 h-4" />
                          <span className="font-medium text-primary">
                            {formatPrice(sub.tier.price)}/mo
                          </span>
                          <span className="text-muted-foreground/50">•</span>
                          <span>{sub.tier.name}</span>
                        </div>
                      </div>

                      {sub.endDate && (
                        <div className="flex items-center gap-1.5 mt-2 text-sm text-muted-foreground">
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

                    <div className="flex flex-col gap-2">
                      <Link href={`/creator/${sub.creator.username}`}>
                        <Button variant="outline" size="sm">
                          View Profile
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-accent-red hover:text-accent-red hover:bg-accent-red/10"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            <Card className="bg-primary/5 border-primary/20">
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">
                      Total Monthly Spend
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {subscriptions.length} active subscription{subscriptions.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <p className="text-2xl font-bold text-primary">
                    {formatPrice(
                      subscriptions.reduce((total, sub) => total + sub.tier.price, 0)
                    )}
                    <span className="text-sm font-normal text-muted-foreground">/mo</span>
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
