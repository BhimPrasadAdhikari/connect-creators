"use client";

import { UserPlus, Layers, Upload, CreditCard, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

export function HowItWorksSection() {
  const steps = [
    {
      step: "1",
      title: "CREATE YOUR PROFILE",
      description: "Sign up as a creator and set up your profile with your bio, social links, and cover image. Tell your story and let fans know what you're about.",
      icon: UserPlus,
    },
    {
      step: "2",
      title: "SET UP SUBSCRIPTION TIERS",
      description: "Create multiple subscription tiers with different prices and benefits. Offer exclusive perks for your most dedicated supporters.",
      icon: Layers,
    },
    {
      step: "3",
      title: "PUBLISH EXCLUSIVE CONTENT",
      description: "Share posts, tutorials, behind-the-scenes, and more. Control which content is free and which requires a subscription.",
      icon: Upload,
    },
    {
      step: "4",
      title: "GET PAID MONTHLY",
      description: "Receive payments directly to your account. We support UPI, bank transfer, eSewa, Khalti, and international cards.",
      icon: CreditCard,
    },
  ];

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto mb-16">
          {steps.map((item, index) => (
            <div key={index} className="relative group">
              {/* Connector Line (Desktop only, between items) */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-8 -right-3 w-6 h-1 bg-brutal-black z-0" />
              )}
              
              <div className="h-full bg-card border-3 border-brutal-black shadow-brutal p-6 flex flex-col items-center text-center relative z-10 hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-brutal-lg transition-all duration-200">
                {/* Number Badge */}
                <div className="absolute -top-5 bg-secondary text-white font-bold font-mono text-lg w-10 h-10 flex items-center justify-center border-2 border-brutal-black shadow-sm">
                  {item.step}
                </div>

                {/* Icon */}
                <div className="mt-6 mb-6 w-16 h-16 border-3 border-brutal-black flex items-center justify-center bg-card shadow-brutal-sm group-hover:shadow-brutal transition-shadow">
                  <item.icon className="w-8 h-8 text-foreground stroke-[2.5]" />
                </div>

                <h3 className="text-lg font-black font-display uppercase mb-4 leading-tight text-foreground">
                  {item.title}
                </h3>
                
                <div className="w-full h-0.5 bg-brutal-black/10 mb-4" />

                <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
            <Link href="/signup?role=creator">
              <Button size="lg" variant="brutal-accent" className="text-lg py-6 px-10">
                Start as Creator
                <ArrowRight className="ml-2 w-6 h-6" strokeWidth={3} />
              </Button>
            </Link>
        </div>
      </div>
    </section>
  );
}
