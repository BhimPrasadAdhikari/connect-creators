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

export default function HomePage() {
  return (
    <main className="min-h-screen">
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
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-50 to-transparent" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-3xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-600 text-sm font-medium mb-6">
            <Zap className="w-4 h-4" />
            For creators in Nepal &amp; India
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
            Support creators you love.{" "}
            <span className="text-blue-600">Get closer access.</span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            Join exclusive communities, content, and live interactions from
            micro-influencers across Nepal &amp; India. Starting at just ₹99/month.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/explore"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 text-lg font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors w-full sm:w-auto"
            >
              Explore Creators
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/signup?role=creator"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 text-lg font-medium text-blue-600 bg-transparent border-2 border-blue-600 rounded-xl hover:bg-blue-50 transition-colors w-full sm:w-auto"
            >
              Become a Creator
            </Link>
          </div>

          {/* Social Proof */}
          <div className="mt-12 flex items-center justify-center gap-8 text-gray-600">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">500+</div>
              <div className="text-sm">Creators</div>
            </div>
            <div className="w-px h-10 bg-gray-200" />
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">10K+</div>
              <div className="text-sm">Subscribers</div>
            </div>
            <div className="w-px h-10 bg-gray-200" />
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">₹5L+</div>
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
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Why creators struggle
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            The current system is broken. Creators work hard but don&apos;t own their audience or income.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {problems.map((problem, index) => (
            <div key={index} className="text-center p-6 rounded-xl hover:bg-gray-50 transition-colors">
              <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
                <problem.icon className="w-7 h-7 text-red-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{problem.title}</h3>
              <p className="text-gray-600 text-sm">{problem.description}</p>
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
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            A direct connection
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Cut out the middlemen. Build real relationships with your biggest fans.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {solutions.map((solution, index) => (
            <div
              key={index}
              className="text-center p-6 rounded-xl bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all"
            >
              <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                <solution.icon className="w-7 h-7 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {solution.title}
              </h3>
              <p className="text-gray-600 text-sm">
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
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            How it works
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Three simple steps to start supporting your favorite creators.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {steps.map((item, index) => (
            <div key={index} className="relative">
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-10 left-[60%] w-full h-0.5 bg-gray-200" />
              )}
              
              <div className="text-center relative z-10">
                <div className="w-20 h-20 rounded-full bg-blue-600 text-white flex items-center justify-center mx-auto mb-6 text-2xl font-bold shadow-lg">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {item.title}
                </h3>
                <p className="text-gray-600">
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
    <section className="py-20 bg-blue-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Built on trust
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            We&apos;re committed to transparency and security for both creators and fans.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto mb-12">
          {trustItems.map((item, index) => (
            <div
              key={index}
              className="flex items-start gap-4 p-6 rounded-xl bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center shrink-0">
                <item.icon className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {item.title}
                </h3>
                <p className="text-gray-600 text-sm">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Payment Providers & Security Badges */}
        <div className="text-center">
          <p className="text-sm text-gray-500 mb-4">Trusted payment partners</p>
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8">
            <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-gray-200">
              <div className="w-6 h-6 bg-green-600 rounded flex items-center justify-center">
                <span className="text-white text-xs font-bold">e</span>
              </div>
              <span className="text-sm font-medium text-gray-700">eSewa</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-gray-200">
              <div className="w-6 h-6 bg-purple-600 rounded flex items-center justify-center">
                <span className="text-white text-xs font-bold">K</span>
              </div>
              <span className="text-sm font-medium text-gray-700">Khalti</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-gray-200">
              <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
                <span className="text-white text-xs font-bold">R</span>
              </div>
              <span className="text-sm font-medium text-gray-700">Razorpay</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-gray-200">
              <div className="w-6 h-6 bg-indigo-600 rounded flex items-center justify-center">
                <span className="text-white text-xs font-bold">S</span>
              </div>
              <span className="text-sm font-medium text-gray-700">Stripe</span>
            </div>
          </div>
          <div className="flex items-center justify-center gap-4 mt-6 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Shield className="w-4 h-4 text-green-600" />
              <span>SSL Encrypted</span>
            </div>
            <div className="w-px h-4 bg-gray-300" />
            <div className="flex items-center gap-1">
              <Shield className="w-4 h-4 text-green-600" />
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
    <section className="py-20 bg-blue-600">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Start with one creator.{" "}
            <span className="text-blue-200">Stay for the community.</span>
          </h2>
          <p className="text-blue-100 text-lg mb-8">
            Join thousands of fans already supporting their favorite creators.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/explore"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 text-lg font-medium text-blue-600 bg-white rounded-xl hover:bg-blue-50 transition-colors w-full sm:w-auto"
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
