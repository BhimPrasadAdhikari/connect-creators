// Audit Logging Service
// Tracks security-relevant actions for compliance and forensics

import prisma from "@/lib/prisma";
import { headers } from "next/headers";

export enum AuditAction {
  // Authentication
  LOGIN_SUCCESS = "LOGIN_SUCCESS",
  LOGIN_FAILURE = "LOGIN_FAILURE",
  LOGOUT = "LOGOUT",
  SIGNUP = "SIGNUP",
  
  // Account Security
  PASSWORD_CHANGE = "PASSWORD_CHANGE",
  EMAIL_CHANGE = "EMAIL_CHANGE",
  SESSIONS_REVOKED = "SESSIONS_REVOKED",
  
  // Profile
  PROFILE_UPDATE = "PROFILE_UPDATE",
  CREATOR_PROFILE_UPDATE = "CREATOR_PROFILE_UPDATE",
  
  // Financial
  PAYMENT_INITIATED = "PAYMENT_INITIATED",
  PAYMENT_COMPLETED = "PAYMENT_COMPLETED",
  PAYMENT_FAILED = "PAYMENT_FAILED",
  SUBSCRIPTION_CREATED = "SUBSCRIPTION_CREATED",
  SUBSCRIPTION_CANCELLED = "SUBSCRIPTION_CANCELLED",
  TIP_SENT = "TIP_SENT",
  PAYOUT_REQUESTED = "PAYOUT_REQUESTED",
  REFUND_PROCESSED = "REFUND_PROCESSED",
  
  // Content
  POST_CREATED = "POST_CREATED",
  POST_DELETED = "POST_DELETED",
  PRODUCT_CREATED = "PRODUCT_CREATED",
  PRODUCT_DELETED = "PRODUCT_DELETED",
  
  // Admin
  ROLE_CHANGE = "ROLE_CHANGE",
  ACCOUNT_DELETED = "ACCOUNT_DELETED",
}

export type AuditStatus = "SUCCESS" | "FAILURE" | "BLOCKED";

