"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, Home, RotateCcw, Heart } from "lucide-react";
import { Button } from "@/components/ui";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to console (could be sent to error reporting service)
    console.error("Application error:", error);
  }, [error]);

  return (
    <html>
      <body>
        <main className="min-h-screen bg-background flex flex-col font-sans">
          {/* Header */}
          <header className="py-4 px-4 sm:px-6 lg:px-8 border-b-4 border-brutal-black bg-card">
            <div className="container mx-auto">
              <Link href="/" className="flex items-center gap-3 w-fit group">
                <div className="w-10 h-10 border-2 border-brutal-black bg-primary flex items-center justify-center shadow-brutal-sm group-hover:rotate-6 transition-transform">
                  <Heart className="w-5 h-5 text-white fill-current" />
                </div>
                <span className="text-xl font-display font-black text-foreground uppercase tracking-tight">
                  CreatorConnect
                </span>
              </Link>
            </div>
          </header>

          {/* Error Content */}
          <div className="flex-1 flex items-center justify-center px-4 py-16">
            <div className="text-center max-w-md w-full bg-card border-4 border-brutal-black shadow-brutal p-8">
              <div className="w-20 h-20 bg-accent-red border-3 border-brutal-black flex items-center justify-center mx-auto mb-6 shadow-brutal-sm animate-bounce">
                <AlertTriangle className="w-10 h-10 text-white stroke-[3]" />
              </div>
              
              <h1 className="font-display text-3xl font-black text-foreground mb-3 uppercase">
                Critical Error
              </h1>
              <p className="text-foreground font-medium mb-8 font-mono text-sm">
                We encountered an unexpected error. Please try again or return to the homepage.
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
            </div>
          </div>
        </main>
      </body>
    </html>
  );
}
