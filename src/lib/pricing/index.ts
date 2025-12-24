/**
 * Pricing Module
 * 
 * Exports all pricing and revenue related functionality
 */

// Configuration
export {
  PLATFORM_COMMISSION,
  PAYMENT_FEES,
  SUGGESTED_TIERS,
  PRICING_RECOMMENDATIONS,
  FREEMIUM_LIMITS,
  PAYOUT_THRESHOLDS,
  PAYOUT_LIMITS,
  PAYOUT_SCHEDULE,
  type PaymentProvider,
  type Currency,
  type CommissionTier,
  type PayoutFrequency,
} from "./config";

// Earnings calculations
export {
  calculatePaymentFee,
  calculatePlatformCommission,
  calculateEarnings,
  calculateMonthlyRecurring,
  checkPayoutEligibility,
  validatePayoutAmount,
  formatCurrency,
  getRecommendedPaymentMethod,
  estimateAnnualEarnings,
  type EarningsBreakdown,
  type PayoutEligibility,
} from "./earnings";

// Validation and recommendations
export {
  validateTierPrice,
  validateAllTiers,
  getSuggestedTiers,
  getOptimalTierCount,
  getPricingGuidance,
  type PricingValidation,
  type TierRecommendation,
} from "./validation";
