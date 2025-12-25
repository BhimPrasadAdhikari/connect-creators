import { Trash2, Building2, Smartphone, Plus } from "lucide-react";
import { Button } from "@/components/ui";

interface PayoutMethod {
  id: string;
  type: "BANK_TRANSFER" | "UPI";
  details: any;
  isDefault: boolean;
}

interface PayoutMethodListProps {
  methods: PayoutMethod[];
  onAdd: () => void;
  onDelete: (id: string) => void;
}

export function PayoutMethodList({ methods, onAdd, onDelete }: PayoutMethodListProps) {
  return (
    <div className="bg-white rounded-3xl border border-gray-100 p-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-900">Payout Methods</h3>
        <Button variant="outline" size="sm" onClick={onAdd} className="gap-2">
          <Plus className="w-4 h-4" />
          Add New
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {methods.map((method) => (
          <div 
            key={method.id} 
            className="p-4 rounded-xl border border-gray-200 hover:border-blue-500 transition-colors relative group bg-gray-50"
          >
            <div className="flex items-start justify-between mb-2">
                <div className="p-2 bg-white rounded-lg shadow-sm border border-gray-100 text-gray-600">
                    {method.type === "BANK_TRANSFER" ? <Building2 className="w-5 h-5" /> : <Smartphone className="w-5 h-5" />}
                </div>
                <button 
                    onClick={() => onDelete(method.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors p-1"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>
            
            <p className="font-bold text-gray-900 mb-1">
                {method.type === "BANK_TRANSFER" ? "Bank Account" : "UPI ID"}
            </p>
            
            <div className="text-sm text-gray-500 space-y-1">
                {method.type === "BANK_TRANSFER" ? (
                    <>
                        <p className="truncate">Acc: {method.details.accountNumber ? `••••${method.details.accountNumber.slice(-4)}` : "N/A"}</p>
                        <p>{method.details.ifsc}</p>
                    </>
                ) : (
                    <p>{method.details.vpa}</p>
                )}
            </div>

            {method.isDefault && (
                <span className="absolute bottom-4 right-4 text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                    Default
                </span>
            )}
          </div>
        ))}
        
        {methods.length === 0 && (
            <div className="col-span-full text-center py-8 text-gray-500 bg-gray-50 border border-dashed border-gray-200 rounded-xl">
                <p className="mb-2">No payout methods added yet.</p>
                <Button variant="primary" onClick={onAdd}>Add your first method</Button>
            </div>
        )}
      </div>
    </div>
  );
}
