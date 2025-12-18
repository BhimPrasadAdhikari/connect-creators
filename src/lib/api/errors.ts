/**
Secure Error Handling Utilities
Prevents data leakage through error responses
*/

import { NextResponse } from "next/server";

// Error codes for tracking
type ErrorCode =
  | "VALIDATION_ERROR"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "RATE_LIMITED"
  | "INTERNAL_ERROR"
  | "BAD_REQUEST";

interface SafeErrorResponse {
  error: string;
  code: ErrorCode;
  details?: string[];
  requestId?: string;
}

//Generate a unique request ID for error tracking
function generateRequestId(): string {
  return `req_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 9)}`;
}

// Log error securely - no sensitive data, structured format
export function logError(
  context: string,
  error: unknown,
  additionalInfo?: Record<string, unknown>
): string {
  const requestId = generateRequestId();
  
  // Extract safe error info
  const errorInfo = {
    requestId,
    context,
    timestamp: new Date().toISOString(),
    type: error instanceof Error ? error.name : typeof error,
    message: error instanceof Error ? error.message : "Unknown error",
    ...additionalInfo,
  };
  
  // Log without stack traces in production
  if (process.env.NODE_ENV === "production") {
    console.error(JSON.stringify(errorInfo));
  } else {
    // In development, include more details
    console.error("[Error]", errorInfo);
    if (error instanceof Error && error.stack) {
      console.error("[Stack]", error.stack);
    }
  }
  
  return requestId;
}

// Create a safe error response (no sensitive data leakage)
export function createErrorResponse(
  message: string,
  status: number,
  code: ErrorCode = "INTERNAL_ERROR",
  details?: string[]
): NextResponse<SafeErrorResponse> {
  const requestId = generateRequestId();
  
  const response: SafeErrorResponse = {
    error: message,
    code,
    requestId,
  };
  
  // Only include details for validation errors (safe to expose)
  if (details && code === "VALIDATION_ERROR") {
    response.details = details;
  }
  
  return NextResponse.json(response, { status });
}

// Standard error responses
export const ApiErrors = {
  unauthorized: (message = "Authentication required") =>
    createErrorResponse(message, 401, "UNAUTHORIZED"),
    
  forbidden: (message = "Access denied") =>
    createErrorResponse(message, 403, "FORBIDDEN"),
    
  notFound: (resource = "Resource") =>
    createErrorResponse(`${resource} not found`, 404, "NOT_FOUND"),
    
  badRequest: (message = "Invalid request") =>
    createErrorResponse(message, 400, "BAD_REQUEST"),
    
  validationError: (errors: string[]) =>
    createErrorResponse("Validation failed", 400, "VALIDATION_ERROR", errors),
    
  conflict: (message = "Resource already exists") =>
    createErrorResponse(message, 409, "CONFLICT"),
    
  rateLimited: (message = "Too many requests") =>
    createErrorResponse(message, 429, "RATE_LIMITED"),
    
  internal: (requestId?: string) =>
    createErrorResponse(
      "An unexpected error occurred. Please try again later.",
      500,
      "INTERNAL_ERROR"
    ),
};

// Safe wrapper for API route handlers
// Catches errors and returns safe responses
export async function withErrorHandler<T>(
  handler: () => Promise<NextResponse<T>>,
  context: string
): Promise<NextResponse<T | SafeErrorResponse>> {
  try {
    return await handler();
  } catch (error) {
    const requestId = logError(context, error);
    
    // Check for known error types
    if (error instanceof ValidationError) {
      return ApiErrors.validationError(error.errors);
    }
    
    if (error instanceof AuthorizationError) {
      return error.statusCode === 401
        ? ApiErrors.unauthorized(error.message)
        : ApiErrors.forbidden(error.message);
    }
    
    // Return safe internal error for unknown errors
    return ApiErrors.internal(requestId);
  }
}

// Custom error classes for typed error handling
export class ValidationError extends Error {
  public errors: string[];
  
  constructor(errors: string[]) {
    super("Validation failed");
    this.name = "ValidationError";
    this.errors = errors;
  }
}

export class AuthorizationError extends Error {
  public statusCode: number;
  
  constructor(message: string, statusCode = 403) {
    super(message);
    this.name = "AuthorizationError";
    this.statusCode = statusCode;
  }
}

export class NotFoundError extends Error {
  constructor(resource = "Resource") {
    super(`${resource} not found`);
    this.name = "NotFoundError";
  }
}
