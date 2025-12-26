import Link from "next/link";
import { Check, ArrowRight, Calculator } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button, Card, CardContent } from "@/components/ui";
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

      {/* Hero */}
      <section className="bg-gradient-to-br from-primary to-primary-700 text-white py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">Simple, Transparent Pricing</h1>
          <p className="text-xl text-primary-100 max-w-2xl mx-auto">
            We only make money when you do. Creators keep up to 88% of their earnings.
          </p>
        </div>
      </section>

      {/* For Creators */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">
              For Creators
            </span>
            <h2 className="text-3xl font-bold text-foreground">Start Free, Pay Only When You Earn</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {creatorPlans.map((plan) => (
              <Card
                key={plan.name}
                className={`relative ${plan.popular ? "border-2 border-primary" : ""}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-primary text-white text-sm font-medium px-3 py-1 rounded-full">
                      Most Popular
                    </span>
                  </div>
                )}
                <CardContent className="p-8">
                  <h3 className="text-xl font-semibold text-foreground mb-2">{plan.name}</h3>
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                    <span className="text-muted-foreground ml-1">/{plan.period}</span>
                  </div>
                  <p className="text-muted-foreground mb-6">{plan.description}</p>
                  
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-accent-green flex-shrink-0 mt-0.5" />
                        <span className="text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Link href={plan.href}>
                    <Button
                      className="w-full"
                      variant={plan.popular ? "primary" : "outline"}
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
      <section className="py-20 bg-card">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1 bg-accent-green/10 text-accent-green rounded-full text-sm font-medium mb-4">
              For Fans
            </span>
            <h2 className="text-3xl font-bold text-foreground">Subscribe to Creators You Love</h2>
            <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
              Subscription prices are set by individual creators. You only pay for what you subscribe to.
            </p>
          </div>

          <div className="max-w-2xl mx-auto">
            <Card>
              <CardContent className="p-8">
                <ul className="space-y-4">
                  {fanFeatures.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-accent-green flex-shrink-0 mt-0.5" />
                      <span className="text-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <div className="mt-8 pt-8 border-t border-border text-center">
                  <Link href="/explore">
                    <Button size="lg">
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
      <section className="py-20 bg-muted">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">
              <Calculator className="w-4 h-4 inline mr-1" />
              Calculate Your Earnings
            </span>
            <h2 className="text-3xl font-bold text-foreground">See What You&apos;ll Earn</h2>
            <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
              Use our calculator to see exactly how much you&apos;ll earn after platform and payment fees.
            </p>
          </div>

          <div className="max-w-md mx-auto">
            <EarningsCalculator />
          </div>
        </div>
      </section>

      {/* Payment Methods */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground">Payment Methods & Fees</h2>
            <p className="text-muted-foreground mt-4">
              We support multiple payment options. Lower fees = more earnings for you!
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-4 max-w-3xl mx-auto">
            {paymentMethods.map((method) => (
              <div
                key={method.name}
                className="bg-muted rounded-lg border border-border px-6 py-4 text-center min-w-[140px]"
              >
                <p className="font-semibold text-foreground">{method.name}</p>
                <p className="text-sm text-muted-foreground">{method.region}</p>
                <p className="text-sm font-medium text-accent-green mt-1">{method.fee} fee</p>
              </div>
            ))}
          </div>

          <p className="text-center text-sm text-muted-foreground mt-8 max-w-xl mx-auto">
            💡 <strong>Pro tip:</strong> Encourage your Indian fans to pay via UPI for the lowest fees. 
            You&apos;ll keep more of what they pay!
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-foreground text-center mb-12">Pricing FAQ</h2>
          
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
    <details className="group bg-card rounded-lg border border-border">
      <summary className="flex items-center justify-between p-4 cursor-pointer list-none">
        <span className="font-medium text-foreground">{question}</span>
        <span className="text-muted-foreground group-open:rotate-180 transition-transform">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      </summary>
      <div className="px-4 pb-4 text-muted-foreground">{answer}</div>
    </details>
  );
}
