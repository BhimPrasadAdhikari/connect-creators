"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Edit, Trash2, ArrowLeft, Check, Info } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Button, Card, CardContent, Input, Badge } from "@/components/ui";

interface Tier {
  id: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  benefits: string[];
  isActive: boolean;
  _count?: {
    subscriptions: number;
  };
}

const SUGGESTED_TIERS = [
  { name: "Supporter", price: 9900, benefits: ["Access to supporter posts", "Early access to content"] },
  { name: "Fan", price: 19900, benefits: ["All Supporter benefits", "Exclusive Q&A access", "Monthly shoutout"] },
  { name: "Superfan", price: 29900, benefits: ["All Fan benefits", "Direct messaging", "Behind-the-scenes content"] },
];

export default function TiersManagementPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
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
      <main className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <p>Loading...</p>
        </div>
      </main>
    );
  }

  if (!session || session.user?.role !== "CREATOR") {
    router.push("/login");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const priceInPaise = Math.round(parseFloat(formData.price) * 100);
    const benefitsArray = formData.benefits.filter(b => b.trim() !== "");
    
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
        setShowForm(false);
        setEditingTier(null);
        setFormData({ name: "", description: "", price: "", benefits: [""] });
        fetchTiers();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to save tier");
      }
    } catch (error) {
      console.error("Error saving tier:", error);
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

  const useSuggestedTier = (tier: typeof SUGGESTED_TIERS[0]) => {
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
    <main className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-3xl mx-auto">
          {/* Back Link */}
          <Link
            href="/dashboard/creator"
            className="inline-flex items-center text-gray-600 hover:text-blue-600 mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Dashboard
          </Link>

          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Subscription Tiers</h1>
              <p className="text-gray-600">Set up pricing for your subscribers</p>
            </div>
            {!showForm && (
              <Button onClick={() => setShowForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Tier
              </Button>
            )}
          </div>

          {/* Pricing Tips */}
          <Card className="mb-8 bg-blue-50 border-blue-200">
            <CardContent className="py-4">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-blue-900 mb-1">Pricing Tips</p>
                  <ul className="text-blue-800 space-y-1">
                    <li>• Entry-level tiers around ₹99-149 have the highest conversion rates</li>
                    <li>• Offer clear value differences between tiers</li>
                    <li>• Most creators succeed with 2-3 tiers</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Form */}
          {showForm && (
            <Card className="mb-8">
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold mb-6">
                  {editingTier ? "Edit Tier" : "Create New Tier"}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <Input
                    label="Tier Name"
                    placeholder="e.g., Supporter, Fan, VIP"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />

                  <Input
                    label="Monthly Price (₹)"
                    type="number"
                    placeholder="99"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                    min="49"
                  />

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description (Optional)
                    </label>
                    <textarea
                      rows={2}
                      placeholder="What subscribers get at this tier..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Benefits
                    </label>
                    {formData.benefits.map((benefit, index) => (
                      <div key={index} className="flex gap-2 mb-2">
                        <input
                          type="text"
                          placeholder="e.g., Access to exclusive posts"
                          value={benefit}
                          onChange={(e) => updateBenefit(index, e.target.value)}
                          className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {formData.benefits.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeBenefit(index)}
                          >
                            ×
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button type="button" variant="outline" size="sm" onClick={addBenefit}>
                      + Add Benefit
                    </Button>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowForm(false);
                        setEditingTier(null);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" className="flex-1">
                      {editingTier ? "Save Changes" : "Create Tier"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Suggested Tiers */}
          {tiers.length === 0 && !showForm && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Suggested Tiers</h3>
              <div className="grid gap-4">
                {SUGGESTED_TIERS.map((tier) => (
                  <Card key={tier.name} className="hover:border-blue-300 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">{tier.name}</h4>
                          <p className="text-lg font-semibold text-blue-600">₹{tier.price / 100}/month</p>
                          <ul className="text-sm text-gray-600 mt-1">
                            {tier.benefits.map((b) => (
                              <li key={b} className="flex items-center gap-1">
                                <Check className="w-3 h-3 text-green-500" />
                                {b}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <Button variant="outline" onClick={() => useSuggestedTier(tier)}>
                          Use This
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Existing Tiers */}
          {tiers.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Your Tiers</h3>
              {tiers.map((tier) => (
                <Card key={tier.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-gray-900">{tier.name}</h4>
                          {!tier.isActive && <Badge variant="warning">Inactive</Badge>}
                          {tier._count && tier._count.subscriptions > 0 && (
                            <Badge variant="success">{tier._count.subscriptions} subscribers</Badge>
                          )}
                        </div>
                        <p className="text-xl font-bold text-blue-600 mt-1">
                          ₹{tier.price / 100}/month
                        </p>
                        {tier.description && (
                          <p className="text-sm text-gray-600 mt-1">{tier.description}</p>
                        )}
                        {tier.benefits.length > 0 && (
                          <ul className="text-sm text-gray-600 mt-2 space-y-1">
                            {tier.benefits.map((b, i) => (
                              <li key={i} className="flex items-center gap-1">
                                <Check className="w-3 h-3 text-green-500" />
                                {b}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => startEdit(tier)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600"
                          onClick={() => handleDelete(tier.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
