"use client";

import { Wallet, TrendingUp, ArrowUpRight, DollarSign, Clock } from "lucide-react";
import { Button, Card, CardContent } from "@/components/ui";

interface BalanceCardProps {
  balance: number;
  totalEarnings: number;
  paidOut: number;
  breakdown: {
    subscriptions: number;
    products: number;
    tips: number;
    dms?: number;
  };
  onRequestPayout: () => void;
}

export function BalanceCard({
  balance,
  totalEarnings,
  paidOut,
  breakdown,
  onRequestPayout,
}: BalanceCardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount / 100);
  };

  return (
    <div className="grid lg:grid-cols-3 gap-6 mb-8">
      {/* Main Balance Card */}
      <Card variant="brutal" className="lg:col-span-2 bg-primary text-white border-primary">
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2 opacity-90">
                <Wallet className="w-5 h-5" />
                <span className="font-display font-bold uppercase tracking-wide text-sm">Available Balance</span>
              </div>
              <h2 className="font-display text-5xl md:text-6xl font-black mb-4 tracking-tight">
                {formatCurrency(balance)}
              </h2>
              <div className="flex items-center gap-2 text-sm font-mono bg-black/20 px-3 py-1.5 rounded-none border border-white/20 inline-flex">
                <Clock className="w-4 h-4" />
                <span>Next payout: Monday, Jan 1</span>
              </div>
            </div>
            
            <Button 
              variant="secondary"
              className=" border-4 border-black shadow-[4px_4px_0px_0px_#000000] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] w-full md:w-auto text-lg py-6"
              onClick={onRequestPayout}
              disabled={balance < 50000} // 500 INR
            >
              Request Payout
            </Button>
          </div>

          <div className="mt-8 pt-6 border-t-2 border-white/20 grid sm:grid-cols-3 gap-6">
            <div>
              <div className="text-white/70 text-xs font-bold uppercase mb-1 font-display">Total Earnings</div>
              <div className="text-2xl font-bold font-display">{formatCurrency(totalEarnings)}</div>
            </div>
            <div>
              <div className="text-white/70 text-xs font-bold uppercase mb-1 font-display">Paid Out</div>
              <div className="text-2xl font-bold font-display">{formatCurrency(paidOut)}</div>
            </div>
            <div>
              <div className="text-white/70 text-xs font-bold uppercase mb-1 font-display">Pending</div>
              <div className="text-2xl font-bold font-display">{formatCurrency(balance)}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Breakdown Card */}
      <Card variant="brutal" className="lg:col-span-1">
        <CardContent className="p-6 h-full flex flex-col">
          <div className="flex items-center gap-2 mb-6 border-b-4 border-brutal-black pb-4">
            <TrendingUp className="w-5 h-5" />
            <h3 className="font-display font-bold uppercase text-lg">Earnings Breakdown</h3>
          </div>

          <div className="space-y-4 flex-1">
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-bold uppercase font-display">
                <span>Subscriptions</span>
                <span>{formatCurrency(breakdown.subscriptions)}</span>
              </div>
              <div className="h-4 bg-secondary/20 border-2 border-brutal-black p-0.5">
                <div 
                  className="h-full bg-accent-blue" 
                  style={{ width: `${totalEarnings > 0 ? (breakdown.subscriptions / totalEarnings) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm font-bold uppercase font-display">
                <span>Digital Products</span>
                <span>{formatCurrency(breakdown.products)}</span>
              </div>
              <div className="h-4 bg-secondary/20 border-2 border-brutal-black p-0.5">
                <div 
                  className="h-full bg-accent-purple" 
                  style={{ width: `${totalEarnings > 0 ? (breakdown.products / totalEarnings) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm font-bold uppercase font-display">
                <span>Tips</span>
                <span>{formatCurrency(breakdown.tips)}</span>
              </div>
              <div className="h-4 bg-secondary/20 border-2 border-brutal-black p-0.5">
                <div 
                  className="h-full bg-accent-yellow" 
                  style={{ width: `${totalEarnings > 0 ? (breakdown.tips / totalEarnings) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
          
          <div className="mt-auto pt-6">
             <div className="flex items-start gap-2 text-xs font-mono text-muted-foreground bg-secondary/10 p-3 border-2 border-dashed border-brutal-black/20">
                <DollarSign className="w-4 h-4 shrink-0 mt-0.5" />
                <p>Platform fee is 5%. Payouts are processed on typical banking days.</p>
             </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
