"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { Heart, Menu, X } from "lucide-react";
import { useState } from "react";
import { Avatar } from "@/components/ui";

interface HeaderProps {
  transparent?: boolean;
}

export function Header({ transparent = false }: HeaderProps) {
  const { data: session, status } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isLoggedIn = status === "authenticated" && session?.user;
  const userRole = (session?.user as { role?: string })?.role;

  return (
    <header
      className={`sticky top-0 z-50 border-b border-gray-200 ${
        transparent
          ? "bg-white/80 backdrop-blur-md"
          : "bg-white"
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-semibold text-gray-900">
              CreatorConnect
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="/explore"
              className="text-gray-600 hover:text-blue-600 transition-colors"
            >
              Explore Creators
            </Link>
            <Link
              href="/how-it-works"
              className="text-gray-600 hover:text-blue-600 transition-colors"
            >
              How It Works
            </Link>
          </nav>

          {/* Auth Section */}
          <div className="flex items-center gap-3">
            {status === "loading" ? (
              <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
            ) : isLoggedIn ? (
              <>
                <Link
                  href={userRole === "CREATOR" ? "/dashboard/creator" : "/dashboard"}
                  className="hidden sm:inline-flex text-gray-600 hover:text-blue-600 transition-colors px-4 py-2"
                >
                  Dashboard
                </Link>
                <Link
                  href={userRole === "CREATOR" ? "/dashboard/creator" : "/dashboard"}
                  className="flex items-center gap-2"
                >
                  <Avatar
                    src={session.user?.image}
                    name={session.user?.name || "User"}
                    size="sm"
                  />
                  <span className="hidden sm:inline text-sm font-medium text-gray-700">
                    {session.user?.name?.split(" ")[0]}
                  </span>
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="hidden sm:inline-flex text-gray-600 hover:text-blue-600 transition-colors px-4 py-2"
                >
                  Log In
                </Link>
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Get Started
                </Link>
              </>
            )}

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 text-gray-600"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100">
            <nav className="flex flex-col gap-2">
              <Link
                href="/explore"
                className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg"
                onClick={() => setMobileMenuOpen(false)}
              >
                Explore Creators
              </Link>
              <Link
                href="/how-it-works"
                className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg"
                onClick={() => setMobileMenuOpen(false)}
              >
                How It Works
              </Link>
              {isLoggedIn ? (
                <>
                  <Link
                    href={userRole === "CREATOR" ? "/dashboard/creator" : "/dashboard"}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/api/auth/signout"
                    className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign Out
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Log In
                  </Link>
                  <Link
                    href="/signup"
                    className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Get Started
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
