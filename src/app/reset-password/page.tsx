"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Heart, Loader2, Lock, ArrowLeft, Check, AlertTriangle } from "lucide-react";
import { Input, Button } from "@/components/ui";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
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
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
        <p className="text-muted-foreground mt-4">Verifying link...</p>
      </div>
    );
  }

  // Invalid or expired token
  if (!isValidToken) {
    return (
      <div className="text-center">
        <div className="w-16 h-16 rounded-full bg-accent-red/10 flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-8 h-8 text-accent-red" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Invalid or Expired Link
        </h1>
        <p className="text-muted-foreground mb-6">
          This password reset link is invalid or has expired.
        </p>
        <Link
          href="/forgot-password"
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
        >
          Request New Link
        </Link>
      </div>
    );
  }

  // Success state
  if (success) {
    return (
      <div className="text-center">
        <div className="w-16 h-16 rounded-full bg-accent-green/20 flex items-center justify-center mx-auto mb-6">
          <Check className="w-8 h-8 text-accent-green" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Password Reset Successful
        </h1>
        <p className="text-muted-foreground mb-6">
          Your password has been updated. You can now log in with your new password.
        </p>
        <Link
          href="/login"
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
        >
          Go to Login
        </Link>
      </div>
    );
  }

  // Reset form
  return (
    <>
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
          <Lock className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Reset your password
        </h1>
        <p className="text-muted-foreground">
          Enter your new password below.
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
            type="password"
            label="New Password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <p className="text-sm text-muted-foreground -mt-2">
            Min 8 characters, include uppercase, lowercase, and number
          </p>

          <Input
            type="password"
            label="Confirm New Password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Resetting...
              </>
            ) : (
              "Reset Password"
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
  );
}

export default function ResetPasswordPage() {
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
          <Suspense fallback={
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
            </div>
          }>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
