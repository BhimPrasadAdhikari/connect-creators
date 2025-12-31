import Link from "next/link";
import { Check, ArrowRight, Calculator, Sparkles } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button, Card, CardContent, TrustBadge, TrustBadgeGroup } from "@/components/ui";
import { EarningsCalculator } from "@/components/ui/EarningsCalculator";

export const metadata = {
  title: "Pricing | CreatorConnect",
  description: "Simple, transparent pricing for creators. CreatorConnect takes only 10%.",
};

const creatorPlans = [
  {
    name: "Free",
    price: "₹0",
    period: "forever",
    description: "Get started and grow your audience",
    features: [
      "Unlimited free posts",
      "Basic profile customization",
      "Up to 3 subscription tiers",
      "Standard support",
      "Basic analytics",
    ],
    cta: "Start Free",
    href: "/signup?role=creator",
    popular: false,
  },
  {
    name: "Pro",
    price: "10%",
    period: "of earnings",
    description: "Everything you need to monetize",
    features: [
      "Everything in Free",
      "Unlimited subscription tiers",
      "Priority support",
      "Advanced analytics",
      "Custom branding",
      "Early access to new features",
      "Keep ~88% after all fees",
    ],
    cta: "Start Earning",
    href: "/signup?role=creator",
    popular: true,
  },
];

const fanFeatures = [
  "Support your favorite creators directly",
  "Access exclusive content instantly",
  "Cancel anytime - no commitments",
  "Multiple payment options (UPI, cards, eSewa, Khalti)",
  "Secure, encrypted payments",
  "Personalized content feed",
];

