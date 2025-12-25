import Link from "next/link";
import { getServerSession } from "next-auth";
import {
  CreditCard,
  CheckCircle,
  XCircle,
  Clock,
  Heart,
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
    return <Heart className="w-4 h-4 text-pink-500 fill-pink-500" />;
  }
  switch (status) {
    case "COMPLETED":
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    case "FAILED":
      return <XCircle className="w-4 h-4 text-red-500" />;
    case "PENDING":
      return <Clock className="w-4 h-4 text-amber-500" />;
    default:
      return null;
  }
}

function getStatusBadge(status: string) {
  switch (status) {
    case "COMPLETED":
      return <Badge variant="success">Completed</Badge>;
    case "FAILED":
      return <Badge variant="error">Failed</Badge>;
    case "PENDING":
      return <Badge variant="warning">Pending</Badge>;
    case "REFUNDED":
      return <Badge variant="accent">Refunded</Badge>;
    default:
      return <Badge>{status}</Badge>;
  }
}

function getTypeBadge(type: string) {
  switch (type) {
    case "tip":
      return <Badge className="bg-pink-100 text-pink-700">Tip</Badge>;
    case "subscription":
      return <Badge className="bg-blue-100 text-blue-700">Subscription</Badge>;
    case "product":
      return <Badge className="bg-purple-100 text-purple-700">Product</Badge>;
    default:
      return <Badge>{type}</Badge>;
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
    <div className="p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Billing & Payments</h1>

        {/* Summary Cards */}
        <div className="grid sm:grid-cols-2 gap-4 mb-8">
            <Card>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                    <CreditCard className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total Spent</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatPrice(totalSpent)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Transactions</p>
                    <p className="text-2xl font-bold text-gray-900">{transactions.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payment History */}
          <Card>
            <CardContent>
              <h2 className="text-lg font-semibold text-gray-900 mb-6">
                Transaction History
              </h2>

              {transactions.length === 0 ? (
                <div className="text-center py-12">
                  <CreditCard className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No Transactions Yet
                  </h3>
                  <p className="text-gray-500">
                    Your transaction history will appear here after you make a purchase or tip.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left border-b border-gray-200">
                        <th className="pb-3 text-sm font-medium text-gray-500">Date</th>
                        <th className="pb-3 text-sm font-medium text-gray-500">Type</th>
                        <th className="pb-3 text-sm font-medium text-gray-500">Description</th>
                        <th className="pb-3 text-sm font-medium text-gray-500">Amount</th>
                        <th className="pb-3 text-sm font-medium text-gray-500">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {transactions.map((transaction) => (
                        <tr key={transaction.id} className="hover:bg-gray-50">
                          <td className="py-4 text-sm text-gray-600">
                            {new Date(transaction.createdAt).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </td>
                          <td className="py-4">
                            {getTypeBadge(transaction.type)}
                          </td>
                          <td className="py-4">
                            <div className="flex items-center gap-2">
                              {getStatusIcon(transaction.status, transaction.type)}
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  {transaction.description}
                                </p>
                                {transaction.recipientName && (
                                  <p className="text-xs text-gray-500">
                                    to {transaction.recipientName}
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="py-4">
                            <p className="text-sm font-medium text-gray-900">
                              {formatPrice(transaction.amount, transaction.currency)}
                            </p>
                            {transaction.provider && (
                              <p className="text-xs text-gray-500">
                                via {transaction.provider.toLowerCase().replace("_", " ")}
                              </p>
                            )}
                          </td>
                          <td className="py-4">{getStatusBadge(transaction.status)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment Methods */}
          <Card className="mt-6">
            <CardContent>
              <h2 className="text-lg font-semibold text-gray-900 mb-6">
                Payment Methods
              </h2>

              <div className="p-4 bg-gray-50 rounded-lg text-center">
                <p className="text-gray-500">
                  Payment methods are managed through your payment provider (Razorpay/Stripe).
                </p>
              </div>
            </CardContent>
          </Card>
      </div>
    </div>
  );
}