interface AuditLogDetails {
  userId?: string;
  action: AuditAction;
  resource?: string;
  resourceId?: string;
  status?: AuditStatus;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

// Extract client IP from request headers
// Works with Vercel, Cloudflare, and direct connections
export async function getClientIp(): Promise<string | null> {
  try {
    const headersList = await headers();
    
    // Vercel/Cloudflare forwarded IP
    const forwardedFor = headersList.get("x-forwarded-for");
    if (forwardedFor) {
      return forwardedFor.split(",")[0].trim();
    }
    
    // Cloudflare specific
    const cfConnectingIp = headersList.get("cf-connecting-ip");
    if (cfConnectingIp) {
      return cfConnectingIp;
    }
    
    // Vercel specific
    const realIp = headersList.get("x-real-ip");
    if (realIp) {
      return realIp;
    }
    
    return null;
  } catch {
    return null;
  }
}

// Get user agent from request headers
export async function getUserAgent(): Promise<string | null> {
  try {
    const headersList = await headers();
    return headersList.get("user-agent");
  } catch {
    return null;
  }
}

// Log an audit event
export async function logAudit(details: AuditLogDetails): Promise<void> {
  try {
    // Get request metadata if not provided
    const ipAddress = details.ipAddress ?? (await getClientIp());
    const userAgent = details.userAgent ?? (await getUserAgent());
    
    await prisma.auditLog.create({
      data: {
        userId: details.userId,
        action: details.action,
        resource: details.resource,
        resourceId: details.resourceId,
        status: details.status || "SUCCESS",
        ipAddress,
        userAgent,
        metadata: details.metadata ? JSON.parse(JSON.stringify(details.metadata)) : undefined,
      },
    });
    
    console.log(
      `[Audit] ${details.action} by ${details.userId || "anonymous"} - ${details.status || "SUCCESS"}`
    );
  } catch (error) {
    // Don't throw - audit logging should never break the main flow
    console.error("[Audit] Failed to log:", error);
  }
}

// Log a successful login
export async function logLoginSuccess(
  userId: string,
  provider: string
): Promise<void> {
  await logAudit({
    userId,
    action: AuditAction.LOGIN_SUCCESS,
    resource: "session",
    metadata: { provider },
  });
}

// Log a failed login attempt
export async function logLoginFailure(
  email: string,
  reason: string
): Promise<void> {
  await logAudit({
    action: AuditAction.LOGIN_FAILURE,
    resource: "session",
    status: "FAILURE",
    metadata: { email, reason },
  });
}

// Log a password change
export async function logPasswordChange(userId: string): Promise<void> {
  await logAudit({
    userId,
    action: AuditAction.PASSWORD_CHANGE,
    resource: "user",
    resourceId: userId,
  });
}

// Log payment events
export async function logPayment(
  userId: string,
  paymentId: string,
  action: AuditAction.PAYMENT_INITIATED | AuditAction.PAYMENT_COMPLETED | AuditAction.PAYMENT_FAILED,
  metadata?: Record<string, unknown>
): Promise<void> {
  await logAudit({
    userId,
    action,
    resource: "payment",
    resourceId: paymentId,
    status: action === AuditAction.PAYMENT_FAILED ? "FAILURE" : "SUCCESS",
    metadata,
  });
}

// Get audit logs for a user (admin/support use)
export async function getUserAuditLogs(
  userId: string,
  limit = 50
): Promise<unknown[]> {
  return prisma.auditLog.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

// Get security-sensitive audit logs (recent failed logins, password changes, etc.)
export async function getSecurityAuditLogs(
  userId: string,
  days = 7
): Promise<unknown[]> {
  const since = new Date();
  since.setDate(since.getDate() - days);
  
  return prisma.auditLog.findMany({
    where: {
      userId,
      createdAt: { gte: since },
      action: {
        in: [
          AuditAction.LOGIN_SUCCESS,
          AuditAction.LOGIN_FAILURE,
          AuditAction.PASSWORD_CHANGE,
          AuditAction.EMAIL_CHANGE,
          AuditAction.SESSIONS_REVOKED,
        ],
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

// Log tip sent
export async function logTipSent(
  userId: string,
  creatorId: string,
  amount: number,
  currency: string
): Promise<void> {
  await logAudit({
    userId,
    action: AuditAction.TIP_SENT,
    resource: "tip",
    resourceId: creatorId,
    metadata: { amount, currency, creatorId },
  });
}

// Log subscription event
export async function logSubscription(
  userId: string,
  subscriptionId: string,
  action: AuditAction.SUBSCRIPTION_CREATED | AuditAction.SUBSCRIPTION_CANCELLED,
  metadata?: Record<string, unknown>
): Promise<void> {
  await logAudit({
    userId,
    action,
    resource: "subscription",
    resourceId: subscriptionId,
    metadata,
  });
}

// Log purchase (product or PPV)
export async function logPurchase(
  userId: string,
  purchaseId: string,
  type: "product" | "ppv",
  amount: number,
  status: AuditStatus
): Promise<void> {
  await logAudit({
    userId,
    action: status === "SUCCESS" ? AuditAction.PAYMENT_COMPLETED : AuditAction.PAYMENT_FAILED,
    resource: "purchase",
    resourceId: purchaseId,
    status,
    metadata: { type, amount },
  });
}

// Log refund request
export async function logRefundRequest(
  userId: string,
  refundId: string,
  amount: number,
  reason: string
): Promise<void> {
  await logAudit({
    userId,
    action: AuditAction.PAYOUT_REQUESTED, // Reusing for refunds
    resource: "refund",
    resourceId: refundId,
    metadata: { amount, reason, type: "refund_request" },
  });
}

// Log content creation/deletion
export async function logContent(
  userId: string,
  contentId: string,
  contentType: "post" | "product",
  action: "created" | "deleted"
): Promise<void> {
  const auditAction = contentType === "post"
    ? (action === "created" ? AuditAction.POST_CREATED : AuditAction.POST_DELETED)
    : (action === "created" ? AuditAction.PRODUCT_CREATED : AuditAction.PRODUCT_DELETED);
  
  await logAudit({
    userId,
    action: auditAction,
    resource: contentType,
    resourceId: contentId,
  });
}

// Log profile updates
export async function logProfileUpdate(
  userId: string,
  profileType: "user" | "creator",
  changes?: Record<string, unknown>
): Promise<void> {
  await logAudit({
    userId,
    action: profileType === "creator" 
      ? AuditAction.CREATOR_PROFILE_UPDATE 
      : AuditAction.PROFILE_UPDATE,
    resource: profileType === "creator" ? "creator_profile" : "user",
    resourceId: userId,
    metadata: changes,
  });
}

// Log refund action (Admin)
export async function logRefundAction(
  userId: string,
  refundId: string,
  action: "APPROVED" | "REJECTED",
  note?: string
): Promise<void> {
  await logAudit({
    userId,
    action: AuditAction.REFUND_PROCESSED,
    resource: "refund",
    resourceId: refundId,
    metadata: { action, note },
  });
}

