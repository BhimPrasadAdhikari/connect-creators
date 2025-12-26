import Link from "next/link";
import {
  Users,
  TrendingDown,
  Zap,
  Shield,
  CreditCard,
  Heart,
  ArrowRight,
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ParticleBackground } from "@/components/ui/ParticleBackground";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <Header transparent />

      {/* Hero Section */}
      <HeroSection />

      {/* Problem Section */}
      <ProblemSection />

      {/* Solution Section */}
      <SolutionSection />

      {/* How It Works */}
      <HowItWorksSection />

      {/* Trust Signals */}
      <TrustSection />

      {/* Final CTA */}
      <CTASection />

      {/* Footer */}
      <Footer />
    </main>
  );
}

function HeroSection() {
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
        <div className="max-w-3xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 pointer-events-auto">
            <Zap className="w-4 h-4" />
            For creators in Nepal &amp; India
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6">
            Support creators you love.{" "}
            <span className="text-primary">Get closer access.</span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            Join exclusive communities, content, and live interactions from
            micro-influencers across Nepal &amp; India. Starting at just ₹99/month.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/explore"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 text-lg font-medium text-white bg-primary rounded-xl hover:bg-primary-700 transition-colors w-full sm:w-auto pointer-events-auto"
            >
              Explore Creators
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/signup?role=creator"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 text-lg font-medium text-primary bg-transparent border-2 border-primary rounded-xl hover:bg-primary/10 transition-colors w-full sm:w-auto pointer-events-auto"
            >
              Become a Creator
            </Link>
          </div>

          {/* Social Proof */}
          <div className="mt-12 flex items-center justify-center gap-8 text-muted-foreground">
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">500+</div>
              <div className="text-sm">Creators</div>
            </div>
            <div className="w-px h-10 bg-border" />
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">10K+</div>
              <div className="text-sm">Subscribers</div>
            </div>
            <div className="w-px h-10 bg-border" />
            <div className="text-center">
              <div className="text-2xl font-bold text-accent-green">₹5L+</div>
              <div className="text-sm">Paid to Creators</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ProblemSection() {
  const problems = [
    {
      icon: TrendingDown,
      title: "Algorithms control reach",
      description: "Social platforms decide who sees your content, not your fans.",
    },
    {
      icon: CreditCard,
      title: "Income is unpredictable",
      description: "Brand deals come and go. Ad revenue keeps dropping.",
    },
    {
      icon: Users,
      title: "Fans want more",
      description: "Your audience wants exclusive content, but there's no direct way to deliver.",
    },
  ];

  return (
    <section className="py-20 bg-card">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Why creators struggle
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            The current system is broken. Creators work hard but don&apos;t own their audience or income.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {problems.map((problem, index) => (
            <div key={index} className="text-center p-6 rounded-xl hover:bg-muted transition-colors">
              <div className="w-14 h-14 rounded-full bg-accent-red/10 flex items-center justify-center mx-auto mb-4">
                <problem.icon className="w-7 h-7 text-accent-red" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">{problem.title}</h3>
              <p className="text-muted-foreground text-sm">{problem.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SolutionSection() {
  const solutions = [
    {
      icon: Heart,
      title: "Fans subscribe directly",
      description: "Build a recurring income stream independent of algorithms.",
    },
    {
      icon: CreditCard,
      title: "Creators earn recurring income",
      description: "Predictable monthly earnings from subscribers who value your work.",
    },
    {
      icon: Users,
      title: "No brands. No noise. Just community.",
      description: "Focus on what matters - your relationship with your audience.",
    },
  ];

  return (
    <section className="py-20 bg-muted">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            A direct connection
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Cut out the middlemen. Build real relationships with your biggest fans.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {solutions.map((solution, index) => (
            <div
              key={index}
              className="text-center p-6 rounded-xl bg-card border border-border shadow-sm hover:shadow-md transition-all"
            >
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <solution.icon className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {solution.title}
              </h3>
              <p className="text-muted-foreground text-sm">
                {solution.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  const steps = [
    {
      step: "1",
      title: "Discover a creator",
      description: "Browse creators in your area of interest - fitness, tech, art, and more.",
    },
    {
      step: "2",
      title: "Subscribe for ₹99–₹299/month",
      description: "Choose a tier that fits your budget. Pay securely via UPI or card.",
    },
    {
      step: "3",
      title: "Access exclusive content",
      description: "Unlock posts, live sessions, and direct interaction with your creator.",
    },
  ];

  return (
    <section className="py-20 bg-card">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            How it works
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Three simple steps to start supporting your favorite creators.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {steps.map((item, index) => (
            <div key={index} className="relative">
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-10 left-[60%] w-full h-0.5 bg-border" />
              )}
              
              <div className="text-center relative z-10">
                <div className="w-20 h-20 rounded-full bg-primary text-white flex items-center justify-center mx-auto mb-6 text-2xl font-bold shadow-lg">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  {item.title}
                </h3>
                <p className="text-muted-foreground">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TrustSection() {
  const trustItems = [
    {
      icon: Shield,
      title: "Secure payments",
      description: "UPI, cards, and digital wallets supported. Your payment data is never stored.",
    },
    {
      icon: CreditCard,
      title: "Transparent pricing",
      description: "No hidden fees. You see exactly what you pay and what the creator receives.",
    },
    {
      icon: Heart,
      title: "Creator-first platform",
      description: "We take only 10%. The rest goes directly to the creators you support.",
    },
  ];

  return (
    <section className="py-20 bg-primary/5">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Built on trust
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            We&apos;re committed to transparency and security for both creators and fans.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto mb-12">
          {trustItems.map((item, index) => (
            <div
              key={index}
              className="flex items-start gap-4 p-6 rounded-xl bg-card border border-border shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="w-12 h-12 rounded-lg bg-accent-green/10 flex items-center justify-center shrink-0">
                <item.icon className="w-6 h-6 text-accent-green" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-1">
                  {item.title}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Payment Providers & Security Badges */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-4">Trusted payment partners</p>
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8">
            <div className="flex items-center gap-2 px-4 py-2 bg-card rounded-lg border border-border">
              <div className="w-6 h-6 bg-green-600 rounded flex items-center justify-center">
                <span className="text-white text-xs font-bold">e</span>
              </div>
              <span className="text-sm font-medium text-foreground">eSewa</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-card rounded-lg border border-border">
              <div className="w-6 h-6 bg-purple-600 rounded flex items-center justify-center">
                <span className="text-white text-xs font-bold">K</span>
              </div>
              <span className="text-sm font-medium text-foreground">Khalti</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-card rounded-lg border border-border">
              <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
                <span className="text-white text-xs font-bold">R</span>
              </div>
              <span className="text-sm font-medium text-foreground">Razorpay</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-card rounded-lg border border-border">
              <div className="w-6 h-6 bg-indigo-600 rounded flex items-center justify-center">
                <span className="text-white text-xs font-bold">S</span>
              </div>
              <span className="text-sm font-medium text-foreground">Stripe</span>
            </div>
          </div>
          <div className="flex items-center justify-center gap-4 mt-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Shield className="w-4 h-4 text-accent-green" />
              <span>SSL Encrypted</span>
            </div>
            <div className="w-px h-4 bg-border" />
            <div className="flex items-center gap-1">
              <Shield className="w-4 h-4 text-accent-green" />
              <span>PCI Compliant</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="py-20 bg-primary">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Start with one creator.{" "}
            <span className="text-primary-100">Stay for the community.</span>
          </h2>
          <p className="text-primary-100 text-lg mb-8">
            Join thousands of fans already supporting their favorite creators.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/explore"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 text-lg font-medium text-primary bg-white rounded-xl hover:bg-gray-100 transition-colors w-full sm:w-auto"
            >
              Explore Creators
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/signup?role=creator"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 text-lg font-medium text-white bg-transparent border-2 border-white rounded-xl hover:bg-white/10 transition-colors w-full sm:w-auto"
            >
              Become a Creator
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
