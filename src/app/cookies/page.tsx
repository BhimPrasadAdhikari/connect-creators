import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent } from "@/components/ui";
import { Cookie } from "lucide-react";

export const metadata = {
  title: "Cookie Policy | CreatorConnect",
  description: "Learn how CreatorConnect uses cookies and similar technologies.",
};

export default function CookiePolicyPage() {
  return (
    <main className="min-h-screen bg-background font-sans text-foreground">
      <Header />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
             <div className="w-16 h-16 bg-accent-yellow border-2 border-brutal-black flex items-center justify-center mx-auto mb-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                 <Cookie className="w-8 h-8 text-brutal-black" strokeWidth={2.5}/>
             </div>
             <h1 className="text-5xl font-black text-foreground mb-4 font-display uppercase">Cookie Policy</h1>
             <p className="text-muted-foreground font-mono font-bold bg-secondary/10 inline-block px-3 py-1 border border-brutal-black">Last updated: December 2024</p>
          </div>

          <Card variant="brutal" className="bg-card">
             <CardContent className="p-8 sm:p-12 prose prose-slate dark:prose-invert max-w-none prose-headings:font-display prose-headings:uppercase prose-headings:font-black prose-p:font-medium prose-li:font-medium">
                <section className="mb-10">
                <h2 className="text-2xl border-l-8 border-primary pl-3 bg-secondary/5 py-1">What Are Cookies?</h2>
                <p>
                    Cookies are small text files stored on your device when you visit websites. 
                    They help websites remember your preferences and improve your experience.
                </p>
                </section>

                <section className="mb-10">
                <h2 className="text-2xl border-l-8 border-accent-pink pl-3 bg-secondary/5 py-1">How We Use Cookies</h2>
                
                <div className="pl-4 border-l-2 border-dashed border-gray-300">
                    <h3 className="not-prose text-lg font-black uppercase text-foreground mt-4 mb-2 flex items-center gap-2">
                        <span className="w-3 h-3 bg-accent-pink"></span> Essential Cookies
                    </h3>
                    <p>
                        Required for the website to function. They enable core features like 
                        authentication and security.
                    </p>

                    <h3 className="not-prose text-lg font-black uppercase text-foreground mt-6 mb-2 flex items-center gap-2">
                        <span className="w-3 h-3 bg-accent-blue"></span> Analytics Cookies
                    </h3>
                    <p>
                        Help us understand how visitors interact with our website, allowing us to 
                        improve our services.
                    </p>

                    <h3 className="not-prose text-lg font-black uppercase text-foreground mt-6 mb-2 flex items-center gap-2">
                         <span className="w-3 h-3 bg-accent-green"></span> Preference Cookies
                    </h3>
                    <p>
                        Remember your settings and preferences like language and theme.
                    </p>
                </div>
                </section>

                <section className="mb-10">
                <h2 className="text-2xl border-l-8 border-accent-yellow pl-3 bg-secondary/5 py-1">Third-Party Cookies</h2>
                <p>
                    Our payment partners may set cookies for fraud prevention and security purposes. 
                    These are governed by their respective privacy policies.
                </p>
                </section>

                <section className="mb-10">
                <h2 className="text-2xl border-l-8 border-primary pl-3 bg-secondary/5 py-1">Managing Cookies</h2>
                <p>
                    You can control cookies through your browser settings:
                </p>
                <ul className="marker:text-brutal-black marker:font-black">
                    <li>Block all cookies</li>
                    <li>Delete existing cookies</li>
                    <li>Allow cookies from specific sites</li>
                    <li>Set preferences for different types of cookies</li>
                </ul>
                <p className="font-bold bg-accent-pink/10 p-2 border-l-4 border-accent-pink">
                    Note: Blocking essential cookies may affect website functionality.
                </p>
                </section>

                <section className="mb-8 p-6 bg-brutal-black text-brutal-white not-prose border-4 border-double border-brutal-white shadow-brutal-sm">
                <h2 className="text-2xl font-black font-display uppercase mb-2 text-brutal-white">Contact Us</h2>
                <p className="font-mono font-bold mb-0">
                    Questions about our cookie policy? Contact us at{" "}
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
