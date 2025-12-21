"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Heart, Check, Shield, Smartphone, Loader2, Package, ArrowLeft, CreditCard } from "lucide-react";
import { Button, Card, CardContent, Badge } from "@/components/ui";
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

type PaymentMethod = "esewa" | "khalti" | "card";

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
        alert("Khalti payment coming soon!");
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
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </main>
    );
  }

  // Error state
  if (error || !product) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {error || "Product not found"}
          </h1>
          <Button onClick={() => router.back()}>Go Back</Button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="py-4 px-4 sm:px-6 lg:px-8 border-b border-gray-200 bg-white">
        <div className="container mx-auto">
          <Link href="/" className="flex items-center gap-2 w-fit">
            <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-semibold text-gray-900">
              CreatorConnect
            </span>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back link */}
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-8">Complete Purchase</h1>

          <div className="grid lg:grid-cols-5 gap-8">
            {/* Left - Payment Form */}
            <div className="lg:col-span-3">
              <Card>
                <CardContent className="p-6">
                  {/* Product Info */}
                  <div className="flex items-center gap-4 pb-6 border-b border-gray-200 mb-6">
                    <div className="w-14 h-14 rounded-xl bg-purple-100 flex items-center justify-center">
                      <Package className="w-7 h-7 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Purchasing</p>
                      <p className="font-semibold text-gray-900">{product.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm text-gray-500">
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
                    <h3 className="font-semibold text-gray-900 mb-4">
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
                              ? "border-purple-600 bg-purple-50"
                              : "border-gray-200 hover:border-gray-300"
                          )}
                        >
                          <method.icon
                            className={cn(
                              "w-6 h-6",
                              paymentMethod === method.id
                                ? "text-purple-600"
                                : "text-gray-500"
                            )}
                          />
                          <div className="flex-1">
                            <span className="font-medium text-gray-900">
                              {method.name}
                            </span>
                            <p className="text-sm text-gray-500">
                              {method.description}
                            </p>
                          </div>
                          <span className="text-xs text-gray-500 px-2 py-1 bg-gray-100 rounded">
                            {method.region}
                          </span>
                        </button>
                      ))}
                    </div>

                    {/* Submit */}
                    <Button
                      type="submit"
                      className="w-full bg-purple-600 hover:bg-purple-700"
                      size="lg"
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <span className="flex items-center gap-2">
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Processing...
                        </span>
                      ) : (
                        `Pay ${formatPrice(product.price)}`
                      )}
                    </Button>

                    {/* Security Note */}
                    <div className="flex items-center justify-center gap-2 mt-4 text-sm text-gray-500">
                      <Shield className="w-4 h-4" />
                      <span>Secure payment via eSewa</span>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Right - Order Summary */}
            <div className="lg:col-span-2">
              <Card className="sticky top-24">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">
                    Order Summary
                  </h3>

                  {/* Product Details */}
                  <div className="pb-4 border-b border-gray-200 mb-4">
                    <p className="font-medium text-gray-900 mb-2">
                      {product.title}
                    </p>
                    {product.description && (
                      <p className="text-sm text-gray-500 line-clamp-2">
                        {product.description}
                      </p>
                    )}
                  </div>

                  {/* Price */}
                  <div className="space-y-3 pb-4 border-b border-gray-200 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Product price</span>
                      <span className="text-gray-900">
                        {formatPrice(product.price)}
                      </span>
                    </div>
                  </div>

                  {/* Total */}
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-900">Total</span>
                    <span className="text-xl font-bold text-gray-900">
                      {formatPrice(product.price)}
                    </span>
                  </div>

                  <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center gap-2 text-sm text-green-800">
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
