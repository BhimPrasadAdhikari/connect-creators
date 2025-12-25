"use client";

import { useState, createContext, useContext, ReactNode } from "react";
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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui";

interface SidebarContextType {
  isCollapsed: boolean;
  toggle: () => void;
}

const SidebarContext = createContext<SidebarContextType>({
  isCollapsed: false,
  toggle: () => {},
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
  const { isCollapsed, toggle } = useSidebar();
  const navSections = variant === "creator" ? creatorNavSections : fanNavSections;

  const isActive = (href: string) => {
    if (href === "/dashboard/creator" || href === "/dashboard") {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-full bg-white hidden lg:flex flex-col z-40 transition-all duration-300 border-r border-gray-100",
        isCollapsed ? "w-20" : "w-72"
      )}
    >
      {/* Header */}
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
            onClick={toggle}
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
          onClick={toggle}
          className="mx-auto mt-2 p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          aria-label="Expand sidebar"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      )}

      {/* Navigation */}
      <nav className={cn("flex-1 py-4 overflow-y-auto", isCollapsed ? "px-2" : "px-4")}>
        {navSections.map((section, sectionIdx) => (
          <div key={sectionIdx} className={sectionIdx > 0 ? "mt-6" : ""}>
            {section.title && !isCollapsed && (
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
                    className={cn(
                      "flex items-center gap-3 rounded-2xl font-medium transition-all",
                      isCollapsed ? "justify-center p-3" : "px-4 py-3",
                      active
                        ? "bg-gray-900 text-white shadow-md shadow-gray-900/10"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    )}
                    title={isCollapsed ? item.label : undefined}
                  >
                    <item.icon className="w-5 h-5 flex-shrink-0" />
                    {!isCollapsed && <span>{item.label}</span>}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User Profile */}
      <div className={cn("border-t border-gray-100", isCollapsed ? "p-2" : "p-4")}>
        {isCollapsed ? (
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
                  {variant === "creator" && creatorProfile?.displayName
                    ? creatorProfile.displayName
                    : user.name}
                </p>
                {variant === "creator" && creatorProfile && (
                  <Link
                    href={`/creator/${creatorProfile.username}`}
                    className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                  >
                    View Profile ↗
                  </Link>
                )}
                {variant === "fan" && (
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                )}
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
      </div>
    </aside>
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

  return (
    <SidebarContext.Provider value={{ isCollapsed, toggle: () => setIsCollapsed(!isCollapsed) }}>
      <div className="min-h-screen bg-gray-50">
        <DashboardSidebar variant={variant} user={user} creatorProfile={creatorProfile} />

        {/* Mobile Header */}
        <header className="lg:hidden sticky top-0 bg-white/80 backdrop-blur-md border-b border-gray-100 z-30 px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-gray-900">CreatorConnect</span>
            </Link>
            <Avatar src={user.image} name={user.name || ""} size="sm" />
          </div>
        </header>

        {/* Main Content */}
        <main
          className={cn(
            "min-h-screen transition-all duration-300",
            isCollapsed ? "lg:ml-20" : "lg:ml-72"
          )}
        >
          {children}
        </main>
      </div>
    </SidebarContext.Provider>
  );
}
