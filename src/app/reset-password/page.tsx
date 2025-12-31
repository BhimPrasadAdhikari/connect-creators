"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Heart, Loader2, Lock, ArrowLeft, Check, AlertTriangle, KeyRound } from "lucide-react";
import { Input, Button, Card, CardContent } from "@/components/ui";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isValidToken, setIsValidToken] = useState<boolean | null>(null);

  useEffect(() => {
    if (!token) {
      setIsValidToken(false);
      return;
    }

    // Verify token is valid
    fetch(`/api/auth/reset-password?token=${token}`)
      .then((res) => {
        setIsValidToken(res.ok);
      })
      .catch(() => {
        setIsValidToken(false);
      });
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
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

  // Loading state while verifying token
  if (isValidToken === null) {
    return (
      <div className="text-center py-12">
        <Loader2 className="w-12 h-12 animate-spin text-brutal-black mx-auto mb-4" />
        <p className="text-muted-foreground font-mono font-bold uppercase tracking-widest">Verifying link...</p>
      </div>
    );
  }

  // Invalid or expired token
  if (!isValidToken) {
    return (
      <div className="text-center py-8">
        <div className="w-20 h-20 bg-accent-red text-white border-4 border-brutal-black flex items-center justify-center mx-auto mb-6 shadow-brutal">
          <AlertTriangle className="w-10 h-10" />
        </div>
        <h1 className="text-3xl font-black text-foreground mb-4 font-display uppercase">
          Invalid or Expired Link
        </h1>
        <p className="text-muted-foreground font-medium mb-8">
          This password reset link is invalid or has expired.
        </p>
        <Link
          href="/forgot-password"
        >
          <Button variant="brutal" size="lg" className="bg-primary text-white w-full">
            Request New Link
          </Button>
        </Link>
      </div>
    );
  }

  // Success state
  if (success) {
    return (
      <div className="text-center py-8">
        <div className="w-20 h-20 bg-accent-green text-brutal-black border-4 border-brutal-black flex items-center justify-center mx-auto mb-6 shadow-brutal">
          <Check className="w-10 h-10" strokeWidth={4} />
        </div>
        <h1 className="text-3xl font-black text-foreground mb-4 font-display uppercase">
          Password Reset Successful
        </h1>
        <p className="text-muted-foreground font-medium mb-8">
          Your password has been updated. You can now log in with your new password.
        </p>
        <Link
          href="/login"
        >
          <Button variant="brutal" size="lg" className="bg-primary text-white w-full">
             Go to Login
          </Button>
        </Link>
      </div>
    );
  }

  // Reset form
  return (
    <>
      <div className="text-center mb-10">
        <div className="w-20 h-20 bg-accent-yellow border-4 border-brutal-black flex items-center justify-center mx-auto mb-6 shadow-brutal-sm">
          <KeyRound className="w-10 h-10 text-brutal-black" strokeWidth={2.5} />
        </div>
        <h1 className="text-3xl font-black text-foreground mb-2 font-display uppercase">
          Reset Password
        </h1>
        <p className="text-muted-foreground font-mono font-bold">
          Enter your new password below.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-accent-red/10 border-2 border-accent-red text-accent-red font-bold font-mono">
           <AlertTriangle className="w-4 h-4 inline mr-2" /> {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
        <Input
          type="password"
          label="New Password"
          variant="brutal"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <p className="text-xs font-bold font-mono text-muted-foreground mt-1 uppercase">
          Min 8 characters, include uppercase, lowercase, and number
        </p>
        </div>

        <Input
          type="password"
          label="Confirm New Password"
          variant="brutal"
          placeholder="••••••••"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />

        <Button type="submit" variant="brutal" className="w-full bg-brutal-black text-brutal-white hover:bg-white hover:text-brutal-black text-lg py-6" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              Resetting...
            </>
          ) : (
            "Reset Password"
          )}
        </Button>
      </form>
      
      <p className="text-center mt-8">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-foreground font-bold hover:underline font-mono uppercase text-sm tracking-wide"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to login
        </Link>
      </p>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <main className="min-h-screen bg-accent-yellow/20 flex flex-col font-sans text-foreground">
      {/* Header */}
      <header className="py-6 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <Link href="/" className="flex items-center gap-3 w-fit">
            <div className="w-10 h-10 border-2 border-brutal-black bg-primary flex items-center justify-center shadow-brutal-sm">
              <Heart className="w-6 h-6 text-white fill-white" />
            </div>
            <span className="text-2xl font-black tracking-tight text-foreground font-display uppercase">
              CreatorConnect
            </span>
          </Link>
        </div>
      </header>

      {/* Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 py-12">
        <Card variant="brutal" className="w-full max-w-lg bg-card shadow-brutal border-4">
          <CardContent className="p-8 sm:p-12">
             <Suspense fallback={
                <div className="text-center">
                <Loader2 className="w-10 h-10 animate-spin text-brutal-black mx-auto" />
                </div>
            }>
                <ResetPasswordForm />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
