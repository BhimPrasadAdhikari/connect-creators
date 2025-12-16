/**
 * Pricing and Revenue Configuration
 * 
 * Revenue Model:
 * - Platform takes 5-10% commission (configurable)
 * - Payment processing fees vary by method
 * - Creators keep 90-95% after all fees
 */

// Platform commission rates
export const PLATFORM_COMMISSION = {
  // Standard commission rate (10% of transaction)
  STANDARD: 0.10,
  // Premium creators (high volume) - reduced rate
  PREMIUM: 0.05,
  // Promotional rate for new creators (first 3 months)
  PROMOTIONAL: 0.03,
} as const;

// Payment processing fees by provider
export const PAYMENT_FEES = {
  // UPI (India) - lowest fees
  RAZORPAY_UPI: {
    percentage: 0.02, // 2%
    fixed: 0, // No fixed fee
    name: "UPI",
  },
  // Cards via Razorpay
  RAZORPAY_CARD: {
    percentage: 0.025, // 2.5%
    fixed: 0,
    name: "Card (India)",
  },
  // International cards via Stripe
  STRIPE: {
    percentage: 0.029, // 2.9%
    fixed: 30, // $0.30 equivalent (~₹25)
    name: "International Card",
  },
  // eSewa (Nepal)
  ESEWA: {
    percentage: 0.02, // 2%
    fixed: 0,
    name: "eSewa",
  },
  // Khalti (Nepal)
  KHALTI: {
    percentage: 0.02, // 2%
    fixed: 0,
    name: "Khalti",
  },
  // Bank Transfer - lowest/no fees
  BANK_TRANSFER: {
    percentage: 0.01, // 1% (manual processing)
    fixed: 0,
    name: "Bank Transfer",
  },
} as const;

// Suggested tier pricing (in paise/cents)
export const SUGGESTED_TIERS = {
  INR: [
    { name: "Supporter", price: 9900, benefits: ["Access to supporter posts", "Early access to content"] },
    { name: "Fan", price: 19900, benefits: ["All Supporter benefits", "Exclusive Q&A access", "Monthly shoutout"] },
    { name: "Superfan", price: 29900, benefits: ["All Fan benefits", "Direct messaging", "Behind-the-scenes content"] },
  ],
  NPR: [
    { name: "Supporter", price: 15900, benefits: ["Access to supporter posts", "Early access to content"] },
    { name: "Fan", price: 29900, benefits: ["All Supporter benefits", "Exclusive Q&A access", "Monthly shoutout"] },
    { name: "Superfan", price: 49900, benefits: ["All Fan benefits", "Direct messaging", "Behind-the-scenes content"] },
  ],
  USD: [
    { name: "Supporter", price: 500, benefits: ["Access to supporter posts", "Early access to content"] },
    { name: "Fan", price: 1000, benefits: ["All Supporter benefits", "Exclusive Q&A access", "Monthly shoutout"] },
    { name: "Superfan", price: 2000, benefits: ["All Fan benefits", "Direct messaging", "Behind-the-scenes content"] },
  ],
} as const;

// Pricing recommendations
export const PRICING_RECOMMENDATIONS = {
  INR: {
    minTierPrice: 4900, // ₹49 minimum
    maxTierPrice: 99900, // ₹999 maximum for MVP
    recommendedEntryTier: 9900, // ₹99 - accessible entry point
    sweetSpotRange: { min: 9900, max: 29900 }, // ₹99-299 sweet spot
  },
  NPR: {
    minTierPrice: 9900, // NPR 99 minimum
    maxTierPrice: 199900, // NPR 1999 maximum
    recommendedEntryTier: 15900, // NPR 159
    sweetSpotRange: { min: 9900, max: 49900 },
  },
  USD: {
    minTierPrice: 100, // $1 minimum
    maxTierPrice: 10000, // $100 maximum
    recommendedEntryTier: 500, // $5
    sweetSpotRange: { min: 300, max: 1500 },
  },
} as const;

// Freemium plan limits
export const FREEMIUM_LIMITS = {
  FREE_TIER: {
    maxSubscribers: 100,
    maxTiers: 3,
    maxPostsPerMonth: 30,
    commissionRate: PLATFORM_COMMISSION.STANDARD,
  },
  PRO_TIER: {
    maxSubscribers: Infinity,
    maxTiers: 10,
    maxPostsPerMonth: Infinity,
    commissionRate: PLATFORM_COMMISSION.STANDARD,
    monthlyFee: 0, // No monthly fee, just commission
  },
} as const;

// Minimum payout thresholds
export const PAYOUT_THRESHOLDS = {
  INR: 50000, // ₹500
  NPR: 100000, // NPR 1000
  USD: 1000, // $10
} as const;

// Payout schedule
export const PAYOUT_SCHEDULE = {
  frequency: "monthly",
  processingDays: 7, // Days to process after month end
  holdPeriod: 14, // Days to hold funds before eligible for payout
} as const;

export type PaymentProvider = keyof typeof PAYMENT_FEES;
export type Currency = "INR" | "NPR" | "USD";
export type CommissionTier = keyof typeof PLATFORM_COMMISSION;
