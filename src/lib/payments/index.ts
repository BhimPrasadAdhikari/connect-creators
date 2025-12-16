/**
 * Unified Payment Service
 * Entry point for all payment operations
 */

import type { PaymentConfig, PaymentResult, PaymentVerification, PaymentProvider, PaymentProviderInterface } from "./types";

export * from "./types";

/**
 * Get the appropriate payment provider (lazy loaded)
 */
async function getProvider(provider: PaymentProvider): Promise<PaymentProviderInterface> {
  switch (provider) {
    case "stripe": {
      const { stripeProvider } = await import("./stripe");
      return stripeProvider;
    }
    case "razorpay": {
      const { razorpayProvider } = await import("./razorpay");
      return razorpayProvider;
    }
    case "esewa": {
      const { esewaProvider } = await import("./esewa");
      return esewaProvider;
    }
    case "khalti": {
      const { khaltiProvider } = await import("./khalti");
      return khaltiProvider;
    }
    case "bank_transfer": {
      const { bankTransferProvider } = await import("./bank-transfer");
      return bankTransferProvider;
    }
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
  const paymentProvider = await getProvider(provider);
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
  const paymentProvider = await getProvider(provider);
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

/**
 * Lazy exports for specific provider utilities
 */
export async function getRazorpayKeyId(): Promise<string> {
  const { getRazorpayKeyId: getKey } = await import("./razorpay");
  return getKey();
}

export async function getKhaltiPublicKey(): Promise<string> {
  const { getKhaltiPublicKey: getKey } = await import("./khalti");
  return getKey();
}

export async function getBankDetails() {
  const { getBankDetails: getDetails } = await import("./bank-transfer");
  return getDetails();
}

export async function verifyBankTransfer(
  orderId: string,
  transactionId: string,
  adminNote?: string
): Promise<boolean> {
  const { verifyBankTransfer: verify } = await import("./bank-transfer");
  return verify(orderId, transactionId, adminNote);
}
