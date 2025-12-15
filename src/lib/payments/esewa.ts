/**
 * eSewa Payment Integration
 * Nepal's leading digital wallet
 */

import crypto from "crypto";
import type { PaymentConfig, PaymentResult, PaymentVerification, PaymentProviderInterface } from "./types";

const ESEWA_CONFIG = {
  merchantId: process.env.ESEWA_MERCHANT_ID || "",
  secretKey: process.env.ESEWA_SECRET_KEY || "",
  baseUrl: process.env.NODE_ENV === "production" 
    ? "https://esewa.com.np" 
    : "https://rc-epay.esewa.com.np",
};

/**
 * Generate eSewa signature
 */
function generateEsewaSignature(message: string): string {
  return crypto
    .createHmac("sha256", ESEWA_CONFIG.secretKey)
    .update(message)
    .digest("base64");
}

export const esewaProvider: PaymentProviderInterface = {
  async createOrder(config: PaymentConfig): Promise<PaymentResult> {
    try {
      // eSewa uses a form-based redirect, so we return the necessary data
      const transactionUuid = `esewa_${Date.now()}_${config.subscriptionId}`;
      
      // Amount in NPR (assuming conversion or NPR input)
      const amount = config.amount / 100; // Convert from paisa to rupees
      const taxAmount = 0;
      const productServiceCharge = 0;
      const productDeliveryCharge = 0;
      const totalAmount = amount + taxAmount + productServiceCharge + productDeliveryCharge;

      const message = `total_amount=${totalAmount},transaction_uuid=${transactionUuid},product_code=${ESEWA_CONFIG.merchantId}`;
      const signature = generateEsewaSignature(message);

      const formData = {
        amount: amount.toString(),
        tax_amount: taxAmount.toString(),
        total_amount: totalAmount.toString(),
        transaction_uuid: transactionUuid,
        product_code: ESEWA_CONFIG.merchantId,
        product_service_charge: productServiceCharge.toString(),
        product_delivery_charge: productDeliveryCharge.toString(),
        success_url: `${process.env.NEXTAUTH_URL}/payment/esewa/success`,
        failure_url: `${process.env.NEXTAUTH_URL}/payment/esewa/failure`,
        signed_field_names: "total_amount,transaction_uuid,product_code",
        signature,
      };

      return {
        success: true,
        orderId: transactionUuid,
        redirectUrl: `${ESEWA_CONFIG.baseUrl}/api/epay/main/v2/form`,
        // Client will need to submit this as form data
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
      // Decode the base64 response from eSewa
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
      const message = `transaction_code=${decodedData.transaction_code},status=${decodedData.status},total_amount=${decodedData.total_amount},transaction_uuid=${transactionUuid},product_code=${ESEWA_CONFIG.merchantId},signed_field_names=${decodedData.signed_field_names}`;
      const expectedSignature = generateEsewaSignature(message);
      
      if (decodedData.signature !== expectedSignature) {
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
        orderId: transactionUuid,
        paymentId: decodedData.transaction_code,
        amount: parseFloat(decodedData.total_amount) * 100, // Convert to paisa
        status: decodedData.status === "COMPLETE" ? "completed" : "failed",
      };
    } catch (error) {
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
    console.log("eSewa webhook received (not standard):", payload);
  },
};

export default esewaProvider;
