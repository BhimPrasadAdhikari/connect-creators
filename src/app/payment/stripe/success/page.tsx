"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Heart, Loader2, Download, Package } from "lucide-react";
import { Button, Card, CardContent } from "@/components/ui";

export default function StripeSuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const type = searchParams.get("type");
  
  const [verifying, setVerifying] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
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
      <main className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-gray-600">Verifying your payment...</p>
        </div>
      </main>
    );
  }

  if (error || !success) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-red-50 to-white flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Payment Issue
            </h1>
            <p className="text-gray-600 mb-6">
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
      </main>
    );
  }

  const isProduct = type === "product";

  return (
    <main className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardContent className="p-8 text-center">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {isProduct ? "Purchase Complete!" : "Subscription Activated!"}
          </h1>
          
          <p className="text-gray-600 mb-6">
            {isProduct
              ? "Your purchase was successful. Check your email for the download link!"
              : "Welcome! Your subscription is now active. Enjoy exclusive content!"}
          </p>

          <div className="space-y-3">
            {isProduct ? (
              <>
                <Link href="/dashboard/purchases" className="block">
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

          <p className="text-sm text-gray-500 mt-6">
            A confirmation email has been sent to your registered email address.
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
