// Razorpay Webhook Handler
// Verifies signatures and processes payment events

import { NextRequest, NextResponse } from "next/server";
import {
  verifyRazorpaySignature,
  isReplayAttack,
  recordWebhookEvent,
} from "@/lib/security/webhooks";
import { logPayment, AuditAction } from "@/lib/security/audit";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET;

  if (!RAZORPAY_WEBHOOK_SECRET) {
    console.error("[Webhook] Razorpay webhook secret not configured");
    return NextResponse.json(
      { error: "Webhook not configured" },
      { status: 500 }
    );
  }

  try {
    const payload = await request.text();
    const signature = request.headers.get("x-razorpay-signature");

    if (!signature) {
      console.error("[Webhook] Missing x-razorpay-signature header");
      return NextResponse.json(
        { error: "Missing signature" },
        { status: 400 }
      );
    }

    // Verify signature
    const isValid = verifyRazorpaySignature(payload, signature, RAZORPAY_WEBHOOK_SECRET);
    if (!isValid) {
      console.error("[Webhook] Invalid Razorpay signature");
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 401 }
      );
    }

    const event = JSON.parse(payload);
    const eventId = event.event || `${event.entity}.${Date.now()}`;

    // Check for replay attack
    if (await isReplayAttack(eventId, "razorpay")) {
      console.log(`[Webhook] Duplicate Razorpay event: ${eventId}`);
      return NextResponse.json({ received: true, duplicate: true });
    }

    // Process the event
    switch (event.event) {
      case "payment.captured": {
        const payment = event.payload.payment.entity;
        const { userId, subscriptionId } = payment.notes || {};

        if (subscriptionId) {
          // Update subscription status
          await prisma.subscription.update({
            where: { id: subscriptionId },
            data: { status: "ACTIVE" },
          });

          // Update payment record
          await prisma.payment.updateMany({
            where: { providerOrderId: payment.order_id },
            data: {
              status: "COMPLETED",
              providerPayId: payment.id,
            },
          });

          // Audit log
          if (userId) {
            await logPayment(userId, payment.id, AuditAction.PAYMENT_COMPLETED, {
              provider: "razorpay",
              amount: payment.amount,
              method: payment.method,
            });
          }
        }
        break;
      }

      case "payment.failed": {
        const payment = event.payload.payment.entity;
        const { userId, subscriptionId } = payment.notes || {};

        if (subscriptionId) {
          await prisma.payment.updateMany({
            where: { providerOrderId: payment.order_id },
            data: { status: "FAILED" },
          });

          if (userId) {
            await logPayment(userId, payment.id, AuditAction.PAYMENT_FAILED, {
              provider: "razorpay",
              error: payment.error_description,
              errorCode: payment.error_code,
            });
          }
        }
        break;
      }

      case "subscription.cancelled": {
        const subscription = event.payload.subscription.entity;
        const { subscriptionId } = subscription.notes || {};

        if (subscriptionId) {
          await prisma.subscription.update({
            where: { id: subscriptionId },
            data: { status: "CANCELLED" },
          });
        }
        break;
      }

      default:
        console.log(`[Webhook] Unhandled Razorpay event: ${event.event}`);
    }

    // Record that we processed this event
    await recordWebhookEvent(eventId, "razorpay", event.event, event.payload);

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[Webhook] Razorpay webhook error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
