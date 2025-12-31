"use client";

import { TrendingDown, CreditCard, Users } from "lucide-react";

export function ProblemSection() {
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
    <section className="py-20 bg-brutal-cream border-y-4 border-brutal-black">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-black text-foreground mb-6 font-display uppercase tracking-tight">
            Why creators struggle
          </h2>
          <p className="text-lg sm:text-xl font-bold font-mono text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            The current system is broken. Creators work hard but don&apos;t own their audience or income.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {problems.map((problem, index) => (
            <div 
              key={index} 
              className="text-center p-6 bg-card border-3 border-brutal-black shadow-brutal-sm hover:shadow-brutal hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all"
            >
              <div className="w-16 h-16 border-3 border-brutal-black bg-accent-red/10 flex items-center justify-center mx-auto mb-4">
                <problem.icon className="w-8 h-8 text-accent-red" />
              </div>
              <h3 className="text-xl font-display font-bold text-foreground mb-2">{problem.title}</h3>
              <p className="text-muted-foreground">{problem.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
