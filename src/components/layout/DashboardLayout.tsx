"use client";

import { useState, createContext, useContext, ReactNode, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Heart,
  Home,
  FileText,
  Users,
  DollarSign,
  Settings,
  Package,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Compass,
  CreditCard,
  ShoppingBag,
  TrendingUp,
  Wallet,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui";

interface SidebarContextType {
  isCollapsed: boolean;
  isMobileOpen: boolean;
  toggle: () => void;
  toggleMobile: () => void;
  closeMobile: () => void;
}

const SidebarContext = createContext<SidebarContextType>({
  isCollapsed: false,
  isMobileOpen: false,
  toggle: () => {},
  toggleMobile: () => {},
  closeMobile: () => {},
});

export function useSidebar() {
  return useContext(SidebarContext);
}

interface NavItem {
  href: string;
  label: string;
  icon: typeof Home;
}

interface NavSection {
  title?: string;
  items: NavItem[];
}

const creatorNavSections: NavSection[] = [
  {
    items: [{ href: "/dashboard/creator", label: "Overview", icon: Home }],
  },
  {
    title: "Content",
    items: [
      { href: "/dashboard/creator/posts", label: "Posts", icon: FileText },
      { href: "/dashboard/creator/products", label: "Products", icon: Package },
      { href: "/dashboard/creator/subscribers", label: "Subscribers", icon: Users },
    ],
  },
  {
    title: "Account",
    items: [
      { href: "/dashboard/creator/earnings", label: "Earnings", icon: DollarSign },
      { href: "/dashboard/payouts", label: "Payouts", icon: Wallet },
      { href: "/dashboard/creator/tiers", label: "Tiers", icon: TrendingUp },
      { href: "/messages", label: "Messages", icon: MessageCircle },
      { href: "/dashboard/creator/settings", label: "Settings", icon: Settings },
    ],
  },
];

const fanNavSections: NavSection[] = [
  {
    items: [{ href: "/dashboard", label: "Dashboard", icon: Home }],
  },
  {
    title: "Browse",
    items: [
      { href: "/explore", label: "Explore", icon: Compass },
      { href: "/subscriptions", label: "Subscriptions", icon: Users },
      { href: "/purchases", label: "Purchases", icon: ShoppingBag },
    ],
  },
  {
    title: "Account",
    items: [
      { href: "/messages", label: "Messages", icon: MessageCircle },
      { href: "/billing", label: "Billing", icon: CreditCard },
      { href: "/settings", label: "Settings", icon: Settings },
    ],
  },
];

interface DashboardSidebarProps {
  variant: "creator" | "fan";
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  creatorProfile?: {
    displayName?: string | null;
    username: string;
  };
}

export function DashboardSidebar({ variant, user, creatorProfile }: DashboardSidebarProps) {
  const pathname = usePathname();
  const { isCollapsed, isMobileOpen, toggle, closeMobile } = useSidebar();
  const navSections = variant === "creator" ? creatorNavSections : fanNavSections;

  const isActive = (href: string) => {
    if (href === "/dashboard/creator" || href === "/dashboard") {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  // Shared navigation content
  const NavigationContent = ({ mobile = false }: { mobile?: boolean }) => (
    <>
      {navSections.map((section, sectionIdx) => (
        <div key={sectionIdx} className={sectionIdx > 0 ? "mt-6" : ""}>
          {section.title && (!isCollapsed || mobile) && (
            <div className="px-4 pb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {section.title}
            </div>
          )}
          <div className="space-y-1">
            {section.items.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={mobile ? closeMobile : undefined}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl font-medium transition-all",
                    !mobile && isCollapsed ? "justify-center p-3" : "px-4 py-3",
                    active
                      ? "bg-foreground text-background shadow-md"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                  title={!mobile && isCollapsed ? item.label : undefined}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  {(mobile || !isCollapsed) && <span>{item.label}</span>}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </>
  );

  // Shared user profile content
  const UserProfileContent = ({ mobile = false }: { mobile?: boolean }) => (
    <>
      {(!mobile && isCollapsed) ? (
        <div className="flex flex-col items-center gap-2">
          <Avatar src={user.image} name={user.name || ""} size="sm" />
          <Link
            href="/api/auth/signout"
            className="p-2 rounded-lg text-muted-foreground hover:text-accent-red hover:bg-accent-red/10 transition-colors"
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-3 mb-3">
            <Avatar src={user.image} name={user.name || ""} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-foreground truncate">
                {variant === "creator" && creatorProfile?.displayName
                  ? creatorProfile.displayName
                  : user.name}
              </p>
              {variant === "creator" && creatorProfile && (
                <Link
                  href={`/creator/${creatorProfile.username}`}
                  onClick={mobile ? closeMobile : undefined}
                  className="text-xs text-primary hover:text-primary-700 font-medium"
                >
                  View Profile ↗
                </Link>
              )}
              {variant === "fan" && (
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              )}
            </div>
          </div>
          <Link
            href="/api/auth/signout"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-accent-red transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </Link>
        </>
      )}
    </>
  );

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-overlay/50 z-40 lg:hidden transition-opacity"
          onClick={closeMobile}
          aria-hidden="true"
        />
      )}

      {/* Mobile Sidebar Drawer */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-full w-72 bg-card flex flex-col z-50 lg:hidden transition-transform duration-300 ease-in-out border-r border-border",
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Mobile Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-border">
          <Link href="/" className="flex items-center gap-3" onClick={closeMobile}>
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-foreground tracking-tight">
              CreatorConnect
            </span>
          </Link>
          <button
            onClick={closeMobile}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mobile Navigation */}
        <nav className="flex-1 py-4 px-4 overflow-y-auto">
          <NavigationContent mobile />
        </nav>

        {/* Mobile User Profile */}
        <div className="border-t border-border p-4">
          <UserProfileContent mobile />
        </div>
      </aside>

      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-full bg-card hidden lg:flex flex-col z-40 transition-all duration-300 border-r border-border",
          isCollapsed ? "w-20" : "w-72"
        )}
      >
        {/* Desktop Header */}
        <div className={cn("flex items-center h-16 px-4", isCollapsed ? "justify-center" : "justify-between")}>
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 flex-shrink-0">
              <Heart className="w-5 h-5 text-white" />
            </div>
            {!isCollapsed && (
              <span className="text-xl font-bold text-foreground tracking-tight">
                CreatorConnect
              </span>
            )}
          </Link>
          {!isCollapsed && (
            <button
              onClick={toggle}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              aria-label="Collapse sidebar"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Expand button when collapsed */}
        {isCollapsed && (
          <button
            onClick={toggle}
            className="mx-auto mt-2 p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label="Expand sidebar"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        )}

        {/* Desktop Navigation */}
        <nav className={cn("flex-1 py-4 overflow-y-auto", isCollapsed ? "px-2" : "px-4")}>
          <NavigationContent />
        </nav>

        {/* Desktop User Profile */}
        <div className={cn("border-t border-border", isCollapsed ? "p-2" : "p-4")}>
          <UserProfileContent />
        </div>
      </aside>
    </>
  );
}

interface DashboardLayoutProps {
  children: ReactNode;
  variant: "creator" | "fan";
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  creatorProfile?: {
    displayName?: string | null;
    username: string;
  };
}

export function DashboardLayout({ children, variant, user, creatorProfile }: DashboardLayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const pathname = usePathname();

  // Close mobile sidebar on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  // Lock body scroll when mobile sidebar is open
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileOpen]);

  const closeMobile = () => setIsMobileOpen(false);

  return (
    <SidebarContext.Provider value={{ 
      isCollapsed, 
      isMobileOpen,
      toggle: () => setIsCollapsed(!isCollapsed),
      toggleMobile: () => setIsMobileOpen(!isMobileOpen),
      closeMobile
    }}>
      <div className="min-h-screen bg-background">
        <DashboardSidebar variant={variant} user={user} creatorProfile={creatorProfile} />

        {/* Mobile Header */}
        <header className="lg:hidden sticky top-0 bg-card/80 backdrop-blur-md border-b border-border z-30 px-4 py-3 safe-area-top">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsMobileOpen(true)}
                className="p-2 -ml-2 rounded-lg text-muted-foreground hover:bg-muted transition-colors"
                aria-label="Open menu"
              >
                <Menu className="w-6 h-6" />
              </button>
              <Link href="/" className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                  <Heart className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-foreground text-sm">CreatorConnect</span>
              </Link>
            </div>
            <Avatar src={user.image} name={user.name || ""} size="sm" />
          </div>
        </header>

        {/* Main Content */}
        <main
          className={cn(
            "min-h-screen transition-all duration-300 pb-safe",
            isCollapsed ? "lg:ml-20" : "lg:ml-72"
          )}
        >
          {children}
        </main>
      </div>
    </SidebarContext.Provider>
  );
}
