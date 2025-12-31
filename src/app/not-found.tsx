"use client"
import Link from "next/link";
import { Home, Search, ArrowLeft, FileQuestion } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Button, Card, CardContent } from "@/components/ui";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-background flex flex-col font-sans">
      <Header />

      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <Card variant="brutal" className="max-w-md w-full border-4 bg-card">
          <CardContent className="p-8 text-center">
            {/* 404 Illustration */}
            <div className="mb-8 relative inline-block">
              <div className="text-9xl font-black text-primary font-display tracking-tighter leading-none" style={{ textShadow: "4px 4px 0 #000" }}>404</div>
              <div className="absolute -top-6 -right-6 w-12 h-12 bg-accent-yellow border-3 border-brutal-black flex items-center justify-center shadow-brutal-sm rotate-12">
                 <FileQuestion className="w-6 h-6 stroke-[3]" />
              </div>
            </div>

            <h1 className="font-display text-2xl font-black text-foreground mb-3 uppercase border-b-4 border-primary inline-block pb-1">
              Page Not Found
            </h1>
            <p className="text-foreground font-medium mb-8 font-mono text-sm mt-4">
              Oops! The page you&apos;re looking for doesn&apos;t exist or has been moved to another dimension.
            </p>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
              <Link href="/" className="w-full sm:w-auto">
                <Button variant="brutal-accent" className="w-full">
                  <Home className="w-4 h-4 mr-2 stroke-[3]" />
                  GO HOME
                </Button>
              </Link>
              <Link href="/explore" className="w-full sm:w-auto">
                <Button variant="brutal" className="w-full">
                  <Search className="w-4 h-4 mr-2 stroke-[3]" />
                  EXPLORE
                </Button>
              </Link>
            </div>

            {/* Back Link */}
            <button
              onClick={() => window.history.back()}
              className="mt-2 inline-flex items-center text-sm font-bold uppercase text-muted-foreground hover:text-primary hover:underline decoration-2 underline-offset-4 transition-colors font-mono"
            >
              <ArrowLeft className="w-4 h-4 mr-2 stroke-[3]" />
              Go back
            </button>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
