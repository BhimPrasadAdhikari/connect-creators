"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Heart, CheckCircle, Loader2 } from "lucide-react";
import { Button, Card, CardContent } from "@/components/ui";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [verifying, setVerifying] = useState(true);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentType, setPaymentType] = useState<"subscription" | "product" | "tip">("subscription");

  useEffect(() => {
    // Reset body overflow in case it was left from a modal
    document.body.style.overflow = "";
    
    // eSewa returns base64-encoded response as 'data' parameter
    const data = searchParams.get("data");
    
    if (!data) {
      setError("No payment data received");
      setVerifying(false);
      return;
    }

    // Verify the payment
    verifyPayment(data);
  }, [searchParams]);

  async function verifyPayment(data: string) {
    try {
      const res = await fetch("/api/payments/esewa/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data }),
      });

      const result = await res.json();

      if (result.success) {
        setVerified(true);
        // Detect payment type from response
        if (result.type) {
          setPaymentType(result.type);
        }
      } else {
        setError(result.error || "Payment verification failed");
      }
    } catch (err) {
      setError("Failed to verify payment");
    } finally {
      setVerifying(false);
    }
  }

  // Dynamic content based on payment type
  const getTitle = () => {
    if (paymentType === "tip") return "Tip Sent Successfully!";
    if (paymentType === "product") return "Purchase Complete!";
    return "Subscription Activated!";
  };

  const getMessage = () => {
    if (paymentType === "tip") return "Thank you for supporting the creator with your generous tip!";
    if (paymentType === "product") return "Your purchase was successful. Check your purchases to download.";
    return "Thank you for your payment. Your subscription is now active.";
  };

  if (verifying) {
    return (
      <div className="text-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-foreground mb-2">
          Verifying Payment...
        </h2>
        <p className="text-muted-foreground">
          Please wait while we confirm your payment with eSewa.
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center">
        <div className="w-16 h-16 rounded-full bg-accent-red/20 flex items-center justify-center mx-auto mb-4">
          <span className="text-accent-red text-2xl">✕</span>
        </div>
        <h2 className="text-xl font-semibold text-foreground mb-2">
          Payment Verification Failed
        </h2>
        <p className="text-muted-foreground mb-6">{error}</p>
        <Button onClick={() => router.push("/dashboard")}>
          Go to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="text-center">
      <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
        paymentType === "tip" ? "bg-pink-500/20" : "bg-accent-green/20"
      }`}>
        {paymentType === "tip" ? (
          <Heart className="w-10 h-10 text-pink-500 fill-pink-500" />
        ) : (
          <CheckCircle className="w-10 h-10 text-accent-green" />
        )}
      </div>
      <h2 className="text-2xl font-bold text-foreground mb-2">
        {getTitle()}
      </h2>
      <p className="text-muted-foreground mb-6">
        {getMessage()}
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        {paymentType === "tip" ? (
          <>
            <Button onClick={() => router.push("/explore")} className="bg-pink-600 hover:bg-pink-700">
              Explore More Creators
            </Button>
            <Button variant="outline" onClick={() => router.push("/dashboard")}>
              Go to Dashboard
            </Button>
          </>
        ) : paymentType === "product" ? (
          <>
            <Button onClick={() => router.push("/purchases")}>
              View My Purchases
            </Button>
            <Button variant="outline" onClick={() => router.push("/explore")}>
              Continue Browsing
            </Button>
          </>
        ) : (
          <>
            <Button onClick={() => router.push("/dashboard")}>
              Go to Dashboard
            </Button>
            <Button variant="outline" onClick={() => router.push("/subscriptions")}>
              View Subscriptions
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

export default function EsewaSuccessPage() {
  return (
    <main className="min-h-screen bg-background flex flex-col">
      <Header />

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8">
            <Suspense fallback={
              <div className="text-center">
                <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
              </div>
            }>
              <SuccessContent />
            </Suspense>
          </CardContent>
        </Card>
      </div>
      
      <Footer />
    </main>
  );
}
