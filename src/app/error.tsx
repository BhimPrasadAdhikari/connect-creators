"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, Home, RotateCcw } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Button, Card, CardContent } from "@/components/ui";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Page error:", error);
  }, [error]);

  return (
    <main className="min-h-screen bg-background flex flex-col font-sans">
      <Header />

      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <Card variant="brutal" className="max-w-md w-full border-4 bg-brutal-cream">
          <CardContent className="p-8 text-center">
            <div className="w-20 h-20 border-3 border-brutal-black bg-accent-red text-white flex items-center justify-center mx-auto mb-6 shadow-brutal-sm">
              <AlertTriangle className="w-10 h-10 stroke-[3]" />
            </div>
            
            <h1 className="font-display text-3xl font-black text-foreground mb-3 uppercase tracking-tight">
              Something went wrong
            </h1>
            <p className="text-foreground font-medium mb-8 font-mono text-sm">
              {error.message || "We encountered an error loading this page. Please try again."}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={() => reset()} variant="brutal-accent" className="w-full sm:w-auto">
                <RotateCcw className="w-4 h-4 mr-2 stroke-[3]" />
                TRY AGAIN
              </Button>
              <Link href="/" className="w-full sm:w-auto">
                <Button variant="brutal" className="w-full">
                  <Home className="w-4 h-4 mr-2 stroke-[3]" />
                  GO HOME
                </Button>
              </Link>
            </div>

            {error.digest && (
              <div className="mt-8 p-2 border-2 border-dashed border-brutal-black/30 bg-muted/50">
                <p className="text-[10px] uppercase font-bold text-muted-foreground font-mono">
                  Error ID: {error.digest}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
