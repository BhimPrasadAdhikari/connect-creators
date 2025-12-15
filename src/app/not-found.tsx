"use client"
import Link from "next/link";
import { Home, Search, ArrowLeft } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="text-center max-w-md">
          {/* 404 Illustration */}
          <div className="mb-8">
            <div className="text-9xl font-bold text-blue-600 mb-2">404</div>
            <div className="w-24 h-1 bg-blue-600 mx-auto rounded-full" />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            Page Not Found
          </h1>
          <p className="text-gray-600 mb-8">
            Oops! The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/">
              <Button className="w-full sm:w-auto">
                <Home className="w-4 h-4 mr-2" />
                Go Home
              </Button>
            </Link>
            <Link href="/explore">
              <Button variant="outline" className="w-full sm:w-auto">
                <Search className="w-4 h-4 mr-2" />
                Explore Creators
              </Button>
            </Link>
          </div>

          {/* Back Link */}
          <button
            onClick={() => window.history.back()}
            className="mt-6 inline-flex items-center text-gray-500 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Go back
          </button>
        </div>
      </div>
    </main>
  );
}
