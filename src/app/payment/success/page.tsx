"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Heart, CheckCircle, Loader2, Download, AlertTriangle } from "lucide-react";
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
        <Card className="max-w-md w-full text-center">
          <CardContent className="py-12">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 bg-amber-500/20">
              <AlertTriangle className="w-12 h-12 text-amber-500" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              No Payment Found
            </h1>
            <p className="text-muted-foreground mb-8">
              It looks like you navigated here directly. Please complete a payment first.
            </p>
            <div className="space-y-3">
              <Link href="/explore" className="block">
                <Button className="w-full" size="lg">
                  Explore Creators
                </Button>
              </Link>
              <Link href="/dashboard" className="block">
                <Button variant="outline" className="w-full">
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
    <div className="flex-1 flex items-center justify-center px-4 py-12">
      <Card className="max-w-md w-full text-center">
        <CardContent className="py-12">
          {/* Success Icon */}
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${
            isTip ? "bg-pink-500/20" : "bg-accent-green/20"
          }`}>
            {isTip ? (
              <Heart className="w-12 h-12 text-pink-500 fill-pink-500" />
            ) : (
              <CheckCircle className="w-12 h-12 text-accent-green" />
            )}
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-foreground mb-2">
            {getTitle()}
          </h1>
          
          <p className="text-muted-foreground mb-8">
            {getMessage()}
          </p>

          {/* CTAs */}
          <div className="space-y-3">
            {isTip ? (
              <>
                <Link href="/explore" className="block">
                  <Button className="w-full bg-pink-600 hover:bg-pink-700" size="lg">
                    <Heart className="w-5 h-5 mr-2" />
                    Explore More Creators
                  </Button>
                </Link>
                <Link href="/dashboard" className="block">
                  <Button variant="outline" className="w-full">
                    Go to Dashboard
                  </Button>
                </Link>
              </>
            ) : isProduct ? (
              <>
                <Link href="/purchases" className="block">
                  <Button className="w-full" size="lg">
                    <Download className="w-5 h-5 mr-2" />
                    View My Purchases
                  </Button>
                </Link>
                <Link href="/explore" className="block">
                  <Button variant="outline" className="w-full">
                    Continue Browsing
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link href="/dashboard" className="block">
                  <Button className="w-full" size="lg">
                    Go to Dashboard
                  </Button>
                </Link>
                <Link href="/explore" className="block">
                  <Button variant="outline" className="w-full">
                    Explore More Creators
                  </Button>
                </Link>
              </>
            )}
          </div>

          <p className="text-sm text-muted-foreground mt-6">
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
    <main className="min-h-screen bg-background flex flex-col">
      <Header />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <Breadcrumbs />
      </div>

      <Suspense fallback={
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-accent-green" />
        </div>
      }>
        <PaymentSuccessContent />
      </Suspense>
      
      <Footer />
    </main>
  );
}
