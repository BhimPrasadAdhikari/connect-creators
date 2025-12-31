import Link from "next/link";
import { Heart } from "lucide-react";

const footerLinks = {
  product: [
    { label: "How It Works", href: "/how-it-works" },
    { label: "Explore Creators", href: "/explore" },
    { label: "Pricing", href: "/pricing" },
  ],
  company: [
    { label: "About Us", href: "/about" },
    { label: "Contact", href: "/contact" },
    { label: "Careers", href: "/careers" },
  ],
  legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Cookie Policy", href: "/cookies" },
  ],
  social: [
    { label: "Twitter", href: "https://twitter.com" },
    { label: "Instagram", href: "https://instagram.com" },
    { label: "YouTube", href: "https://youtube.com" },
  ],
};

interface FooterProps {
  variant?: "default" | "minimal";
}

export function Footer({ variant = "default" }: FooterProps) {
  if (variant === "minimal") {
    return (
      <footer className="bg-card border-t-4 border-brutal-black py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 border-3 border-brutal-black bg-primary flex items-center justify-center shadow-brutal-sm">
                <Heart className="w-5 h-5 text-white fill-current" />
              </div>
              <span className="font-display font-bold text-xl text-foreground">CreatorConnect</span>
            </div>
            <div className="flex gap-6 font-mono text-sm font-medium">
              <Link href="/privacy" className="text-muted-foreground hover:text-primary hover:underline transition-all decoration-2 underline-offset-4">
                Privacy
              </Link>
              <Link href="/terms" className="text-muted-foreground hover:text-primary hover:underline transition-all decoration-2 underline-offset-4">
                Terms
              </Link>
              <Link href="/contact" className="text-muted-foreground hover:text-primary hover:underline transition-all decoration-2 underline-offset-4">
                Contact
              </Link>
            </div>
            <p className="font-mono text-sm text-muted-foreground font-bold">
              © {new Date().getFullYear()} CreatorConnect
            </p>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="bg-card border-t-4 border-brutal-black">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 md:gap-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-6 group w-fit">
              <div className="w-12 h-12 border-3 border-brutal-black bg-primary flex items-center justify-center shadow-brutal-sm group-hover:shadow-brutal group-hover:translate-x-[-2px] group-hover:translate-y-[-2px] transition-all">
                <Heart className="w-6 h-6 text-white fill-current" />
              </div>
              <span className="font-display font-bold text-2xl text-foreground">CreatorConnect</span>
            </Link>
            <p className="font-mono text-muted-foreground max-w-sm leading-relaxed border-l-4 border-brutal-black pl-4 py-1">
              Connecting creators with their fans in South Asia through a 
              <span className="font-bold text-foreground"> transparent</span> and 
              <span className="font-bold text-foreground"> direct</span> platform.
            </p>
          </div>

          {/* Product */}
          <div>
            <h3 className="font-display font-bold text-lg text-foreground mb-6 uppercase tracking-wider border-b-4 border-secondary/20 pb-2 w-fit">Product</h3>
            <ul className="space-y-4 font-mono text-sm">
              {footerLinks.product.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground hover:text-primary hover:translate-x-1 inline-block transition-transform font-medium"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-display font-bold text-lg text-foreground mb-6 uppercase tracking-wider border-b-4 border-accent-green/20 pb-2 w-fit">Company</h3>
            <ul className="space-y-4 font-mono text-sm">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground hover:text-primary hover:translate-x-1 inline-block transition-transform font-medium"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-display font-bold text-lg text-foreground mb-6 uppercase tracking-wider border-b-4 border-accent-pink/20 pb-2 w-fit">Legal</h3>
            <ul className="space-y-4 font-mono text-sm">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground hover:text-primary hover:translate-x-1 inline-block transition-transform font-medium"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-16 pt-8 border-t-4 border-dashed border-brutal-black/20 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="font-mono text-sm text-muted-foreground font-bold">
            © {new Date().getFullYear()} CreatorConnect. All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-sm font-mono bg-secondary/10 px-4 py-2 border-2 border-brutal-black rounded-lg transform rotate-[-1deg] hover:rotate-0 transition-transform cursor-cell">
            <span className="font-bold">Made with</span>
            <Heart className="w-4 h-4 text-accent-red fill-accent-red animate-pulse" />
            <span className="font-bold">in Nepal</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

