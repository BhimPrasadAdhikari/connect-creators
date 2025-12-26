"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { BalanceCard } from "@/components/payouts/BalanceCard";
import { PayoutMethodList } from "@/components/payouts/PayoutMethodList";
import { PayoutHistoryTable } from "@/components/payouts/PayoutHistoryTable";
import { AddPayoutMethodModal } from "@/components/payouts/AddPayoutMethodModal";
import { RequestPayoutModal } from "@/components/payouts/RequestPayoutModal";

export default function PayoutsPage() {
  const [loading, setLoading] = useState(false);
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
    } catch (e) {
        console.error("Failed to load payout data", e);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
     fetchData();
  }, []);

  const handleDeleteMethod = async (id: string) => {
      if (!confirm("Are you sure you want to remove this payout method?")) return;
      
      try {
          const res = await fetch(`/api/payouts/methods/${id}`, { method: "DELETE" });
          if (res.ok) {
              fetchData();
          }
      } catch (e) {
          alert("Failed to delete method");
      }
  };

  if (loading) {
      return (
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
      );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Payouts & Earnings</h1>
            <p className="text-gray-500 mt-1">Manage your withdrawals and track your earnings.</p>
        </div>

        <BalanceCard 
            balance={data.availableBalance || 0}
            totalEarnings={data.totalEarnings || 0}
            paidOut={data.paidOut || 0}
            breakdown={data.breakdown || { subscriptions: 0, products: 0, tips: 0, dms: 0 }}
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
      </main>
    </div>
  );
}
