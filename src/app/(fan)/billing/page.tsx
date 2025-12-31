import Link from "next/link";
import { getServerSession } from "next-auth";
import {
  CreditCard,
  CheckCircle,
  XCircle,
  Clock,
  Heart,
  Receipt,
  AlertTriangle
} from "lucide-react";
import { authOptions } from "@/lib/auth";
import { Card, CardContent, Badge } from "@/components/ui";
import prisma from "@/lib/prisma";

// Unified transaction type for display
type Transaction = {
  id: string;
  type: "subscription" | "product" | "tip";
  amount: number;
  currency: string;
  status: string;
  provider?: string;
  createdAt: Date;
  description: string;
  recipientName?: string;
};

async function getTransactionHistory(userId: string): Promise<Transaction[]> {
  // Fetch subscription/product payments
  const payments = await prisma.payment.findMany({
    where: { userId },
    include: {
      subscription: {
        include: {
          tier: true,
          creator: {
            include: {
              user: {
                select: { name: true },
              },
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  // Fetch tips sent by this user
  const tips = await prisma.tip.findMany({
    where: { fromUserId: userId },
    include: {
      toCreator: {
        include: {
          user: {
            select: { name: true },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  // Convert payments to unified transaction format
  const paymentTransactions: Transaction[] = payments.map((p) => ({
    id: p.id,
    type: "subscription" as const,
    amount: p.amount,
    currency: p.currency,
    status: p.status,
    provider: p.provider,
    createdAt: p.createdAt,
    description: p.subscription
      ? `Subscription: ${p.subscription.tier.name}`
      : "Payment",
    recipientName: p.subscription
      ? p.subscription.creator.displayName || p.subscription.creator.user.name || undefined
      : undefined,
  }));

  // Convert tips to unified transaction format
  const tipTransactions: Transaction[] = tips.map((t) => ({
    id: t.id,
    type: "tip" as const,
    amount: t.amount,
    currency: t.currency,
    status: "COMPLETED", // Tips are recorded only after successful payment
    createdAt: t.createdAt,
    description: "Tip",
    recipientName: t.toCreator.displayName || t.toCreator.user.name || undefined,
  }));

  // Combine and sort by date
  const allTransactions = [...paymentTransactions, ...tipTransactions];
  allTransactions.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  return allTransactions;
}

function formatPrice(amountInPaise: number, currency: string = "INR"): string {
  const amount = amountInPaise / 100;
  return new Intl.NumberFormat(currency === "INR" ? "en-IN" : "en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function getStatusIcon(status: string, type: string) {
  if (type === "tip") {
    return <Heart className="w-5 h-5 text-accent-pink fill-accent-pink" strokeWidth={2.5}/>;
  }
  switch (status) {
    case "COMPLETED":
      return <CheckCircle className="w-5 h-5 text-accent-green" strokeWidth={2.5} />;
    case "FAILED":
      return <XCircle className="w-5 h-5 text-accent-red" strokeWidth={2.5}/>;
    case "PENDING":
      return <Clock className="w-5 h-5 text-accent-yellow" strokeWidth={2.5}/>;
    default:
      return null;
  }
}

function getStatusBadge(status: string) {
  switch (status) {
    case "COMPLETED":
      return <Badge variant="success" className="text-xs uppercase">Completed</Badge>;
    case "FAILED":
      return <Badge variant="error" className="text-xs uppercase">Failed</Badge>;
    case "PENDING":
      return <Badge variant="warning" className="text-xs uppercase">Pending</Badge>;
    case "REFUNDED":
      return <Badge variant="accent" className="text-xs uppercase">Refunded</Badge>;
    default:
      return <Badge className="text-xs uppercase bg-secondary/20 text-foreground">{status}</Badge>;
  }
}

function getTypeBadge(type: string) {
  switch (type) {
    case "tip":
      return <Badge className="bg-accent-pink text-brutal-black border-2 border-brutal-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-xs uppercase font-black">Tip</Badge>;
    case "subscription":
      return <Badge className="bg-accent-blue text-brutal-black border-2 border-brutal-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-xs uppercase font-black">Subscription</Badge>;
    case "product":
      return <Badge className="bg-accent-purple text-brutal-black border-2 border-brutal-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-xs uppercase font-black">Product</Badge>;
    default:
      return <Badge className="border-2 border-brutal-black">{type}</Badge>;
  }
}

export default async function BillingPage() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string })?.id;

  if (!userId) {
    return null; // Layout handles redirect
  }

  const transactions = await getTransactionHistory(userId);

  const totalSpent = transactions
    .filter((t) => t.status === "COMPLETED")
    .reduce((sum, t) => sum + t.amount, 0);

  const tipCount = transactions.filter((t) => t.type === "tip").length;

  return (
    <div className="p-6 lg:p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 border-b-4 border-brutal-black pb-6">
          <h1 className="text-3xl lg:text-5xl font-black text-foreground flex items-center gap-3 font-display uppercase tracking-tight">
             <div className="w-12 h-12 bg-accent-green border-3 border-brutal-black flex items-center justify-center shadow-brutal-sm">
                <Receipt className="w-7 h-7 text-brutal-black" strokeWidth={2.5}/>
             </div>
             Billing & Payments
          </h1>
        </div>

        {/* Summary Cards */}
        <div className="grid sm:grid-cols-2 gap-6 mb-8">
            <Card variant="brutal" className="bg-accent-blue">
              <CardContent className="p-6">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-none bg-card border-2 border-brutal-black flex items-center justify-center shadow-brutal-sm">
                    <CreditCard className="w-8 h-8 text-brutal-black" strokeWidth={2} />
                  </div>
                  <div>
                    <p className="text-sm font-black uppercase text-brutal-black/70 mb-1">Total Spent</p>
                    <p className="text-4xl font-black text-white font-display text-stroke-sm">
                      {formatPrice(totalSpent)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card variant="brutal" className="bg-accent-yellow">
              <CardContent className="p-6">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-none bg-card border-2 border-brutal-black flex items-center justify-center shadow-brutal-sm">
                    <CheckCircle className="w-8 h-8 text-brutal-black" strokeWidth={2} />
                  </div>
                  <div>
                    <p className="text-sm font-black uppercase text-brutal-black/70 mb-1">Transactions</p>
                    <p className="text-4xl font-black text-brutal-black font-display">
                        {transactions.length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payment History */}
          <Card variant="brutal">
            <CardContent className="p-0">
              <div className="p-6 border-b-4 border-brutal-black bg-secondary/5">
                 <h2 className="text-2xl font-black text-foreground font-display uppercase tracking-wide">
                    Transaction History
                 </h2>
              </div>

              {transactions.length === 0 ? (
                <div className="text-center py-20 px-6">
                  <div className="w-20 h-20 bg-secondary/20 border-4 border-brutal-black flex items-center justify-center mx-auto mb-6 shadow-brutal-sm">
                    <CreditCard className="w-10 h-10 text-brutal-black/50" strokeWidth={2} />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2 font-display uppercase">
                    No Transactions Yet
                  </h3>
                  <p className="text-muted-foreground font-medium font-mono">
                    Your transaction history will appear here after you make a purchase or tip.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left border-b-4 border-brutal-black bg-brutal-black text-brutal-white">
                        <th className="py-4 px-6 text-sm font-black uppercase font-display tracking-wider">Date</th>
                        <th className="py-4 px-6 text-sm font-black uppercase font-display tracking-wider">Type</th>
                        <th className="py-4 px-6 text-sm font-black uppercase font-display tracking-wider">Description</th>
                        <th className="py-4 px-6 text-sm font-black uppercase font-display tracking-wider">Amount</th>
                        <th className="py-4 px-6 text-sm font-black uppercase font-display tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y-2 divide-brutal-black/10">
                      {transactions.map((transaction) => (
                        <tr key={transaction.id} className="hover:bg-secondary/5 transition-colors font-medium">
                          <td className="py-4 px-6 text-sm text-foreground font-mono font-bold">
                            {new Date(transaction.createdAt).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </td>
                          <td className="py-4 px-6">
                            {getTypeBadge(transaction.type)}
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <div className="p-1 border-2 border-brutal-black bg-card shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                {getStatusIcon(transaction.status, transaction.type)}
                              </div>
                              <div>
                                <p className="text-sm font-bold text-foreground uppercase">
                                  {transaction.description}
                                </p>
                                {transaction.recipientName && (
                                  <p className="text-xs text-muted-foreground font-mono font-bold">
                                    to {transaction.recipientName}
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <p className="text-sm font-bold text-foreground font-mono">
                              {formatPrice(transaction.amount, transaction.currency)}
                            </p>
                            {transaction.provider && (
                              <p className="text-xs text-muted-foreground uppercase font-black">
                                {transaction.provider.toLowerCase().replace("_", " ")}
                              </p>
                            )}
                          </td>
                          <td className="py-4 px-6">{getStatusBadge(transaction.status)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment Methods */}
          <Card variant="brutal" className="mt-8 bg-secondary/10">
            <CardContent className="p-8 text-center">
              <h2 className="text-xl font-black text-foreground mb-4 font-display uppercase flex items-center justify-center gap-2">
                 <AlertTriangle className="w-6 h-6" /> Payment Methods
              </h2>

              <div className="p-4 bg-card border-2 border-brutal-black shadow-brutal-sm inline-block max-w-md mx-auto">
                <p className="text-foreground font-bold font-mono">
                  Payment methods are managed securely through our payment partners (Razorpay/Stripe).
                </p>
              </div>
            </CardContent>
          </Card>
      </div>
    </div>
  );
}
