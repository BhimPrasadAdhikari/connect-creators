"use client";

import { useState } from "react";
import { Mail, Phone, MapPin, Send, MessageSquare, ArrowRight } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button, Card, CardContent, Input, Textarea } from "@/components/ui";

const contactInfo = [
  {
    icon: Mail,
    title: "Email",
    value: "support@creatorconnect.com",
    href: "mailto:support@creatorconnect.com",
    color: "bg-accent-blue"
  },
  {
    icon: Phone,
    title: "Phone",
    value: "+977 1-4XXXXXX",
    href: "tel:+97714000000",
    color: "bg-accent-green"
  },
  {
    icon: MapPin,
    title: "Location",
    value: "Kathmandu, Nepal",
    href: null,
    color: "bg-accent-pink"
  },
];

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    setSubmitted(true);
    setIsSubmitting(false);
  };

  return (
    <main className="min-h-screen bg-background font-sans text-foreground">
      <Header />

      {/* Hero */}
      <section className="bg-primary text-white py-20 border-b-4 border-brutal-black relative overflow-hidden">
         <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-accent-yellow rounded-full border-4 border-brutal-black"></div>
         
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h1 className="text-5xl sm:text-7xl font-black mb-6 font-display uppercase tracking-tighter drop-shadow-[4px_4px_0px_#000]">
            Contact Us
          </h1>
          <p className="text-xl sm:text-2xl font-bold font-mono text-white/90 max-w-xl mx-auto bg-black/20 p-2 inline-block">
            Have a question or feedback? We&apos;d love to hear from you.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Contact Info */}
          <div className="space-y-8">
            <h2 className="text-3xl font-black text-foreground font-display uppercase bg-secondary/20 inline-block px-2 border-l-4 border-brutal-black">
                Get in Touch
            </h2>
            
            <div className="space-y-6">
                {contactInfo.map((item) => (
                <Card key={item.title} variant="brutal" className="hover:translate-x-2 transition-transform">
                    <CardContent className="flex items-center gap-5 p-5">
                    <div className={`w-14 h-14 ${item.color} border-2 border-brutal-black flex items-center justify-center flex-shrink-0 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]`}>
                        <item.icon className="w-7 h-7 text-brutal-black" strokeWidth={2.5} />
                    </div>
                    <div>
                        <p className="text-xs font-black uppercase text-muted-foreground tracking-widest mb-1">{item.title}</p>
                        {item.href ? (
                        <a
                            href={item.href}
                            className="font-bold text-lg text-foreground hover:text-primary transition-colors font-mono break-all"
                        >
                            {item.value}
                        </a>
                        ) : (
                        <p className="font-bold text-lg text-foreground font-mono">{item.value}</p>
                        )}
                    </div>
                    </CardContent>
                </Card>
                ))}
            </div>

            <div className="bg-card border-2 border-brutal-black p-6 shadow-brutal-sm">
                <div className="flex items-center gap-3 mb-3">
                  <MessageSquare className="w-6 h-6 text-primary" strokeWidth={2.5} />
                  <span className="font-black text-foreground uppercase font-display text-lg">Response Time</span>
                </div>
                <p className="text-sm font-bold font-mono text-muted-foreground border-t-2 border-dashed border-brutal-black/20 pt-3">
                  We typically respond within 24-48 hours during business days.
                </p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card variant="brutal" className="bg-card">
              <CardContent className="p-8 sm:p-10">
                {submitted ? (
                  <div className="text-center py-16">
                    <div className="w-24 h-24 bg-accent-green text-brutal-black border-4 border-brutal-black rounded-full flex items-center justify-center mx-auto mb-6 shadow-brutal">
                      <Send className="w-10 h-10" strokeWidth={3} />
                    </div>
                    <h3 className="text-4xl font-black text-foreground mb-4 font-display uppercase">
                      Message Sent!
                    </h3>
                    <p className="text-muted-foreground font-bold font-mono text-lg mb-10">
                      Thank you for reaching out. We&apos;ll get back to you soon.
                    </p>
                    <Button onClick={() => setSubmitted(false)} variant="brutal" size="lg">
                      Send Another Message
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid sm:grid-cols-2 gap-6">
                      <Input
                        label="Your Name"
                        placeholder="John Doe"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        variant="brutal"
                      />
                      <Input
                        label="Email Address"
                        type="email"
                        placeholder="john@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                        variant="brutal"
                      />
                    </div>
                    <Input
                      label="Subject"
                      placeholder="How can we help?"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      required
                      variant="brutal"
                    />
                    <div>
                      <Textarea
                        label="Message"
                        variant="brutal"
                        rows={6}
                        placeholder="Tell us more about your inquiry..."
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        required
                      />
                    </div>
                    <Button 
                        type="submit" 
                        size="lg" 
                        variant="brutal"
                        disabled={isSubmitting} 
                        className="w-full sm:w-auto text-xl px-10 py-6 bg-brutal-black text-brutal-white hover:bg-primary hover:text-white"
                    >
                      {isSubmitting ? "Sending..." : "Send Message"}
                      <ArrowRight className="w-6 h-6 ml-3" />
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
