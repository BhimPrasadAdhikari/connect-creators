/**
 * Payment Provider Types
 * Unified types for all payment integrations
 */

export type PaymentProvider = "stripe" | "razorpay" | "esewa" | "khalti" | "bank_transfer";

export type PaymentStatus = "pending" | "processing" | "completed" | "failed" | "refunded";

export interface PaymentConfig {
  provider: PaymentProvider;
  amount: number; // In smallest currency unit (paise/cents)
  currency: string;
  subscriptionId: string;
  userId: string;
  metadata?: Record<string, string>;
}

export interface PaymentResult {
  success: boolean;
  orderId?: string;
  paymentId?: string;
  error?: string;
  redirectUrl?: string;
  formData?: Record<string, string>; // For form-based payment providers like eSewa
}

export interface PaymentVerification {
  success: boolean;
  orderId: string;
  paymentId: string;
  amount: number;
  status: PaymentStatus;
}

export interface WebhookPayload {
  provider: PaymentProvider;
  event: string;
  data: Record<string, unknown>;
}

/**
 * Base Payment Provider Interface
 */
export interface PaymentProviderInterface {
  createOrder(config: PaymentConfig): Promise<PaymentResult>;
  verifyPayment(orderId: string, paymentId: string, signature?: string): Promise<PaymentVerification>;
  processWebhook(payload: WebhookPayload): Promise<void>;
  checkStatus?(transactionId: string, amount: number): Promise<PaymentVerification>; // Optional status check
  fetchOrder?(orderId: string): Promise<any>; // Optional fetch order details
  refundPayment?(paymentId: string, amount?: number, currency?: string): Promise<{ success: boolean; refundId?: string; error?: string }>;
}

/**
 * Calculate platform fee
 */
export function calculatePlatformFee(amount: number): {
  total: number;
  platformFee: number;
  creatorEarnings: number;
} {
  const feePercent = parseInt(process.env.PLATFORM_FEE_PERCENT || "10");
  const platformFee = Math.round((amount * feePercent) / 100);
  const creatorEarnings = amount - platformFee;

  return {
    total: amount,
    platformFee,
    creatorEarnings,
  };
}

/**
 * Format amount for display
 */
export function formatAmount(amount: number, currency: string = "INR"): string {
  const formatter = new Intl.NumberFormat(currency === "INR" ? "en-IN" : "en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  return formatter.format(amount / 100);
}
