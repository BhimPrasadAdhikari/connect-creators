"use client";

import { useState } from "react";
import { Mail, Phone, MapPin, Send, MessageSquare } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button, Card, CardContent, Input } from "@/components/ui";

const contactInfo = [
  {
    icon: Mail,
    title: "Email",
    value: "support@creatorconnect.com",
    href: "mailto:support@creatorconnect.com",
  },
  {
    icon: Phone,
    title: "Phone",
    value: "+977 1-4XXXXXX",
    href: "tel:+97714000000",
  },
  {
    icon: MapPin,
    title: "Location",
    value: "Kathmandu, Nepal",
    href: null,
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
    <main className="min-h-screen bg-background">
      <Header />

      {/* Hero */}
      <section className="bg-gradient-to-br from-primary to-primary-700 text-white py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
          <p className="text-xl text-white/80 max-w-xl mx-auto">
            Have a question or feedback? We&apos;d love to hear from you.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Contact Info */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-foreground mb-6">Get in Touch</h2>
            
            {contactInfo.map((item) => (
              <Card key={item.title}>
                <CardContent className="flex items-start gap-4 py-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{item.title}</p>
                    {item.href ? (
                      <a
                        href={item.href}
                        className="font-medium text-foreground hover:text-primary transition-colors"
                      >
                        {item.value}
                      </a>
                    ) : (
                      <p className="font-medium text-foreground">{item.value}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}

            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="py-4">
                <div className="flex items-center gap-3 mb-2">
                  <MessageSquare className="w-5 h-5 text-primary" />
                  <span className="font-medium text-foreground">Response Time</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  We typically respond within 24-48 hours during business days.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-6 sm:p-8">
                {submitted ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-accent-green/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Send className="w-8 h-8 text-accent-green" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      Message Sent!
                    </h3>
                    <p className="text-muted-foreground mb-6">
                      Thank you for reaching out. We&apos;ll get back to you soon.
                    </p>
                    <Button onClick={() => setSubmitted(false)}>
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
                      />
                      <Input
                        label="Email Address"
                        type="email"
                        placeholder="john@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                      />
                    </div>
                    <Input
                      label="Subject"
                      placeholder="How can we help?"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      required
                    />
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">
                        Message
                      </label>
                      <textarea
                        rows={5}
                        placeholder="Tell us more about your inquiry..."
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        required
                        className="w-full px-4 py-3 rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none placeholder:text-muted-foreground"
                      />
                    </div>
                    <Button type="submit" size="lg" disabled={isSubmitting} className="w-full sm:w-auto">
                      {isSubmitting ? "Sending..." : "Send Message"}
                      <Send className="w-5 h-5 ml-2" />
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
