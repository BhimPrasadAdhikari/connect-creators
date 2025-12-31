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
  TrendingUp,
  Menu,
  X,
  Wallet,
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

const navSections: NavSection[] = [
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
      { href: "/dashboard/creator/payouts", label: "Payouts", icon: Wallet },
      { href: "/dashboard/creator/tiers", label: "Tiers", icon: TrendingUp },
      { href: "/dashboard/creator/messages", label: "Messages", icon: MessageCircle },
      { href: "/dashboard/creator/settings", label: "Settings", icon: Settings },
    ],
  },
];

interface CreatorDashboardShellProps {
  children: ReactNode;
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  creatorProfile: {
    displayName?: string | null;
    username: string;
  };
}

export function CreatorDashboardShell({ children, user, creatorProfile }: CreatorDashboardShellProps) {
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

  const isActive = (href: string) => {
    if (href === "/dashboard/creator") {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  const closeMobile = () => setIsMobileOpen(false);

  // Shared navigation content
  const NavigationContent = ({ mobile = false }: { mobile?: boolean }) => (
    <>
      {navSections.map((section, sectionIdx) => (
        <div key={sectionIdx} className={sectionIdx > 0 ? "mt-8" : ""}>
          {section.title && (!isCollapsed || mobile) && (
            <div className="px-4 pb-2 mb-2 text-xs font-black text-foreground font-mono uppercase tracking-wider border-b-2 border-brutal-black/20 mx-2">
              {section.title}
            </div>
          )}
          <div className="space-y-2">
            {section.items.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={mobile ? closeMobile : undefined}
                  className={cn(
                    "flex items-center gap-3 font-bold transition-all group relative",
                    !mobile && isCollapsed ? "justify-center p-3" : "px-4 py-3 mx-2",
                    active
                      ? "bg-primary text-primary-foreground border-2 border-brutal-black shadow-brutal-sm translate-x-[-2px] translate-y-[-2px]"
                      : "text-foreground hover:bg-accent-yellow hover:text-brutal-black hover:border-2 hover:border-brutal-black hover:shadow-brutal-sm hover:translate-x-[-2px] hover:translate-y-[-2px] border-2 border-transparent"
                  )}
                  title={!mobile && isCollapsed ? item.label : undefined}
                >
                  <item.icon className={cn("w-5 h-5 flex-shrink-0 transition-transform stroke-2", active ? "scale-110" : "group-hover:scale-110")} />
                  {(mobile || !isCollapsed) && <span className="font-display tracking-tight text-sm uppercase">{item.label}</span>}
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
          <div className="border-2 border-brutal-black rounded-none p-0.5 bg-background shadow-brutal-sm">
            <Avatar src={user.image} name={user.name || ""} size="sm" className="rounded-none" />
          </div>
          <Link
            href="/api/auth/signout"
            className="p-2 border-2 border-transparent hover:border-brutal-black hover:bg-accent-red hover:text-white hover:shadow-brutal-sm transition-all"
            title="Sign out"
          >
            <LogOut className="w-4 h-4 stroke-2" />
          </Link>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-3 mb-4 p-3 bg-card border-2 border-brutal-black shadow-brutal-sm">
            <div className="border-2 border-brutal-black rounded-none shrink-0">
              <Avatar src={user.image} name={user.name || ""} size="sm" className="rounded-none" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-display font-black text-sm text-foreground truncate uppercase">
                {creatorProfile.displayName || user.name}
              </p>
              <Link
                href={`/creator/${creatorProfile.username}`}
                onClick={mobile ? closeMobile : undefined}
                className="text-xs text-primary hover:text-accent-purple hover:underline font-mono font-bold uppercase"
              >
                View Profile ↗
              </Link>
            </div>
          </div>
          <Link
            href="/api/auth/signout"
            className="flex items-center justify-center gap-2 text-sm font-black uppercase text-foreground border-2 border-dashed border-brutal-black p-2 hover:bg-accent-red hover:text-white hover:border-solid hover:shadow-brutal-sm active:translate-y-[2px] active:shadow-none transition-all"
          >
            <LogOut className="w-4 h-4 stroke-2" />
            Sign Out
          </Link>
        </>
      )}
    </>
  );

  return (
    <SidebarContext.Provider value={{ 
      isCollapsed, 
      isMobileOpen,
      toggle: () => setIsCollapsed(!isCollapsed),
      toggleMobile: () => setIsMobileOpen(!isMobileOpen),
      closeMobile
    }}>
      <div className="min-h-screen bg-background">
        {/* Mobile Sidebar Overlay */}
        {isMobileOpen && (
          <div
            className="fixed inset-0 bg-brutal-black/50 backdrop-blur-sm z-40 lg:hidden transition-opacity"
            onClick={closeMobile}
            aria-hidden="true"
          />
        )}

        {/* Mobile Sidebar Drawer */}
        <aside
          className={cn(
            "fixed left-0 top-0 h-full w-80 bg-background flex flex-col z-50 lg:hidden transition-transform duration-300 ease-in-out border-r-4 border-brutal-black",
            isMobileOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          {/* Mobile Header */}
          <div className="flex items-center justify-between h-20 px-6 border-b-4 border-brutal-black bg-primary text-white">
            <Link href="/" className="flex items-center gap-3 group" onClick={closeMobile}>
              <div className="w-10 h-10 border-3 border-white bg-card flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)] group-hover:rotate-3 transition-transform">
                <Heart className="w-5 h-5 text-primary fill-current" />
              </div>
              <span className="font-display text-xl font-bold tracking-tight">
                CreatorConnect
              </span>
            </Link>
            <button
              onClick={closeMobile}
              className="p-2 border-2 border-white bg-card/10 hover:bg-card/20 text-white transition-all shadow-sm active:translate-y-0.5"
              aria-label="Close menu"
            >
              <X className="w-6 h-6 stroke-2" />
            </button>
          </div>

          {/* Mobile Navigation */}
          <nav className="flex-1 py-6 px-2 overflow-y-auto bg-card">
            <NavigationContent mobile />
          </nav>

          {/* Mobile User Profile */}
          <div className="border-t-4 border-brutal-black p-6 bg-muted">
            <UserProfileContent mobile />
          </div>
        </aside>

        {/* Desktop Sidebar */}
        <aside
          className={cn(
            "fixed left-0 top-0 h-full bg-card hidden lg:flex flex-col z-40 transition-all duration-300 border-r-4 border-brutal-black shadow-brutal",
            isCollapsed ? "w-24" : "w-72"
          )}
        >
          {/* Desktop Header */}
          <div className={cn("flex items-center h-20 border-b-4 border-brutal-black bg-primary text-white", isCollapsed ? "justify-center px-0" : "justify-between px-6")}>
            <Link href="/" className={cn("flex items-center gap-3 transition-all", isCollapsed ? "" : "group")}>
              <div className={cn(
                "border-3 border-white bg-card flex items-center justify-center shadow-[3px_3px_0px_0px_rgba(0,0,0,0.3)] group-hover:rotate-3 transition-transform",
                isCollapsed ? "w-10 h-10" : "w-10 h-10"
              )}>
                <Heart className="w-5 h-5 text-primary fill-current" />
              </div>
              {!isCollapsed && (
                <span className="font-display text-xl font-bold tracking-tight">
                  CreatorConnect
                </span>
              )}
            </Link>
            {!isCollapsed && (
              <button
                onClick={() => setIsCollapsed(true)}
                className="p-1.5 border-2 border-transparent hover:border-white hover:bg-card/10 rounded-md transition-all"
                aria-label="Collapse sidebar"
              >
                <ChevronLeft className="w-5 h-5 stroke-2" />
              </button>
            )}
          </div>

          {/* Expand button when collapsed */}
          {isCollapsed && (
            <button
              onClick={() => setIsCollapsed(false)}
              className="mx-auto mt-4 p-2 border-2 border-brutal-black bg-card hover:bg-secondary transition-all shadow-brutal-sm hover:shadow-brutal hover:translate-x-[-2px] hover:translate-y-[-2px]"
              aria-label="Expand sidebar"
            >
              <ChevronRight className="w-5 h-5 text-brutal-black stroke-2" />
            </button>
          )}

          {/* Desktop Navigation */}
          <nav className={cn("flex-1 py-6 overflow-y-auto scrollbar-hide", isCollapsed ? "px-2" : "px-2")}>
            <NavigationContent />
          </nav>

          {/* Desktop User Profile */}
          <div className={cn("border-t-4 border-brutal-black bg-muted", isCollapsed ? "p-4" : "p-6")}>
            <UserProfileContent />
          </div>
        </aside>

        {/* Mobile Header */}
        <header className="lg:hidden sticky top-0 bg-card border-b-4 border-brutal-black z-30 px-4 py-3 safe-area-top shadow-brutal-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsMobileOpen(true)}
                className="p-2 -ml-2 border-2 border-brutal-black bg-card shadow-brutal-sm active:translate-y-[2px] active:shadow-none transition-all"
                aria-label="Open menu"
              >
                <Menu className="w-5 h-5 stroke-2" />
              </button>
              <Link href="/" className="flex items-center gap-2 group">
                <div className="w-8 h-8 border-2 border-brutal-black bg-primary flex items-center justify-center shadow-brutal-sm group-hover:rotate-6 transition-transform">
                  <Heart className="w-4 h-4 text-white fill-current" />
                </div>
                <span className="font-display font-bold text-foreground text-lg">CreatorConnect</span>
              </Link>
            </div>
            <Link href={`/creator/${creatorProfile.username}`}>
               <div className="border-2 border-brutal-black rounded-none p-0.5 bg-background shadow-brutal-sm">
                <Avatar src={user.image} name={user.name || ""} size="sm" className="rounded-none" />
              </div>
            </Link>
          </div>
        </header>

        {/* Main Content - this is where children (page content) renders */}
        <main
          className={cn(
            "min-h-screen transition-all duration-300 pb-safe",
             isCollapsed ? "lg:ml-24" : "lg:ml-72"
          )}
        >
          {children}
        </main>
      </div>
    </SidebarContext.Provider>
  );
}
