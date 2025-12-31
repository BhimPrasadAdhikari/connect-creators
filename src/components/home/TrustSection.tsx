"use client";

import { Shield, CreditCard, Heart } from "lucide-react";
import { TrustBadge, TrustBadgeGroup } from "@/components/ui";

export function TrustSection() {
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
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-display text-display-sm sm:text-display font-bold text-foreground mb-4">
            Built on trust
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            We&apos;re committed to transparency and security for both creators and fans.
          </p>
          <TrustBadgeGroup className="justify-center mt-6">
            <TrustBadge type="secured" />
            <TrustBadge type="verified" />
          </TrustBadgeGroup>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-12">
          {trustItems.map((item, index) => (
            <div
              key={index}
              className="flex items-start gap-4 p-6 bg-card border-3 border-brutal-black shadow-brutal-sm hover:shadow-brutal transition-shadow"
            >
              <div className="w-14 h-14 border-3 border-brutal-black bg-secondary/10 flex items-center justify-center shrink-0">
                <item.icon className="w-7 h-7 text-secondary" />
              </div>
              <div>
                <h3 className="text-lg font-display font-bold text-foreground mb-1">
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
          <p className="text-sm font-mono uppercase tracking-wide text-muted-foreground mb-4">
            Trusted payment partners
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
            {[
              { name: "eSewa", color: "bg-green-600" },
              { name: "Khalti", color: "bg-purple-600" },
              { name: "Razorpay", color: "bg-blue-600" },
              { name: "Stripe", color: "bg-indigo-600" },
            ].map((provider) => (
              <div 
                key={provider.name}
                className="flex items-center gap-2 px-4 py-2 bg-card border-2 border-brutal-black shadow-brutal-sm"
              >
                <div className={`w-6 h-6 ${provider.color} flex items-center justify-center`}>
                  <span className="text-white text-xs font-bold">{provider.name[0]}</span>
                </div>
                <span className="text-sm font-bold text-foreground">{provider.name}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-center gap-4 mt-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Shield className="w-4 h-4 text-secondary" />
              <span className="font-mono">SSL Encrypted</span>
            </div>
            <div className="w-px h-4 bg-brutal-black" />
            <div className="flex items-center gap-1">
              <Shield className="w-4 h-4 text-secondary" />
              <span className="font-mono">PCI Compliant</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
