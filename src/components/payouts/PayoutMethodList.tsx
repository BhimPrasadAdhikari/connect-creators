"use client";

import { CreditCard, Banknote, Building, Plus, Trash2, CheckCircle2 } from "lucide-react";
import { Button, Card, CardContent } from "@/components/ui";

interface PayoutMethod {
  id: string;
  type: string;
  details: {
    bankName?: string;
    accountNumber?: string;
    ifsc?: string;
    upiId?: string;
    email?: string;
  };
  isDefault: boolean;
}

interface PayoutMethodListProps {
  methods: PayoutMethod[];
  onAdd: () => void;
  onDelete: (id: string) => void;
}

export function PayoutMethodList({ methods, onAdd, onDelete }: PayoutMethodListProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case "bank": return <Building className="w-6 h-6" />;
      case "upi": return <Banknote className="w-6 h-6" />;
      default: return <CreditCard className="w-6 h-6" />;
    }
  };

  const getTitle = (method: PayoutMethod) => {
    switch (method.type) {
      case "bank": return method.details.bankName || "Bank Account";
      case "upi": return "UPI ID";
      case "paypal": return "PayPal";
      default: return "Payout Method";
    }
  };

  const getSubtitle = (method: PayoutMethod) => {
    switch (method.type) {
      case "bank": return `**** ${method.details.accountNumber?.slice(-4)}`;
      case "upi": return method.details.upiId;
      case "paypal": return method.details.email;
      default: return "";
    }
  };

  return (
    <Card variant="brutal" className="mb-8">
      <CardContent className="p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 border-b-4 border-brutal-black pb-4">
          <div>
            <h3 className="font-display text-2xl font-bold uppercase">Payout Methods</h3>
            <p className="font-mono text-sm text-muted-foreground mt-1">Manage where your earnings are sent.</p>
          </div>
          <Button variant="brutal" size="sm" onClick={onAdd} className="bg-card text-foreground hover:bg-secondary/20">
            <Plus className="w-4 h-4 mr-2" />
            Add New Method
          </Button>
        </div>

        {methods.length === 0 ? (
          <div className="text-center py-12 bg-secondary/5 border-2 border-dashed border-brutal-black">
            <div className="w-16 h-16 bg-secondary/20 border-2 border-brutal-black rounded-full flex items-center justify-center mx-auto mb-4">
              <CreditCard className="w-8 h-8 text-muted-foreground" />
            </div>
            <h4 className="font-display font-bold text-lg mb-2">No payout methods added</h4>
            <p className="text-muted-foreground max-w-sm mx-auto mb-6 font-mono text-sm">
              Add a bank account or UPI ID to start receiving your payouts.
            </p>
            <Button variant="brutal" onClick={onAdd}>
              Add Payout Method
            </Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {methods.map((method) => (
              <div 
                key={method.id} 
                className="group relative p-4 border-2 border-brutal-black hover:bg-secondary/5 transition-colors shadow-brutal-sm bg-card"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/20 border-2 border-brutal-black flex items-center justify-center shrink-0">
                    {getIcon(method.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-display font-bold truncate pr-6">{getTitle(method)}</h4>
                      {method.isDefault && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-accent-green/10 text-accent-green text-[10px] font-bold uppercase border border-accent-green/30">
                          <CheckCircle2 className="w-3 h-3" />
                          Default
                        </span>
                      )}
                    </div>
                    <p className="font-mono text-sm text-muted-foreground font-bold truncate">
                      {getSubtitle(method)}
                    </p>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-50 hover:text-red-600 hover:border-red-200 border border-transparent"
                    onClick={() => onDelete(method.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                
                {method.type === "bank" && (
                   <div className="mt-4 pt-4 border-t-2 border-dashed border-brutal-black/10 flex justify-between text-xs font-mono text-muted-foreground">
                      <span>IFSC: {method.details.ifsc}</span>
                      <span>WIRE</span>
                   </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
