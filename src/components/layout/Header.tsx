"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { Heart, Menu, X, Search, Sun, Moon } from "lucide-react";
import { useState } from "react";
import { Avatar, NotificationDropdown, Notification, Button } from "@/components/ui";
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
      className={`sticky top-0 z-40 border-b-4 border-brutal-black ${
        transparent
          ? "bg-background/95 backdrop-blur-md"
          : "bg-card"
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 shrink-0 group">
            <div className="w-10 h-10 border-3 border-brutal-black bg-primary flex items-center justify-center shadow-brutal-sm group-hover:translate-x-[-2px] group-hover:translate-y-[-2px] group-hover:shadow-brutal transition-all">
              <Heart className="w-5 h-5 text-white fill-current" />
            </div>
            <span className="font-display text-2xl font-bold text-foreground hidden sm:inline tracking-tight">
              CreatorConnect
            </span>
          </Link>

          {/* Search Bar - Desktop */}
          <form onSubmit={handleSearch} className="hidden lg:flex flex-1 max-w-md mx-4">
            <div className="relative w-full group">
              <div className="absolute inset-0 bg-brutal-black translate-x-1 translate-y-1 rounded-none -z-10 group-focus-within:translate-x-2 group-focus-within:translate-y-2 transition-transform"></div>
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-foreground" />
              <input
                type="text"
                placeholder="Search creators..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 font-mono text-sm border-3 border-brutal-black bg-background focus:outline-none focus:ring-0 placeholder:text-muted-foreground transition-colors"
              />
            </div>
          </form>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="/explore"
              className="font-display font-bold text-lg hover:text-primary transition-colors border-b-2 border-transparent hover:border-primary text-foreground"
            >
              Explore
            </Link>
            <Link
              href="/how-it-works"
              className="font-display font-bold text-lg hover:text-primary transition-colors border-b-2 border-transparent hover:border-primary text-foreground"
            >
              How It Works
            </Link>
            <Link
              href="/pricing"
              className="font-display font-bold text-lg hover:text-primary transition-colors border-b-2 border-transparent hover:border-primary text-foreground"
            >
              Pricing
            </Link>
          </nav>

          {/* Auth Section */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 border-3 border-brutal-black bg-secondary/10 hover:bg-secondary/20 shadow-brutal-sm hover:shadow-brutal hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all"
              aria-label={`Switch to ${resolvedTheme === 'light' ? 'dark' : 'light'} mode`}
            >
              {resolvedTheme === 'light' ? (
                <Moon className="w-5 h-5 text-foreground" />
              ) : (
                <Sun className="w-5 h-5 text-foreground" />
              )}
            </button>

            {status === "loading" ? (
              <div className="w-10 h-10 border-3 border-brutal-black bg-muted animate-pulse" />
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
                  className="hidden sm:inline-flex"
                >
                  <Button variant="brutal" size="sm" className="hidden xl:flex">
                    Dashboard
                  </Button>
                </Link>
                <Link
                  href={userRole === "CREATOR" ? "/dashboard/creator" : "/dashboard"}
                  className="flex items-center gap-2 group"
                >
                  <div className="border-3 border-brutal-black rounded-full overflow-hidden shadow-brutal-sm group-hover:shadow-brutal transition-all">
                    <Avatar
                      src={session.user?.image}
                      name={session.user?.name || "User"}
                      size="sm"
                    />
                  </div>
                </Link>
              </>
            ) : (
              <>
                <Link href="/login" className="hidden sm:inline-block">
                  <Button variant="ghost" className="font-display font-bold">Log In</Button>
                </Link>
                <Link href="/signup">
                  <Button variant="brutal-accent" size="md">
                    Get Started
                  </Button>
                </Link>
              </>
            )}

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 border-3 border-brutal-black bg-background hover:bg-muted shadow-brutal-sm active:translate-y-[2px] active:shadow-none transition-all"
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
          <div className="md:hidden py-6 border-t-3 border-brutal-black bg-card animate-in slide-in-from-top-4">
            <nav className="flex flex-col gap-4 font-display font-bold text-xl px-2">
              <Link
                href="/explore"
                className="px-4 py-3 hover:bg-primary/10 border-3 border-transparent hover:border-brutal-black hover:shadow-brutal-sm transition-all"
                onClick={() => setMobileMenuOpen(false)}
              >
                Explore Creators
              </Link>
              <Link
                href="/how-it-works"
                className="px-4 py-3 hover:bg-primary/10 border-3 border-transparent hover:border-brutal-black hover:shadow-brutal-sm transition-all"
                onClick={() => setMobileMenuOpen(false)}
              >
                How It Works
              </Link>
              {isLoggedIn ? (
                <>
                  <Link
                    href={userRole === "CREATOR" ? "/dashboard/creator" : "/dashboard"}
                    className="px-4 py-3 hover:bg-primary/10 border-3 border-transparent hover:border-brutal-black hover:shadow-brutal-sm transition-all"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/api/auth/signout"
                    className="px-4 py-3 text-accent-red hover:bg-accent-red/10 border-3 border-transparent hover:border-brutal-black hover:shadow-brutal-sm transition-all"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign Out
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="px-4 py-3 hover:bg-primary/10 border-3 border-transparent hover:border-brutal-black hover:shadow-brutal-sm transition-all"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Log In
                  </Link>
                  <Link
                    href="/signup"
                    className="mx-4 mt-2 py-3 bg-primary text-white text-center border-3 border-brutal-black shadow-brutal hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-brutal-lg transition-all"
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

