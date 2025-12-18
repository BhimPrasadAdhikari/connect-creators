// Role-Based Access Control (RBAC) Utilities
// Centralized permission checking for secure authorization

import { Session } from "next-auth";
import prisma from "@/lib/prisma";

// Role definitions
export const ROLES = {
  ADMIN: "ADMIN",
  CREATOR: "CREATOR",
  FAN: "FAN",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

// Permission levels (higher = more privileged)
const ROLE_HIERARCHY: Record<Role, number> = {
  ADMIN: 100,
  CREATOR: 50,
  FAN: 10,
};

// Checks if the user has the required role or higher
export function hasRole(session: Session | null, requiredRole: Role): boolean {
  if (!session?.user?.role) return false;
  const userRole = session.user.role as Role;
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

// Checks if user is exactly the specified role
export function isRole(session: Session | null, role: Role): boolean {
  if (!session?.user?.role) return false;
  return session.user.role === role;
}

// Checks if user is authenticated
export function isAuthenticated(session: Session | null): boolean {
  return !!session?.user?.id;
}

// Checks if user is a creator
export function isCreator(session: Session | null): boolean {
  return session?.user?.role === ROLES.CREATOR;
}

// Checks if user is an admin
export function isAdmin(session: Session | null): boolean {
  return session?.user?.role === ROLES.ADMIN;
}

// Verifies that the user owns the specified creator profile
// Used for authorization on creator-specific actions
export async function isCreatorOwner(
  session: Session | null,
  creatorId: string
): Promise<boolean> {
  if (!session?.user?.id) return false;

  const creator = await prisma.creatorProfile.findUnique({
    where: { id: creatorId },
    select: { userId: true },
  });

  return creator?.userId === session.user.id;
}

// Verifies that the user owns the specified resource by userId
export function isResourceOwner(
  session: Session | null,
  resourceUserId: string
): boolean {
  if (!session?.user?.id) return false;
  return session.user.id === resourceUserId;
}

// Creates a standardized unauthorized response
export function unauthorizedResponse(message = "Unauthorized") {
  return { error: message, status: 401 };
}

// Creates a standardized forbidden response
export function forbiddenResponse(message = "Forbidden") {
  return { error: message, status: 403 };
}

// Utility to require authentication - throws descriptive error
export function requireAuth(session: Session | null): asserts session is Session {
  if (!session?.user?.id) {
    throw new AuthorizationError("Authentication required");
  }
}

// Utility to require a specific role
export function requireRole(session: Session | null, role: Role): void {
  requireAuth(session);
  if (!hasRole(session, role)) {
    throw new AuthorizationError(`${role} role required`);
  }
}

// Custom error class for authorization failures
export class AuthorizationError extends Error {
  public statusCode: number;

  constructor(message: string, statusCode = 403) {
    super(message);
    this.name = "AuthorizationError";
    this.statusCode = statusCode;
  }
}