const paymentMethods = [
  { name: "UPI", region: "India", fee: "~2%" },
  { name: "Cards", region: "International", fee: "~2.5%" },
  { name: "eSewa", region: "Nepal", fee: "~2%" },
  { name: "Khalti", region: "Nepal", fee: "~2%" },
  { name: "Bank Transfer", region: "All", fee: "~1%" },
];

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-background">
      <Header />

      {/* Hero - Neubrutalist Style */}
      <section className="bg-primary text-white py-12 border-b-4 border-brutal-black relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-20" 
             style={{ backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
        </div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-block transform -rotate-2 mb-8">
            <span className="bg-card text-foreground border-3 border-brutal-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] px-6 py-2 font-black uppercase tracking-widest text-sm sm:text-base">
              Simple & Transparent
            </span>
          </div>
          
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black mb-6 font-display uppercase tracking-tighter text-white drop-shadow-[6px_6px_0px_rgba(0,0,0,1)]">
            Pricing
          </h1>
          
          <div className="max-w-3xl mx-auto bg-brutal-black/20 p-6 sm:p-8 border-2 border-white/20 backdrop-blur-sm transform rotate-1 mb-8">
            <p className="text-xl sm:text-2xl font-bold font-mono text-white/90 leading-relaxed">
              We only make money when you do. <span className="text-accent-yellow">Creators keep ~88%</span> of their earnings.
            </p>
          </div>

          <TrustBadgeGroup className="justify-center">
            <TrustBadge type="secured" className="trust-badge-verified border-2 border-brutal-black" />
          </TrustBadgeGroup>
        </div>
      </section>

      {/* For Creators */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-2 border-3 border-brutal-black bg-primary/20 text-primary font-bold text-sm mb-4">
              FOR CREATORS
            </span>
            <h2 className="font-display text-display-sm sm:text-display font-bold text-foreground">
              Start Free, Pay Only When You Earn
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {creatorPlans.map((plan) => (
              <Card
                key={plan.name}
                variant={plan.popular ? "brutal" : "brutal"}
                className={`relative ${plan.popular ? "border-primary bg-primary/5" : ""}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-primary text-white text-sm font-bold px-4 py-2 border-3 border-brutal-black shadow-brutal-sm">
                      MOST POPULAR
                    </span>
                  </div>
                )}
                <CardContent className="p-8">
                  <h3 className="font-display text-2xl font-bold text-foreground mb-2">{plan.name}</h3>
                  <div className="mb-4">
                    <span className="font-display text-display-sm font-bold text-foreground">{plan.price}</span>
                    <span className="text-muted-foreground font-mono text-sm ml-1">/{plan.period}</span>
                  </div>
                  <p className="text-muted-foreground mb-6">{plan.description}</p>
                  
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2">
                        <div className="w-5 h-5 border-2 border-secondary bg-secondary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check className="w-3 h-3 text-secondary" />
                        </div>
                        <span className="text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Link href={plan.href}>
                    <Button
                      className="w-full"
                      variant={plan.popular ? "brutal-accent" : "brutal"}
                    >
                      {plan.cta}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* For Fans */}
      <section className="py-20 bg-brutal-cream border-y-4 border-brutal-black">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-2 border-3 border-brutal-black bg-secondary/10 text-secondary font-bold text-sm mb-4">
              FOR FANS
            </span>
            <h2 className="font-display text-display-sm sm:text-display font-bold text-foreground">
              Subscribe to Creators You Love
            </h2>
            <p className="text-muted-foreground mt-4 max-w-xl mx-auto text-lg">
              Subscription prices are set by individual creators. You only pay for what you subscribe to.
            </p>
          </div>

          <div className="max-w-2xl mx-auto">
            <Card variant="brutal">
              <CardContent className="p-8">
                <ul className="space-y-4">
                  {fanFeatures.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <div className="w-6 h-6 border-2 border-secondary bg-secondary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="w-4 h-4 text-secondary" />
                      </div>
                      <span className="text-foreground font-medium">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <div className="mt-8 pt-8 border-t-2 border-brutal-black text-center">
                  <Link href="/explore">
                    <Button variant="brutal-accent" size="lg">
                      Explore Creators
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Earnings Calculator */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-2 border-3 border-brutal-black bg-primary/20 text-primary font-bold text-sm mb-4">
              <Calculator className="w-4 h-4 inline mr-1" />
              CALCULATE EARNINGS
            </span>
            <h2 className="font-display text-display-sm sm:text-display font-bold text-foreground">
              See What You&apos;ll Earn
            </h2>
            <p className="text-muted-foreground mt-4 max-w-xl mx-auto text-lg">
              Use our calculator to see exactly how much you&apos;ll earn after platform and payment fees.
            </p>
          </div>

          <div className="max-w-md mx-auto">
            <EarningsCalculator />
          </div>
        </div>
      </section>

      {/* Payment Methods */}
      <section className="py-20 bg-brutal-cream border-y-4 border-brutal-black">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-display text-display-sm sm:text-display font-bold text-foreground">
              Payment Methods & Fees
            </h2>
            <p className="text-muted-foreground mt-4 text-lg">
              We support multiple payment options. Lower fees = more earnings for you!
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-4 max-w-4xl mx-auto">
            {paymentMethods.map((method) => (
              <div
                key={method.name}
                className="bg-card border-3 border-brutal-black shadow-brutal-sm hover:shadow-brutal transition-shadow px-6 py-4 text-center min-w-[160px]"
              >
                <p className="font-display font-bold text-foreground text-lg">{method.name}</p>
                <p className="text-sm text-muted-foreground font-mono">{method.region}</p>
                <p className="text-sm font-bold text-secondary mt-1">{method.fee} fee</p>
              </div>
            ))}
          </div>

          <div className="mt-8 max-w-xl mx-auto p-4 bg-accent-yellow/20 border-3 border-brutal-black text-center">
            <p className="text-sm text-foreground">
              💡 <strong>Pro tip:</strong> Encourage your Indian fans to pay via UPI for the lowest fees. 
              You&apos;ll keep more of what they pay!
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-display-sm sm:text-display font-bold text-foreground text-center mb-12">
            Pricing FAQ
          </h2>
          
          <div className="max-w-2xl mx-auto space-y-4">
            <FAQItem
              question="When do creators get paid?"
              answer="Payments are processed monthly. Once you reach the minimum payout threshold (₹500 for India, NPR 1000 for Nepal), funds are transferred to your linked bank account within 7 business days."
            />
            <FAQItem
              question="Are there any hidden fees?"
              answer="No hidden fees. We take 10% of your earnings, and payment processing fees (typically 2-3%) are included in this. You keep 90% of what subscribers pay."
            />
            <FAQItem
              question="Can I change my subscription tier prices?"
              answer="Yes, you can update tier prices anytime. Existing subscribers will continue at their current rate until they cancel and resubscribe."
            />
            <FAQItem
              question="What happens if a fan disputes a payment?"
              answer="We handle disputes through our payment partners. Excessive chargebacks may affect your account standing."
            />
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  return (
    <details className="group bg-card border-3 border-brutal-black shadow-brutal-sm">
      <summary className="flex items-center justify-between p-4 cursor-pointer list-none min-h-touch">
        <span className="font-display font-bold text-foreground">{question}</span>
        <span className="text-muted-foreground group-open:rotate-180 transition-transform">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      </summary>
      <div className="px-4 pb-4 text-muted-foreground border-t-2 border-brutal-black pt-4">{answer}</div>
    </details>
  );
}

