/**
 * Pricing and Revenue Configuration
 * 
 * Revenue Model:
 * - Platform takes 15% commission (standard)
 * - Payment processing fees vary by method (2-3%)
 * - Creators keep ~82-83% after all fees
 */

// Platform commission rates
export const PLATFORM_COMMISSION = {
  // Standard commission rate (15% of transaction)
  STANDARD: 0.15,
  // Premium creators (high volume) - reduced rate (10%)
  PREMIUM: 0.10,
  // Promotional rate for new creators (first 3 months) - 5%
  PROMOTIONAL: 0.05,
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

// Minimum payout thresholds (in smallest currency unit - paise/cents)
export const PAYOUT_THRESHOLDS = {
  INR: 50000, // ₹500 minimum
  NPR: 100000, // NPR 1000 minimum
  USD: 1000, // $10 minimum
} as const;

// Maximum payout limits per transaction (anti-fraud measure)
export const PAYOUT_LIMITS = {
  INR: 10000000, // ₹100,000 max per payout
  NPR: 20000000, // NPR 200,000 max per payout
  USD: 500000, // $5,000 max per payout
} as const;

// Payout schedule configuration
export const PAYOUT_SCHEDULE = {
  // Payout frequency options
  frequencies: {
    WEEKLY: {
      name: "Weekly",
      dayOfWeek: 1, // Monday
      description: "Payouts processed every Monday",
    },
    BIWEEKLY: {
      name: "Bi-weekly",
      dayOfWeek: 1, // Every other Monday
      description: "Payouts processed every 2 weeks on Monday",
    },
    MONTHLY: {
      name: "Monthly",
      dayOfMonth: 1, // 1st of each month
      description: "Payouts processed on the 1st of each month",
    },
  },
  // Default frequency
  defaultFrequency: "MONTHLY" as const,
  // Days to process after period ends
  processingDays: 7,
  // Hold period before funds are eligible (chargeback protection)
  holdPeriod: 14, // 14 days
  // Minimum days between payouts
  minimumDaysBetweenPayouts: 7,
} as const;

export type PaymentProvider = keyof typeof PAYMENT_FEES;
export type Currency = "INR" | "NPR" | "USD";
export type CommissionTier = keyof typeof PLATFORM_COMMISSION;
export type PayoutFrequency = keyof typeof PAYOUT_SCHEDULE.frequencies;

