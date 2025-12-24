// Secure Download URL Generator
// Creates signed, time-limited download tokens for digital products

import crypto from "crypto";

const DOWNLOAD_SECRET = process.env.DOWNLOAD_SECRET || "default-download-secret";
const DEFAULT_EXPIRY_HOURS = 24;

export interface DownloadToken {
  purchaseId: string;
  productId: string;
  userId: string;
  expiresAt: number;
  signature: string;
}

// Generate a secure, time-limited download token
export function generateDownloadToken(
  purchaseId: string,
  productId: string,
  userId: string,
  expiryHours: number = DEFAULT_EXPIRY_HOURS
): string {
  const expiresAt = Date.now() + expiryHours * 60 * 60 * 1000;

  const payload = {
    purchaseId,
    productId,
    userId,
    expiresAt,
  };

  // Create signature
  const dataToSign = `${purchaseId}:${productId}:${userId}:${expiresAt}`;
  const signature = crypto
    .createHmac("sha256", DOWNLOAD_SECRET)
    .update(dataToSign)
    .digest("hex");

  // Encode as base64 URL-safe string
  const tokenData = { ...payload, signature };
  return Buffer.from(JSON.stringify(tokenData)).toString("base64url");
}

// Verify and decode a download token
export function verifyDownloadToken(token: string): {
  valid: boolean;
  data?: DownloadToken;
  error?: string;
} {
  try {
    // Decode token
    const decoded = Buffer.from(token, "base64url").toString();
    const data: DownloadToken = JSON.parse(decoded);

    // Check expiration
    if (Date.now() > data.expiresAt) {
      return { valid: false, error: "Download link has expired" };
    }

    // Verify signature
    const dataToSign = `${data.purchaseId}:${data.productId}:${data.userId}:${data.expiresAt}`;
    const expectedSignature = crypto
      .createHmac("sha256", DOWNLOAD_SECRET)
      .update(dataToSign)
      .digest("hex");

    if (!crypto.timingSafeEqual(
      Buffer.from(data.signature),
      Buffer.from(expectedSignature)
    )) {
      return { valid: false, error: "Invalid download token" };
    }

    return { valid: true, data };
  } catch {
    return { valid: false, error: "Invalid download token format" };
  }
}

// Generate a secure download URL for a product
export function generateSecureDownloadUrl(
  purchaseId: string,
  productId: string,
  userId: string,
  baseUrl: string = process.env.NEXTAUTH_URL || "http://localhost:3000",
  expiryHours: number = DEFAULT_EXPIRY_HOURS
): string {
  const token = generateDownloadToken(purchaseId, productId, userId, expiryHours);
  return `${baseUrl}/api/downloads/${token}`;
}

// Get remaining time until token expires
export function getTokenExpiryInfo(token: string): {
  expired: boolean;
  remainingMs?: number;
  expiresAt?: Date;
} {
  try {
    const decoded = Buffer.from(token, "base64url").toString();
    const data: DownloadToken = JSON.parse(decoded);
    const now = Date.now();
    
    if (now > data.expiresAt) {
      return { expired: true };
    }

    return {
      expired: false,
      remainingMs: data.expiresAt - now,
      expiresAt: new Date(data.expiresAt),
    };
  } catch {
    return { expired: true };
  }
}
