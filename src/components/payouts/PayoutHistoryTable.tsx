"use client";

import { AlertCircle, CheckCircle, Clock } from "lucide-react";
import { Card, CardContent, Badge } from "@/components/ui";

interface PayoutTransaction {
  id: string;
  amount: number;
  status: "pending" | "processing" | "completed" | "failed";
  method: string;
  requestedAt: string;
  processedAt?: string;
  referenceId?: string;
}

interface PayoutHistoryTableProps {
  payouts: PayoutTransaction[];
}

export function PayoutHistoryTable({ payouts }: PayoutHistoryTableProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-accent-green text-white border-2 border-brutal-black font-mono text-xs font-bold uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <CheckCircle className="w-3 h-3" />
            Paid
          </span>
        );
      case "processing":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-accent-blue text-white border-2 border-brutal-black font-mono text-xs font-bold uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <Clock className="w-3 h-3" />
            Processing
          </span>
        );
      case "failed":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-accent-red text-white border-2 border-brutal-black font-mono text-xs font-bold uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <AlertCircle className="w-3 h-3" />
            Failed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-accent-yellow text-brutal-black border-2 border-brutal-black font-mono text-xs font-bold uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <Clock className="w-3 h-3" />
            Pending
          </span>
        );
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount / 100);
  };

  return (
    <Card variant="brutal">
      <CardContent className="p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-8 border-b-4 border-brutal-black pb-4">
          <Clock className="w-6 h-6" />
          <h3 className="font-display text-2xl font-bold uppercase">Payout History</h3>
        </div>

        {payouts.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground font-mono bg-secondary/5 border-2 border-dashed border-brutal-black">
            No payout history found
          </div>
        ) : (
          <div className="overflow-x-auto border-2 border-brutal-black shadow-brutal-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-primary text-white border-b-2 border-brutal-black">
                  <th className="p-4 font-display font-bold uppercase text-sm tracking-wider w-32">Date</th>
                  <th className="p-4 font-display font-bold uppercase text-sm tracking-wider">Amount</th>
                  <th className="p-4 font-display font-bold uppercase text-sm tracking-wider">Method</th>
                  <th className="p-4 font-display font-bold uppercase text-sm tracking-wider">Status</th>
                  <th className="p-4 font-display font-bold uppercase text-sm tracking-wider text-right">Reference ID</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-brutal-black/10 bg-card">
                {payouts.map((payout) => (
                  <tr key={payout.id} className="hover:bg-secondary/5 transition-colors font-mono text-sm font-bold">
                    <td className="p-4 text-muted-foreground">
                      {formatDate(payout.requestedAt)}
                    </td>
                    <td className="p-4 text-lg">
                      {formatCurrency(payout.amount)}
                    </td>
                    <td className="p-4 capitalize">
                      {payout.method}
                    </td>
                    <td className="p-4">
                      {getStatusBadge(payout.status)}
                    </td>
                    <td className="p-4 text-right text-muted-foreground font-mono text-xs">
                      {payout.referenceId || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
