"use client";

import { useState, useEffect } from "react";
import { Calculator, ArrowRight, Info } from "lucide-react";
import { Card, CardContent, Button } from "@/components/ui";

interface EarningsResult {
  gross: string;
  paymentFee: string;
  platformFee: string;
  youEarn: string;
  creatorShare: string;
}

const QUICK_AMOUNTS = [
  { label: "₹99", value: 9900 },
  { label: "₹199", value: 19900 },
  { label: "₹299", value: 29900 },
  { label: "₹499", value: 49900 },
];

const PAYMENT_METHODS = [
  { id: "razorpay", name: "UPI", fee: "~2%" },
  { id: "razorpay_card", name: "Card (India)", fee: "~2.5%" },
  { id: "stripe", name: "International Card", fee: "~2.9%" },
  { id: "esewa", name: "eSewa", fee: "~2%" },
  { id: "khalti", name: "Khalti", fee: "~2%" },
];

interface EarningsCalculatorProps {
  className?: string;
}

export function EarningsCalculator({ className = "" }: EarningsCalculatorProps) {
  const [amount, setAmount] = useState(19900); // ₹199 default
  const [provider, setProvider] = useState("razorpay");
  const [result, setResult] = useState<EarningsResult | null>(null);
  const [loading, setLoading] = useState(false);

  const calculateEarnings = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/pricing/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, provider }),
      });
      
      if (res.ok) {
        const data = await res.json();
        setResult(data.formatted);
      }
    } catch (error) {
      console.error("Failed to calculate:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    calculateEarnings();
  }, [amount, provider]);

  return (
    <Card className={className} variant="brutal">
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-10 h-10 bg-primary/20 border-2 border-brutal-black flex items-center justify-center shadow-brutal-sm">
            <Calculator className="w-6 h-6 text-primary" strokeWidth={2.5} />
          </div>
          <h3 className="text-xl font-black font-display text-foreground uppercase tracking-tight">Earnings Calculator</h3>
        </div>

        {/* Quick Amount Selection */}
        <div className="mb-6">
          <label className="block text-sm font-bold font-mono text-foreground mb-3 uppercase tracking-wider">
            Subscription Price
          </label>
          <div className="grid grid-cols-4 gap-3">
            {QUICK_AMOUNTS.map((qa) => (
              <button
                key={qa.value}
                onClick={() => setAmount(qa.value)}
                className={`py-2 px-1 border-2 border-brutal-black text-sm font-bold font-mono transition-all shadow-brutal-sm hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-brutal
                  ${amount === qa.value 
                    ? "bg-primary text-white" 
                    : "bg-card text-foreground hover:bg-primary/20"
                  }`}
              >
                {qa.label}
              </button>
            ))}
          </div>
          <div className="mt-3">
            <input
              type="number"
              value={amount / 100}
              onChange={(e) => setAmount(Math.round(parseFloat(e.target.value) * 100) || 0)}
              className="w-full px-4 py-3 border-2 border-brutal-black text-sm font-bold font-mono bg-background text-foreground focus:outline-none focus:ring-0 focus:bg-accent-yellow/10 shadow-brutal-sm transition-all"
              placeholder="Custom amount (₹)"
            />
          </div>
        </div>

        {/* Payment Method */}
        <div className="mb-6">
          <label className="block text-sm font-bold font-mono text-foreground mb-3 uppercase tracking-wider">
            Payment Method
          </label>
          <div className="relative">
            <select
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
              className="w-full appearance-none px-4 py-3 border-2 border-brutal-black text-sm font-bold font-mono bg-background text-foreground focus:outline-none focus:ring-0 shadow-brutal-sm cursor-pointer"
            >
              {PAYMENT_METHODS.map((pm) => (
                <option key={pm.id} value={pm.id} className="bg-background text-foreground font-sans">
                  {pm.name} ({pm.fee})
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-foreground">
              <ArrowRight className="h-4 w-4 rotate-90" strokeWidth={3} />
            </div>
          </div>
        </div>

        {/* Results */}
        {result && (
          <div className="bg-secondary/10 border-2 border-brutal-black p-5 space-y-3 shadow-brutal-sm text-foreground">
            <div className="flex justify-between text-sm font-mono font-bold">
              <span className="text-muted-foreground uppercase">Subscriber pays</span>
              <span className="text-foreground">{result.gross}</span>
            </div>
            <div className="flex justify-between text-sm font-mono font-bold">
              <span className="text-muted-foreground uppercase">Payment fee</span>
              <span className="text-accent-red">-{result.paymentFee}</span>
            </div>
            <div className="flex justify-between text-sm font-mono font-bold">
              <span className="text-muted-foreground uppercase">Platform fee (5%)</span>
              <span className="text-accent-red">-{result.platformFee}</span>
            </div>
            <div className="border-t-2 border-brutal-black border-dashed pt-3 flex justify-between items-end">
              <span className="font-black text-foreground font-display uppercase text-lg">You earn</span>
              <div className="text-right">
                <span className="font-black text-secondary text-2xl block leading-none">{result.youEarn}</span>
                <span className="text-xs font-bold font-mono text-muted-foreground">({result.creatorShare})</span>
              </div>
            </div>
          </div>
        )}

        {/* Info */}
        <div className="mt-5 flex items-start gap-3 text-xs font-bold font-mono text-muted-foreground bg-card border-2 border-brutal-black p-3 shadow-brutal-xs">
          <Info className="w-4 h-4 flex-shrink-0 text-foreground mt-0.5" strokeWidth={2.5} />
          <p>
            Platform fee is only 10%. Payment fees vary by method. 
            UPI has the lowest fees (~2%), so encourage Indian fans to use it!
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export default EarningsCalculator;
