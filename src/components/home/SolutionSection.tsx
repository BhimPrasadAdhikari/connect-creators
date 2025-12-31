"use client";

import { Heart, CreditCard, Users } from "lucide-react";

export function SolutionSection() {
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
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-black text-foreground mb-6 font-display uppercase tracking-tight">
            A direct connection
          </h2>
          <p className="text-lg sm:text-xl font-bold font-mono text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Cut out the middlemen. Build real relationships with your biggest fans.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {solutions.map((solution, index) => (
            <div
              key={index}
              className="text-center p-6 bg-card border-3 border-brutal-black shadow-brutal hover:shadow-brutal-lg hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all"
            >
              <div className="w-16 h-16 border-3 border-brutal-black bg-primary/20 flex items-center justify-center mx-auto mb-4">
                <solution.icon className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-display font-bold text-foreground mb-2">
                {solution.title}
              </h3>
              <p className="text-muted-foreground">
                {solution.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
