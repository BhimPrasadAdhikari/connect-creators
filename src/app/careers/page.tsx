import Link from "next/link";
import { Briefcase, MapPin, Clock, ArrowRight, Zap, Coffee, Code, HeartHandshake } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button, Card, CardContent, Badge } from "@/components/ui";

export const metadata = {
  title: "Careers | CreatorConnect",
  description: "Join the CreatorConnect team and help empower creators in South Asia.",
};

const openPositions = [
  {
    title: "Senior Full-Stack Developer",
    department: "Engineering",
    location: "Remote (Nepal/India)",
    type: "Full-time",
    description: "Build and scale our platform using Next.js, TypeScript, and PostgreSQL.",
    color: "bg-accent-blue"
  },
  {
    title: "Product Designer",
    department: "Design",
    location: "Remote",
    type: "Full-time",
    description: "Design intuitive experiences for creators and fans on our platform.",
    color: "bg-accent-pink"
  },
  {
    title: "Community Manager",
    department: "Operations",
    location: "Kathmandu, Nepal",
    type: "Full-time",
    description: "Build and nurture our creator community across Nepal and India.",
    color: "bg-accent-yellow"
  },
  {
    title: "Marketing Lead",
    department: "Marketing",
    location: "Remote",
    type: "Full-time",
    description: "Drive growth through content marketing, partnerships, and campaigns.",
    color: "bg-accent-green"
  },
];

const benefits = [
  { text: "Competitive salary", icon: Zap },
  { text: "Remote-first culture", icon: MapPin },
  { text: "Flexible working hours", icon: Clock },
  { text: "Health insurance", icon: HeartHandshake },
  { text: "Learning budget", icon: Code },
  { text: "Team retreats", icon: Coffee },
];

export default function CareersPage() {
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
          <div className="inline-block transform rotate-2 mb-8">
             <span className="bg-card text-foreground border-3 border-brutal-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] px-6 py-2 font-black uppercase tracking-widest text-sm sm:text-base">
               We&apos;re Hiring!
             </span>
          </div>
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black mb-6 font-display uppercase tracking-tighter text-white drop-shadow-[6px_6px_0px_rgba(0,0,0,1)]">
            Join Our Team
          </h1>
          
          <div className="max-w-3xl mx-auto bg-brutal-black/20 p-6 sm:p-8 border-2 border-white/20 backdrop-blur-sm transform -rotate-1">
            <p className="text-xl sm:text-2xl font-bold font-mono text-white/90 leading-relaxed">
              Help us build the future of creator monetization in South Asia.
            </p>
          </div>
        </div>
      </section>

      {/* Why Join */}
      <section className="py-24 bg-secondary/5 border-b-4 border-brutal-black">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="text-4xl font-black text-foreground mb-4 font-display uppercase">Why Join CreatorConnect?</h2>
            <p className="text-muted-foreground font-medium text-lg max-w-2xl mx-auto leading-relaxed border-l-4 border-brutal-black pl-4 bg-card py-4 shadow-brutal-sm">
              We&apos;re building something meaningful — empowering creators to earn a living doing what they love. 
              Join us and make a real impact.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {benefits.map((benefit, i) => (
              <div
                key={i}
                className="bg-card border-2 border-brutal-black p-6 flex flex-col items-center justify-center text-center shadow-brutal hover:translate-x-[-2px] hover:translate-y-[-2px] transition-transform"
              >
                <div className="w-12 h-12 bg-secondary text-white border-2 border-brutal-black flex items-center justify-center mb-4 shadow-brutal-sm">
                    <benefit.icon className="w-6 h-6" strokeWidth={2.5} />
                </div>
                <span className="text-foreground font-black uppercase font-display text-lg">{benefit.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Open Positions */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-black text-foreground text-center mb-16 font-display uppercase flex items-center justify-center gap-3">
             <Briefcase className="w-8 h-8" strokeWidth={3} /> Open Positions
          </h2>
          
          <div className="max-w-4xl mx-auto space-y-6">
            {openPositions.map((position) => (
              <Card key={position.title} variant="brutal" className="hover:translate-x-[-4px] hover:translate-y-[-4px] transition-transform group">
                <CardContent className="p-8">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-3">
                        <h3 className="text-2xl font-black text-foreground uppercase font-display">{position.title}</h3>
                        <span className={`inline-block px-3 py-1 text-xs font-black uppercase border border-brutal-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${position.color} text-brutal-black`}>
                            {position.department}
                        </span>
                      </div>
                      <p className="text-muted-foreground font-medium mb-6 text-lg">{position.description}</p>
                      <div className="flex flex-wrap gap-4 text-sm font-bold font-mono text-foreground/70 uppercase">
                        <span className="flex items-center gap-2 bg-secondary/10 px-2 py-1 border border-brutal-black/20">
                          <MapPin className="w-4 h-4" />
                          {position.location}
                        </span>
                        <span className="flex items-center gap-2 bg-secondary/10 px-2 py-1 border border-brutal-black/20">
                          <Clock className="w-4 h-4" />
                          {position.type}
                        </span>
                      </div>
                    </div>
                    <Link href={`mailto:careers@creatorconnect.com?subject=Application: ${position.title}`} className="mt-2 md:mt-0">
                      <Button variant="brutal" className="w-full md:w-auto text-lg px-8 py-6 bg-primary text-white hover:bg-white hover:text-primary border-3 border-brutal-black shadow-brutal">
                        Apply Now
                        <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* No Position? */}
      <section className="py-24 bg-secondary/10 border-t-4 border-brutal-black">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Card variant="brutal" className="max-w-3xl mx-auto text-center bg-secondary text-brutal-black">
            <CardContent className="py-16 px-8">
              <div className="w-20 h-20 bg-card text-secondary border-4 border-brutal-black mx-auto mb-6 flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                 <Briefcase className="w-10 h-10" strokeWidth={3} />
              </div>
              <h3 className="text-3xl font-black text-brutal-black mb-4 font-display uppercase drop-shadow-sm">
                Don&apos;t see a role that fits?
              </h3>
              <p className="text-brutal-black/90 font-bold font-mono text-lg mb-8 max-w-xl mx-auto">
                We&apos;re always looking for talented people. Send us your resume and tell us how you can contribute.
              </p>
              <Link href="mailto:careers@creatorconnect.com">
                <Button size="lg" variant="brutal" className="bg-card text-brutal-black border-brutal-black hover:bg-brutal-black hover:text-brutal-white px-8 py-6 text-xl shadow-brutal">
                  Send Open Application
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </main>
  );
}
