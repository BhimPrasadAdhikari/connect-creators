"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";
import Link from "next/link";

export function DatabaseError() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-card border-4 border-brutal-black shadow-brutal p-8 text-center">
        <div className="w-20 h-20 border-4 border-brutal-black bg-accent-yellow flex items-center justify-center mx-auto mb-6 shadow-brutal-sm">
          <AlertTriangle className="w-10 h-10 text-brutal-black stroke-[2.5]" />
        </div>
        <h1 className="text-2xl font-display font-black uppercase text-foreground mb-4">
          Connection Issue
        </h1>
        <p className="text-muted-foreground font-mono text-sm mb-6">
          We&apos;re having trouble connecting to our servers. Please try again in a moment.
        </p>
        <div className="flex gap-4 justify-center">
          <Link 
            href="/"
            className="px-6 py-3 bg-card border-2 border-brutal-black font-bold uppercase text-sm hover:shadow-brutal-sm hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all"
          >
            Go Home
          </Link>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-primary text-white border-2 border-brutal-black font-bold uppercase text-sm hover:shadow-brutal-sm hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        </div>
      </div>
    </div>
  );
}
