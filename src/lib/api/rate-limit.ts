// Rate Limiter Utility
// In-memory rate limiting using sliding window algorithm
// For production with multiple server instances, use Redis-based rate limiting

import { NextRequest, NextResponse } from "next/server";

interface RateLimitEntry {
  count: number;
  firstRequest: number;
}

// In-memory storage (use Redis in production for distributed systems)
const rateLimitStore = new Map<string, RateLimitEntry>();

// Rate limit configurations for different endpoint types
export const RATE_LIMITS = {
  // Payment creation - stricter limits
  PAYMENT_CREATE: {
    windowMs: 60 * 1000, // 1 minute window
    maxRequests: 5, // Max 5 requests per minute
    message: "Too many payment attempts. Please wait a minute before trying again.",
  },
  // Payment verification - moderate limits
  PAYMENT_VERIFY: {
    windowMs: 60 * 1000, // 1 minute window
    maxRequests: 10, // Max 10 verifications per minute
    message: "Too many verification attempts. Please wait before trying again.",
  },
  // Tips - prevent spam
  TIPS: {
    windowMs: 60 * 1000, // 1 minute window
    maxRequests: 5, // Max 5 tips per minute
    message: "You're sending tips too quickly. Please slow down.",
  },
  // General API - default
  GENERAL: {
    windowMs: 60 * 1000, // 1 minute window
    maxRequests: 60, // Max 60 requests per minute
    message: "Rate limit exceeded. Please try again later.",
  },
};

export type RateLimitType = keyof typeof RATE_LIMITS;

// Clean up old entries periodically (every 5 minutes)
const CLEANUP_INTERVAL = 5 * 60 * 1000;
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    // Remove entries older than 10 minutes
    if (now - entry.firstRequest > 10 * 60 * 1000) {
      rateLimitStore.delete(key);
    }
  }
}, CLEANUP_INTERVAL);

// Get client identifier from request (IP address or user ID)
function getClientIdentifier(req: NextRequest, userId?: string): string {
  // Use user ID if available (more reliable for logged-in users)
  if (userId) {
    return `user:${userId}`;
  }
  
  // Fall back to IP address
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0].trim() : "unknown";
  return `ip:${ip}`;
}

// Check rate limit for a given request
// Returns true if request is allowed, false if rate limited
export function checkRateLimit(
  req: NextRequest,
  type: RateLimitType,
  userId?: string
): { allowed: boolean; remaining: number; resetIn: number } {
  const config = RATE_LIMITS[type];
  const clientId = getClientIdentifier(req, userId);
  const key = `${type}:${clientId}`;
  const now = Date.now();

  const entry = rateLimitStore.get(key);

  if (!entry) {
    // First request from this client
    rateLimitStore.set(key, { count: 1, firstRequest: now });
    return { allowed: true, remaining: config.maxRequests - 1, resetIn: config.windowMs };
  }

  const windowElapsed = now - entry.firstRequest;

  if (windowElapsed > config.windowMs) {
    // Window has expired, reset counter
    rateLimitStore.set(key, { count: 1, firstRequest: now });
    return { allowed: true, remaining: config.maxRequests - 1, resetIn: config.windowMs };
  }

  if (entry.count >= config.maxRequests) {
    // Rate limit exceeded
    const resetIn = config.windowMs - windowElapsed;
    return { allowed: false, remaining: 0, resetIn };
  }

  // Increment counter
  entry.count++;
  rateLimitStore.set(key, entry);
  return { 
    allowed: true, 
    remaining: config.maxRequests - entry.count, 
    resetIn: config.windowMs - windowElapsed 
  };
}

// Rate limit middleware for API routes
// Returns a response if rate limited, undefined if allowed
export function rateLimit(
  req: NextRequest,
  type: RateLimitType,
  userId?: string
): NextResponse | null {
  const { allowed, remaining, resetIn } = checkRateLimit(req, type, userId);
  const config = RATE_LIMITS[type];

  if (!allowed) {
    console.warn(`[RateLimit] Blocked ${type} request from ${getClientIdentifier(req, userId)}`);
    
    return NextResponse.json(
      { 
        error: config.message,
        retryAfter: Math.ceil(resetIn / 1000),
      },
      { 
        status: 429,
        headers: {
          "Retry-After": Math.ceil(resetIn / 1000).toString(),
          "X-RateLimit-Limit": config.maxRequests.toString(),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": Math.ceil((Date.now() + resetIn) / 1000).toString(),
        },
      }
    );
  }

  return null;
}

// Add rate limit headers to a response
export function addRateLimitHeaders(
  response: NextResponse,
  type: RateLimitType,
  remaining: number,
  resetIn: number
): NextResponse {
  const config = RATE_LIMITS[type];
  response.headers.set("X-RateLimit-Limit", config.maxRequests.toString());
  response.headers.set("X-RateLimit-Remaining", remaining.toString());
  response.headers.set("X-RateLimit-Reset", Math.ceil((Date.now() + resetIn) / 1000).toString());
  return response;
}
