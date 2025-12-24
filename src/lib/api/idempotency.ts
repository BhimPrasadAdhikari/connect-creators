// Idempotency Key Utility
// Prevents duplicate payment creation from double-clicks or network retries
// Uses in-memory storage with TTL (use Redis in production for distributed systems)

import { NextRequest, NextResponse } from "next/server";

interface IdempotencyEntry {
  response: object;
  createdAt: number;
}

// In-memory storage for idempotency keys (use Redis in production)
const idempotencyStore = new Map<string, IdempotencyEntry>();

// TTL for idempotency keys (5 minutes)
const IDEMPOTENCY_TTL_MS = 5 * 60 * 1000;

// Clean up expired entries periodically (every 2 minutes)
const CLEANUP_INTERVAL = 2 * 60 * 1000;
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of idempotencyStore.entries()) {
    if (now - entry.createdAt > IDEMPOTENCY_TTL_MS) {
      idempotencyStore.delete(key);
    }
  }
}, CLEANUP_INTERVAL);

// Generate idempotency key from user ID and request parameters
export function generateIdempotencyKey(
  userId: string,
  operation: string,
  params: Record<string, string | number | undefined>
): string {
  const paramStr = Object.entries(params)
    .filter(([, v]) => v !== undefined)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join("&");
  
  return `${userId}:${operation}:${paramStr}`;
}

// Check if an idempotent operation was already processed
// Returns the cached response if found, null otherwise
export function checkIdempotency(key: string): object | null {
  const entry = idempotencyStore.get(key);
  
  if (!entry) {
    return null;
  }
  
  // Check if entry has expired
  if (Date.now() - entry.createdAt > IDEMPOTENCY_TTL_MS) {
    idempotencyStore.delete(key);
    return null;
  }
  
  console.log(`[Idempotency] Returning cached response for key: ${key}`);
  return entry.response;
}

// Store a response for future duplicate requests
export function storeIdempotentResponse(key: string, response: object): void {
  idempotencyStore.set(key, {
    response,
    createdAt: Date.now(),
  });
  console.log(`[Idempotency] Stored response for key: ${key}`);
}

// Main helper function for payment routes
// Returns cached response if duplicate, null if new request
export function handleIdempotency(
  req: NextRequest,
  userId: string,
  operation: string,
  params: Record<string, string | number | undefined>
): { key: string; cachedResponse: NextResponse | null } {
  // Check for client-provided idempotency key header (preferred)
  const clientKey = req.headers.get("x-idempotency-key");
  
  // Generate key from parameters if no client key provided
  const key = clientKey 
    ? `${userId}:${operation}:${clientKey}`
    : generateIdempotencyKey(userId, operation, params);
  
  const cached = checkIdempotency(key);
  
  if (cached) {
    return {
      key,
      cachedResponse: NextResponse.json({
        ...cached,
        _idempotent: true,
        _message: "This request was already processed. Returning cached response.",
      }),
    };
  }
  
  return { key, cachedResponse: null };
}

// Store successful payment response for idempotency
export function cachePaymentResponse(key: string, response: object): void {
  storeIdempotentResponse(key, response);
}
