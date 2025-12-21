// Stripe Webhook Handler
// Verifies signatures and processes payment events

import { NextRequest, NextResponse } from "next/server";
import {
  verifyStripeSignature,
  isReplayAttack,
  recordWebhookEvent,
} from "@/lib/security/webhooks";
import { logPayment, AuditAction } from "@/lib/security/audit";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

  if (!STRIPE_WEBHOOK_SECRET) {
    console.error("[Webhook] Stripe webhook secret not configured");
    return NextResponse.json(
      { error: "Webhook not configured" },
      { status: 500 }
    );
  }

  try {
    const payload = await request.text();
    const signature = request.headers.get("stripe-signature");

    if (!signature) {
      console.error("[Webhook] Missing stripe-signature header");
      return NextResponse.json(
        { error: "Missing signature" },
        { status: 400 }
      );
    }

    // Verify signature
    const isValid = verifyStripeSignature(payload, signature, STRIPE_WEBHOOK_SECRET);
    if (!isValid) {
      console.error("[Webhook] Invalid Stripe signature");
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 401 }
      );
    }

    const event = JSON.parse(payload);

    // Check for replay attack
    if (await isReplayAttack(event.id, "stripe")) {
      console.log(`[Webhook] Duplicate Stripe event: ${event.id}`);
      return NextResponse.json({ received: true, duplicate: true });
    }

    // Process the event
    switch (event.type) {
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object;
        const { userId, subscriptionId } = paymentIntent.metadata || {};

        if (subscriptionId) {
          // Update subscription status
          await prisma.subscription.update({
            where: { id: subscriptionId },
            data: { status: "ACTIVE" },
          });

          // Update payment record
          await prisma.payment.updateMany({
            where: { providerOrderId: paymentIntent.id },
            data: {
              status: "COMPLETED",
              providerPayId: paymentIntent.id,
            },
          });

          // Audit log
          if (userId) {
            await logPayment(userId, paymentIntent.id, AuditAction.PAYMENT_COMPLETED, {
              provider: "stripe",
              amount: paymentIntent.amount,
            });
          }
        }
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object;
        const { userId, subscriptionId } = paymentIntent.metadata || {};

        if (subscriptionId) {
          await prisma.payment.updateMany({
            where: { providerOrderId: paymentIntent.id },
            data: { status: "FAILED" },
          });

          if (userId) {
            await logPayment(userId, paymentIntent.id, AuditAction.PAYMENT_FAILED, {
              provider: "stripe",
              error: paymentIntent.last_payment_error?.message,
            });
          }
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        const { subscriptionId } = subscription.metadata || {};

        if (subscriptionId) {
          await prisma.subscription.update({
            where: { id: subscriptionId },
            data: { status: "CANCELLED" },
          });
        }
        break;
      }

      default:
        console.log(`[Webhook] Unhandled Stripe event: ${event.type}`);
    }

    // Record that we processed this event
    await recordWebhookEvent(event.id, "stripe", event.type, event.data.object);

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[Webhook] Stripe webhook error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
