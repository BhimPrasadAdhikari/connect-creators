"use client";

import { useState } from "react";
import { Loader2, DollarSign } from "lucide-react";
import { Button, Input, Modal, Select, useToastActions } from "@/components/ui";

interface RequestPayoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  maxAmount: number;
  methods: any[];
}

export function RequestPayoutModal({ isOpen, onClose, onSuccess, maxAmount, methods }: RequestPayoutModalProps) {
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState("");
  const [methodId, setMethodId] = useState(methods[0]?.id || "");
  const toast = useToastActions();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/payouts/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
            amount: Math.round(parseFloat(amount) * 100), 
            methodId 
        }),
      });

      if (res.ok) {
        toast.success("Request Submitted", "Your payout request has been received.");
        onSuccess();
        onClose();
        setAmount("");
      } else {
        const data = await res.json();
        toast.error("Request Failed", data.error || "Please try again.");
      }
    } catch (e) {
      toast.error("Error", "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (val: number) => {
      return new Intl.NumberFormat("en-IN", {
          style: "currency",
          currency: "INR",
          maximumFractionDigits: 0
      }).format(val / 100);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Request Payout" variant="brutal">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="p-4 bg-secondary/10 border-2 border-brutal-black border-dashed mb-6">
            <div className="flex justify-between items-center text-sm font-bold font-mono">
                <span className="text-muted-foreground uppercase">Available Balance</span>
                <span className="text-foreground">{formatCurrency(maxAmount)}</span>
            </div>
        </div>

        <div className="space-y-4">
            <div>
                <label className="block text-sm font-bold text-foreground mb-1.5 uppercase tracking-wide font-display">
                    Amount (INR)
                </label>
                <div className="flex items-center">
                    <span className="px-4 py-3 bg-secondary/20 text-foreground border-2 border-r-0 border-brutal-black font-display font-bold text-xl">
                        ₹
                    </span>
                    <Input
                        type="number"
                        variant="brutal"
                        placeholder="0"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        required
                        max={maxAmount / 100}
                        min={500}
                        className="rounded-none border-l-0 text-xl font-bold"
                        containerClassName="mb-0 w-full"
                    />
                </div>
                <p className="font-mono text-xs font-bold text-muted-foreground mt-2">
                    Minimum payout amount is ₹500
                </p>
            </div>

            <Select 
                variant="brutal"
                label="Select Payout Method"
                value={methodId}
                onChange={(e) => setMethodId(e.target.value)}
                options={methods.map(m => ({
                    value: m.id,
                    label: m.type === 'bank' ? `${m.details.bankName} (****${m.details.accountNumber?.slice(-4)})` : 
                           m.type === 'upi' ? `UPI (${m.details.upiId})` : `PayPal (${m.details.email})`
                }))}
            />
        </div>

        <div className="pt-4 flex gap-3">
          <Button type="button" variant="ghost" onClick={onClose} className="flex-1 border-2 border-transparent hover:border-brutal-black">
            Cancel
          </Button>
          <Button type="submit" variant="brutal" className="flex-1" disabled={loading || !amount || parseFloat(amount) < 500}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <DollarSign className="w-4 h-4 mr-2" />}
            Request Payout
          </Button>
        </div>
      </form>
    </Modal>
  );
}
