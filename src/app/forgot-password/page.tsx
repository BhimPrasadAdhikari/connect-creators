"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart, Loader2, Mail, ArrowLeft, Check } from "lucide-react";
import { Input, Button } from "@/components/ui";

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
    <main className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="py-4 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <Link href="/" className="flex items-center gap-2 w-fit">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-semibold text-foreground">
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
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-accent-green/20 flex items-center justify-center mx-auto mb-6">
                <Check className="w-8 h-8 text-accent-green" />
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-2">
                Check your email
              </h1>
              <p className="text-muted-foreground mb-6">
                If an account exists for <strong>{email}</strong>, we&apos;ve sent a password reset link.
              </p>
              <p className="text-sm text-muted-foreground mb-8">
                The link will expire in 1 hour. Check your spam folder if you don&apos;t see it.
              </p>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-primary font-medium hover:underline"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to login
              </Link>
            </div>
          ) : (
            // Form State
            <>
              <div className="text-center mb-8">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                  <Mail className="w-8 h-8 text-primary" />
                </div>
                <h1 className="text-2xl font-bold text-foreground mb-2">
                  Forgot your password?
                </h1>
                <p className="text-muted-foreground">
                  Enter your email and we&apos;ll send you a link to reset your password.
                </p>
              </div>

              <div className="bg-card rounded-xl border border-border shadow-sm p-6 sm:p-8">
                {error && (
                  <div className="mb-4 p-3 rounded-lg bg-accent-red/10 border border-accent-red/20 text-accent-red text-sm">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <Input
                    type="email"
                    label="Email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />

                  <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      "Send Reset Link"
                    )}
                  </Button>
                </form>
              </div>

              <p className="text-center text-muted-foreground mt-6">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 text-primary font-medium hover:underline"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to login
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
