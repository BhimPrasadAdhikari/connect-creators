import { DollarSign, TrendingUp, CreditCard, Wallet } from "lucide-react";
import { Card, CardContent, Button } from "@/components/ui";

interface BalanceCardProps {
  balance: number; // in paise
  totalEarnings: number; // in paise
  paidOut: number; // in paise
  onRequestPayout: () => void;
  breakdown: {
    subscriptions: number;
    products: number;
    tips: number;
    dms: number;
  };
}

export function BalanceCard({ balance, totalEarnings, paidOut, onRequestPayout, breakdown }: BalanceCardProps) {
  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount / 100);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {/* Main Balance */}
      <Card className="md:col-span-2 bg-gradient-to-br from-indigo-900 to-indigo-800 text-white border-none shadow-xl">
        <CardContent className="p-8">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-indigo-200 font-medium mb-1">Available for Payout</p>
              <h2 className="text-5xl font-bold tracking-tight mb-6">
                {formatPrice(balance)}
              </h2>
              <div className="flex gap-6 text-sm text-indigo-100">
                <div>
                  <span className="opacity-70">Total Earned</span>
                  <p className="font-semibold text-lg">{formatPrice(totalEarnings)}</p>
                </div>
                <div>
                  <span className="opacity-70">Paid Out</span>
                  <p className="font-semibold text-lg">{formatPrice(paidOut)}</p>
                </div>
              </div>
            </div>
            <Button 
                onClick={onRequestPayout}
                className="bg-white text-indigo-900 hover:bg-gray-100 font-bold px-6 py-2 h-auto"
                size="lg"
            >
              Request Payout
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Breakdown */}
      <div className="space-y-4">
         <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                    <UsersIcon className="w-5 h-5" />
                </div>
                <div>
                    <p className="text-xs text-gray-500 font-medium">Subscriptions</p>
                    <p className="font-bold text-gray-900">{formatPrice(breakdown.subscriptions)}</p>
                </div>
            </div>
         </div>
         <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                    <ShoppingBagIcon className="w-5 h-5" />
                </div>
                <div>
                    <p className="text-xs text-gray-500 font-medium">Products & PPV</p>
                    <p className="font-bold text-gray-900">{formatPrice(breakdown.products)}</p>
                </div>
            </div>
         </div>
         <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                    <HeartIcon className="w-5 h-5" />
                </div>
                <div>
                    <p className="text-xs text-gray-500 font-medium">Tips & DMs</p>
                    <p className="font-bold text-gray-900">{formatPrice(breakdown.tips + breakdown.dms)}</p>
                </div>
            </div>
         </div>
      </div>
    </div>
  );
}

function UsersIcon(props: any) {
    return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
}

function ShoppingBagIcon(props: any) {
    return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
}

function HeartIcon(props: any) {
    return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
}
