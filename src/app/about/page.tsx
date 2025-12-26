import Link from "next/link";
import { Heart, Users, Globe, Target, ArrowRight } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button, Card, CardContent } from "@/components/ui";

export const metadata = {
  title: "About Us | CreatorConnect",
  description: "Learn about CreatorConnect's mission to empower creators in South Asia.",
};

const values = [
  {
    icon: Heart,
    title: "Creator First",
    description: "Everything we build is designed to help creators succeed and earn fairly.",
  },
  {
    icon: Users,
    title: "Community",
    description: "We foster genuine connections between creators and their supporters.",
  },
  {
    icon: Globe,
    title: "Local Focus",
    description: "Built specifically for South Asia with regional payment methods and languages.",
  },
  {
    icon: Target,
    title: "Transparency",
    description: "Clear pricing, no hidden fees, and honest communication always.",
  },
];

const team = [
  { name: "Bhim Prasad Adhikari", role: "Founder & CEO", image: null },
  { name: "Coming Soon", role: "CTO", image: null },
  { name: "Coming Soon", role: "Head of Design", image: null },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-background">
      <Header />

      {/* Hero */}
      <section className="bg-gradient-to-br from-primary to-primary-700 text-white py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">About CreatorConnect</h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            Empowering creators in South Asia to build sustainable businesses doing what they love.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-foreground mb-6">Our Mission</h2>
            <p className="text-lg text-muted-foreground mb-8">
              We believe every creator deserves the tools to monetize their passion. 
              CreatorConnect was built to solve the unique challenges faced by creators 
              in Nepal and India — from payment processing to audience building.
            </p>
            <p className="text-lg text-muted-foreground">
              Our platform takes only 10% so creators keep more of what they earn, 
              with support for regional payment methods like UPI, eSewa, and Khalti.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-foreground text-center mb-12">Our Values</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value) => (
              <Card key={value.title} className="text-center">
                <CardContent className="py-8">
                  <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <value.icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{value.title}</h3>
                  <p className="text-muted-foreground text-sm">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-foreground text-center mb-12">Our Team</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-3xl mx-auto">
            {team.map((member) => (
              <div key={member.name} className="text-center">
                <div className="w-24 h-24 bg-muted rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Users className="w-10 h-10 text-muted-foreground" />
                </div>
                <h3 className="font-semibold text-foreground">{member.name}</h3>
                <p className="text-muted-foreground text-sm">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Join Our Journey</h2>
          <p className="text-white/80 mb-8 max-w-xl mx-auto">
            Whether you&apos;re a creator or a fan, be part of the revolution.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup?role=creator">
              <Button size="lg" className="bg-white text-primary hover:bg-white/90">
                Start Creating
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link href="/careers">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                Join Our Team
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
