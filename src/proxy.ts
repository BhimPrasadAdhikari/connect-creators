import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Security headers to add to all responses
const securityHeaders = {
  "X-DNS-Prefetch-Control": "on",
  "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
  "X-XSS-Protection": "1; mode=block",
  "X-Frame-Options": "SAMEORIGIN",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
};

// Public API routes that don't require authentication
const publicApiRoutes = [
  "/api/auth",
  "/api/posts", // GET is public
  "/api/products", // GET is public
  "/api/creator", // Public creator info
];

// Check if path is a public API route
function isPublicApiRoute(pathname: string): boolean {
  return publicApiRoutes.some(
    (route) => pathname.startsWith(route) && !pathname.includes("/purchase")
  );
}

// Proxy with NextAuth integration (renamed from middleware per Next.js convention)
export default withAuth(
  function proxy(_request: NextRequest) {
    const response = NextResponse.next();

    // Add security headers to all responses
    Object.entries(securityHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    return response;
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;

        // Allow public routes
        if (
          pathname === "/" ||
          pathname.startsWith("/login") ||
          pathname.startsWith("/register") ||
          pathname.startsWith("/creator/") ||
          pathname.startsWith("/post/") ||
          pathname.startsWith("/pricing") ||
          pathname.startsWith("/terms") ||
          pathname.startsWith("/privacy") ||
          pathname.startsWith("/cookies") ||
          pathname.startsWith("/_next") ||
          pathname.startsWith("/favicon") ||
          pathname.includes(".")
        ) {
          return true;
        }

        // Allow public API routes for GET requests
        if (pathname.startsWith("/api/")) {
          if (isPublicApiRoute(pathname)) {
            return true;
          }
          // API routes require authentication
          return !!token;
        }

        // Protected routes require authentication
        if (
          pathname.startsWith("/dashboard") ||
          pathname.startsWith("/settings") ||
          pathname.startsWith("/billing") ||
          pathname.startsWith("/subscriptions") ||
          pathname.startsWith("/messages")
        ) {
          return !!token;
        }

        return true;
      },
    },
    pages: {
      signIn: "/login",
    },
  }
);

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
};
