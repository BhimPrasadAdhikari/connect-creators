/**
 * Stripe Payment Integration
 * For international card payments
 */

import Stripe from "stripe";
import type { PaymentConfig, PaymentResult, PaymentVerification, PaymentProviderInterface } from "./types";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-11-17.clover",
});

export const stripeProvider: PaymentProviderInterface = {
  async createOrder(config: PaymentConfig): Promise<PaymentResult> {
    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: config.currency.toLowerCase(),
              product_data: {
                name: "Creator Subscription",
                metadata: config.metadata,
              },
              unit_amount: config.amount,
              recurring: {
                interval: "month",
              },
            },
            quantity: 1,
          },
        ],
        mode: "subscription",
        success_url: `${process.env.NEXTAUTH_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.NEXTAUTH_URL}/payment/cancel`,
        metadata: {
          subscriptionId: config.subscriptionId,
          userId: config.userId,
          ...config.metadata,
        },
      });

      return {
        success: true,
        orderId: session.id,
        redirectUrl: session.url || undefined,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Stripe payment failed";
      return {
        success: false,
        error: message,
      };
    }
  },

  async verifyPayment(sessionId: string): Promise<PaymentVerification> {
    try {
      const session = await stripe.checkout.sessions.retrieve(sessionId);

      return {
        success: session.payment_status === "paid",
        orderId: session.id,
        paymentId: session.payment_intent as string,
        amount: session.amount_total || 0,
        status: session.payment_status === "paid" ? "completed" : "pending",
      };
    } catch (error) {
      return {
        success: false,
        orderId: sessionId,
        paymentId: "",
        amount: 0,
        status: "failed",
      };
    }
  },

  async processWebhook(payload) {
    // Handle Stripe webhook events
    const event = payload.data as unknown as Stripe.Event;

    switch (event.type) {
      case "checkout.session.completed":
        // Mark subscription as active
        console.log("Stripe checkout completed:", event.data.object);
        break;
      case "invoice.payment_succeeded":
        // Renewal successful
        console.log("Stripe renewal succeeded:", event.data.object);
        break;
      case "invoice.payment_failed":
        // Renewal failed
        console.log("Stripe renewal failed:", event.data.object);
        break;
      case "customer.subscription.deleted":
        // Subscription cancelled
        console.log("Stripe subscription cancelled:", event.data.object);
        break;
    }
  },
};

/**
 * Verify Stripe webhook signature
 */
export function verifyStripeWebhook(
  payload: string,
  signature: string
): Stripe.Event | null {
  try {
    const secret = process.env.STRIPE_WEBHOOK_SECRET || "";
    return stripe.webhooks.constructEvent(payload, signature, secret);
  } catch (error) {
    console.error("Stripe webhook verification failed:", error);
    return null;
  }
}

export default stripeProvider;
