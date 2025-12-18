import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import {
  ArrowLeft,
  CreditCard,
  Download,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
import { authOptions } from "@/lib/auth";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, Badge } from "@/components/ui";
import prisma from "@/lib/prisma";

async function getPaymentHistory(userId: string) {
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

  return payments;
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

function getStatusIcon(status: string) {
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

export default async function BillingPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const userId = (session.user as { id?: string }).id;
  if (!userId) {
    redirect("/login");
  }

  const payments = await getPaymentHistory(userId);

  const totalSpent = payments
    .filter((p) => p.status === "COMPLETED")
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto">
          <Link
            href="/dashboard"
            className="inline-flex items-center text-gray-600 hover:text-blue-600 mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Dashboard
          </Link>

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
                    <p className="text-2xl font-bold text-gray-900">{payments.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payment History */}
          <Card>
            <CardContent>
              <h2 className="text-lg font-semibold text-gray-900 mb-6">
                Payment History
              </h2>

              {payments.length === 0 ? (
                <div className="text-center py-12">
                  <CreditCard className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No Payments Yet
                  </h3>
                  <p className="text-gray-500">
                    Your payment history will appear here after you make a purchase.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left border-b border-gray-200">
                        <th className="pb-3 text-sm font-medium text-gray-500">Date</th>
                        <th className="pb-3 text-sm font-medium text-gray-500">Description</th>
                        <th className="pb-3 text-sm font-medium text-gray-500">Amount</th>
                        <th className="pb-3 text-sm font-medium text-gray-500">Status</th>
                        <th className="pb-3 text-sm font-medium text-gray-500"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {payments.map((payment) => (
                        <tr key={payment.id} className="hover:bg-gray-50">
                          <td className="py-4 text-sm text-gray-600">
                            {new Date(payment.createdAt).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </td>
                          <td className="py-4">
                            <div className="flex items-center gap-2">
                              {getStatusIcon(payment.status)}
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  {payment.subscription
                                    ? `Subscription: ${payment.subscription.tier.name}`
                                    : "Payment"}
                                </p>
                                {payment.subscription && (
                                  <p className="text-xs text-gray-500">
                                    {payment.subscription.creator.displayName ||
                                      payment.subscription.creator.user.name}
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="py-4">
                            <p className="text-sm font-medium text-gray-900">
                              {formatPrice(payment.amount)}
                            </p>
                            <p className="text-xs text-gray-500">
                              via {payment.provider.toLowerCase().replace("_", " ")}
                            </p>
                          </td>
                          <td className="py-4">{getStatusBadge(payment.status)}</td>
                          <td className="py-4">
                            {payment.status === "COMPLETED" && (
                              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                                <Download className="w-4 h-4" />
                              </button>
                            )}
                          </td>
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
    </main>
  );
}
