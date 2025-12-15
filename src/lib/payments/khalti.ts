/**
 * Khalti Payment Integration
 * Nepal's second leading digital wallet
 */

import type { PaymentConfig, PaymentResult, PaymentVerification, PaymentProviderInterface } from "./types";

const KHALTI_CONFIG = {
  secretKey: process.env.KHALTI_SECRET_KEY || "",
  publicKey: process.env.KHALTI_PUBLIC_KEY || "",
  baseUrl: process.env.NODE_ENV === "production"
    ? "https://khalti.com/api/v2"
    : "https://a.khalti.com/api/v2",
};

export const khaltiProvider: PaymentProviderInterface = {
  async createOrder(config: PaymentConfig): Promise<PaymentResult> {
    try {
      const response = await fetch(`${KHALTI_CONFIG.baseUrl}/epayment/initiate/`, {
        method: "POST",
        headers: {
          "Authorization": `Key ${KHALTI_CONFIG.secretKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          return_url: `${process.env.NEXTAUTH_URL}/payment/khalti/callback`,
          website_url: process.env.NEXTAUTH_URL,
          amount: config.amount, // Khalti expects paisa
          purchase_order_id: config.subscriptionId,
          purchase_order_name: "Creator Subscription",
          customer_info: {
            name: config.metadata?.userName || "Customer",
            email: config.metadata?.userEmail || "",
          },
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Khalti initiation failed");
      }

      const data = await response.json();

      return {
        success: true,
        orderId: data.pidx,
        redirectUrl: data.payment_url,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Khalti payment failed";
      return {
        success: false,
        error: message,
      };
    }
  },

  async verifyPayment(pidx: string): Promise<PaymentVerification> {
    try {
      const response = await fetch(`${KHALTI_CONFIG.baseUrl}/epayment/lookup/`, {
        method: "POST",
        headers: {
          "Authorization": `Key ${KHALTI_CONFIG.secretKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ pidx }),
      });

      if (!response.ok) {
        return {
          success: false,
          orderId: pidx,
          paymentId: "",
          amount: 0,
          status: "failed",
        };
      }

      const data = await response.json();

      return {
        success: data.status === "Completed",
        orderId: pidx,
        paymentId: data.transaction_id || pidx,
        amount: data.total_amount,
        status: data.status === "Completed" ? "completed" : 
               data.status === "Pending" ? "pending" : "failed",
      };
    } catch (error) {
      return {
        success: false,
        orderId: pidx,
        paymentId: "",
        amount: 0,
        status: "failed",
      };
    }
  },

  async processWebhook(payload) {
    // Khalti can send webhooks for status updates
    const { event, data } = payload;
    
    switch (event) {
      case "payment.completed":
        console.log("Khalti payment completed:", data);
        break;
      case "payment.failed":
        console.log("Khalti payment failed:", data);
        break;
    }
  },
};

/**
 * Get Khalti public key for client-side
 */
export function getKhaltiPublicKey(): string {
  return KHALTI_CONFIG.publicKey;
}

export default khaltiProvider;
