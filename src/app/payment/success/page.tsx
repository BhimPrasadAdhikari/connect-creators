"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Heart, CheckCircle, Loader2, Download } from "lucide-react";
import { Button, Card, CardContent } from "@/components/ui";

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const type = searchParams.get("type");
  
  const isProduct = type === "product";

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-12">
      <Card className="max-w-md w-full text-center">
        <CardContent className="py-12">
          {/* Success Icon */}
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {isProduct ? "Purchase Complete!" : "Subscription Activated!"}
          </h1>
          
          <p className="text-gray-600 mb-8">
            {isProduct 
              ? "Your purchase was successful. Check your email for the download link!"
              : "Welcome! Your subscription is now active. Enjoy exclusive content!"}
          </p>

          {/* CTAs */}
          <div className="space-y-3">
            {isProduct ? (
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

          <p className="text-sm text-gray-500 mt-6">
            A confirmation email has been sent to your registered email address.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-green-50 to-white flex flex-col">
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

      <Suspense fallback={
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-green-600" />
        </div>
      }>
        <PaymentSuccessContent />
      </Suspense>
    </main>
  );
}
