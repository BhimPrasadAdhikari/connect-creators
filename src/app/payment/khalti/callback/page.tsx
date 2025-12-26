"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Heart, Loader2, XCircle, Download } from "lucide-react";
import { Button, Card, CardContent } from "@/components/ui";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

function KhaltiCallbackContent() {
  const searchParams = useSearchParams();
  
  const pidx = searchParams.get("pidx");
  const status = searchParams.get("status");
  const transaction_id = searchParams.get("transaction_id");
  const purchase_order_id = searchParams.get("purchase_order_id");
  
  const [verifying, setVerifying] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Reset body overflow in case it was left from a modal
    document.body.style.overflow = "";
    
    if (!pidx) {
      setError("No payment identifier provided");
      setVerifying(false);
      return;
    }

    // Check status from callback params
    if (status === "User canceled") {
      setError("Payment was cancelled");
      setVerifying(false);
      return;
    }

    // Verify payment with our API
    fetch("/api/payments/khalti/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pidx }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setSuccess(true);
        } else {
          setError(data.error || "Payment verification failed");
        }
        setVerifying(false);
      })
      .catch(() => {
        setError("Failed to verify payment");
        setVerifying(false);
      });
  }, [pidx, status]);

  if (verifying) {
    return (
      <div className="text-center py-12">
        <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
        <p className="text-muted-foreground">Verifying your payment...</p>
      </div>
    );
  }

  if (error || !success) {
    return (
      <Card className="max-w-md w-full mx-auto">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-accent-red/20 flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-10 h-10 text-accent-red" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Payment Failed
          </h1>
          <p className="text-muted-foreground mb-6">
            {error || "There was an issue with your payment. Please try again."}
          </p>
          <div className="space-y-3">
            <Link href="/explore" className="block">
              <Button variant="primary" className="w-full">
                Back to Explore
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  const isProduct = purchase_order_id?.startsWith("product_");
  const isTip = purchase_order_id?.startsWith("tip_");
  
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
    <Card className="max-w-md w-full mx-auto">
      <CardContent className="p-8 text-center">
        <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${
          isTip ? "bg-pink-500/20" : "bg-primary/20"
        }`}>
          {isTip ? (
            <Heart className="w-12 h-12 text-pink-500 fill-pink-500" />
          ) : (
            <CheckCircle className="w-12 h-12 text-primary" />
          )}
        </div>
        
        <h1 className="text-2xl font-bold text-foreground mb-2">
          {getTitle()}
        </h1>
        
        <p className="text-muted-foreground mb-6">
          {getMessage()}
        </p>

        {transaction_id && (
          <p className="text-xs text-muted-foreground mb-4">
            Transaction ID: {transaction_id}
          </p>
        )}

        <div className="space-y-3">
          {isTip ? (
            <>
              <Link href="/explore" className="block">
                <Button variant="primary" className="w-full bg-pink-600 hover:bg-pink-700">
                  <Heart className="w-4 h-4 mr-2" />
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
                <Button variant="primary" className="w-full">
                  <Download className="w-4 h-4 mr-2" />
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
                <Button variant="primary" className="w-full">
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
  );
}

export default function KhaltiCallbackPage() {
  return (
    <main className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <div className="flex-1 flex items-center justify-center p-4">
        <Suspense fallback={
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading...</p>
          </div>
        }>
          <KhaltiCallbackContent />
        </Suspense>
      </div>
      
      <Footer />
    </main>
  );
}
