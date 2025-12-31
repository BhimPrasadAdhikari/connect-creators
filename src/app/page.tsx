import dynamic from "next/dynamic";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/home/HeroSection";

// Lazy load below-the-fold sections
const ProblemSection = dynamic(() => import("@/components/home/ProblemSection").then(mod => mod.ProblemSection));
const SolutionSection = dynamic(() => import("@/components/home/SolutionSection").then(mod => mod.SolutionSection));
const HowItWorksSection = dynamic(() => import("@/components/home/HowItWorksSection").then(mod => mod.HowItWorksSection));
const TrustSection = dynamic(() => import("@/components/home/TrustSection").then(mod => mod.TrustSection));
const CTASection = dynamic(() => import("@/components/home/CTASection").then(mod => mod.CTASection));

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <Header transparent />

      {/* Hero Section - Load immediately (LCP) */}
      <HeroSection />

      {/* Lazy Loaded Sections */}
      <ProblemSection />
      <SolutionSection />
      <HowItWorksSection />
      <TrustSection />
      <CTASection />

      {/* Footer */}
      <Footer />
    </main>
  );
}

