"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Heart, CheckCircle, Loader2 } from "lucide-react";
import { Button, Card, CardContent } from "@/components/ui";

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [verifying, setVerifying] = useState(true);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
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
      } else {
        setError(result.error || "Payment verification failed");
      }
    } catch (err) {
      setError("Failed to verify payment");
    } finally {
      setVerifying(false);
    }
  }

  if (verifying) {
    return (
      <div className="text-center">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Verifying Payment...
        </h2>
        <p className="text-gray-600">
          Please wait while we confirm your payment with eSewa.
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center">
        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
          <span className="text-red-600 text-2xl">✕</span>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Payment Verification Failed
        </h2>
        <p className="text-gray-600 mb-6">{error}</p>
        <Button onClick={() => router.push("/dashboard")}>
          Go to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="text-center">
      <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
        <CheckCircle className="w-10 h-10 text-green-600" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        Payment Successful!
      </h2>
      <p className="text-gray-600 mb-6">
        Thank you for your payment. Your subscription is now active.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button onClick={() => router.push("/dashboard")}>
          Go to Dashboard
        </Button>
        <Button variant="outline" onClick={() => router.push("/subscriptions")}>
          View Subscriptions
        </Button>
      </div>
    </div>
  );
}

export default function EsewaSuccessPage() {
  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="py-4 px-4 sm:px-6 lg:px-8 border-b border-gray-200 bg-white">
        <div className="container mx-auto">
          <Link href="/" className="flex items-center gap-2 w-fit">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-semibold text-gray-900">
              CreatorConnect
            </span>
          </Link>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8">
            <Suspense fallback={
              <div className="text-center">
                <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto" />
              </div>
            }>
              <SuccessContent />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
