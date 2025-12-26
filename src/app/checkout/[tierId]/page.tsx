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
        // Khalti payment
        const res = await fetch("/api/payments/khalti/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tierId: tier.id,
            currency: "NPR",
          }),
        });
        
        const data = await res.json();
        
        if (!res.ok || !data.success) {
          throw new Error(data.error || "Failed to create Khalti payment");
        }
        
        // Redirect to Khalti payment page
        if (data.redirectUrl) {
          window.location.href = data.redirectUrl;
          return;
        }
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
        // Razorpay UPI payment
        const res = await fetch("/api/payments/razorpay/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tierId: tier.id,
            currency: "INR",
          }),
        });
        
        const data = await res.json();
        
        if (!res.ok || !data.success) {
          throw new Error(data.error || "Failed to create Razorpay order");
        }

        // Load Razorpay script if not loaded
        if (!(window as unknown as { Razorpay: unknown }).Razorpay) {
          const script = document.createElement("script");
          script.src = "https://checkout.razorpay.com/v1/checkout.js";
          script.async = true;
          await new Promise((resolve) => {
            script.onload = resolve;
            document.body.appendChild(script);
          });
        }

        // Open Razorpay checkout
        const options = {
          key: data.keyId,
          amount: data.amount,
          currency: data.currency,
          name: "CreatorConnect",
          description: data.description,
          order_id: data.orderId,
          prefill: data.prefill,
          handler: async (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
            // Verify payment
            const verifyRes = await fetch("/api/payments/razorpay/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                type: "subscription",
              }),
            });
            
            const verifyData = await verifyRes.json();
            
            if (verifyData.success) {
              router.push("/payment/success?provider=razorpay");
            } else {
              alert("Payment verification failed");
            }
          },
          modal: {
            ondismiss: () => {
              setIsProcessing(false);
            },
          },
          theme: {
            color: "#7C3AED",
          },
        };

        const RazorpayConstructor = (window as unknown as { Razorpay: new (options: unknown) => { open: () => void } }).Razorpay;
        const razorpay = new RazorpayConstructor(options);
        razorpay.open();
        return;
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
      <header className="py-4 px-4 sm:px-6 lg:px-8 border-b border-border bg-card">
        <div className="container mx-auto">
          <Link href="/" className="flex items-center gap-2 w-fit">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-semibold text-foreground">
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
                  <div className="flex items-center gap-6 pb-8 mb-8">
                    <Avatar
                      src={tier.creator.user?.image}
                      name={tier.creator.displayName}
                      size="lg"
                      className="w-16 h-16"
                    />
                    <div>
                      <p className="text-sm text-text-secondary font-medium mb-1">
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
                            "w-full flex items-center gap-4 p-4 rounded-xl text-left transition-all border-0 ring-1",
                            paymentMethod === method.id
                              ? "ring-primary bg-primary/5 shadow-sm"
                              : "ring-border bg-card hover:ring-muted-foreground hover:bg-muted"
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
                          <span className="text-xs text-muted-foreground px-2 py-1 bg-muted rounded">
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
                          className="w-full px-4 py-3 border border-border bg-card text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder:text-muted-foreground"
                        />
                      </div>
                    )}

                    {/* Bank Transfer Info */}
                    {paymentMethod === "bank" && (
                      <div className="mb-6 p-4 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground">
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
                      loading={isProcessing}
                    >
                      {isProcessing ? "Processing..." : `Pay ${formatPrice(tier.price)}`}
                    </Button>

                    {/* Security Note */}
                    <div className="flex items-center justify-center gap-2 mt-4 text-sm text-text-secondary">
                      <Shield className="w-4 h-4 text-green-600" />
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
                  <div className="pb-6 mb-6">
                    <p className="font-bold text-lg text-text-primary mb-4">
                      {tier.name}
                    </p>
                    <ul className="space-y-3">
                      {tier.benefits.map((benefit, index) => (
                        <li
                          key={index}
                          className="flex items-start gap-3 text-sm text-text-secondary"
                        >
                          <div className="w-5 h-5 rounded-full bg-accent-green/20 flex items-center justify-center flex-shrink-0">
                            <Check className="w-3 h-3 text-accent-green" />
                          </div>
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Price Breakdown */}
                  <div className="space-y-3 pb-6 mb-6 bg-muted rounded-xl p-4">
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
