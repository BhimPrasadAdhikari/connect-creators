"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Heart, CheckCircle, Loader2, Download, AlertTriangle, ArrowRight } from "lucide-react";
import { Button, Card, CardContent } from "@/components/ui";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const type = searchParams.get("type");
  const provider = searchParams.get("provider");
  
  // Reset body overflow in case it was left from a modal
  useEffect(() => {
    document.body.style.overflow = "";
  }, []);
  
  // Check if this is a valid payment success page access
  // Should have at least a provider or type parameter from a redirect
  const isValidAccess = provider || type;
  
  if (!isValidAccess) {
    return (
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <Card variant="brutal" className="max-w-md w-full text-center bg-accent-red/20 border-4">
          <CardContent className="py-12">
            <div className="w-24 h-24 rounded-none border-4 border-brutal-black flex items-center justify-center mx-auto mb-8 bg-accent-yellow shadow-brutal">
              <AlertTriangle className="w-12 h-12 text-foreground stroke-[3]" />
            </div>
            <h1 className="text-3xl font-display font-black uppercase text-foreground mb-4">
              No Payment Found
            </h1>
            <p className="text-foreground font-mono font-bold mb-8 bg-card p-2 border-2 border-brutal-black inline-block transform -rotate-1">
              It looks like you navigated here directly. Please complete a payment first.
            </p>
            <div className="space-y-4">
              <Link href="/explore" className="block">
                <Button className="w-full" size="lg" variant="brutal">
                  Explore Creators
                </Button>
              </Link>
              <Link href="/dashboard" className="block">
                <Button variant="brutal-accent" className="w-full">
                  Go to Dashboard
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  const isProduct = type === "product";
  const isTip = type === "tip";
  const isSubscription = !isProduct && !isTip;

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
    <div className="flex-1 flex items-center justify-center px-4 py-12 bg-pattern-dots">
      <Card variant="brutal" className="max-w-md w-full text-center bg-card border-4">
        <CardContent className="py-12 px-6">
          {/* Success Icon */}
          <div className={`w-24 h-24 rounded-none border-4 border-brutal-black flex items-center justify-center mx-auto mb-8 shadow-brutal
            ${isTip ? "bg-accent-pink" : "bg-accent-green"}
          `}>
            {isTip ? (
              <Heart className="w-12 h-12 text-foreground stroke-[3] fill-white" />
            ) : (
              <CheckCircle className="w-12 h-12 text-foreground stroke-[3]" />
            )}
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-display font-black text-foreground uppercase mb-4 leading-tight tracking-tight">
            {getTitle()}
          </h1>
          
          <div className="bg-accent-yellow/20 p-4 border-2 border-brutal-black mb-8 transform rotate-1">
            <p className="text-foreground font-medium text-lg leading-snug">
              {getMessage()}
            </p>
          </div>

          {/* CTAs */}
          <div className="space-y-4">
            {isTip ? (
              <>
                <Link href="/explore" className="block">
                  <Button className="w-full text-lg py-6" size="lg" variant="brutal">
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
                  <Button className="w-full text-lg py-6" size="lg" variant="brutal">
                    <Download className="w-6 h-6 mr-3 stroke-[3]" />
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
                  <Button className="w-full text-lg py-6" size="lg" variant="brutal">
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
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <main className="min-h-screen bg-accent-yellow/5 flex flex-col">
      <Header />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumbs className="font-mono" />
      </div>

      <Suspense fallback={
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-12 h-12 animate-spin text-foreground stroke-[3]" />
        </div>
      }>
        <PaymentSuccessContent />
      </Suspense>
      
      <Footer />
    </main>
  );
}
