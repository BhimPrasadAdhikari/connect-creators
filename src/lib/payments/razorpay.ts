/**
 * Razorpay Payment Integration
 * For India - UPI + Cards
 */

import Razorpay from "razorpay";
import crypto from "crypto";
import type { PaymentConfig, PaymentResult, PaymentVerification, PaymentProviderInterface } from "./types";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "",
});

export const razorpayProvider: PaymentProviderInterface = {
  async createOrder(config: PaymentConfig): Promise<PaymentResult> {
    try {
      const order = await razorpay.orders.create({
        amount: config.amount,
        currency: config.currency,
        receipt: config.subscriptionId,
        notes: {
          userId: config.userId,
          subscriptionId: config.subscriptionId,
          ...config.metadata,
        },
      });

      return {
        success: true,
        orderId: order.id,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Razorpay payment failed";
      return {
        success: false,
        error: message,
      };
    }
  },

  async verifyPayment(
    orderId: string,
    paymentId: string,
    signature?: string
  ): Promise<PaymentVerification> {
    try {
      // Verify signature
      const secret = process.env.RAZORPAY_KEY_SECRET || "";
      const body = `${orderId}|${paymentId}`;
      const expectedSignature = crypto
        .createHmac("sha256", secret)
        .update(body)
        .digest("hex");

      const isValid = signature === expectedSignature;

      if (!isValid) {
        return {
          success: false,
          orderId,
          paymentId,
          amount: 0,
          status: "failed",
        };
      }

      // Fetch payment details
      const payment = await razorpay.payments.fetch(paymentId);

      return {
        success: payment.status === "captured",
        orderId,
        paymentId,
        amount: payment.amount as number,
        status: payment.status === "captured" ? "completed" : "pending",
      };
    } catch (error) {
      return {
        success: false,
        orderId,
        paymentId,
        amount: 0,
        status: "failed",
      };
    }
  },

  async processWebhook(payload) {
    const { event, data } = payload;

    switch (event) {
      case "payment.authorized":
        console.log("Razorpay payment authorized:", data);
        break;
      case "payment.captured":
        console.log("Razorpay payment captured:", data);
        // Mark subscription as active
        break;
      case "payment.failed":
        console.log("Razorpay payment failed:", data);
        break;
      case "subscription.charged":
        console.log("Razorpay subscription renewed:", data);
        break;
      case "subscription.cancelled":
        console.log("Razorpay subscription cancelled:", data);
        break;
    }
  },
};

/**
 * Verify Razorpay webhook signature
 */
export function verifyRazorpayWebhook(
  payload: string,
  signature: string
): boolean {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET || "";
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");
  return signature === expectedSignature;
}

/**
 * Get Razorpay key for client-side
 */
export function getRazorpayKeyId(): string {
  return process.env.RAZORPAY_KEY_ID || "";
}

export default razorpayProvider;
