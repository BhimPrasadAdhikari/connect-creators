"use client";

import Link from "next/link";
import { Zap, ArrowRight, TrendingDown } from "lucide-react"; // TrendingDown unused here but checking imports
import { Button } from "@/components/ui";
import { ParticleBackground } from "@/components/ui/ParticleBackground";

export function HeroSection() {
  return (
    <section className="relative py-20 sm:py-28 lg:py-32 overflow-hidden">
      {/* Particle Background - wrapped for full coverage */}
      <div className="absolute inset-0 w-full h-full">
        <ParticleBackground
          particleCount={600}
          particleColor="59, 130, 246"
          lineColor="59, 130, 246"
          connectionDistance={120}
          mouseRadius={180}
          speed={0.8}
        />
      </div>
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-background/50 to-background pointer-events-none dark:from-primary/5" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative pointer-events-none">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge - Neubrutalist Style */}
          <div className="inline-flex items-center gap-2 px-4 py-2 border-3 border-brutal-black bg-card text-foreground text-sm sm:text-base font-black uppercase tracking-widest mb-8 shadow-brutal-sm pointer-events-auto">
            <Zap className="w-4 h-4" />
            FOR CREATORS IN NEPAL & INDIA
          </div>

          {/* Headline - Display Typography */}
          <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-black text-foreground uppercase tracking-tighter leading-none mb-6 drop-shadow-sm">
            Support creators you love.{" "}
            <span className="text-primary block sm:inline">Get closer access.</span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            Join exclusive communities, content, and live interactions from
            micro-influencers across Nepal & India. Starting at just ₹99/month.
          </p>

          {/* CTAs - Neubrutalist Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pointer-events-auto">
            <Link href="/explore">
              <Button variant="brutal-accent" size="lg" className="gap-2 w-full sm:w-auto">
                Explore Creators
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link href="/signup?role=creator">
              <Button variant="brutal" size="lg" className="w-full sm:w-auto">
                Become a Creator
              </Button>
            </Link>
          </div>

          {/* Social Proof - Neubrutalist Stats */}
          <div className="mt-12 flex items-center justify-center gap-6 sm:gap-8">
            <div className="text-center p-4 border-3 border-brutal-black bg-card shadow-brutal-sm">
              <div className="font-display text-2xl sm:text-3xl font-bold text-foreground">500+</div>
              <div className="text-sm font-mono uppercase text-muted-foreground">Creators</div>
            </div>
            <div className="text-center p-4 border-3 border-brutal-black bg-card shadow-brutal-sm">
              <div className="font-display text-2xl sm:text-3xl font-bold text-foreground">10K+</div>
              <div className="text-sm font-mono uppercase text-muted-foreground">Subscribers</div>
            </div>
            <div className="text-center p-4 border-3 border-brutal-black bg-secondary shadow-brutal-sm">
              <div className="font-display text-2xl sm:text-3xl font-bold text-white">₹5L+</div>
              <div className="text-sm font-mono uppercase text-white/80">Paid Out</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
