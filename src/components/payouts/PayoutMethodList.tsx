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
    <div className="bg-card rounded-3xl border border-border p-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-foreground">Payout Methods</h3>
        <Button variant="outline" size="sm" onClick={onAdd} className="gap-2">
          <Plus className="w-4 h-4" />
          Add New
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {methods.map((method) => (
          <div 
            key={method.id} 
            className="p-4 rounded-xl border border-border hover:border-primary transition-colors relative group bg-muted"
          >
            <div className="flex items-start justify-between mb-2">
                <div className="p-2 bg-card rounded-lg shadow-sm border border-border text-muted-foreground">
                    {method.type === "BANK_TRANSFER" ? <Building2 className="w-5 h-5" /> : <Smartphone className="w-5 h-5" />}
                </div>
                <button 
                    onClick={() => onDelete(method.id)}
                    className="text-muted-foreground hover:text-accent-red transition-colors p-1"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>
            
            <p className="font-bold text-foreground mb-1">
                {method.type === "BANK_TRANSFER" ? "Bank Account" : "UPI ID"}
            </p>
            
            <div className="text-sm text-muted-foreground space-y-1">
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
                <span className="absolute bottom-4 right-4 text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded">
                    Default
                </span>
            )}
          </div>
        ))}
        
        {methods.length === 0 && (
            <div className="col-span-full text-center py-8 text-muted-foreground bg-muted border border-dashed border-border rounded-xl">
                <p className="mb-2">No payout methods added yet.</p>
                <Button variant="primary" onClick={onAdd}>Add your first method</Button>
            </div>
        )}
      </div>
    </div>
  );
}
