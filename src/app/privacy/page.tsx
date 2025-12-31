import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent } from "@/components/ui";

export const metadata = {
  title: "Privacy Policy | CreatorConnect",
  description: "Learn how CreatorConnect collects, uses, and protects your personal information.",
};

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-background font-sans text-foreground">
      <Header />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
             <h1 className="text-5xl font-black text-foreground mb-4 font-display uppercase">Privacy Policy</h1>
             <p className="text-muted-foreground font-mono font-bold bg-secondary/10 inline-block px-3 py-1 border border-brutal-black">Last updated: December 2024</p>
          </div>

          <Card variant="brutal" className="bg-card">
             <CardContent className="p-8 sm:p-12 prose prose-slate dark:prose-invert max-w-none prose-headings:font-display prose-headings:uppercase prose-headings:font-black prose-p:font-medium prose-li:font-medium">
                <section className="mb-10">
                <h2 className="text-2xl border-l-8 border-primary pl-3 bg-secondary/5 py-1">1. Information We Collect</h2>
                <p>
                    We collect information you provide directly, including:
                </p>
                <ul className="marker:text-brutal-black marker:font-black">
                    <li>Account information (name, email, password)</li>
                    <li>Profile information (bio, avatar, social links)</li>
                    <li>Payment information (processed securely by our payment partners)</li>
                    <li>Content you create (posts, comments, messages)</li>
                    <li>Communications with us (support requests, feedback)</li>
                </ul>
                </section>

                <section className="mb-10">
                <h2 className="text-2xl border-l-8 border-accent-pink pl-3 bg-secondary/5 py-1">2. How We Use Your Information</h2>
                <ul className="marker:text-brutal-black marker:font-black">
                    <li>Provide and maintain our services</li>
                    <li>Process payments and subscriptions</li>
                    <li>Send important notifications and updates</li>
                    <li>Improve and personalize your experience</li>
                    <li>Protect against fraud and abuse</li>
                    <li>Comply with legal obligations</li>
                </ul>
                </section>

                <section className="mb-10">
                <h2 className="text-2xl border-l-8 border-accent-yellow pl-3 bg-secondary/5 py-1">3. Information Sharing</h2>
                <p>
                    We do not sell your personal information. We may share data with:
                </p>
                <ul className="marker:text-brutal-black marker:font-black">
                    <li>Payment processors (Stripe, Razorpay, eSewa, Khalti)</li>
                    <li>Service providers who assist our operations</li>
                    <li>Law enforcement when required by law</li>
                </ul>
                </section>

                <section className="mb-10">
                <h2 className="text-2xl border-l-8 border-accent-green pl-3 bg-secondary/5 py-1">4. Data Security</h2>
                <p>
                    We implement industry-standard security measures including encryption, 
                    secure servers, and regular security audits to protect your data.
                </p>
                </section>

                <section className="mb-10">
                <h2 className="text-2xl border-l-8 border-primary pl-3 bg-secondary/5 py-1">5. Your Rights</h2>
                <p>You have the right to:</p>
                <ul className="marker:text-brutal-black marker:font-black">
                    <li>Access your personal data</li>
                    <li>Correct inaccurate data</li>
                    <li>Delete your account and data</li>
                    <li>Export your data</li>
                    <li>Opt out of marketing communications</li>
                </ul>
                </section>

                <section className="mb-8 p-6 bg-brutal-black text-brutal-white not-prose border-4 border-double border-brutal-white shadow-brutal-sm">
                <h2 className="text-2xl font-black font-display uppercase mb-2 text-brutal-white">6. Contact Us</h2>
                <p className="font-mono font-bold mb-0">
                    For privacy-related questions, contact us at{" "}
                    <a href="mailto:privacy@creatorconnect.com" className="text-accent-yellow underline decoration-2 underline-offset-4 hover:text-white">
                    privacy@creatorconnect.com
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
