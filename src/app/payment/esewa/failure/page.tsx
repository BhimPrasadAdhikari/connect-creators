"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Heart, XCircle, Loader2, AlertTriangle } from "lucide-react";
import { Button, Card, CardContent } from "@/components/ui";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

function FailureContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Get error message if any
  const message = searchParams.get("message") || "Payment was cancelled or failed";

  return (
    <div className="text-center">
      <div className="w-24 h-24 rounded-none border-4 border-brutal-black flex items-center justify-center mx-auto mb-8 bg-accent-red shadow-brutal">
        <XCircle className="w-12 h-12 text-foreground stroke-[3]" />
      </div>
      <h2 className="text-3xl font-display font-black text-foreground uppercase mb-4 tracking-tight">
        Payment Failed
      </h2>
      <div className="bg-accent-red/10 p-4 border-2 border-brutal-black mb-8 transform -rotate-1">
        <p className="text-foreground font-medium text-lg font-mono">
          {message}
        </p>
      </div>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button onClick={() => router.back()} size="lg" variant="brutal" className="w-full sm:w-auto">
          Try Again
        </Button>
        <Button variant="outline" onClick={() => router.push("/dashboard")} className="w-full sm:w-auto border-3 text-lg bg-card hover:bg-foreground hover:text-white transition-all transform hover:-translate-y-1 hover:shadow-brutal-sm">
          Go to Dashboard
        </Button>
      </div>
    </div>
  );
}

export default function EsewaFailurePage() {
  return (
    <main className="min-h-screen bg-accent-red/5 flex flex-col">
      <Header />

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <Card variant="brutal" className="w-full max-w-md bg-card border-4">
          <CardContent className="p-8">
            <Suspense fallback={
              <div className="text-center">
                <Loader2 className="w-12 h-12 animate-spin text-foreground stroke-[3] mx-auto" />
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
