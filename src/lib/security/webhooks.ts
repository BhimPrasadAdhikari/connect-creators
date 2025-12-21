// Webhook Verification Utilities
// Cryptographic signature verification for payment provider webhooks

import crypto from "crypto";
import prisma from "@/lib/prisma";

// Verify Razorpay webhook signature
// Uses HMAC SHA256
export function verifyRazorpaySignature(
  body: string,
  signature: string,
  secret: string
): boolean {
  try {
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(body)
      .digest("hex");
    
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  } catch (error) {
    console.error("[Webhook] Razorpay signature verification failed:", error);
    return false;
  }
}

// Verify Stripe webhook signature
// Uses their custom signing scheme with timestamp
export function verifyStripeSignature(
  payload: string,
  signatureHeader: string,
  secret: string
): boolean {
  try {
    // Parse the signature header
    const elements = signatureHeader.split(",");
    const signatureMap: Record<string, string> = {};
    
    for (const element of elements) {
      const [key, value] = element.split("=");
      signatureMap[key] = value;
    }
    
    const timestamp = signatureMap["t"];
    const signature = signatureMap["v1"];
    
    if (!timestamp || !signature) {
      console.error("[Webhook] Missing timestamp or signature in Stripe header");
      return false;
    }
    
    // Verify timestamp is recent (within 5 minutes)
    const timestampAge = Math.abs(Date.now() / 1000 - parseInt(timestamp));
    if (timestampAge > 300) {
      console.error("[Webhook] Stripe webhook timestamp too old:", timestampAge);
      return false;
    }
    
    // Compute expected signature
    const signedPayload = `${timestamp}.${payload}`;
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(signedPayload)
      .digest("hex");
    
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  } catch (error) {
    console.error("[Webhook] Stripe signature verification failed:", error);
    return false;
  }
}

// Check if a webhook event has already been processed (idempotency)
// Prevents replay attacks and duplicate processing
export async function isReplayAttack(
  eventId: string,
  provider: string
): Promise<boolean> {
  // Check if we've already processed this event
  const existing = await prisma.webhookEvent.findFirst({
    where: {
      providerId: eventId,
      provider: provider,
    },
  });
  
  return existing !== null;
}

// Record a processed webhook event
export async function recordWebhookEvent(
  eventId: string,
  provider: string,
  eventType: string,
  payload: unknown
): Promise<void> {
  await prisma.webhookEvent.create({
    data: {
      providerId: eventId,
      provider: provider,
      eventType: eventType,
      payload: payload as object,
    },
  });
}

// Clean up old webhook events (run periodically)
// Keeps events for 30 days for debugging
export async function cleanupOldWebhookEvents(): Promise<number> {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const result = await prisma.webhookEvent.deleteMany({
    where: {
      processedAt: { lt: thirtyDaysAgo },
    },
  });
  
  return result.count;
}
