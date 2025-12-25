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
          case 'PAID': return 'bg-green-100 text-green-700';
          case 'PENDING': return 'bg-yellow-100 text-yellow-700';
          case 'PROCESSING': return 'bg-blue-100 text-blue-700';
          case 'FAILED': return 'bg-red-100 text-red-700';
          default: return 'bg-gray-100 text-gray-700';
      }
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-100">
        <h3 className="text-lg font-bold text-gray-900">Payout History</h3>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50 text-gray-500 text-sm font-medium">
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Amount</th>
              <th className="px-6 py-4">Method</th>
              <th className="px-6 py-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {payouts.length === 0 ? (
                <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                        No payout history found.
                    </td>
                </tr>
            ) : (
                payouts.map((payout) => (
                    <tr key={payout.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-gray-900">
                        {new Date(payout.createdAt).toLocaleDateString("en-IN", {
                            day: 'numeric', month: 'short', year: 'numeric'
                        })}
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {formatPrice(payout.amount)}
                      </td>
                      <td className="px-6 py-4 text-gray-600 text-sm">
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
