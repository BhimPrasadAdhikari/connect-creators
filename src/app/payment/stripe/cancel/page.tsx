"use client";

import Link from "next/link";
import { XCircle, ArrowLeft, AlertTriangle } from "lucide-react";
import { Button, Card, CardContent } from "@/components/ui";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export default function StripeCancelPage() {
  return (
    <main className="min-h-screen bg-accent-yellow/5 flex flex-col">
      <Header />
      
      <div className="flex-1 flex items-center justify-center p-4">
        <Card variant="brutal" className="max-w-md w-full bg-card border-4">
          <CardContent className="p-8 text-center">
            <div className="w-24 h-24 rounded-none border-4 border-brutal-black flex items-center justify-center mx-auto mb-8 bg-foreground shadow-brutal">
              <XCircle className="w-12 h-12 text-white stroke-[3]" />
            </div>
            
            <h1 className="text-3xl font-display font-black text-foreground uppercase mb-4 tracking-tight">
              Payment Cancelled
            </h1>
            
            <div className="bg-accent-yellow p-4 border-2 border-brutal-black mb-8 transform rotate-1">
              <p className="text-foreground font-medium text-lg font-mono">
                Your payment was cancelled. No charges were made to your card.
              </p>
            </div>

            <div className="space-y-4">
              <Link href="/explore" className="block">
                <Button className="w-full text-lg py-6 border-3 bg-card hover:bg-foreground hover:text-white transition-all transform hover:-translate-y-1 hover:shadow-brutal-sm" variant="outline">
                  <ArrowLeft className="w-5 h-5 mr-3 stroke-[3]" />
                  Back to Explore
                </Button>
              </Link>
            </div>

            <p className="text-xs font-bold uppercase tracking-wide text-foreground/60 mt-8">
              Need help? Contact our support team.
            </p>
          </CardContent>
        </Card>
      </div>
      
      <Footer />
    </main>
  );
}
