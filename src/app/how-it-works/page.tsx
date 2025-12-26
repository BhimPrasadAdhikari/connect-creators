import Link from "next/link";
import {
  UserPlus,
  Layers,
  Upload,
  CreditCard,
  Heart,
  Search,
  Star,
  TrendingUp,
  Shield,
  Zap,
  ArrowRight,
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button, Card, CardContent } from "@/components/ui";

const creatorSteps = [
  {
    icon: UserPlus,
    title: "Create Your Profile",
    description:
      "Sign up as a creator and set up your profile with your bio, social links, and cover image. Tell your story and let fans know what you're about.",
  },
  {
    icon: Layers,
    title: "Set Up Subscription Tiers",
    description:
      "Create multiple subscription tiers with different prices and benefits. Offer exclusive perks for your most dedicated supporters.",
  },
  {
    icon: Upload,
    title: "Publish Exclusive Content",
    description:
      "Share posts, tutorials, behind-the-scenes, and more. Control which content is free and which requires a subscription.",
  },
  {
    icon: CreditCard,
    title: "Get Paid Monthly",
    description:
      "Receive payments directly to your account. We support UPI, bank transfer, eSewa, Khalti, and international cards.",
  },
];

const fanSteps = [
  {
    icon: Search,
    title: "Discover Creators",
    description:
      "Browse our explore page to find creators you love. Filter by category, search by name, or discover trending creators.",
  },
  {
    icon: Star,
    title: "Choose Your Tier",
    description:
      "Every creator offers different subscription tiers. Pick the one that matches your budget and desired benefits.",
  },
  {
    icon: CreditCard,
    title: "Subscribe Securely",
    description:
      "Pay using your preferred method - UPI, cards, eSewa, Khalti, or bank transfer. Your payment is secure and encrypted.",
  },
  {
    icon: Heart,
    title: "Enjoy Exclusive Content",
    description:
      "Access premium posts, tutorials, live sessions, and more. Connect directly with your favorite creators.",
  },
];

const benefits = [
  {
    icon: Shield,
    title: "Secure Payments",
    description: "Bank-grade encryption and trusted payment partners keep your transactions safe.",
  },
  {
    icon: TrendingUp,
    title: "Low Platform Fee",
    description: "We take only 10% so creators keep more of what they earn.",
  },
  {
    icon: Zap,
    title: "Instant Access",
    description: "Subscribe and immediately unlock all exclusive content from your favorite creators.",
  },
];

export default function HowItWorksPage() {
  return (
    <main className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary to-primary-700 text-white py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            How CreatorConnect Works
          </h1>
          <p className="text-xl text-primary-100 max-w-2xl mx-auto">
            Whether you&apos;re a creator looking to monetize your content or a fan wanting to support your favorites, we make it simple.
          </p>
        </div>
      </section>

      {/* For Creators Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">
              For Creators
            </span>
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Start Earning in 4 Simple Steps
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Turn your passion into income. Set up once, earn monthly from your dedicated fanbase.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {creatorSteps.map((step, index) => (
              <div key={step.title} className="relative">
                {/* Connector Line */}
                {index < creatorSteps.length - 1 && (
                  <div className="hidden lg:block absolute top-12 left-1/2 w-full h-0.5 bg-primary/20" />
                )}
                
                <Card className="relative h-full">
                  <CardContent className="pt-6">
                    {/* Step Number */}
                    <div className="absolute -top-4 left-6 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 mt-2">
                      <step.icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      {step.title}
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      {step.description}
                    </p>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/signup?role=creator">
              <Button size="lg">
                Start as Creator
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="container mx-auto px-4">
        <div className="h-px bg-border" />
      </div>

      {/* For Fans Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1 bg-accent-green/10 text-accent-green rounded-full text-sm font-medium mb-4">
              For Fans
            </span>
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Support Creators You Love
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Get exclusive access to premium content and connect directly with your favorite creators.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {fanSteps.map((step, index) => (
              <div key={step.title} className="relative">
                {/* Connector Line */}
                {index < fanSteps.length - 1 && (
                  <div className="hidden lg:block absolute top-12 left-1/2 w-full h-0.5 bg-accent-green/20" />
                )}
                
                <Card className="relative h-full">
                  <CardContent className="pt-6">
                    {/* Step Number */}
                    <div className="absolute -top-4 left-6 w-8 h-8 bg-accent-green text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    
                    <div className="w-12 h-12 bg-accent-green/10 rounded-lg flex items-center justify-center mb-4 mt-2">
                      <step.icon className="w-6 h-6 text-accent-green" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      {step.title}
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      {step.description}
                    </p>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/explore">
              <Button size="lg" variant="secondary">
                Explore Creators
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-muted">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Why Choose CreatorConnect?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We built this platform with creators and fans in mind.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {benefits.map((benefit) => (
              <Card key={benefit.title} className="text-center">
                <CardContent className="py-8">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <benefit.icon className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {benefit.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Preview Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-foreground mb-8 text-center">
              Frequently Asked Questions
            </h2>
            
            <div className="space-y-4">
              <FAQItem
                question="How much does it cost to use CreatorConnect?"
                answer="Signing up and creating a profile is completely free. We only take a 10% platform fee when you earn money from subscriptions. Fans pay the subscription price set by creators."
              />
              <FAQItem
                question="What payment methods are supported?"
                answer="We support UPI for India, eSewa and Khalti for Nepal, international cards (Visa/Mastercard), and bank transfers. We're always adding more options."
              />
              <FAQItem
                question="When do creators get paid?"
                answer="Payments are processed monthly. Once you reach the minimum payout threshold (₹500 / NPR 1000), funds are transferred to your linked bank account."
              />
              <FAQItem
                question="Can I cancel my subscription anytime?"
                answer="Yes! Fans can cancel their subscriptions at any time. You'll continue to have access until the end of your billing period."
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-primary-100 mb-8 max-w-xl mx-auto">
            Join thousands of creators and fans already using CreatorConnect.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup?role=creator">
              <Button size="lg" className="bg-white text-primary hover:bg-primary-50">
                Start as Creator
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                Sign Up as Fan
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
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
      <div className="px-4 pb-4 text-muted-foreground">
        {answer}
      </div>
    </details>
  );
}
