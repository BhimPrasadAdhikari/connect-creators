import Link from "next/link";
import { Briefcase, MapPin, Clock, ArrowRight } from "lucide-react";
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
  },
  {
    title: "Product Designer",
    department: "Design",
    location: "Remote",
    type: "Full-time",
    description: "Design intuitive experiences for creators and fans on our platform.",
  },
  {
    title: "Community Manager",
    department: "Operations",
    location: "Kathmandu, Nepal",
    type: "Full-time",
    description: "Build and nurture our creator community across Nepal and India.",
  },
  {
    title: "Marketing Lead",
    department: "Marketing",
    location: "Remote",
    type: "Full-time",
    description: "Drive growth through content marketing, partnerships, and campaigns.",
  },
];

const benefits = [
  "Competitive salary",
  "Remote-first culture",
  "Flexible working hours",
  "Health insurance",
  "Learning budget",
  "Equity options",
  "Annual team retreats",
  "Unlimited PTO",
];

export default function CareersPage() {
  return (
    <main className="min-h-screen bg-background">
      <Header />

      {/* Hero */}
      <section className="bg-gradient-to-br from-primary to-primary-700 text-white py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">Join Our Team</h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            Help us build the future of creator monetization in South Asia.
          </p>
        </div>
      </section>

      {/* Why Join */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Why Join CreatorConnect?</h2>
            <p className="text-muted-foreground">
              We&apos;re building something meaningful — empowering creators to earn a living doing what they love. 
              Join us and make a real impact.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {benefits.map((benefit) => (
              <div
                key={benefit}
                className="bg-card rounded-lg border border-border px-4 py-3 text-center"
              >
                <span className="text-foreground font-medium">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Open Positions */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-foreground text-center mb-12">Open Positions</h2>
          
          <div className="max-w-3xl mx-auto space-y-4">
            {openPositions.map((position) => (
              <Card key={position.title} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-foreground">{position.title}</h3>
                        <Badge variant="accent">{position.department}</Badge>
                      </div>
                      <p className="text-muted-foreground text-sm mb-3">{position.description}</p>
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {position.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {position.type}
                        </span>
                      </div>
                    </div>
                    <Link href={`mailto:careers@creatorconnect.com?subject=Application: ${position.title}`}>
                      <Button>
                        Apply
                        <ArrowRight className="w-4 h-4 ml-1" />
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
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="max-w-2xl mx-auto text-center">
            <CardContent className="py-12">
              <Briefcase className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Don&apos;t see a role that fits?
              </h3>
              <p className="text-muted-foreground mb-6">
                We&apos;re always looking for talented people. Send us your resume and tell us how you can contribute.
              </p>
              <Link href="mailto:careers@creatorconnect.com">
                <Button variant="outline">
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
