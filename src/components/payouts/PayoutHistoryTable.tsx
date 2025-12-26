import { Badge } from "@/components/ui";

interface Payout {
  id: string;
  amount: number;
  status: "PENDING" | "PROCESSING" | "PAID" | "FAILED" | "REJECTED";
  createdAt: string;
  payoutMethod?: {
      type: string;
      details: any;
  }
}

interface PayoutHistoryTableProps {
  payouts: Payout[];
}

export function PayoutHistoryTable({ payouts }: PayoutHistoryTableProps) {
  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount / 100);
  };

  const getStatusColor = (status: string) => {
      switch(status) {
          case 'PAID': return 'bg-accent-green/10 text-accent-green';
          case 'PENDING': return 'bg-amber-500/10 text-amber-500';
          case 'PROCESSING': return 'bg-primary/10 text-primary';
          case 'FAILED': return 'bg-accent-red/10 text-accent-red';
          default: return 'bg-muted text-muted-foreground';
      }
  };

  return (
    <div className="bg-card rounded-3xl border border-border overflow-hidden">
      <div className="px-6 py-5 border-b border-border">
        <h3 className="text-lg font-bold text-foreground">Payout History</h3>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-muted text-muted-foreground text-sm font-medium">
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Amount</th>
              <th className="px-6 py-4">Method</th>
              <th className="px-6 py-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {payouts.length === 0 ? (
                <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">
                        No payout history found.
                    </td>
                </tr>
            ) : (
                payouts.map((payout) => (
                    <tr key={payout.id} className="hover:bg-muted transition-colors">
                      <td className="px-6 py-4 text-foreground">
                        {new Date(payout.createdAt).toLocaleDateString("en-IN", {
                            day: 'numeric', month: 'short', year: 'numeric'
                        })}
                      </td>
                      <td className="px-6 py-4 font-medium text-foreground">
                        {formatPrice(payout.amount)}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground text-sm">
                        {payout.payoutMethod ? (
                            <span className="flex items-center gap-2">
                                {payout.payoutMethod.type === 'UPI' ? 'UPI' : 'Bank'} 
                                <span className="opacity-50">•</span>
                                <span className="truncate max-w-[100px]">
                                    {payout.payoutMethod.type === 'UPI' 
                                        ? payout.payoutMethod.details.vpa 
                                        : `••${payout.payoutMethod.details.accountNumber?.slice(-4) || '••'}`}
                                </span>
                            </span>
                        ) : 'Unknown'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(payout.status)}`}>
                            {payout.status}
                        </span>
                      </td>
                    </tr>
                  ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
