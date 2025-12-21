"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Heart, Check, Shield, CreditCard, Smartphone, Building, Loader2 } from "lucide-react";
import { Avatar, Badge, Button, Card, CardContent } from "@/components/ui";
import { formatPrice, calculateFees } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface Tier {
  id: string;
  name: string;
  price: number;
  benefits: string[];
  creator: {
    username: string;
    displayName: string;
    user: {
      image: string | null;
    };
  };
}

type PaymentMethod = "upi" | "card" | "esewa" | "khalti" | "bank";

export default function CheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const tierId = params.tierId as string;
  
  const [tier, setTier] = useState<Tier | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("esewa");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!tierId) return;
    
    fetch(`/api/tiers/${tierId}`)
      .then(res => {
        if (!res.ok) throw new Error("Tier not found");
        return res.json();
      })
      .then(data => {
        setTier(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [tierId]);

  const fees = tier ? calculateFees(tier.price) : null;

  const paymentMethods = [
    {
      id: "upi" as const,
      name: "UPI",
      description: "Google Pay, PhonePe, Paytm",
      icon: Smartphone,
      recommended: true,
      region: "India",
    },
    {
      id: "card" as const,
      name: "Card",
      description: "Visa, Mastercard, RuPay",
      icon: CreditCard,
      region: "International",
    },
    {
      id: "esewa" as const,
      name: "eSewa",
      description: "Nepal digital wallet",
      icon: Smartphone,
      region: "Nepal",
    },
    {
      id: "khalti" as const,
      name: "Khalti",
      description: "Nepal digital wallet",
      icon: Smartphone,
      region: "Nepal",
    },
    {
      id: "bank" as const,
      name: "Bank Transfer",
      description: "Direct bank transfer",
      icon: Building,
      region: "All",
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tier) return;
    
    setIsProcessing(true);
    
    try {
      if (paymentMethod === "esewa") {
        // Call API to create eSewa payment
        const res = await fetch("/api/payments/esewa/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tierId: tier.id,
            amount: tier.price,
            currency: "NPR",
          }),
        });
        
        const data = await res.json();
        
        if (!res.ok || !data.success) {
          throw new Error(data.error || "Failed to create payment");
        }
        
        // eSewa requires form submission - create and submit form
        if (data.formData && data.redirectUrl) {
          const form = document.createElement("form");
          form.method = "POST";
          form.action = data.redirectUrl;
          
          Object.entries(data.formData as Record<string, string>).forEach(([key, value]) => {
            const input = document.createElement("input");
            input.type = "hidden";
            input.name = key;
            input.value = value;
            form.appendChild(input);
          });
          
          document.body.appendChild(form);
          form.submit();
          return; // Form will redirect to eSewa
        }
      } else if (paymentMethod === "khalti") {
        // Khalti integration placeholder
        alert("Khalti payment coming soon!");
      } else if (paymentMethod === "card") {
        // Stripe card payment
        const res = await fetch("/api/payments/stripe/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tierId: tier.id,
            currency: "USD",
          }),
        });
        
        const data = await res.json();
        
        if (!res.ok || !data.success) {
          throw new Error(data.error || "Failed to create payment session");
        }
        
        // Redirect to Stripe Checkout
        if (data.redirectUrl) {
          window.location.href = data.redirectUrl;
          return;
        }
      } else if (paymentMethod === "upi") {
        // UPI integration placeholder
        alert("UPI payment coming soon!");
      } else if (paymentMethod === "bank") {
        // Bank transfer - show instructions
        alert("Bank transfer instructions will be sent to your email.");
      }
    } catch (error) {
      console.error("Payment error:", error);
      alert(error instanceof Error ? error.message : "Payment failed");
    } finally {
      setIsProcessing(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </main>
    );
  }

  // Error state
  if (error || !tier) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-text-primary mb-4">
            {error || "Tier not found"}
          </h1>
          <Button onClick={() => router.back()}>Go Back</Button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="py-4 px-4 sm:px-6 lg:px-8 border-b border-border bg-white">
        <div className="container mx-auto">
          <Link href="/" className="flex items-center gap-2 w-fit">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-semibold text-text-primary">
              CreatorConnect
            </span>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-text-primary mb-8">Checkout</h1>

          <div className="grid lg:grid-cols-5 gap-8">
            {/* Left - Payment Form */}
            <div className="lg:col-span-3">
              <Card>
                <CardContent>
                  {/* Creator Info */}
                  <div className="flex items-center gap-4 pb-6 border-b border-border mb-6">
                    <Avatar
                      src={tier.creator.user?.image}
                      name={tier.creator.displayName}
                      size="lg"
                    />
                    <div>
                      <p className="text-sm text-text-secondary">
                        Subscribing to
                      </p>
                      <p className="font-semibold text-text-primary">
                        {tier.creator.displayName}
                      </p>
                      <Badge variant="accent">{tier.name}</Badge>
                    </div>
                  </div>

                  {/* Payment Methods */}
                  <form onSubmit={handleSubmit}>
                    <h3 className="font-semibold text-text-primary mb-4">
                      Select Payment Method
                    </h3>

                    <div className="space-y-3 mb-6">
                      {paymentMethods.map((method) => (
                        <button
                          key={method.id}
                          type="button"
                          onClick={() => setPaymentMethod(method.id)}
                          className={cn(
                            "w-full flex items-center gap-4 p-4 rounded-lg border-2 text-left transition-all",
                            paymentMethod === method.id
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-text-secondary"
                          )}
                        >
                          <method.icon
                            className={cn(
                              "w-6 h-6",
                              paymentMethod === method.id
                                ? "text-primary"
                                : "text-text-secondary"
                            )}
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-text-primary">
                                {method.name}
                              </span>
                              {method.recommended && (
                                <Badge variant="success">Recommended</Badge>
                              )}
                            </div>
                            <p className="text-sm text-text-secondary">
                              {method.description}
                            </p>
                          </div>
                          <span className="text-xs text-text-secondary px-2 py-1 bg-background rounded">
                            {method.region}
                          </span>
                        </button>
                      ))}
                    </div>

                    {/* UPI ID Input */}
                    {paymentMethod === "upi" && (
                      <div className="mb-6">
                        <label className="block text-sm font-medium text-text-primary mb-2">
                          UPI ID
                        </label>
                        <input
                          type="text"
                          placeholder="yourname@upi"
                          className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        />
                      </div>
                    )}

                    {/* Bank Transfer Info */}
                    {paymentMethod === "bank" && (
                      <div className="mb-6 p-4 bg-background rounded-lg">
                        <p className="text-sm text-text-secondary">
                          After checkout, you'll receive bank details to
                          complete the transfer. Your subscription will activate
                          once payment is verified (usually within 24 hours).
                        </p>
                      </div>
                    )}

                    {/* Submit */}
                    <Button
                      type="submit"
                      className="w-full"
                      size="lg"
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <span className="flex items-center gap-2">
                          <svg
                            className="animate-spin w-5 h-5"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                          </svg>
                          Processing...
                        </span>
                      ) : (
                        `Pay ${formatPrice(tier.price)}`
                      )}
                    </Button>

                    {/* Security Note */}
                    <div className="flex items-center justify-center gap-2 mt-4 text-sm text-text-secondary">
                      <Shield className="w-4 h-4" />
                      <span>Secure payment powered by Razorpay</span>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Right - Order Summary */}
            <div className="lg:col-span-2">
              <Card className="sticky top-24">
                <CardContent>
                  <h3 className="font-semibold text-text-primary mb-4">
                    Order Summary
                  </h3>

                  {/* Tier Details */}
                  <div className="pb-4 border-b border-border mb-4">
                    <p className="font-medium text-text-primary mb-2">
                      {tier.name} Subscription
                    </p>
                    <ul className="space-y-2">
                      {tier.benefits.map((benefit, index) => (
                        <li
                          key={index}
                          className="flex items-start gap-2 text-sm text-text-secondary"
                        >
                          <Check className="w-4 h-4 text-secondary flex-shrink-0 mt-0.5" />
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Price Breakdown */}
                  <div className="space-y-3 pb-4 border-b border-border mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-text-secondary">Subscription</span>
                      <span className="text-text-primary">
                      {formatPrice(fees!.total)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-text-secondary">
                        Creator receives
                      </span>
                      <span className="text-secondary font-medium">
                        {formatPrice(fees!.creatorEarnings)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-text-secondary">
                        Platform fee ({fees!.platformFeePercent}%)
                      </span>
                      <span className="text-text-secondary">
                        {formatPrice(fees!.platformFee)}
                      </span>
                    </div>
                  </div>

                  {/* Total */}
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-text-primary">
                      Total (Monthly)
                    </span>
                    <span className="text-xl font-bold text-text-primary">
                      {formatPrice(fees!.total)}
                    </span>
                  </div>

                  <p className="text-xs text-text-secondary mt-4">
                    Your subscription will renew automatically each month. You
                    can cancel anytime from your dashboard.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
