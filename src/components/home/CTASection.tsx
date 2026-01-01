"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui";

export function CTASection() {
  return (
    <section className="py-20 bg-primary border-t-4 border-brutal-black">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-display text-display-sm sm:text-display font-bold text-white mb-4">
            Start with one creator.{" "}
            <span className="text-primary-100">Stay for the community.</span>
          </h2>
          <p className="text-primary-100 text-lg mb-8">
            Join thousands of fans already supporting their favorite creators.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/explore">
              <Button 
                variant="brutal" 
                size="lg" 
                className="gap-2  w-full sm:w-auto bg-accent-yellow text-primary"
              >
                Explore Creators
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link href="/signup?role=creator">
              <Button 
                variant="brutal" 
                size="lg" 
                className="w-full sm:w-auto bg-transparent text-white border-white hover:bg-card/10"
              >
                Become a Creator
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
