"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Heart, Check, Shield, Smartphone, Loader2, Package, ArrowLeft, CreditCard } from "lucide-react";
import { Button, Card, CardContent, Badge } from "@/components/ui";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { formatPrice, calculateFees } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface Product {
  id: string;
  title: string;
  description: string | null;
  price: number;
  currency: string;
  fileType: string | null;
  creator: {
    username: string;
    displayName: string | null;
    user: {
      image: string | null;
    };
  };
}

type PaymentMethod = "esewa" | "khalti" | "card" | "upi";

export default function ProductCheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.productId as string;
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("esewa");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!productId) return;
    
    fetch(`/api/products/${productId}`)
      .then(res => {
        if (!res.ok) throw new Error("Product not found");
        return res.json();
      })
      .then(data => {
        // API returns { product: ... }
        setProduct(data.product);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [productId]);

  const paymentMethods = [
    {
      id: "upi" as const,
      name: "UPI",
      description: "Google Pay, PhonePe, Paytm",
      icon: Smartphone,
      region: "India",
    },
    {
      id: "card" as const,
      name: "Card",
      description: "Visa, Mastercard, Amex",
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
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;
    
    setIsProcessing(true);
    
    try {
      if (paymentMethod === "esewa") {
        const res = await fetch("/api/payments/esewa/product/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            productId: product.id,
            amount: product.price,
            currency: product.currency || "NPR",
          }),
        });
        
        const data = await res.json();
        
        if (!res.ok || !data.success) {
          throw new Error(data.error || "Failed to create payment");
        }
        
        // eSewa form submission
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
          return;
        }
      } else if (paymentMethod === "khalti") {
        // Khalti payment
        const res = await fetch("/api/payments/khalti/product/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            productId: product.id,
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
        const res = await fetch("/api/payments/stripe/product/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            productId: product.id,
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
        const res = await fetch("/api/payments/razorpay/product/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            productId: product.id,
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
            const verifyRes = await fetch("/api/payments/razorpay/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                type: "product",
              }),
            });
            
            const verifyData = await verifyRes.json();
            
            if (verifyData.success) {
              router.push("/payment/success?provider=razorpay&type=product");
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
  if (error || !product) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">
            {error || "Product not found"}
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
        {/* Back link */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <Breadcrumbs />
        </div>

        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-foreground mb-8">Complete Purchase</h1>

          <div className="grid lg:grid-cols-5 gap-8">
            {/* Left - Payment Form */}
            <div className="lg:col-span-3">
              <Card>
                <CardContent className="p-6">
                  {/* Product Info */}
                  <div className="flex items-center gap-4 pb-6 border-b border-border mb-6">
                    <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Package className="w-7 h-7 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Purchasing</p>
                      <p className="font-semibold text-foreground">{product.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm text-muted-foreground">
                          by {product.creator.displayName || product.creator.username}
                        </span>
                        {product.fileType && (
                          <Badge variant="accent">{product.fileType.toUpperCase()}</Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Payment Methods */}
                  <form onSubmit={handleSubmit}>
                    <h3 className="font-semibold text-foreground mb-4">
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
                              : "border-border bg-card hover:border-muted-foreground/30"
                          )}
                        >
                          <method.icon
                            className={cn(
                              "w-6 h-6",
                              paymentMethod === method.id
                                ? "text-primary"
                                : "text-muted-foreground"
                            )}
                          />
                          <div className="flex-1">
                            <span className="font-medium text-foreground">
                              {method.name}
                            </span>
                            <p className="text-sm text-muted-foreground">
                              {method.description}
                            </p>
                          </div>
                          <span className="text-xs text-muted-foreground px-2 py-1 bg-muted rounded">
                            {method.region}
                          </span>
                        </button>
                      ))}
                    </div>

                    {/* Submit */}
                    <Button
                      type="submit"
                      className="w-full"
                      size="lg"
                      loading={isProcessing}
                    >
                      {isProcessing ? "Processing..." : `Pay ${formatPrice(product.price)}`}
                    </Button>

                    {/* Security Note */}
                    <div className="flex items-center justify-center gap-2 mt-4 text-sm text-muted-foreground">
                      <Shield className="w-4 h-4 text-accent-green" />
                      <span>Secure encrypted payment</span>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Right - Order Summary */}
            <div className="lg:col-span-2">
              <Card className="sticky top-24">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-foreground mb-4">
                    Order Summary
                  </h3>

                  {/* Product Details */}
                  <div className="pb-4 border-b border-border mb-4">
                    <p className="font-medium text-foreground mb-2">
                      {product.title}
                    </p>
                    {product.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {product.description}
                      </p>
                    )}
                  </div>

                  {/* Price */}
                  <div className="space-y-3 pb-4 border-b border-border mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Product price</span>
                      <span className="text-foreground">
                        {formatPrice(product.price)}
                      </span>
                    </div>
                  </div>

                  {/* Total */}
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground">Total</span>
                    <span className="text-xl font-bold text-foreground">
                      {formatPrice(product.price)}
                    </span>
                  </div>

                  <div className="mt-4 p-3 bg-accent-green/10 rounded-lg border border-accent-green/20">
                    <div className="flex items-center gap-2 text-sm text-accent-green">
                      <Check className="w-4 h-4" />
                      <span>Instant download after payment</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
