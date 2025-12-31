"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Heart, CheckCircle, Loader2, ArrowRight, Download, CreditCard, XCircle } from "lucide-react";
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
      <div className="text-center py-12">
        <Loader2 className="w-16 h-16 animate-spin text-foreground stroke-[3] mx-auto mb-6" />
        <h2 className="text-3xl font-display font-black text-foreground uppercase mb-4 tracking-tight animate-pulse">
          Verifying Payment...
        </h2>
        <p className="text-foreground font-mono font-bold text-lg bg-accent-yellow p-2 inline-block border-2 border-brutal-black transform -rotate-1">
          Please wait while we confirm your payment with eSewa.
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="w-24 h-24 rounded-none border-4 border-brutal-black flex items-center justify-center mx-auto mb-8 bg-accent-red shadow-brutal">
          <XCircle className="w-12 h-12 text-foreground stroke-[3]" />
        </div>
        <h2 className="text-3xl font-display font-black text-foreground uppercase mb-4 tracking-tight">
          Payment Verification Failed
        </h2>
        <div className="bg-accent-red/20 p-4 border-2 border-brutal-black mb-8 max-w-lg mx-auto transform rotate-1">
          <p className="text-foreground font-medium text-lg font-mono">{error}</p>
        </div>
        <Button onClick={() => router.push("/dashboard")} variant="brutal" size="lg">
          Go to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="text-center py-8">
      <div className={`w-24 h-24 rounded-none border-4 border-brutal-black flex items-center justify-center mx-auto mb-8 shadow-brutal ${
        paymentType === "tip" ? "bg-accent-pink" : "bg-accent-green"
      }`}>
        {paymentType === "tip" ? (
          <Heart className="w-12 h-12 text-foreground stroke-[3] fill-white" />
        ) : (
          <CheckCircle className="w-12 h-12 text-foreground stroke-[3]" />
        )}
      </div>
      <h2 className="text-3xl md:text-4xl font-display font-black text-foreground uppercase mb-6 tracking-tight leading-none">
        {getTitle()}
      </h2>
      
      <div className="bg-accent-yellow/30 p-4 border-2 border-brutal-black mb-10 max-w-lg mx-auto transform -rotate-1">
        <p className="text-foreground font-bold text-lg font-mono leading-relaxed">
          {getMessage()}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        {paymentType === "tip" ? (
          <>
            <Button onClick={() => router.push("/explore")} variant="brutal" size="lg" className="w-full sm:w-auto">
              <Heart className="w-5 h-5 mr-2 stroke-[3]" />
              Explore More Creators
            </Button>
            <Button variant="outline" onClick={() => router.push("/dashboard")} className="w-full sm:w-auto border-3 text-lg bg-card hover:bg-foreground hover:text-white transition-all transform hover:-translate-y-1 hover:shadow-brutal-sm py-6">
              Go to Dashboard
            </Button>
          </>
        ) : paymentType === "product" ? (
          <>
            <Button onClick={() => router.push("/purchases")} variant="brutal" size="lg" className="w-full sm:w-auto">
              <Download className="w-5 h-5 mr-2 stroke-[3]" />
              View My Purchases
            </Button>
            <Button variant="outline" onClick={() => router.push("/explore")} className="w-full sm:w-auto border-3 text-lg bg-card hover:bg-foreground hover:text-white transition-all transform hover:-translate-y-1 hover:shadow-brutal-sm py-6">
              Continue Browsing
            </Button>
          </>
        ) : (
          <>
            <Button onClick={() => router.push("/dashboard")} variant="brutal" size="lg" className="w-full sm:w-auto">
              Go to Dashboard <ArrowRight className="ml-2 w-5 h-5 stroke-[3]" />
            </Button>
            <Button variant="outline" onClick={() => router.push("/subscriptions")} className="w-full sm:w-auto border-3 text-lg bg-card hover:bg-foreground hover:text-white transition-all transform hover:-translate-y-1 hover:shadow-brutal-sm py-6">
              <CreditCard className="w-5 h-5 mr-2 stroke-[3]" />
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
    <main className="min-h-screen bg-accent-green/5 flex flex-col">
      <Header />

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <Card variant="brutal" className="w-full max-w-2xl bg-card border-4">
          <CardContent className="p-8 sm:p-12">
            <Suspense fallback={
              <div className="text-center py-12">
                <Loader2 className="w-16 h-16 animate-spin text-foreground stroke-[3] mx-auto mb-6" />
                <h2 className="text-2xl font-bold text-foreground uppercase mb-4">Loading...</h2>
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
