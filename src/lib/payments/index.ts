/**
 * Unified Payment Service
 * Entry point for all payment operations
 */

import type { PaymentConfig, PaymentResult, PaymentVerification, PaymentProvider } from "./types";
import { stripeProvider } from "./stripe";
import { razorpayProvider } from "./razorpay";
import { esewaProvider } from "./esewa";
import { khaltiProvider } from "./khalti";
import { bankTransferProvider } from "./bank-transfer";

export * from "./types";
export { getRazorpayKeyId } from "./razorpay";
export { getKhaltiPublicKey } from "./khalti";
export { getBankDetails, verifyBankTransfer } from "./bank-transfer";

/**
 * Get the appropriate payment provider
 */
function getProvider(provider: PaymentProvider) {
  switch (provider) {
    case "stripe":
      return stripeProvider;
    case "razorpay":
      return razorpayProvider;
    case "esewa":
      return esewaProvider;
    case "khalti":
      return khaltiProvider;
    case "bank_transfer":
      return bankTransferProvider;
    default:
      throw new Error(`Unknown payment provider: ${provider}`);
  }
}

/**
 * Create a payment order
 */
export async function createPaymentOrder(
  provider: PaymentProvider,
  config: PaymentConfig
): Promise<PaymentResult> {
  const paymentProvider = getProvider(provider);
  return paymentProvider.createOrder(config);
}

/**
 * Verify a payment
 */
export async function verifyPayment(
  provider: PaymentProvider,
  orderId: string,
  paymentId?: string,
  signature?: string
): Promise<PaymentVerification> {
  const paymentProvider = getProvider(provider);
  return paymentProvider.verifyPayment(orderId, paymentId || "", signature);
}

/**
 * Get recommended payment method based on location
 */
export function getRecommendedProvider(countryCode: string): PaymentProvider {
  switch (countryCode.toUpperCase()) {
    case "IN":
      return "razorpay"; // UPI is dominant in India
    case "NP":
      return "esewa"; // eSewa is popular in Nepal
    default:
      return "stripe"; // International
  }
}

/**
 * Get available payment methods for a region
 */
export function getAvailableProviders(countryCode: string): PaymentProvider[] {
  switch (countryCode.toUpperCase()) {
    case "IN":
      return ["razorpay", "stripe", "bank_transfer"];
    case "NP":
      return ["esewa", "khalti", "bank_transfer"];
    default:
      return ["stripe", "bank_transfer"];
  }
}
