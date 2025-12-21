/**
 * eSewa Payment Integration
 * Nepal's leading digital wallet
 * Reference: https://developer.esewa.com.np/pages/Epay
 */

import crypto from "crypto";
import type { PaymentConfig, PaymentResult, PaymentVerification, PaymentProviderInterface } from "./types";

const ESEWA_CONFIG = {
  // For UAT: EPAYTEST, For production: your merchant code
  merchantId: process.env.ESEWA_MERCHANT_ID || "EPAYTEST",
  // For UAT: 8gBm/:&EnhH.1/q
  secretKey: process.env.ESEWA_SECRET_KEY || "8gBm/:&EnhH.1/q",
  baseUrl: process.env.NODE_ENV === "production" 
    ? "https://epay.esewa.com.np" 
    : "https://rc-epay.esewa.com.np",
  statusUrl: process.env.NODE_ENV === "production"
    ? "https://esewa.com.np"
    : "https://rc.esewa.com.np",
};

/**
 * Generate eSewa HMAC-SHA256 signature
 * Format: total_amount=X,transaction_uuid=Y,product_code=Z
 */
function generateEsewaSignature(message: string): string {
  return crypto
    .createHmac("sha256", ESEWA_CONFIG.secretKey)
    .update(message)
    .digest("base64");
}

/**
 * Verify eSewa response signature
 */
function verifyEsewaSignature(data: {
  transaction_code: string;
  status: string;
  total_amount: string | number;
  transaction_uuid: string;
  product_code: string;
  signed_field_names: string;
  signature: string;
}): boolean {
  const message = `transaction_code=${data.transaction_code},status=${data.status},total_amount=${data.total_amount},transaction_uuid=${data.transaction_uuid},product_code=${data.product_code},signed_field_names=${data.signed_field_names}`;
  const expectedSignature = generateEsewaSignature(message);
  return data.signature === expectedSignature;
}

export const esewaProvider: PaymentProviderInterface = {
  async createOrder(config: PaymentConfig): Promise<PaymentResult> {
    try {
      const transactionUuid = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
      
      // Amount in NPR (eSewa works with NPR)
      // Assuming config.amount is in paisa, convert to rupees
      const amount = config.amount / 100;
      const taxAmount = 0;
      const productServiceCharge = 0;
      const productDeliveryCharge = 0;
      const totalAmount = amount + taxAmount + productServiceCharge + productDeliveryCharge;

      // Generate signature per eSewa docs
      // Format: total_amount=X,transaction_uuid=Y,product_code=Z
      const signatureMessage = `total_amount=${totalAmount},transaction_uuid=${transactionUuid},product_code=${ESEWA_CONFIG.merchantId}`;
      const signature = generateEsewaSignature(signatureMessage);

      const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

      // Return form data for client-side form submission
      const formData = {
        amount: amount.toString(),
        tax_amount: taxAmount.toString(),
        total_amount: totalAmount.toString(),
        transaction_uuid: transactionUuid,
        product_code: ESEWA_CONFIG.merchantId,
        product_service_charge: productServiceCharge.toString(),
        product_delivery_charge: productDeliveryCharge.toString(),
        success_url: `${baseUrl}/payment/esewa/success`,
        failure_url: `${baseUrl}/payment/esewa/failure`,
        signed_field_names: "total_amount,transaction_uuid,product_code",
        signature,
      };

      return {
        success: true,
        orderId: transactionUuid,
        redirectUrl: `${ESEWA_CONFIG.baseUrl}/api/epay/main/v2/form`,
        formData, // Client needs to POST this as form data
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : "eSewa payment failed";
      return {
        success: false,
        error: message,
      };
    }
  },

  async verifyPayment(
    transactionUuid: string,
    paymentData?: string
  ): Promise<PaymentVerification> {
    try {
      // Decode the base64 response from eSewa redirect
      if (!paymentData) {
        return {
          success: false,
          orderId: transactionUuid,
          paymentId: "",
          amount: 0,
          status: "failed",
        };
      }

      const decodedData = JSON.parse(Buffer.from(paymentData, "base64").toString());
      
      // Verify signature
      const isValid = verifyEsewaSignature(decodedData);
      
      if (!isValid) {
        console.error("[eSewa] Signature verification failed");
        return {
          success: false,
          orderId: transactionUuid,
          paymentId: decodedData.transaction_code || "",
          amount: 0,
          status: "failed",
        };
      }

      return {
        success: decodedData.status === "COMPLETE",
        orderId: decodedData.transaction_uuid,
        paymentId: decodedData.transaction_code,
        amount: parseFloat(decodedData.total_amount) * 100, // Convert back to paisa
        status: decodedData.status === "COMPLETE" ? "completed" : "failed",
      };
    } catch (error) {
      console.error("[eSewa] Verification error:", error);
      return {
        success: false,
        orderId: transactionUuid,
        paymentId: "",
        amount: 0,
        status: "failed",
      };
    }
  },

  /**
   * Check transaction status via eSewa API
   * Use when redirect response is not received within 5 minutes
   */
  async checkStatus(transactionUuid: string, totalAmount: number): Promise<PaymentVerification> {
    try {
      const url = `${ESEWA_CONFIG.statusUrl}/api/epay/transaction/status/?product_code=${ESEWA_CONFIG.merchantId}&total_amount=${totalAmount}&transaction_uuid=${transactionUuid}`;
      
      const response = await fetch(url);
      const data = await response.json();

      return {
        success: data.status === "COMPLETE",
        orderId: data.transaction_uuid,
        paymentId: data.ref_id || "",
        amount: data.total_amount * 100,
        status: data.status === "COMPLETE" ? "completed" : 
               data.status === "PENDING" ? "pending" : "failed",
      };
    } catch (error) {
      console.error("[eSewa] Status check error:", error);
      return {
        success: false,
        orderId: transactionUuid,
        paymentId: "",
        amount: 0,
        status: "failed",
      };
    }
  },

  async processWebhook(payload) {
    // eSewa doesn't use webhooks, verification happens on redirect
    console.log("[eSewa] Webhook received (not standard):", payload);
  },
};

export default esewaProvider;

