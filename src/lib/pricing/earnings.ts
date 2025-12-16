/**
 * Earnings Calculator
 * 
 * Calculates creator earnings after platform commission and payment fees
 */

import {
  PLATFORM_COMMISSION,
  PAYMENT_FEES,
  PAYOUT_THRESHOLDS,
  type PaymentProvider,
  type Currency,
  type CommissionTier,
} from "./config";

export interface EarningsBreakdown {
  grossAmount: number;
  paymentFee: number;
  paymentFeePercentage: number;
  platformCommission: number;
  platformCommissionPercentage: number;
  totalFees: number;
  totalFeesPercentage: number;
  netEarnings: number;
  creatorSharePercentage: number;
  currency: string;
}

export interface PayoutEligibility {
  eligible: boolean;
  currentBalance: number;
  threshold: number;
  deficit: number;
  currency: string;
  message: string;
}

/**
 * Calculate payment processing fee for a transaction
 */
export function calculatePaymentFee(
  amount: number,
  provider: PaymentProvider
): { fee: number; percentage: number } {
  const feeConfig = PAYMENT_FEES[provider];
  const percentageFee = Math.round(amount * feeConfig.percentage);
  const totalFee = percentageFee + feeConfig.fixed;
  
  return {
    fee: totalFee,
    percentage: feeConfig.percentage * 100,
  };
}

/**
 * Calculate platform commission
 */
export function calculatePlatformCommission(
  amount: number,
  tier: CommissionTier = "STANDARD"
): { commission: number; percentage: number } {
  const rate = PLATFORM_COMMISSION[tier];
  const commission = Math.round(amount * rate);
  
  return {
    commission,
    percentage: rate * 100,
  };
}

/**
 * Calculate complete earnings breakdown for a transaction
 */
export function calculateEarnings(
  grossAmount: number,
  provider: PaymentProvider,
  commissionTier: CommissionTier = "STANDARD",
  currency: Currency = "INR"
): EarningsBreakdown {
  // Calculate payment processing fee
  const { fee: paymentFee, percentage: paymentFeePercentage } = calculatePaymentFee(
    grossAmount,
    provider
  );
  
  // Calculate platform commission (on gross amount)
  const { commission: platformCommission, percentage: platformCommissionPercentage } = 
    calculatePlatformCommission(grossAmount, commissionTier);
  
  const totalFees = paymentFee + platformCommission;
  const netEarnings = grossAmount - totalFees;
  const totalFeesPercentage = (totalFees / grossAmount) * 100;
  const creatorSharePercentage = (netEarnings / grossAmount) * 100;
  
  return {
    grossAmount,
    paymentFee,
    paymentFeePercentage,
    platformCommission,
    platformCommissionPercentage,
    totalFees,
    totalFeesPercentage,
    netEarnings,
    creatorSharePercentage,
    currency,
  };
}

/**
 * Calculate monthly recurring revenue for a creator
 */
export function calculateMonthlyRecurring(
  subscriptions: Array<{ price: number; count: number }>,
  provider: PaymentProvider,
  commissionTier: CommissionTier = "STANDARD"
): {
  grossRevenue: number;
  netRevenue: number;
  totalFees: number;
  subscriberCount: number;
} {
  let grossRevenue = 0;
  let subscriberCount = 0;
  
  for (const sub of subscriptions) {
    grossRevenue += sub.price * sub.count;
    subscriberCount += sub.count;
  }
  
  const earnings = calculateEarnings(grossRevenue, provider, commissionTier);
  
  return {
    grossRevenue,
    netRevenue: earnings.netEarnings,
    totalFees: earnings.totalFees,
    subscriberCount,
  };
}

/**
 * Check payout eligibility
 */
export function checkPayoutEligibility(
  balance: number,
  currency: Currency
): PayoutEligibility {
  const threshold = PAYOUT_THRESHOLDS[currency];
  const eligible = balance >= threshold;
  const deficit = eligible ? 0 : threshold - balance;
  
  const currencySymbols: Record<Currency, string> = {
    INR: "₹",
    NPR: "NPR",
    USD: "$",
  };
  
  const symbol = currencySymbols[currency];
  const formattedBalance = `${symbol}${(balance / 100).toFixed(2)}`;
  const formattedThreshold = `${symbol}${(threshold / 100).toFixed(2)}`;
  const formattedDeficit = `${symbol}${(deficit / 100).toFixed(2)}`;
  
  let message: string;
  if (eligible) {
    message = `You are eligible for payout! Current balance: ${formattedBalance}`;
  } else {
    message = `Earn ${formattedDeficit} more to reach the ${formattedThreshold} payout threshold.`;
  }
  
  return {
    eligible,
    currentBalance: balance,
    threshold,
    deficit,
    currency,
    message,
  };
}

/**
 * Format currency amount for display
 */
export function formatCurrency(amount: number, currency: Currency): string {
  const divisor = 100; // Amounts stored in paise/cents
  
  switch (currency) {
    case "INR":
      return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount / divisor);
    case "NPR":
      return `NPR ${(amount / divisor).toFixed(0)}`;
    case "USD":
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(amount / divisor);
    default:
      return `${amount / divisor}`;
  }
}

/**
 * Get recommended payment method based on currency/region
 */
export function getRecommendedPaymentMethod(currency: Currency): PaymentProvider {
  switch (currency) {
    case "INR":
      return "RAZORPAY_UPI"; // Lowest fees for India
    case "NPR":
      return "ESEWA"; // Popular in Nepal
    case "USD":
      return "STRIPE"; // International
    default:
      return "STRIPE";
  }
}

/**
 * Estimate annual earnings based on current monthly
 */
export function estimateAnnualEarnings(
  monthlyGross: number,
  provider: PaymentProvider,
  commissionTier: CommissionTier = "STANDARD",
  growthRate: number = 0.05 // 5% monthly growth default
): {
  currentMonthly: number;
  projectedAnnual: number;
  withGrowth: number;
} {
  const monthlyEarnings = calculateEarnings(monthlyGross, provider, commissionTier);
  const annualWithoutGrowth = monthlyEarnings.netEarnings * 12;
  
  // Calculate with compound growth
  let annualWithGrowth = 0;
  let currentMonthRevenue = monthlyEarnings.netEarnings;
  for (let month = 0; month < 12; month++) {
    annualWithGrowth += currentMonthRevenue;
    currentMonthRevenue *= (1 + growthRate);
  }
  
  return {
    currentMonthly: monthlyEarnings.netEarnings,
    projectedAnnual: Math.round(annualWithoutGrowth),
    withGrowth: Math.round(annualWithGrowth),
  };
}
