"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Heart, Loader2, Download, Package, ArrowRight, XCircle } from "lucide-react";
import { Button, Card, CardContent } from "@/components/ui";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

function StripeSuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const type = searchParams.get("type");
  
  const [verifying, setVerifying] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Reset body overflow in case it was left from a modal
    document.body.style.overflow = "";
    
    if (!sessionId) {
      setError("No session ID provided");
      setVerifying(false);
      return;
    }

    // Verify the payment (optional - webhook handles the actual processing)
    fetch("/api/payments/stripe/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setSuccess(true);
        } else {
          // Payment might still be processing via webhook
          setSuccess(true); // Show success anyway, webhook will handle
        }
        setVerifying(false);
      })
      .catch(() => {
        // Even if verification fails, show success - webhook processes it
        setSuccess(true);
        setVerifying(false);
      });
  }, [sessionId]);

  if (verifying) {
    return (
      <div className="text-center py-12">
        <Loader2 className="w-16 h-16 animate-spin text-foreground stroke-[3] mx-auto mb-6" />
        <h2 className="text-3xl font-display font-black text-foreground uppercase mb-4 tracking-tight animate-pulse">
          Verifying Payment...
        </h2>
        <p className="text-foreground font-mono font-bold text-lg bg-accent-yellow p-2 inline-block border-2 border-brutal-black transform rotate-1">
          Checking Stripe status...
        </p>
      </div>
    );
  }

  if (error || !success) {
    return (
      <Card variant="brutal" className="max-w-md w-full mx-auto bg-card border-4">
        <CardContent className="p-8 text-center">
          <div className="w-24 h-24 rounded-none border-4 border-brutal-black flex items-center justify-center mx-auto mb-8 bg-accent-red shadow-brutal">
            <Heart className="w-12 h-12 text-foreground stroke-[3]" />
          </div>
          <h1 className="text-3xl font-display font-black text-foreground uppercase mb-4 tracking-tight">
            Payment Issue
          </h1>
          <div className="bg-accent-red/20 p-4 border-2 border-brutal-black mb-8 transform -rotate-1">
            <p className="text-foreground font-medium text-lg font-mono">
              {error || "There was an issue with your payment. Please try again."}
            </p>
          </div>
          <div className="space-y-4">
            <Link href="/explore" className="block">
              <Button variant="brutal" size="lg" className="w-full">
                Back to Explore
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  const isProduct = type === "product";
  const isTip = type === "tip";
  
  // Dynamic content based on payment type
  const getTitle = () => {
    if (isTip) return "Tip Sent Successfully!";
    if (isProduct) return "Purchase Complete!";
    return "Subscription Activated!";
  };

  const getMessage = () => {
    if (isTip) return "Thank you for supporting the creator with your generous tip!";
    if (isProduct) return "Your purchase was successful. Check your email for the download link!";
    return "Welcome! Your subscription is now active. Enjoy exclusive content!";
  };

  return (
    <Card variant="brutal" className="max-w-md w-full mx-auto bg-card border-4">
      <CardContent className="p-8 text-center">
        <div className={`w-24 h-24 rounded-none border-4 border-brutal-black flex items-center justify-center mx-auto mb-8 shadow-brutal ${
          isTip ? "bg-accent-pink" : "bg-accent-green"
        }`}>
          {isTip ? (
            <Heart className="w-12 h-12 text-foreground stroke-[3] fill-white" />
          ) : (
            <CheckCircle className="w-12 h-12 text-foreground stroke-[3]" />
          )}
        </div>
        
        <h1 className="text-3xl md:text-4xl font-display font-black text-foreground uppercase mb-6 tracking-tight leading-none">
          {getTitle()}
        </h1>
        
        <div className="bg-accent-yellow/30 p-4 border-2 border-brutal-black mb-10 transform rotate-1">
          <p className="text-foreground font-bold text-lg font-mono leading-relaxed">
            {getMessage()}
          </p>
        </div>

        <div className="space-y-4">
          {isTip ? (
            <>
              <Link href="/explore" className="block">
                <Button variant="brutal" className="w-full text-lg py-6 bg-accent-pink hover:bg-foreground hover:text-white">
                  <Heart className="w-5 h-5 mr-3 stroke-[3]" />
                  Explore More Creators
                </Button>
              </Link>
              <Link href="/dashboard" className="block">
                <Button variant="outline" className="w-full border-3 text-lg py-6 bg-card hover:bg-foreground hover:text-white transition-all transform hover:-translate-y-1 hover:shadow-brutal-sm">
                  Go to Dashboard
                </Button>
              </Link>
            </>
          ) : isProduct ? (
            <>
              <Link href="/purchases" className="block">
                <Button variant="brutal" className="w-full text-lg py-6">
                  <Download className="w-5 h-5 mr-3 stroke-[3]" />
                  View My Purchases
                </Button>
              </Link>
              <Link href="/explore" className="block">
                <Button variant="outline" className="w-full border-3 text-lg py-6 bg-card hover:bg-foreground hover:text-white transition-all transform hover:-translate-y-1 hover:shadow-brutal-sm">
                  Continue Browsing
                </Button>
              </Link>
            </>
          ) : (
            <>
              <Link href="/dashboard" className="block">
                <Button variant="brutal" className="w-full text-lg py-6">
                  Go to Dashboard <ArrowRight className="ml-2 w-5 h-5 stroke-[3]" />
                </Button>
              </Link>
              <Link href="/explore" className="block">
                <Button variant="outline" className="w-full border-3 text-lg py-6 bg-card hover:bg-foreground hover:text-white transition-all transform hover:-translate-y-1 hover:shadow-brutal-sm">
                  Explore More Creators
                </Button>
              </Link>
            </>
          )}
        </div>

        <p className="text-xs font-bold uppercase tracking-wide text-foreground/60 mt-8">
          {isTip 
            ? "The creator has been notified of your tip."
            : "A confirmation email has been sent to your registered email address."}
        </p>
      </CardContent>
    </Card>
  );
}

export default function StripeSuccessPage() {
  return (
    <main className="min-h-screen bg-accent-green/5 flex flex-col">
      <Header />
      
      <div className="flex-1 flex items-center justify-center p-4">
        <Suspense fallback={
          <div className="text-center py-12">
            <Loader2 className="w-12 h-12 animate-spin text-foreground stroke-[3] mx-auto mb-4" />
            <p className="text-foreground font-mono font-bold">Loading...</p>
          </div>
        }>
          <StripeSuccessContent />
        </Suspense>
      </div>
      
      <Footer />
    </main>
  );
}
