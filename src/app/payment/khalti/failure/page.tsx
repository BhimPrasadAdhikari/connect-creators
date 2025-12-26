"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Heart, XCircle, Loader2 } from "lucide-react";
import { Button, Card, CardContent } from "@/components/ui";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

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
      <div className="w-16 h-16 rounded-full bg-accent-red/20 flex items-center justify-center mx-auto mb-4">
        <XCircle className="w-10 h-10 text-accent-red" />
      </div>
      <h2 className="text-2xl font-bold text-foreground mb-2">
        Payment Failed
      </h2>
      <p className="text-muted-foreground mb-6">
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
    <main className="min-h-screen bg-background flex flex-col">
      <Header />

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8">
            <Suspense fallback={
              <div className="text-center">
                <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
              </div>
            }>
              <FailureContent />
            </Suspense>
          </CardContent>
        </Card>
      </div>
      
      <Footer />
    </main>
  );
}
