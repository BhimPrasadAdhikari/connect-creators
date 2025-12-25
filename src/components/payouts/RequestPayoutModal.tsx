import { useState } from 'react';
import { Modal, Button, Input } from "@/components/ui";

interface RequestPayoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  maxAmount: number; // in paise
  methods: any[];
}

export function RequestPayoutModal({ isOpen, onClose, onSuccess, maxAmount, methods }: RequestPayoutModalProps) {
  const [amount, setAmount] = useState<string>("");
  const [methodId, setMethodId] = useState<string>(methods[0]?.id || "");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!methodId) {
        alert("Please select a payout method");
        return;
    }
    
    const amountPaise = parseFloat(amount) * 100;
    if (amountPaise > maxAmount) {
        alert("Amount exceeds available balance");
        return;
    }

    setLoading(true);
    try {
        const res = await fetch("/api/payouts/request", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                amount: amountPaise,
                payoutMethodId: methodId,
            }),
        });
        
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        
        onSuccess();
        onClose();
        setAmount("");
    } catch (error: any) {
        alert(error.message);
    } finally {
        setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Request Payout">
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-xl text-center mb-4">
                <p className="text-sm text-gray-500">Available Balance</p>
                <p className="text-2xl font-bold text-gray-900">
                    {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(maxAmount / 100)}
                </p>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Withdrawal Amount (₹)</label>
                <Input 
                    type="number"
                    required
                    min="1"
                    max={maxAmount / 100}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Enter amount"
                />
            </div>
            
             <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Method</label>
                <select 
                    className="w-full rounded-lg border border-gray-300 p-2"
                    value={methodId}
                    onChange={(e) => setMethodId(e.target.value)}
                    required
                >
                    <option value="" disabled>Select a method</option>
                    {methods.map(m => (
                        <option key={m.id} value={m.id}>
                            {m.type === 'UPI' ? `UPI - ${m.details.vpa}` : `Bank - ••${m.details.accountNumber?.slice(-4)}`}
                        </option>
                    ))}
                </select>
            </div>

            <div className="flex justify-end gap-3 mt-6">
                <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
                <Button type="submit" isLoading={loading} disabled={methods.length === 0 || maxAmount <= 0}>
                    Request Withdrawal
                </Button>
            </div>
        </form>
    </Modal>
  );
}
