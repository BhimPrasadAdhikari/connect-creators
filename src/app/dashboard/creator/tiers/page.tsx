"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Plus, Edit, Trash2, Check, Info, X } from "lucide-react";
import { Button, Card, CardContent, Input, Badge, useToastActions } from "@/components/ui";
import { TiersPageSkeleton } from "@/components/ui/Skeleton";

interface Tier {
  id: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  benefits: string[];
  isActive: boolean;
  _count?: { subscriptions: number };
}

const SUGGESTED_TIERS = [
  { name: "Supporter", price: 9900, benefits: ["Access to supporter posts", "Early access to content"] },
  { name: "Fan", price: 19900, benefits: ["All Supporter benefits", "Exclusive Q&A access", "Monthly shoutout"] },
  { name: "Superfan", price: 29900, benefits: ["All Fan benefits", "Direct messaging", "Behind-the-scenes content"] },
];

export default function TiersManagementPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const toast = useToastActions();
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTier, setEditingTier] = useState<Tier | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    benefits: [""],
  });

  useEffect(() => {
    fetchTiers();
  }, []);

  async function fetchTiers() {
    try {
      const res = await fetch("/api/creator/tiers");
      if (res.ok) {
        const data = await res.json();
        setTiers(data.tiers || []);
      }
    } catch (error) {
      console.error("Failed to fetch tiers:", error);
    } finally {
      setLoading(false);
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-12 max-w-4xl mx-auto">
        <TiersPageSkeleton />
      </div>
    );
  }

  if (!session || session.user?.role !== "CREATOR") {
    router.push("/login");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const priceInPaise = Math.round(parseFloat(formData.price) * 100);
    const benefitsArray = formData.benefits.filter((b) => b.trim() !== "");

    try {
      const url = editingTier ? `/api/creator/tiers/${editingTier.id}` : "/api/creator/tiers";
      const method = editingTier ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          price: priceInPaise,
          benefits: benefitsArray,
        }),
      });

      if (res.ok) {
        toast.success(editingTier ? "Tier updated!" : "Tier created!");
        setShowForm(false);
        setEditingTier(null);
        setFormData({ name: "", description: "", price: "", benefits: [""] });
        fetchTiers();
      } else {
        const data = await res.json();
        toast.error("Failed to save tier", data.error || "Please try again.");
      }
    } catch (error) {
      console.error("Error saving tier:", error);
      toast.error("Failed to save tier", "Please try again.");
    }
  };

  const handleDelete = async (tierId: string) => {
    if (!confirm("Are you sure you want to delete this tier?")) return;

    try {
      const res = await fetch(`/api/creator/tiers/${tierId}`, { method: "DELETE" });
      if (res.ok) {
        fetchTiers();
      }
    } catch (error) {
      console.error("Error deleting tier:", error);
    }
  };

  const addBenefit = () => {
    setFormData({ ...formData, benefits: [...formData.benefits, ""] });
  };

  const updateBenefit = (index: number, value: string) => {
    const newBenefits = [...formData.benefits];
    newBenefits[index] = value;
    setFormData({ ...formData, benefits: newBenefits });
  };

  const removeBenefit = (index: number) => {
    setFormData({ ...formData, benefits: formData.benefits.filter((_, i) => i !== index) });
  };

  const applySuggestedTier = (tier: (typeof SUGGESTED_TIERS)[0]) => {
    setFormData({
      name: tier.name,
      description: "",
      price: (tier.price / 100).toString(),
      benefits: [...tier.benefits],
    });
    setShowForm(true);
  };

  const startEdit = (tier: Tier) => {
    setEditingTier(tier);
    setFormData({
      name: tier.name,
      description: tier.description || "",
      price: (tier.price / 100).toString(),
      benefits: tier.benefits.length > 0 ? tier.benefits : [""],
    });
    setShowForm(true);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-12 max-w-4xl mx-auto">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h1 className="font-display text-display-sm font-bold text-foreground mb-2">Subscription Tiers</h1>
            <p className="text-muted-foreground font-mono">Set up pricing for your subscribers</p>
          </div>
          {!showForm && (
            <Button 
              onClick={() => setShowForm(true)} 
              variant="brutal-accent"
              className="gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Tier
            </Button>
          )}
        </div>

        {/* Pricing Tips */}
        <div className="mb-8 p-6 bg-secondary/10 border-3 border-brutal-black border-dashed rounded-none relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-secondary/20 rotate-45 transform translate-x-8 -translate-y-8"></div>
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 border-2 border-brutal-black bg-secondary text-primary flex items-center justify-center shadow-brutal-sm shrink-0">
              <Info className="w-6 h-6 text-foreground" />
            </div>
            <div className="text-sm">
              <p className="font-display font-bold text-lg text-foreground mb-2 uppercase">Pricing Tips</p>
              <ul className="text-muted-foreground space-y-1 font-mono">
                <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-foreground rounded-full"></span> Entry-level tiers around ₹99-149 have the highest conversion rates</li>
                <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-foreground rounded-full"></span> Offer clear value differences between tiers</li>
                <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-foreground rounded-full"></span> Most creators succeed with 2-3 tiers</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Form */}
        {showForm && (
          <Card variant="brutal" className="mb-8 p-8 bg-card border-3 border-primary animate-in fade-in slide-in-from-bottom-4">
            <div className="flex justify-between items-center mb-6 border-b-2 border-brutal-black pb-4">
              <h2 className="font-display text-2xl font-bold text-foreground uppercase">{editingTier ? "Edit Tier" : "Create New Tier"}</h2>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => {
                  setShowForm(false);
                  setEditingTier(null);
                }}
              >
                <X className="w-6 h-6" />
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Input
                  variant="brutal"
                  label="Tier Name"
                  placeholder="e.g., Supporter, Fan, VIP"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />

                <Input
                  variant="brutal"
                  label="Monthly Price (₹)"
                  type="number"
                  placeholder="99"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                  min="49"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-foreground mb-2 font-mono uppercase">Description (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="What subscribers get at this tier..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 border-3 border-brutal-black bg-card focus:outline-none focus:ring-0 focus:border-primary focus:shadow-brutal transition-all placeholder:text-muted-foreground/50 font-mono text-sm"
                />
              </div>

              <div className="bg-muted/30 p-4 border-2 border-brutal-black border-dashed">
                <label className="block text-sm font-bold text-foreground mb-3 font-mono uppercase">Benefits</label>
                <div className="space-y-3">
                  {formData.benefits.map((benefit, index) => (
                    <div key={index} className="flex gap-2">
                      <div className="flex-1">
                        <Input
                          variant="brutal"
                          placeholder={`Benefit #${index + 1}`}
                          value={benefit}
                          onChange={(e) => updateBenefit(index, e.target.value)}
                        />
                      </div>
                      {formData.benefits.length > 1 && (
                        <Button type="button" variant="brutal" className="px-3 bg-red-100 hover:bg-red-200 border-red-900 text-red-900" onClick={() => removeBenefit(index)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
                <Button type="button" variant="ghost" size="sm" onClick={addBenefit} className="mt-3 text-primary hover:text-primary hover:underline font-bold font-mono">
                  + Add Another Benefit
                </Button>
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="brutal"
                  className="flex-1 bg-muted hover:bg-muted/80"
                  onClick={() => {
                    setShowForm(false);
                    setEditingTier(null);
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="brutal-accent" className="flex-1">
                  {editingTier ? "Save Changes" : "Create Tier"}
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Suggested Tiers */}
        {tiers.length === 0 && !showForm && (
          <div className="mb-8">
            <h3 className="font-display text-xl font-bold text-foreground mb-4 uppercase tracking-wider relative inline-block">
              Suggested Tiers
              <span className="absolute -right-6 -top-4 text-2xl animate-bounce">👇</span>
            </h3>
            <div className="grid gap-6 md:grid-cols-3">
              {SUGGESTED_TIERS.map((tier, idx) => (
                <Card key={tier.name} variant="brutal" className={`hover:scale-105 transition-transform duration-300 ${idx === 1 ? 'bg-primary/5' : ''}`}>
                  <CardContent className="p-6 flex flex-col h-full">
                    <div className="mb-4">
                      <h4 className="font-display text-xl font-bold text-foreground">{tier.name}</h4>
                      <p className="text-3xl font-bold text-primary mt-2 font-display">₹{tier.price / 100}<span className="text-sm text-muted-foreground font-mono font-normal">/mo</span></p>
                    </div>
                    <ul className="text-sm text-muted-foreground space-y-3 font-mono mb-6 flex-1">
                      {tier.benefits.map((b) => (
                        <li key={b} className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-accent-green shrink-0 mt-0.5" />
                          <span className="leading-tight">{b}</span>
                        </li>
                      ))}
                    </ul>
                    <Button variant="brutal" className="w-full mt-auto group-hover:bg-primary group-hover:text-white transition-colors" onClick={() => applySuggestedTier(tier)}>
                      Use This Template
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Existing Tiers */}
        {tiers.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <h3 className="font-display text-2xl font-bold text-foreground uppercase">Your Active Tiers</h3>
              <span className="bg-brutal-black text-brutal-white text-xs font-bold px-2 py-1 rounded-sm font-mono">{tiers.length}</span>
            </div>
            {tiers.map((tier) => (
              <Card key={tier.id} variant="brutal" className="group hover:border-primary transition-colors">
                <CardContent className="p-6 md:p-8">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <h4 className="font-display text-2xl font-bold text-foreground">{tier.name}</h4>
                        {!tier.isActive && (
                          <span className="bg-amber-100 text-amber-800 border-2 border-amber-800 px-2 py-0.5 text-xs font-bold uppercase shadow-[2px_2px_0px_0px_rgba(146,64,14,1)]">Inactive</span>
                        )}
                        {tier._count && tier._count.subscriptions > 0 && (
                          <span className="bg-accent-green/20 text-accent-green border-2 border-accent-green px-2 py-0.5 text-xs font-bold uppercase shadow-[2px_2px_0px_0px_rgba(22,163,74,1)]">
                            {tier._count.subscriptions} subscriber{tier._count.subscriptions !== 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                      <p className="text-3xl font-bold text-primary font-display mb-3">
                        ₹{tier.price / 100}<span className="text-lg text-muted-foreground font-mono font-normal">/month</span>
                      </p>
                      
                      {tier.description && (
                        <div className="bg-muted p-3 border-l-4 border-brutal-black mb-4 italic text-muted-foreground font-mono text-sm max-w-xl">
                          &quot;{tier.description}&quot;
                        </div>
                      )}
                      
                      {tier.benefits.length > 0 && (
                        <div className="mt-4">
                          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 font-mono">Includes:</p>
                          <ul className="grid sm:grid-cols-2 gap-2 text-sm text-foreground font-medium">
                            {tier.benefits.map((b, i) => (
                              <li key={i} className="flex items-center gap-2 bg-secondary/10 px-3 py-2 border border-brutal-black/20 rounded-lg">
                                <div className="w-5 h-5 bg-accent-green rounded-full flex items-center justify-center shrink-0 border border-brutal-black">
                                  <Check className="w-3 h-3 text-white stroke-[3px]" />
                                </div>
                                {b}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-3 md:flex-col shrink-0">
                      <Button variant="brutal" size="sm" onClick={() => startEdit(tier)} className="flex items-center gap-2">
                        <Edit className="w-4 h-4" />
                        Edit Tier
                      </Button>
                      <Button variant="brutal" size="sm" className="bg-red-50 hover:bg-red-100 border-red-900 text-red-900 shadow-none hover:shadow-brutal-sm" onClick={() => handleDelete(tier.id)}>
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
    </div>
  );
}

