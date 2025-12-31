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
  HelpCircle,
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
    <main className="min-h-screen bg-background font-sans text-foreground">
      <Header />

      {/* Hero Section */}
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
            How It Works
          </h1>
          
          <div className="max-w-3xl mx-auto bg-brutal-black/20 p-6 sm:p-8 border-2 border-white/20 backdrop-blur-sm transform rotate-1">
            <p className="text-xl sm:text-2xl font-bold font-mono text-white/90 leading-relaxed">
              Whether you&apos;re a creator looking to monetize or a fan wanting to support, we make it simple.
            </p>
          </div>
        </div>
      </section>

      {/* For Creators Section */}
      <section className="py-24 bg-secondary/20 border-b-4 border-brutal-black">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 bg-card text-foreground text-lg font-black uppercase tracking-widest mb-4 shadow-brutal border-2 border-white transform rotate-1">
              For Creators
            </span>
            <h2 className="text-4xl sm:text-5xl font-black text-foreground mb-4 font-display uppercase">
              Start Earning in 4 Steps
            </h2>
            <p className="text-lg font-bold font-mono text-foreground/80 max-w-2xl mx-auto">
              Turn your passion into income. Set up once, earn monthly from your dedicated fanbase.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {creatorSteps.map((step, index) => (
              <div key={step.title} className="relative group">
                {/* Connector Line */}
                {index < creatorSteps.length - 1 && (
                  <div className="hidden lg:block absolute top-[60px] -right-4 w-8 h-1 bg-brutal-black z-0" />
                )}
                
                <Card variant="brutal" className="relative h-full bg-card group-hover:bg-card group-hover:-translate-y-2 transition-transform duration-300">
                  <CardContent className="pt-8 pb-8 px-6 text-center">
                    {/* Step Number */}
                    <div className="absolute -top-5 left-1/2 -translate-x-1/2 w-10 h-10 bg-secondary text-white border-2 border-brutal-black flex items-center justify-center text-lg font-black shadow-brutal-sm z-10">
                      {index + 1}
                    </div>
                    
                    <div className="w-16 h-16 bg-secondary border-2 border-brutal-black flex items-center justify-center mb-6 mx-auto shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                      <step.icon className="w-8 h-8 text-white" strokeWidth={2.5} />
                    </div>
                    <h3 className="text-xl font-black text-foreground mb-3 uppercase font-display leading-tight">
                      {step.title}
                    </h3>
                    <p className="text-foreground font-medium text-sm leading-relaxed border-t-2 border-brutal-black/10 pt-3">
                      {step.description}
                    </p>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>

          <div className="text-center mt-16">
            <Link href="/signup?role=creator">
              <Button size="lg" variant="brutal" className="bg-primary text-white text-xl px-10 py-8 hover:bg-white hover:text-primary border-3 border-brutal-black shadow-brutal hover:scale-105 active:scale-95 transition-all">
                Start as Creator
                <ArrowRight className="w-6 h-6 ml-3" strokeWidth={3} />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* For Fans Section */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 bg-card text-foreground text-lg font-black uppercase tracking-widest mb-4 shadow-brutal border-2 border-brutal-black transform -rotate-1">
              For Fans
            </span>
            <h2 className="text-4xl sm:text-5xl font-black text-foreground mb-4 font-display uppercase">
              Support Creators You Love
            </h2>
            <p className="text-lg font-bold font-mono text-muted-foreground max-w-2xl mx-auto">
              Get exclusive access to premium content and connect directly with your favorite creators.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {fanSteps.map((step, index) => (
              <div key={step.title} className="relative group">
                <Card variant="brutal" className="relative h-full bg-secondary/10 border-dashed hover:bg-secondary/20 transition-colors">
                  <CardContent className="pt-8 pb-8 px-6 text-center">
                     <div className="w-16 h-16 bg-secondary text-white border-2 border-brutal-black flex items-center justify-center mb-6 mx-auto shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-none">
                      <step.icon className="w-8 h-8" strokeWidth={2.5} />
                    </div>
                    <h3 className="text-xl font-black text-foreground mb-3 uppercase font-display leading-tight">
                      {step.title}
                    </h3>
                    <p className="text-muted-foreground font-bold font-mono text-xs leading-relaxed uppercase tracking-wide">
                      {step.description}
                    </p>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>

          <div className="text-center mt-16">
            <Link href="/explore">
              <Button size="lg" variant="brutal" className="bg-secondary text-white text-xl px-10 py-8 hover:bg-white hover:text-secondary border-3 border-brutal-black shadow-brutal hover:scale-105 active:scale-95 transition-all">
                Explore Creators
                <ArrowRight className="w-6 h-6 ml-3" strokeWidth={3} />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 bg-primary text-primary-foreground border-y-4 border-brutal-black">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-black mb-4 font-display uppercase text-white">
              Why Choose CreatorConnect?
            </h2>
            <p className="text-white/90 font-mono text-lg max-w-2xl mx-auto">
              We built this platform with creators and fans in mind.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {benefits.map((benefit) => (
              <div key={benefit.title} className="bg-card text-foreground p-8 border-4 border-accent-blue shadow-[8px_8px_0px_0px_#3b82f6] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-transform">
                  <div className="w-14 h-14 bg-primary text-white flex items-center justify-center mb-6 border-2 border-brutal-black">
                    <benefit.icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-2xl font-black mb-3 uppercase font-display">
                    {benefit.title}
                  </h3>
                  <p className="font-medium text-sm leading-relaxed">
                    {benefit.description}
                  </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Preview Section */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-center gap-4 mb-12">
                 <HelpCircle className="w-10 h-10 text-foreground" strokeWidth={3} />
                 <h2 className="text-4xl font-black text-foreground text-center font-display uppercase">
                   Frequently Asked Questions
                 </h2>
              </div>
            
            <div className="space-y-6">
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
      <section className="py-24 bg-accent-blue border-t-4 border-brutal-black">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl sm:text-6xl font-black mb-6 text-white font-display uppercase drop-shadow-[4px_4px_0px_#000]">
            Ready to Get Started?
          </h2>
          <p className="text-white font-bold font-mono text-lg mb-10 max-w-xl mx-auto bg-black/30 p-2">
            Join thousands of creators and fans already using CreatorConnect.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link href="/signup?role=creator">
              <Button size="lg" variant="brutal" className="bg-primary text-white hover:bg-white hover:text-primary border-white text-xl px-12 py-8 w-full sm:w-auto shadow-brutal">
                Start as Creator
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="lg" variant="brutal" className="bg-secondary text-white hover:bg-white hover:text-secondary border-brutal-black text-xl px-12 py-8 w-full sm:w-auto shadow-brutal">
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
    <details className="group bg-card border-2 border-brutal-black shadow-brutal open:shadow-none open:translate-x-[4px] open:translate-y-[4px] transition-all">
      <summary className="flex items-center justify-between p-6 cursor-pointer list-none bg-secondary/5 group-hover:bg-secondary/10 transition-colors">
        <span className="font-bold text-lg text-foreground font-display uppercase">{question}</span>
        <span className="text-foreground group-open:rotate-180 transition-transform duration-300 border-2 border-brutal-black p-1 bg-card shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      </summary>
      <div className="px-6 pb-6 pt-2 text-foreground font-medium leading-relaxed border-t-2 border-brutal-black border-dashed">
        {answer}
      </div>
    </details>
  );
}
