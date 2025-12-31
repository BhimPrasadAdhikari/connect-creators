"use client";

import { useState } from "react";
import { Building, Banknote, CreditCard, Plus, Loader2 } from "lucide-react";
import { Button, Input, Modal, Select, useToastActions } from "@/components/ui";

interface AddPayoutMethodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddPayoutMethodModal({ isOpen, onClose, onSuccess }: AddPayoutMethodModalProps) {
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState("bank");
  const toast = useToastActions();

  // Bank Info
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [ifsc, setIfsc] = useState("");

  // UPI Info
  const [upiId, setUpiId] = useState("");

  // PayPal Info
  const [paypalEmail, setPaypalEmail] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const details = type === "bank" 
        ? { bankName, accountNumber, ifsc }
        : type === "upi" 
          ? { upiId } 
          : { email: paypalEmail };

      const res = await fetch("/api/payouts/methods", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, details }),
      });

      if (res.ok) {
        toast.success("Method Added", "Your payout method has been saved successfully.");
        onSuccess();
        onClose();
        // Reset form
        setBankName("");
        setAccountNumber("");
        setIfsc("");
        setUpiId("");
        setPaypalEmail("");
        setType("bank");
      } else {
        const data = await res.json();
        toast.error("Failed to add method", data.error || "Please try again.");
      }
    } catch (e) {
      toast.error("Error", "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Payout Method" variant="brutal">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-3 gap-3 mb-6">
          <button
            type="button"
            onClick={() => setType("bank")}
            className={`flex flex-col items-center justify-center p-3 border-2 transition-all ${
              type === "bank" 
                ? "bg-primary text-white border-brutal-black shadow-brutal-sm translate-x-[-2px] translate-y-[-2px]" 
                : "bg-card border-brutal-black hover:bg-secondary/10"
            }`}
          >
            <Building className="w-6 h-6 mb-2" />
            <span className="text-xs font-bold uppercase font-display">Bank</span>
          </button>
          
          <button
            type="button"
            onClick={() => setType("upi")}
            className={`flex flex-col items-center justify-center p-3 border-2 transition-all ${
              type === "upi" 
                ? "bg-primary text-white border-brutal-black shadow-brutal-sm translate-x-[-2px] translate-y-[-2px]" 
                : "bg-card border-brutal-black hover:bg-secondary/10"
            }`}
          >
            <Banknote className="w-6 h-6 mb-2" />
            <span className="text-xs font-bold uppercase font-display">UPI</span>
          </button>
          
          <button
            type="button"
            onClick={() => setType("paypal")}
            className={`flex flex-col items-center justify-center p-3 border-2 transition-all ${
              type === "paypal" 
                ? "bg-primary text-white border-brutal-black shadow-brutal-sm translate-x-[-2px] translate-y-[-2px]" 
                : "bg-card border-brutal-black hover:bg-secondary/10"
            }`}
          >
            <CreditCard className="w-6 h-6 mb-2" />
            <span className="text-xs font-bold uppercase font-display">PayPal</span>
          </button>
        </div>

        {type === "bank" && (
          <div className="space-y-4">
            <Input
              variant="brutal"
              label="Bank Name"
              placeholder="e.g. HDFC Bank"
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              required={type === "bank"}
            />
            <Input
              variant="brutal"
              label="Account Number"
              placeholder="Enter account number"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              required={type === "bank"}
            />
            <Input
              variant="brutal"
              label="IFSC Code"
              placeholder="e.g. HDFC0001234"
              value={ifsc}
              onChange={(e) => setIfsc(e.target.value)}
              required={type === "bank"}
            />
          </div>
        )}

        {type === "upi" && (
          <Input
            variant="brutal"
            label="UPI ID"
            placeholder="username@upi"
            value={upiId}
            onChange={(e) => setUpiId(e.target.value)}
            required={type === "upi"}
          />
        )}

        {type === "paypal" && (
          <Input
            variant="brutal"
            label="PayPal Email"
            type="email"
            placeholder="email@example.com"
            value={paypalEmail}
            onChange={(e) => setPaypalEmail(e.target.value)}
            required={type === "paypal"}
          />
        )}

        <div className="pt-4 flex gap-3">
          <Button type="button" variant="ghost" onClick={onClose} className="flex-1 border-2 border-transparent hover:border-brutal-black">
            Cancel
          </Button>
          <Button type="submit" variant="brutal" className="flex-1" disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
            Add Method
          </Button>
        </div>
      </form>
    </Modal>
  );
}
