"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

interface BreadcrumbItem {
  label: string;
  href: string;
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
  className?: string;
  showHome?: boolean;
}

// Route label mappings for automatic breadcrumb generation
const routeLabels: Record<string, string> = {
  dashboard: "Dashboard",
  creator: "Creator",
  explore: "Explore",
  settings: "Settings",
  posts: "Posts",
  new: "New Post",
  tiers: "Tiers",
  products: "Products",
  messages: "Messages",
  notifications: "Notifications",
  checkout: "Checkout",
  payment: "Payment",
  success: "Success",
  "how-it-works": "How It Works",
  pricing: "Pricing",
};

export function Breadcrumbs({ 
  items, 
  className, 
  showHome = true 
}: BreadcrumbsProps) {
  const pathname = usePathname();

  // Generate breadcrumbs from pathname if no items provided
  const breadcrumbItems: BreadcrumbItem[] = items || generateBreadcrumbs(pathname);

  // Don't show on home page or if only home is visible
  if (pathname === "/" || (breadcrumbItems.length === 0 && showHome)) {
    return null;
  }

  return (
    <nav 
      aria-label="Breadcrumb" 
      className={cn("flex items-center text-sm", className)}
    >
      <ol className="flex items-center flex-wrap gap-1">
        {showHome && (
          <li className="flex items-center">
            <Link 
              href="/" 
              className="text-muted-foreground hover:text-foreground transition-colors p-1 -ml-1 rounded hover:bg-muted"
              aria-label="Home"
            >
              <Home className="w-4 h-4" />
            </Link>
            {breadcrumbItems.length > 0 && (
              <ChevronRight className="w-4 h-4 text-muted-foreground mx-1" />
            )}
          </li>
        )}
        
        {breadcrumbItems.map((item, index) => {
          const isLast = index === breadcrumbItems.length - 1;
          
          return (
            <li key={item.href} className="flex items-center">
              {isLast ? (
                <span 
                  className="text-foreground font-medium truncate max-w-[200px]"
                  aria-current="page"
                >
                  {item.label}
                </span>
              ) : (
                <>
                  <Link 
                    href={item.href}
                    className="text-muted-foreground hover:text-foreground transition-colors hover:underline truncate max-w-[150px]"
                  >
                    {item.label}
                  </Link>
                  <ChevronRight className="w-4 h-4 text-muted-foreground mx-1 shrink-0" />
                </>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function generateBreadcrumbs(pathname: string): BreadcrumbItem[] {
  if (!pathname || pathname === "/") return [];

  const segments = pathname.split("/").filter(Boolean);
  const items: BreadcrumbItem[] = [];
  let currentPath = "";

  for (const segment of segments) {
    currentPath += `/${segment}`;
    
    // Skip dynamic route segments like [username] or [tierId]
    if (segment.startsWith("[") && segment.endsWith("]")) {
      continue;
    }

    // Check if it's a dynamic segment (UUID-like or username)
    const isDynamicValue = /^[a-f0-9-]{36}$/.test(segment) || 
                           /^[a-zA-Z0-9_]+$/.test(segment) && !routeLabels[segment];

    // Get label from mapping or format the segment
    let label = routeLabels[segment];
    
    if (!label && !isDynamicValue) {
      // Fallback: capitalize and replace dashes
      label = segment
        .split("-")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    }

    if (label) {
      items.push({
        label,
        href: currentPath,
      });
    }
  }

  return items;
}

// Compact mobile version
export function BreadcrumbsMobile({ 
  items, 
  className 
}: BreadcrumbsProps) {
  const pathname = usePathname();
  const breadcrumbItems = items || generateBreadcrumbs(pathname);

  if (breadcrumbItems.length <= 1) {
    return <Breadcrumbs items={items} className={className} />;
  }

  // Show only parent and current on mobile
  const parent = breadcrumbItems[breadcrumbItems.length - 2];
  const current = breadcrumbItems[breadcrumbItems.length - 1];

  return (
    <nav 
      aria-label="Breadcrumb" 
      className={cn("flex items-center text-sm", className)}
    >
      <Link 
        href={parent.href}
        className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
      >
        <ChevronRight className="w-4 h-4 rotate-180" />
        <span className="truncate max-w-[120px]">{parent.label}</span>
      </Link>
    </nav>
  );
}
