"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart, Loader2, Mail, ArrowLeft, Check, AlertTriangle } from "lucide-react";
import { Input, Button, Card, CardContent } from "@/components/ui";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-accent-yellow/5 flex flex-col">
      {/* Header */}
      <header className="py-6 px-4 sm:px-6 lg:px-8 border-b-4 border-brutal-black bg-card">
        <div className="container mx-auto">
          <Link href="/" className="flex items-center gap-3 w-fit group">
            <div className="w-12 h-12 border-3 border-brutal-black bg-accent-purple shadow-brutal-sm flex items-center justify-center group-hover:translate-x-1 group-hover:translate-y-1 group-hover:shadow-none transition-all">
              <Heart className="w-6 h-6 text-white stroke-[3] fill-current" />
            </div>
            <span className="text-2xl font-display font-black uppercase text-foreground tracking-tight">
              CreatorConnect
            </span>
          </Link>
        </div>
      </header>

      {/* Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 py-12">
        <div className="w-full max-w-md">
          {success ? (
            // Success State
            <Card variant="brutal" className="bg-card border-4">
              <CardContent className="p-8 text-center">
                <div className="w-24 h-24 rounded-none border-4 border-brutal-black flex items-center justify-center mx-auto mb-8 bg-accent-green shadow-brutal">
                  <Check className="w-12 h-12 text-foreground stroke-[3]" />
                </div>
                <h1 className="text-3xl font-display font-black text-foreground uppercase mb-4 tracking-tight">
                  Check your email
                </h1>
                
                <div className="bg-accent-green/20 p-4 border-2 border-brutal-black mb-8 transform -rotate-1">
                  <p className="text-foreground font-medium text-lg">
                    If an account exists for <span className="font-bold underline">{email}</span>, we&apos;ve sent a password reset link.
                  </p>
                </div>

                <div className="bg-accent-yellow/20 p-3 border-2 border-brutal-black mb-8 text-sm font-bold uppercase tracking-wide">
                  The link will expire in 1 hour.
                </div>

                <Link href="/login" className="block">
                  <Button variant="brutal" className="w-full" size="lg">
                    <ArrowLeft className="w-5 h-5 mr-2 stroke-[3]" />
                    Back to login
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            // Form State
            <Card variant="brutal" className="bg-card border-4">
              <CardContent className="p-8">
                <div className="text-center mb-8">
                  <div className="w-20 h-20 rounded-none border-4 border-brutal-black flex items-center justify-center mx-auto mb-6 bg-accent-blue shadow-brutal">
                    <Mail className="w-10 h-10 text-white stroke-[2.5]" />
                  </div>
                  <h1 className="text-3xl font-display font-black text-foreground uppercase mb-4 tracking-tight leading-none">
                    Forgot Password?
                  </h1>
                  <p className="text-muted-foreground font-medium text-lg leading-snug">
                    Enter your email and we&apos;ll send you a link to reset your password.
                  </p>
                </div>

                {error && (
                  <div className="mb-6 p-4 bg-accent-red/10 border-3 border-brutal-black flex items-center gap-3 shadow-brutal-sm">
                    <AlertTriangle className="w-6 h-6 text-accent-red stroke-[3]" />
                    <p className="text-foreground font-bold uppercase text-sm">{error}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <Input
                    type="email"
                    label="Email Address"
                    variant="brutal"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    containerClassName="space-y-2"
                  />

                  <Button 
                    type="submit" 
                    className="w-full text-lg py-6" 
                    size="lg" 
                    variant="brutal"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-6 h-6 animate-spin stroke-[3] mr-2" />
                        Sending Link...
                      </>
                    ) : (
                      "Send Reset Link"
                    )}
                  </Button>
                </form>

                <div className="mt-8 pt-6 border-t-2 border-dashed border-brutal-black/30 text-center">
                  <Link href="/login">
                    <Button variant="ghost" className="hover:bg-accent-yellow/20 hover:text-foreground font-bold uppercase tracking-wide">
                      <ArrowLeft className="w-4 h-4 mr-2 stroke-[3]" />
                      Back to login
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </main>
  );
}
