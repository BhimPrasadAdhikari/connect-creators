"use client";

import { useState, useEffect } from "react";
import { BalanceCard } from "@/components/payouts/BalanceCard";
import { PayoutMethodList } from "@/components/payouts/PayoutMethodList";
import { PayoutHistoryTable } from "@/components/payouts/PayoutHistoryTable";
import { AddPayoutMethodModal } from "@/components/payouts/AddPayoutMethodModal";
import { RequestPayoutModal } from "@/components/payouts/RequestPayoutModal";
import { Skeleton } from "@/components/ui/Skeleton";

export default function PayoutsPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>({
      balance: 0,
      totalEarnings: 0,
      paidOut: 0,
      breakdown: { subscriptions: 0, products: 0, tips: 0 },
      methods: [],
      history: []
  });
  
  const [isAddMethodOpen, setIsAddMethodOpen] = useState(false);
  const [isRequestPayoutOpen, setIsRequestPayoutOpen] = useState(false);

  const fetchData = async () => {
    try {
        // In a real app, these would be actual API calls
        // Mocking data for now if endpoints don't exist yet or return 404
        /*
       const [balanceRes, methodsRes, historyRes] = await Promise.all([
           fetch("/api/payouts/balance"),
           fetch("/api/payouts/methods"),
           fetch("/api/payouts/history")
       ]);
       
       const balance = await balanceRes.json();
       const methods = await methodsRes.json();
       const history = await historyRes.json();
       
       setData({
           ...balance,
           methods: methods.methods || [],
           history: history.payouts || []
       });
       */
       
       // SImulate fetch
       setTimeout(() => {
           setData({
               availableBalance: 1250000, // 12,500 INR
               totalEarnings: 4500000,   // 45,000 INR
               paidOut: 3250000,         // 32,500 INR
               breakdown: { subscriptions: 2000000, products: 1500000, tips: 1000000 },
               methods: [
                   { id: '1', type: 'bank', details: { bankName: 'HDFC Bank', accountNumber: '1234567890', ifsc: 'HDFC0001234' }, isDefault: true }
               ],
               history: [
                   { id: '1', amount: 500000, status: 'completed', method: 'bank', requestedAt: '2023-12-01T10:00:00Z', referenceId: 'REF123456' },
                   { id: '2', amount: 750000, status: 'processing', method: 'bank', requestedAt: '2023-12-15T12:00:00Z' }
               ]
           });
           setLoading(false);
       }, 1000);

    } catch (e) {
        console.error("Failed to load payout data", e);
        setLoading(false);
    }
  };

  useEffect(() => {
     fetchData();
  }, []);

  const handleDeleteMethod = async (id: string) => {
      if (!confirm("Are you sure you want to remove this payout method?")) return;
      
      // Mock delete
      setData((prev: any) => ({
          ...prev,
          methods: prev.methods.filter((m: any) => m.id !== id)
      }));
  };

  if (loading) {
      return (
        <div className="p-4 sm:p-6 lg:p-12 max-w-7xl mx-auto space-y-8">
            <div className="space-y-2">
                <Skeleton className="h-10 w-48" />
                <Skeleton className="h-4 w-64" />
            </div>
            <div className="grid lg:grid-cols-3 gap-6">
                <Skeleton className="lg:col-span-2 h-64" />
                <Skeleton className="lg:col-span-1 h-64" />
            </div>
            <Skeleton className="h-48 w-full" />
        </div>
      );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-12 max-w-7xl mx-auto">
      <div className="mb-12">
          <h1 className="font-display text-4xl font-bold text-foreground">Payouts & Earnings</h1>
          <p className="font-mono text-lg text-muted-foreground mt-2">Manage your withdrawals and track your earnings.</p>
      </div>

      <BalanceCard 
          balance={data.availableBalance || 0}
          totalEarnings={data.totalEarnings || 0}
          paidOut={data.paidOut || 0}
          breakdown={data.breakdown || { subscriptions: 0, products: 0, tips: 0 }}
          onRequestPayout={() => setIsRequestPayoutOpen(true)}
      />

      <PayoutMethodList 
          methods={data.methods}
          onAdd={() => setIsAddMethodOpen(true)}
          onDelete={handleDeleteMethod}
      />

      <PayoutHistoryTable payouts={data.history} />

      <AddPayoutMethodModal 
          isOpen={isAddMethodOpen}
          onClose={() => setIsAddMethodOpen(false)}
          onSuccess={fetchData}
      />

      <RequestPayoutModal 
          isOpen={isRequestPayoutOpen}
          onClose={() => setIsRequestPayoutOpen(false)}
          onSuccess={fetchData}
          maxAmount={data.availableBalance || 0}
          methods={data.methods}
      />
    </div>
  );
}
