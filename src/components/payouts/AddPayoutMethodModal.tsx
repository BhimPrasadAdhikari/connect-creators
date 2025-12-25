import { useState } from "react";
import { Modal, Button, Input } from "@/components/ui";

interface AddPayoutMethodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddPayoutMethodModal({ isOpen, onClose, onSuccess }: AddPayoutMethodModalProps) {
  const [type, setType] = useState<"BANK_TRANSFER" | "UPI">("UPI");
  const [loading, setLoading] = useState(false);
  const [details, setDetails] = useState<any>({});
  
  const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      try {
          const res = await fetch("/api/payouts/methods", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                  type,
                  details,
                  isDefault: true // Make default by default for MVP convenience
              })
          });
          
          if (!res.ok) throw new Error("Failed to add method");
          
          onSuccess();
          onClose();
          setDetails({});
      } catch (error) {
          console.error(error);
          alert("Failed to add method");
      } finally {
          setLoading(false);
      }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Payout Method">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-4 mb-4">
            <button
                type="button"
                className={`flex-1 py-2 rounded-lg font-medium border ${type === 'UPI' ? 'bg-blue-50 border-blue-500 text-blue-600' : 'border-gray-200 text-gray-600'}`}
                onClick={() => setType('UPI')}
            >
                UPI
            </button>
            <button
                type="button"
                className={`flex-1 py-2 rounded-lg font-medium border ${type === 'BANK_TRANSFER' ? 'bg-blue-50 border-blue-500 text-blue-600' : 'border-gray-200 text-gray-600'}`}
                onClick={() => setType('BANK_TRANSFER')}
            >
                Bank Transfer
            </button>
        </div>

        {type === 'UPI' ? (
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">UPI ID (VPA)</label>
                <Input 
                    required 
                    placeholder="username@upi"
                    value={details.vpa || ''}
                    onChange={e => setDetails({...details, vpa: e.target.value})}
                />
            </div>
        ) : (
            <div className="space-y-3">
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
                    <Input 
                        required 
                        placeholder="0000000000"
                        value={details.accountNumber || ''}
                        onChange={e => setDetails({...details, accountNumber: e.target.value})}
                    />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">IFSC Code</label>
                    <Input 
                        required 
                        placeholder="SBIN0001234"
                        value={details.ifsc || ''}
                        onChange={e => setDetails({...details, ifsc: e.target.value})}
                    />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Account Holder Name</label>
                    <Input 
                        required 
                        placeholder="John Doe"
                        value={details.accountHolder || ''}
                        onChange={e => setDetails({...details, accountHolder: e.target.value})}
                    />
                </div>
            </div>
        )}

        <div className="flex justify-end gap-3 mt-6">
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit" isLoading={loading}>Save Method</Button>
        </div>
      </form>
    </Modal>
  );
}
