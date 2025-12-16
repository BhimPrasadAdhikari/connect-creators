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
    <Card className={className}>
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Calculator className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Earnings Calculator</h3>
        </div>

        {/* Quick Amount Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Subscription Price
          </label>
          <div className="grid grid-cols-4 gap-2">
            {QUICK_AMOUNTS.map((qa) => (
              <button
                key={qa.value}
                onClick={() => setAmount(qa.value)}
                className={`py-2 px-3 rounded-lg border text-sm font-medium transition-colors
                  ${amount === qa.value 
                    ? "bg-blue-600 border-blue-600 text-white" 
                    : "border-gray-200 text-gray-700 hover:border-blue-300"
                  }`}
              >
                {qa.label}
              </button>
            ))}
          </div>
          <div className="mt-2">
            <input
              type="number"
              value={amount / 100}
              onChange={(e) => setAmount(Math.round(parseFloat(e.target.value) * 100) || 0)}
              className="w-full px-3 py-2 border rounded-lg text-sm"
              placeholder="Custom amount (₹)"
            />
          </div>
        </div>

        {/* Payment Method */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Payment Method
          </label>
          <select
            value={provider}
            onChange={(e) => setProvider(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg text-sm"
          >
            {PAYMENT_METHODS.map((pm) => (
              <option key={pm.id} value={pm.id}>
                {pm.name} ({pm.fee})
              </option>
            ))}
          </select>
        </div>

        {/* Results */}
        {result && (
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subscriber pays</span>
              <span className="font-medium text-gray-900">{result.gross}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Payment fee</span>
              <span className="text-red-600">-{result.paymentFee}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Platform fee (5%)</span>
              <span className="text-red-600">-{result.platformFee}</span>
            </div>
            <div className="border-t pt-3 flex justify-between">
              <span className="font-semibold text-gray-900">You earn</span>
              <div className="text-right">
                <span className="font-bold text-green-600 text-lg">{result.youEarn}</span>
                <span className="text-sm text-gray-500 ml-1">({result.creatorShare})</span>
              </div>
            </div>
          </div>
        )}

        {/* Info */}
        <div className="mt-4 flex items-start gap-2 text-sm text-gray-500">
          <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
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
