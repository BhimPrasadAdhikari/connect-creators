"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Heart, Loader2, XCircle, Download } from "lucide-react";
import { Button, Card, CardContent } from "@/components/ui";

export default function KhaltiCallbackPage() {
  const searchParams = useSearchParams();
  
  const pidx = searchParams.get("pidx");
  const status = searchParams.get("status");
  const transaction_id = searchParams.get("transaction_id");
  const purchase_order_id = searchParams.get("purchase_order_id");
  
  const [verifying, setVerifying] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
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
      <main className="min-h-screen bg-gradient-to-b from-purple-50 to-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-purple-600 mx-auto mb-4" />
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
              <XCircle className="w-10 h-10 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Payment Failed
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

  const isProduct = purchase_order_id?.startsWith("product_");

  return (
    <main className="min-h-screen bg-gradient-to-b from-purple-50 to-white flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardContent className="p-8 text-center">
          <div className="w-20 h-20 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-purple-600" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {isProduct ? "Purchase Complete!" : "Subscription Activated!"}
          </h1>
          
          <p className="text-gray-600 mb-6">
            {isProduct
              ? "Your purchase was successful. Check your email for the download link!"
              : "Welcome! Your subscription is now active. Enjoy exclusive content!"}
          </p>

          {transaction_id && (
            <p className="text-xs text-gray-500 mb-4">
              Transaction ID: {transaction_id}
            </p>
          )}

          <div className="space-y-3">
            {isProduct ? (
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

          <p className="text-sm text-gray-500 mt-6">
            A confirmation email has been sent to your registered email address.
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
