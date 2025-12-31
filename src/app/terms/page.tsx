import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent } from "@/components/ui";
import { Scale } from "lucide-react";

export const metadata = {
  title: "Terms of Service | CreatorConnect",
  description: "Read the terms and conditions for using CreatorConnect.",
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-background font-sans text-foreground">
      <Header />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
             <div className="w-16 h-16 bg-card border-2 border-brutal-black flex items-center justify-center mx-auto mb-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                 <Scale className="w-8 h-8 text-brutal-black" strokeWidth={2.5}/>
             </div>
             <h1 className="text-5xl font-black text-foreground mb-4 font-display uppercase">Terms of Service</h1>
             <p className="text-muted-foreground font-mono font-bold bg-secondary/10 inline-block px-3 py-1 border border-brutal-black">Last updated: December 2024</p>
          </div>

          <Card variant="brutal" className="bg-card">
             <CardContent className="p-8 sm:p-12 prose prose-slate dark:prose-invert max-w-none prose-headings:font-display prose-headings:uppercase prose-headings:font-black prose-p:font-medium prose-li:font-medium">
                <section className="mb-10">
                <h2 className="text-2xl border-l-8 border-primary pl-3 bg-secondary/5 py-1">1. Acceptance of Terms</h2>
                <p>
                    By accessing or using CreatorConnect, you agree to be bound by these Terms of Service. 
                    If you do not agree, please do not use our services.
                </p>
                </section>

                <section className="mb-10">
                <h2 className="text-2xl border-l-8 border-accent-pink pl-3 bg-secondary/5 py-1">2. Account Registration</h2>
                <ul className="marker:text-brutal-black marker:font-black">
                    <li>You must be at least 18 years old to create an account</li>
                    <li>You are responsible for maintaining account security</li>
                    <li>One person may only maintain one account</li>
                    <li>Provide accurate and complete information</li>
                </ul>
                </section>

                <section className="mb-10">
                <h2 className="text-2xl border-l-8 border-accent-yellow pl-3 bg-secondary/5 py-1">3. Creator Responsibilities</h2>
                <ul className="marker:text-brutal-black marker:font-black">
                    <li>Provide content as described in your subscription tiers</li>
                    <li>Do not post illegal, harmful, or misleading content</li>
                    <li>Respect intellectual property rights</li>
                    <li>Comply with all applicable laws and regulations</li>
                    <li>Pay applicable taxes on your earnings</li>
                </ul>
                </section>

                <section className="mb-10">
                <h2 className="text-2xl border-l-8 border-accent-green pl-3 bg-secondary/5 py-1">4. Subscriber Responsibilities</h2>
                <ul className="marker:text-brutal-black marker:font-black">
                    <li>Do not share or redistribute paid content</li>
                    <li>Respect creators and other community members</li>
                    <li>Do not engage in harassment or abuse</li>
                    <li>Provide valid payment information</li>
                </ul>
                </section>

                <section className="mb-10">
                <h2 className="text-2xl border-l-8 border-primary pl-3 bg-secondary/5 py-1">5. Payments and Fees</h2>
                <ul className="marker:text-brutal-black marker:font-black">
                    <li>CreatorConnect charges a 10% platform fee on creator earnings</li>
                    <li>Payments are processed monthly</li>
                    <li>Refunds are handled on a case-by-case basis</li>
                    <li>Chargebacks may result in account suspension</li>
                </ul>
                </section>

                <section className="mb-10">
                <h2 className="text-2xl border-l-8 border-accent-pink pl-3 bg-secondary/5 py-1">6. Prohibited Content</h2>
                <p>The following content is strictly prohibited:</p>
                <ul className="marker:text-brutal-black marker:font-black">
                    <li>Illegal content or activities</li>
                    <li>Content exploiting minors</li>
                    <li>Harassment, hate speech, or threats</li>
                    <li>Spam or misleading content</li>
                    <li>Malware or harmful code</li>
                </ul>
                </section>

                <section className="mb-10">
                <h2 className="text-2xl border-l-8 border-accent-yellow pl-3 bg-secondary/5 py-1">7. Termination</h2>
                <p>
                    We may suspend or terminate accounts that violate these terms. 
                    You may delete your account at any time from your settings.
                </p>
                </section>

                <section className="mb-10">
                <h2 className="text-2xl border-l-8 border-accent-green pl-3 bg-secondary/5 py-1">8. Limitation of Liability</h2>
                <p>
                    CreatorConnect is provided &quot;as is&quot; without warranties. We are not liable for 
                    indirect, incidental, or consequential damages arising from your use of the platform.
                </p>
                </section>

                <section className="mb-8 p-6 bg-brutal-black text-brutal-white not-prose border-4 border-double border-brutal-white shadow-brutal-sm">
                <h2 className="text-2xl font-black font-display uppercase mb-2 text-brutal-white">9. Contact</h2>
                <p className="font-mono font-bold mb-0">
                    Questions about these terms? Contact us at{" "}
                    <a href="mailto:legal@creatorconnect.com" className="text-accent-yellow underline decoration-2 underline-offset-4 hover:text-white">
                    legal@creatorconnect.com
                    </a>
                </p>
                </section>
             </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </main>
  );
}
