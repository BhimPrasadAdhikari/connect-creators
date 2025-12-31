"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Heart, User, Palette, Loader2 } from "lucide-react";
import { Input, Button, Card, CardContent } from "@/components/ui";
import { cn } from "@/lib/utils";

export default function SignupPage() {
  const router = useRouter();
  const [role, setRole] = useState<"fan" | "creator">("fan");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // Call signup API
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          role: role === "creator" ? "CREATOR" : "FAN",
          username: role === "creator" ? username : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Signup failed");
      }

      // Auto sign in after successful signup
      const signInResult = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (signInResult?.error) {
        // Signup succeeded but signin failed, redirect to login
        router.push("/login?message=Account created successfully. Please sign in.");
      } else {
        // Redirect to appropriate dashboard
        router.push(role === "creator" ? "/dashboard/creator" : "/dashboard");
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    signIn("google", { callbackUrl: "/dashboard" });
  };

  return (
    <main className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="py-4 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <Link href="/" className="flex items-center gap-2 w-fit group">
            <div className="w-10 h-10 border-3 border-brutal-black bg-primary flex items-center justify-center shadow-brutal-sm group-hover:shadow-brutal transition-shadow">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <span className="font-display text-xl font-bold text-foreground">
              CreatorConnect
            </span>
          </Link>
        </div>
      </header>

      {/* Signup Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="font-display text-display-sm font-bold text-foreground mb-2">
              Create your account
            </h1>
            <p className="text-muted-foreground">
              Join CreatorConnect to support your favorite creators
            </p>
          </div>

          <Card variant="brutal" className="p-0">
            <CardContent className="p-6 sm:p-8">
              {/* Error Message */}
              {error && (
                <div className="mb-4 p-3 border-2 border-accent-red bg-accent-red/10 text-accent-red text-sm font-medium">
                  {error}
                </div>
              )}

              {/* Role Selection - Neubrutalist Style */}
              <div className="mb-6">
                <label className="block font-mono text-sm uppercase tracking-wide text-foreground mb-3">
                  I want to join as a
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRole("fan")}
                    className={cn(
                      "flex flex-col items-center gap-2 p-4 border-3 transition-all min-h-touch",
                      role === "fan"
                        ? "border-primary bg-primary/20 shadow-brutal-sm"
                        : "border-brutal-black hover:shadow-brutal-sm"
                    )}
                  >
                    <User
                      className={cn(
                        "w-6 h-6",
                        role === "fan" ? "text-primary" : "text-muted-foreground"
                      )}
                    />
                    <span
                      className={cn(
                        "font-display font-bold",
                        role === "fan" ? "text-primary" : "text-muted-foreground"
                      )}
                    >
                      Fan
                    </span>
                    <span className="text-xs text-muted-foreground text-center font-mono">
                      Support creators
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole("creator")}
                    className={cn(
                      "flex flex-col items-center gap-2 p-4 border-3 transition-all min-h-touch",
                      role === "creator"
                        ? "border-primary bg-primary/20 shadow-brutal-sm"
                        : "border-brutal-black hover:shadow-brutal-sm"
                    )}
                  >
                    <Palette
                      className={cn(
                        "w-6 h-6",
                        role === "creator" ? "text-primary" : "text-muted-foreground"
                      )}
                    />
                    <span
                      className={cn(
                        "font-display font-bold",
                        role === "creator" ? "text-primary" : "text-muted-foreground"
                      )}
                    >
                      Creator
                    </span>
                    <span className="text-xs text-muted-foreground text-center font-mono">
                      Share &amp; earn
                    </span>
                  </button>
                </div>
              </div>

              {/* Social Login */}
              <div className="space-y-3 mb-6">
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 border-3 border-brutal-black bg-card hover:bg-muted shadow-brutal-sm hover:shadow-brutal transition-all min-h-touch font-medium"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  <span>Continue with Google</span>
                </button>
              </div>

              {/* Divider */}
              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t-2 border-brutal-black" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-3 bg-card text-muted-foreground font-mono uppercase text-xs tracking-wide">
                    or continue with email
                  </span>
                </div>
              </div>

              {/* Email Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  type="text"
                  label="Full Name"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  variant="brutal"
                  required
                />
                <Input
                  type="email"
                  label="Email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  variant="brutal"
                  required
                />
                <Input
                  type="password"
                  label="Password"
                  placeholder="Create a strong password (8+ chars)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  variant="brutal"
                  required
                />

                {role === "creator" && (
                  <Input
                    type="text"
                    label="Username"
                    placeholder="yourhandle"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                    variant="brutal"
                    required
                  />
                )}

                <p className="text-xs text-muted-foreground">
                  By signing up, you agree to our{" "}
                  <Link href="/terms" className="text-primary font-medium hover:underline">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy" className="text-primary font-medium hover:underline">
                    Privacy Policy
                  </Link>
                  .
                </p>

                <Button 
                  type="submit" 
                  variant="brutal-accent" 
                  className="w-full" 
                  size="lg" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    "Create Account"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          <p className="text-center text-muted-foreground mt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-primary font-bold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}

