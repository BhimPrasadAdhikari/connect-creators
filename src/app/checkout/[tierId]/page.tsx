"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Heart, Check, Shield, CreditCard, Smartphone, Building, Loader2, ArrowLeft } from "lucide-react";
import { Avatar, Badge, Button, Card, CardContent } from "@/components/ui";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Header } from "@/components/layout/Header";
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
      <main className="min-h-screen bg-accent-yellow/10 flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-foreground stroke-[3]" />
      </main>
    );
  }

  // Error state
  if (error || !tier) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card variant="brutal" className="max-w-md w-full text-center p-8 bg-accent-red/10">
          <h1 className="text-3xl font-display font-black uppercase text-foreground mb-4">
            {error || "Tier not found"}
          </h1>
          <Button variant="brutal" onClick={() => router.back()}>Go Back</Button>
        </Card>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background pb-20">
      {/* Header */}
      <Header />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="max-w-5xl mx-auto">
           {/* Back link */}
           <div className="flex items-center gap-6 mb-12">
            <button
              onClick={() => router.back()}
              className="group inline-flex items-center gap-2 font-black font-display text-xl uppercase tracking-wider hover:text-primary transition-colors"
            >
              <ArrowLeft className="w-6 h-6 stroke-[3] group-hover:-translate-x-1 transition-transform" />
              BACK
            </button>
            <div className="h-8 w-0.5 bg-brutal-black" />
            <Breadcrumbs className="font-mono text-sm font-bold uppercase tracking-wide text-muted-foreground" />
          </div>

          <h1 className="text-4xl md:text-5xl font-display font-black uppercase text-foreground mb-10 tracking-tight">
            Checkout <span className="text-accent-purple">/</span> Review
          </h1>

          <div className="grid lg:grid-cols-5 gap-8">
            {/* Left - Payment Form */}
            <div className="lg:col-span-3">
              <Card variant="brutal" className="bg-card overflow-hidden">
                <CardContent className="p-0">
                   <div className="p-8 border-b-4 border-brutal-black bg-accent-blue/10">
                    {/* Creator Info */}
                    <div className="flex items-center gap-6">
                      <Avatar
                        src={tier.creator.user?.image}
                        name={tier.creator.displayName}
                        size="xl"
                        className="w-20 h-20 border-4 border-brutal-black rounded-none shadow-brutal-sm"
                      />
                      <div>
                        <p className="text-sm font-mono font-bold text-foreground/70 mb-1 uppercase tracking-wider">
                          Subscribing to
                        </p>
                        <p className="text-2xl font-display font-black text-foreground uppercase leading-none mb-2">
                          {tier.creator.displayName}
                        </p>
                        <Badge variant="accent" className="border-2 border-brutal-black bg-accent-yellow text-foreground font-bold rounded-none shadow-brutal-sm">
                          {tier.name}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="p-8">
                    {/* Payment Methods */}
                    <form onSubmit={handleSubmit}>
                      <h3 className="text-xl font-display font-black uppercase text-foreground mb-6 flex items-center gap-3">
                        <span className="w-8 h-8 rounded-none bg-foreground text-white flex items-center justify-center text-sm">1</span>
                        Select Payment Method
                      </h3>

                      <div className="space-y-4 mb-8">
                        {paymentMethods.map((method) => (
                          <button
                            key={method.id}
                            type="button"
                            onClick={() => setPaymentMethod(method.id)}
                            className={cn(
                              "w-full flex items-center gap-4 p-5 text-left transition-all border-3 relative group",
                              paymentMethod === method.id
                                ? "border-brutal-black bg-accent-purple/10 shadow-brutal"
                                : "border-brutal-black/20 hover:border-brutal-black hover:bg-card hover:shadow-brutal-sm bg-gray-50"
                            )}
                          >
                            <div className={cn(
                              "w-12 h-12 border-2 border-brutal-black flex items-center justify-center transition-colors",
                              paymentMethod === method.id ? "bg-brutal-black text-brutal-white" : "bg-card text-foreground group-hover:bg-brutal-black group-hover:text-brutal-white"
                            )}>
                              <method.icon className="w-6 h-6 stroke-[2.5]" />
                            </div>
                            
                            <div className="flex-1">
                              <div className="flex items-center gap-3 flex-wrap">
                                <span className={cn(
                                  "font-bold text-lg uppercase tracking-tight",
                                  paymentMethod === method.id ? "text-accent-purple" : "text-foreground"
                                )}>
                                  {method.name}
                                </span>
                                {method.recommended && (
                                  <Badge className="bg-accent-green text-foreground border-2 border-brutal-black rounded-none text-xs font-bold shadow-sm">
                                    Recommended
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm font-mono text-foreground/70 mt-1">
                                {method.description}
                              </p>
                            </div>
                            <span className="text-xs font-bold uppercase tracking-wide px-2 py-1 bg-foreground text-white border border-black">
                              {method.region}
                            </span>
                            
                            {paymentMethod === method.id && (
                                <div className="absolute top-0 right-0 p-1 bg-accent-purple border-l-2 border-b-2 border-brutal-black">
                                    <Check className="w-4 h-4 text-white stroke-[4]" />
                                </div>
                            )}
                          </button>
                        ))}
                      </div>

                      {/* UPI ID Input */}
                      {paymentMethod === "upi" && (
                        <div className="mb-8 pl-4 border-l-4 border-accent-purple">
                          <label className="block text-sm font-bold uppercase text-foreground mb-2">
                            Enter UPI ID
                          </label>
                          <input
                            type="text"
                            placeholder="yourname@upi"
                            className="w-full px-4 py-3 border-3 border-brutal-black bg-card text-foreground font-mono focus:outline-none focus:ring-0 focus:shadow-brutal focus:translate-x-[-2px] focus:translate-y-[-2px] transition-all placeholder:text-gray-400 placeholder:uppercase placeholder:text-sm"
                          />
                        </div>
                      )}

                      {/* Bank Transfer Info */}
                      {paymentMethod === "bank" && (
                         <div className="mb-8 p-4 border-3 border-brutal-black bg-accent-blue/20 shadow-brutal-sm">
                          <p className="text-sm font-medium text-foreground">
                            <span className="font-bold uppercase block mb-1">Note:</span>
                            After checkout, you'll receive bank details to
                            complete the transfer. Your subscription will activate
                            once payment is verified (usually within 24 hours).
                          </p>
                        </div>
                      )}

                      {/* Submit */}
                      <div className="pt-4">
                        <Button
                          type="submit"
                          className="w-full text-lg py-6 bg-primary text-white hover:bg-card hover:text-primary shadow-brutal"
                          size="lg"
                          variant="brutal"
                          loading={isProcessing}
                        >
                          {isProcessing ? "Processing..." : `Pay ${formatPrice(tier.price)}`}
                        </Button>
                      </div>

                      {/* Security Note */}
                      <div className="flex items-center justify-center gap-2 mt-6 text-xs font-bold uppercase tracking-wide text-foreground/60">
                        <Shield className="w-4 h-4 text-accent-green stroke-[3]" />
                        <span>Secure payment powered by Razorpay</span>
                      </div>
                    </form>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right - Order Summary */}
            <div className="lg:col-span-2">
              <Card variant="brutal" className="sticky top-24 bg-accent-yellow/30 border-4">
                <CardContent className="p-6">
                  <h3 className="text-xl font-display font-black uppercase text-foreground mb-6 border-b-4 border-brutal-black pb-2">
                    Order Summary
                  </h3>

                  {/* Tier Details */}
                  <div className="pb-6 mb-6 border-b-2 border-dashed border-brutal-black/50">
                    <p className="text-2xl font-bold text-foreground mb-4 uppercase tracking-tight">
                      {tier.name}
                    </p>
                    <ul className="space-y-4">
                      {tier.benefits.map((benefit, index) => (
                        <li
                          key={index}
                          className="flex items-start gap-4 text-sm font-medium text-foreground"
                        >
                          <div className="w-6 h-6 rounded-none border-2 border-brutal-black bg-card flex items-center justify-center flex-shrink-0 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                            <Check className="w-4 h-4 text-foreground stroke-[4]" />
                          </div>
                          <span className="pt-0.5">{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Price Breakdown */}
                  <div className="space-y-3 pb-6 mb-6 bg-card border-2 border-brutal-black p-4 shadow-brutal-sm">
                    <div className="flex items-center justify-between text-sm font-bold">
                      <span className="text-foreground/70 uppercase">Subscription</span>
                      <span className="text-foreground font-mono">
                      {formatPrice(fees!.total)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm font-bold">
                      <span className="text-foreground/70 uppercase">
                        Creator receives
                      </span>
                      <span className="text-accent-green font-mono">
                        {formatPrice(fees!.creatorEarnings)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm font-bold">
                      <span className="text-foreground/70 uppercase">
                        Platform fee ({fees!.platformFeePercent}%)
                      </span>
                      <span className="text-foreground/70 font-mono">
                        {formatPrice(fees!.platformFee)}
                      </span>
                    </div>
                  </div>

                  {/* Total */}
                  <div className="flex items-center justify-between p-4 bg-foreground text-white border-2 border-transparent">
                    <span className="font-display font-black uppercase tracking-wide text-lg">
                      Total
                    </span>
                    <span className="text-2xl font-mono font-bold text-accent-yellow">
                      {formatPrice(fees!.total)}
                    </span>
                  </div>

                  <p className="text-xs font-bold text-foreground/60 mt-4 text-center uppercase leading-relaxed">
                    Automatic monthly renewal. <br/>Cancel anytime.
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
