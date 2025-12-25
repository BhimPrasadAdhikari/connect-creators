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

          {/* Error Content */}
          <div className="flex-1 flex items-center justify-center px-4 py-16">
            <div className="text-center max-w-md">
              <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
                <AlertTriangle className="w-10 h-10 text-red-600" />
              </div>
              
              <h1 className="text-2xl font-bold text-gray-900 mb-3">
                Something went wrong
              </h1>
              <p className="text-gray-600 mb-8">
                We encountered an unexpected error. Please try again or return to the homepage.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button onClick={() => reset()}>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
                <Link href="/">
                  <Button variant="outline" className="w-full sm:w-auto">
                    <Home className="w-4 h-4 mr-2" />
                    Go Home
                  </Button>
                </Link>
              </div>

              {error.digest && (
                <p className="text-xs text-gray-400 mt-8">
                  Error ID: {error.digest}
                </p>
              )}
            </div>
          </div>
        </main>
      </body>
    </html>
  );
}
