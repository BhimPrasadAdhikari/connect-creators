"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { Heart, Menu, X, Search, Sun, Moon } from "lucide-react";
import { useState } from "react";
import { Avatar, NotificationDropdown, Notification } from "@/components/ui";
import { useRouter } from "next/navigation";
import { useTheme } from "@/components/providers/ThemeProvider";

interface HeaderProps {
  transparent?: boolean;
}

export function Header({ transparent = false }: HeaderProps) {
  const { data: session, status } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const { resolvedTheme, toggleTheme } = useTheme();

  const isLoggedIn = status === "authenticated" && session?.user;
  const userRole = (session?.user as { role?: string })?.role;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/explore?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // Demo notifications - in production, fetch from API
  const getDemoNotifications = (): Notification[] => {
    if (!isLoggedIn) return [];
    return [
      {
        id: "1",
        type: "subscription",
        title: "New Subscriber!",
        message: "Someone subscribed to your Fan tier",
        read: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 5), // 5 mins ago
        href: "/dashboard/creator",
      },
      {
        id: "2",
        type: "message",
        title: "New Message",
        message: "You have a new message from a fan",
        read: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 30), // 30 mins ago
        href: "/messages",
      },
      {
        id: "3",
        type: "purchase",
        title: "Product Sold!",
        message: "Your preset pack was purchased",
        read: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
        href: "/dashboard/creator/products",
      },
    ];
  };

  return (
    <header
      className={`sticky top-0 z-40 border-b border-border ${
        transparent
          ? "bg-background/80 backdrop-blur-md"
          : "bg-card"
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-semibold text-foreground hidden sm:inline">
              CreatorConnect
            </span>
          </Link>

          {/* Search Bar - Desktop */}
          <form onSubmit={handleSearch} className="hidden lg:flex flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search creators..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm border border-border rounded-lg bg-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-card text-foreground placeholder:text-muted-foreground transition-colors"
              />
            </div>
          </form>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/explore"
              className="text-muted-foreground hover:text-primary transition-colors text-sm font-medium"
            >
              Explore
            </Link>
            <Link
              href="/how-it-works"
              className="text-muted-foreground hover:text-primary transition-colors text-sm font-medium"
            >
              How It Works
            </Link>
            <Link
              href="/pricing"
              className="text-muted-foreground hover:text-primary transition-colors text-sm font-medium"
            >
              Pricing
            </Link>
          </nav>

          {/* Auth Section */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              aria-label={`Switch to ${resolvedTheme === 'light' ? 'dark' : 'light'} mode`}
            >
              {resolvedTheme === 'light' ? (
                <Moon className="w-5 h-5" />
              ) : (
                <Sun className="w-5 h-5" />
              )}
            </button>

            {status === "loading" ? (
              <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
            ) : isLoggedIn ? (
              <>
                {/* Notifications */}
                <NotificationDropdown
                  notifications={getDemoNotifications()}
                  onMarkRead={(id) => console.log("Mark read:", id)}
                  onMarkAllRead={() => console.log("Mark all read")}
                />
                
                <Link
                  href={userRole === "CREATOR" ? "/dashboard/creator" : "/dashboard"}
                  className="hidden sm:inline-flex text-muted-foreground hover:text-primary transition-colors px-3 py-2 text-sm font-medium"
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
                  <span className="hidden sm:inline text-sm font-medium text-foreground">
                    {session.user?.name?.split(" ")[0]}
                  </span>
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="hidden sm:inline-flex text-muted-foreground hover:text-primary transition-colors px-4 py-2"
                >
                  Log In
                </Link>
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Get Started
                </Link>
              </>
            )}

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 text-muted-foreground hover:text-foreground"
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
          <div className="md:hidden py-4 border-t border-border">
            <nav className="flex flex-col gap-2">
              <Link
                href="/explore"
                className="px-4 py-2 text-muted-foreground hover:bg-muted rounded-lg"
                onClick={() => setMobileMenuOpen(false)}
              >
                Explore Creators
              </Link>
              <Link
                href="/how-it-works"
                className="px-4 py-2 text-muted-foreground hover:bg-muted rounded-lg"
                onClick={() => setMobileMenuOpen(false)}
              >
                How It Works
              </Link>
              {isLoggedIn ? (
                <>
                  <Link
                    href={userRole === "CREATOR" ? "/dashboard/creator" : "/dashboard"}
                    className="px-4 py-2 text-muted-foreground hover:bg-muted rounded-lg"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/api/auth/signout"
                    className="px-4 py-2 text-accent-red hover:bg-accent-red/10 rounded-lg"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign Out
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="px-4 py-2 text-muted-foreground hover:bg-muted rounded-lg"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Log In
                  </Link>
                  <Link
                    href="/signup"
                    className="px-4 py-2 text-primary hover:bg-primary/10 rounded-lg font-medium"
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

