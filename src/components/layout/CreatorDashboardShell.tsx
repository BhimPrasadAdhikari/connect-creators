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
      { href: "/dashboard/payouts", label: "Payouts", icon: Wallet },
      { href: "/dashboard/creator/tiers", label: "Tiers", icon: TrendingUp },
      { href: "/messages", label: "Messages", icon: MessageCircle },
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
        <div key={sectionIdx} className={sectionIdx > 0 ? "mt-6" : ""}>
          {section.title && (!isCollapsed || mobile) && (
            <div className="px-4 pb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
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
                      ? "bg-gray-900 text-white shadow-md shadow-gray-900/10"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
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
            className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
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
              <p className="font-semibold text-sm text-gray-900 truncate">
                {creatorProfile.displayName || user.name}
              </p>
              <Link
                href={`/creator/${creatorProfile.username}`}
                onClick={mobile ? closeMobile : undefined}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium"
              >
                View Profile ↗
              </Link>
            </div>
          </div>
          <Link
            href="/api/auth/signout"
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-500 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign out
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
      <div className="min-h-screen bg-gray-50">
        {/* Mobile Sidebar Overlay */}
        {isMobileOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity"
            onClick={closeMobile}
            aria-hidden="true"
          />
        )}

        {/* Mobile Sidebar Drawer */}
        <aside
          className={cn(
            "fixed left-0 top-0 h-full w-72 bg-white flex flex-col z-50 lg:hidden transition-transform duration-300 ease-in-out border-r border-gray-100",
            isMobileOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          {/* Mobile Header */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-100">
            <Link href="/" className="flex items-center gap-3" onClick={closeMobile}>
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/20">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900 tracking-tight">
                CreatorConnect
              </span>
            </Link>
            <button
              onClick={closeMobile}
              className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
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
          <div className="border-t border-gray-100 p-4">
            <UserProfileContent mobile />
          </div>
        </aside>

        {/* Desktop Sidebar - stays mounted, never re-renders on navigation */}
        <aside
          className={cn(
            "fixed left-0 top-0 h-full bg-white hidden lg:flex flex-col z-40 transition-all duration-300 border-r border-gray-100",
            isCollapsed ? "w-20" : "w-72"
          )}
        >
          {/* Desktop Header */}
          <div className={cn("flex items-center h-16 px-4", isCollapsed ? "justify-center" : "justify-between")}>
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/20 flex-shrink-0">
                <Heart className="w-5 h-5 text-white" />
              </div>
              {!isCollapsed && (
                <span className="text-xl font-bold text-gray-900 tracking-tight">
                  CreatorConnect
                </span>
              )}
            </Link>
            {!isCollapsed && (
              <button
                onClick={() => setIsCollapsed(true)}
                className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                aria-label="Collapse sidebar"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Expand button when collapsed */}
          {isCollapsed && (
            <button
              onClick={() => setIsCollapsed(false)}
              className="mx-auto mt-2 p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
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
          <div className={cn("border-t border-gray-100", isCollapsed ? "p-2" : "p-4")}>
            <UserProfileContent />
          </div>
        </aside>

        {/* Mobile Header */}
        <header className="lg:hidden sticky top-0 bg-white/80 backdrop-blur-md border-b border-gray-100 z-30 px-4 py-3 safe-area-top">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsMobileOpen(true)}
                className="p-2 -ml-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                aria-label="Open menu"
              >
                <Menu className="w-6 h-6" />
              </button>
              <Link href="/" className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                  <Heart className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-gray-900 text-sm">CreatorConnect</span>
              </Link>
            </div>
            <Link href={`/creator/${creatorProfile.username}`}>
              <Avatar src={user.image} name={user.name || ""} size="sm" />
            </Link>
          </div>
        </header>

        {/* Main Content - this is where children (page content) renders */}
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
