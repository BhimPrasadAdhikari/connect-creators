"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Heart, XCircle, Loader2 } from "lucide-react";
import { Button, Card, CardContent } from "@/components/ui";

function FailureContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Get error message if any
  const status = searchParams.get("status");
  const message = status === "User canceled" 
    ? "Payment was cancelled by user" 
    : searchParams.get("message") || "Payment was cancelled or failed";

  return (
    <div className="text-center">
      <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
        <XCircle className="w-10 h-10 text-red-600" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        Payment Failed
      </h2>
      <p className="text-gray-600 mb-6">
        {message}
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button onClick={() => router.back()}>
          Try Again
        </Button>
        <Button variant="outline" onClick={() => router.push("/dashboard")}>
          Go to Dashboard
        </Button>
      </div>
    </div>
  );
}

export default function KhaltiFailurePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-purple-50 to-white flex flex-col">
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
                <Loader2 className="w-12 h-12 animate-spin text-purple-600 mx-auto" />
              </div>
            }>
              <FailureContent />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
