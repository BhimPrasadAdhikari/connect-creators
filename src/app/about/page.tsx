import Link from "next/link";
import { Heart, Users, Globe, Target, ArrowRight, Star } from "lucide-react";
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
  { name: "Bhim Prasad Adhikari", role: "Founder & CEO", color: "bg-accent-blue" },
  { name: "Coming Soon", role: "CTO", color: "bg-accent-pink" },
  { name: "Coming Soon", role: "Head of Design", color: "bg-accent-yellow" },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-background font-sans text-foreground">
      <Header />

      {/* Hero */}
      <section className="bg-primary text-white py-12 border-b-4 border-brutal-black relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-20" 
             style={{ backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
        </div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-block transform -rotate-2 mb-8">
            <span className="bg-card text-foreground border-3 border-brutal-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] px-6 py-2 font-black uppercase tracking-widest text-sm sm:text-base flex items-center gap-2">
              <Star className="w-4 h-4 fill-foreground" /> Since 2024
            </span>
          </div>
          
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black mb-6 font-display uppercase tracking-tighter text-white drop-shadow-[6px_6px_0px_rgba(0,0,0,1)]">
            About <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-pink to-accent-yellow">CreatorConnect</span>
          </h1>
          
          <div className="max-w-3xl mx-auto bg-brutal-black/20 p-6 sm:p-8 border-2 border-white/20 backdrop-blur-sm transform rotate-1">
            <p className="text-xl sm:text-2xl font-bold font-mono text-white/90 leading-relaxed">
              Empowering creators in South Asia to build sustainable businesses doing what they love.
            </p>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-24 border-b-4 border-brutal-black bg-accent-green">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center bg-card border-4 border-brutal-black shadow-brutal p-8 sm:p-12">
            <h2 className="text-4xl font-black mb-8 font-display uppercase bg-brutal-black text-brutal-white inline-block px-4 py-1 transform -rotate-2">
                Our Mission
            </h2>
            <p className="text-xl sm:text-2xl text-foreground font-bold mb-8 leading-snug">
              We believe every creator deserves the tools to monetize their passion. 
              CreatorConnect was built to solve the unique challenges faced by creators 
              in Nepal and India — from payment processing to audience building.
            </p>
            <p className="text-lg text-muted-foreground font-mono font-medium border-t-4 border-dashed border-brutal-black pt-8">
              Our platform takes only <span className="bg-accent-yellow text-foreground px-1 border border-brutal-black">10%</span> so creators keep more of what they earn, 
              with support for regional payment methods like UPI, eSewa, and Khalti.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
              <h2 className="text-4xl font-black text-foreground mb-2 font-display uppercase">Our Core Values</h2>
              <div className="w-24 h-2 bg-brutal-black mx-auto"></div>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, idx) => (
              <Card key={value.title} variant="brutal" className={`text-center hover:translate-y-[-8px] transition-transform duration-300 ${idx % 2 === 0 ? 'bg-secondary/5' : 'bg-card'}`}>
                <CardContent className="py-10 px-6">
                  <div className="w-16 h-16 bg-secondary text-white border-2 border-brutal-black flex items-center justify-center mx-auto mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <value.icon className="w-8 h-8" strokeWidth={2.5} />
                  </div>
                  <h3 className="text-xl font-black text-foreground mb-3 font-display uppercase">{value.title}</h3>
                  <p className="text-muted-foreground font-bold text-sm font-mono leading-relaxed">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-24 bg-secondary/10 border-y-4 border-brutal-black">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-black text-foreground text-center mb-16 font-display uppercase">
            Meet The Team
          </h2>
          <div className="grid md:grid-cols-3 gap-10 max-w-4xl mx-auto">
            {team.map((member) => (
              <div key={member.role} className="text-center group">
                <div className={`w-40 h-40 ${member.color} border-4 border-brutal-black mx-auto mb-6 flex items-center justify-center shadow-brutal group-hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all overflow-hidden relative`}>
                  <Users className="w-16 h-16 text-brutal-black opacity-20 absolute" />
                  <span className="text-4xl font-black text-brutal-black relative z-10">{member.name.charAt(0)}</span>
                </div>
                <h3 className="text-xl font-black text-foreground font-display uppercase">{member.name}</h3>
                <p className="text-muted-foreground text-sm font-mono font-bold uppercase tracking-widest mt-1 bg-card inline-block px-2 border border-brutal-black">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-accent-blue border-t-4 border-brutal-black">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl sm:text-6xl font-black mb-6 font-display uppercase text-white drop-shadow-[4px_4px_0px_#000]">Join Our Journey</h2>
          <p className="text-white font-bold font-mono text-lg mb-10 max-w-xl mx-auto bg-black/30 p-2">
            Whether you&apos;re a creator or a fan, be part of the revolution.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link href="/signup?role=creator">
              <Button size="lg" variant="brutal" className="bg-primary text-white hover:bg-white hover:text-primary border-white text-xl px-12 py-8 w-full sm:w-auto shadow-brutal">
                Start Creating
                <ArrowRight className="w-6 h-6 ml-3" strokeWidth={3} />
              </Button>
            </Link>
            <Link href="/careers">
              <Button size="lg" variant="brutal" className="bg-secondary text-white hover:bg-white hover:text-secondary border-brutal-black text-xl px-12 py-8 w-full sm:w-auto shadow-brutal">
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
