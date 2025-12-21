// Session Security Service
// Handles session management for account takeover prevention

import prisma from "@/lib/prisma";
import { logAudit, AuditAction } from "./audit";
import { sendSessionsRevokedEmail } from "@/lib/email/service";

// Revoke all sessions for a user
// Increments securityVersion which invalidates all JWTs
export async function revokeAllSessions(userId: string): Promise<void> {
  // Get user info for email notification
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, name: true, securityVersion: true },
  });

  if (!user) {
    throw new Error("User not found");
  }

  // Increment security version to invalidate all existing JWTs
  await prisma.user.update({
    where: { id: userId },
    data: { securityVersion: { increment: 1 } },
  });

  // Delete any stored sessions (for database session strategy)
  await prisma.session.deleteMany({
    where: { userId },
  });

  // Log the action
  await logAudit({
    userId,
    action: AuditAction.SESSIONS_REVOKED,
    resource: "session",
  });

  // Send email notification
  if (user.email) {
    await sendSessionsRevokedEmail(user.email, user.name || "User");
  }
}

// Get active sessions for a user
// Note: With JWT strategy, we can't list all sessions
// This is for database session strategy
export async function getActiveSessions(userId: string) {
  return prisma.session.findMany({
    where: {
      userId,
      expires: { gt: new Date() },
    },
    select: {
      id: true,
      expires: true,
    },
    orderBy: { expires: "desc" },
  });
}

// Check for suspicious login patterns
// Simple implementation - can be enhanced with ML/more sophisticated detection
export async function detectSuspiciousLogin(
  userId: string,
  currentIp: string | null
): Promise<{
  isSuspicious: boolean;
  reasons: string[];
}> {
  const reasons: string[] = [];

  // Get recent login history
  const recentLogins = await prisma.auditLog.findMany({
    where: {
      userId,
      action: AuditAction.LOGIN_SUCCESS,
      createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }, // Last 30 days
    },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  if (recentLogins.length === 0) {
    // First login ever - not necessarily suspicious but notable
    return { isSuspicious: false, reasons: [] };
  }

  // Check if this IP is new
  const knownIps = new Set(
    recentLogins.map((log) => log.ipAddress).filter(Boolean)
  );

  if (currentIp && !knownIps.has(currentIp)) {
    reasons.push("Login from new IP address");
  }

  // Check for rapid logins from different IPs (possible credential stuffing victim)
  const last24Hours = recentLogins.filter(
    (log) => log.createdAt > new Date(Date.now() - 24 * 60 * 60 * 1000)
  );

  const uniqueIpsLast24h = new Set(
    last24Hours.map((log) => log.ipAddress).filter(Boolean)
  );

  if (uniqueIpsLast24h.size >= 3) {
    reasons.push("Multiple different IPs in last 24 hours");
  }

  // Check for failed login attempts before this success
  const recentFailures = await prisma.auditLog.count({
    where: {
      action: AuditAction.LOGIN_FAILURE,
      ipAddress: currentIp,
      createdAt: { gte: new Date(Date.now() - 60 * 60 * 1000) }, // Last hour
    },
  });

  if (recentFailures >= 3) {
    reasons.push("Multiple failed login attempts before success");
  }

  return {
    isSuspicious: reasons.length > 0,
    reasons,
  };
}

// Validate password strength
export function validatePasswordStrength(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long");
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }

  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }

  if (!/[0-9]/.test(password)) {
    errors.push("Password must contain at least one number");
  }

  // Check for common weak passwords
  const commonPasswords = [
    // "password",
    "12345678",
    "qwerty123",
    // "password123",
    "letmein",
  ];
  if (commonPasswords.includes(password.toLowerCase())) {
    errors.push("This password is too common");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
