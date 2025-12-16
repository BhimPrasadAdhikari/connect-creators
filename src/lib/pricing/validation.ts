/**
 * Pricing Validation
 * 
 * Validates tier pricing and provides recommendations
 */

import { PRICING_RECOMMENDATIONS, SUGGESTED_TIERS, type Currency } from "./config";

export interface PricingValidation {
  valid: boolean;
  warnings: string[];
  errors: string[];
  suggestions: string[];
}

export interface TierRecommendation {
  name: string;
  price: number;
  benefits: readonly string[];
  priceFormatted: string;
}

/**
 * Validate a tier price
 */
export function validateTierPrice(
  price: number,
  currency: Currency
): PricingValidation {
  const config = PRICING_RECOMMENDATIONS[currency];
  const warnings: string[] = [];
  const errors: string[] = [];
  const suggestions: string[] = [];
  
  // Check minimum price
  if (price < config.minTierPrice) {
    errors.push(
      `Price must be at least ${formatPrice(config.minTierPrice, currency)}. ` +
      `This ensures you earn enough after fees.`
    );
  }
  
  // Check maximum price
  if (price > config.maxTierPrice) {
    errors.push(
      `Price cannot exceed ${formatPrice(config.maxTierPrice, currency)} for MVP. ` +
      `Consider creating multiple tiers instead.`
    );
  }
  
  // Check if below sweet spot
  if (price < config.sweetSpotRange.min) {
    warnings.push(
      `Consider pricing at ${formatPrice(config.sweetSpotRange.min, currency)} or higher. ` +
      `Low prices may undervalue your content.`
    );
  }
  
  // Check if above sweet spot
  if (price > config.sweetSpotRange.max) {
    warnings.push(
      `Tiers above ${formatPrice(config.sweetSpotRange.max, currency)} may have lower conversion. ` +
      `Consider offering a lower tier as well.`
    );
  }
  
  // Suggest entry tier if not present
  if (price > config.recommendedEntryTier * 1.5) {
    suggestions.push(
      `Consider adding an entry-level tier around ${formatPrice(config.recommendedEntryTier, currency)} ` +
      `to capture fans with smaller budgets.`
    );
  }
  
  return {
    valid: errors.length === 0,
    warnings,
    errors,
    suggestions,
  };
}

/**
 * Validate all tiers for a creator
 */
export function validateAllTiers(
  tiers: Array<{ name: string; price: number }>,
  currency: Currency
): PricingValidation {
  const allWarnings: string[] = [];
  const allErrors: string[] = [];
  const allSuggestions: string[] = [];
  
  // Must have at least one tier
  if (tiers.length === 0) {
    allErrors.push("You need at least one subscription tier to start earning.");
    return { valid: false, warnings: [], errors: allErrors, suggestions: [] };
  }
  
  // Validate each tier
  for (const tier of tiers) {
    const validation = validateTierPrice(tier.price, currency);
    allErrors.push(...validation.errors);
    allWarnings.push(...validation.warnings);
    allSuggestions.push(...validation.suggestions);
  }
  
  // Check for recommended entry tier
  const config = PRICING_RECOMMENDATIONS[currency];
  const hasAccessibleTier = tiers.some(t => t.price <= config.recommendedEntryTier * 1.2);
  if (!hasAccessibleTier && tiers.length > 0) {
    allSuggestions.push(
      `Add a tier under ${formatPrice(config.recommendedEntryTier, currency)} ` +
      `to attract more subscribers. Research shows this is the sweet spot for fans.`
    );
  }
  
  // Check price gaps
  const sortedTiers = [...tiers].sort((a, b) => a.price - b.price);
  for (let i = 1; i < sortedTiers.length; i++) {
    const gap = sortedTiers[i].price / sortedTiers[i - 1].price;
    if (gap > 3) {
      allWarnings.push(
        `Large price gap between "${sortedTiers[i - 1].name}" and "${sortedTiers[i].name}". ` +
        `Consider adding an intermediate tier.`
      );
    }
  }
  
  // Dedupe suggestions
  const uniqueSuggestions = [...new Set(allSuggestions)];
  
  return {
    valid: allErrors.length === 0,
    warnings: allWarnings,
    errors: allErrors,
    suggestions: uniqueSuggestions,
  };
}

/**
 * Get suggested tiers for a currency
 */
export function getSuggestedTiers(currency: Currency): TierRecommendation[] {
  const tiers = SUGGESTED_TIERS[currency] || SUGGESTED_TIERS.INR;
  
  return tiers.map(tier => ({
    ...tier,
    priceFormatted: formatPrice(tier.price, currency),
  }));
}

/**
 * Calculate optimal tier count based on audience size
 */
export function getOptimalTierCount(estimatedAudience: number): {
  recommended: number;
  reason: string;
} {
  if (estimatedAudience < 100) {
    return {
      recommended: 1,
      reason: "Start with one tier to keep things simple while building your audience.",
    };
  }
  if (estimatedAudience < 500) {
    return {
      recommended: 2,
      reason: "Two tiers (basic + premium) give fans choice without overwhelming them.",
    };
  }
  if (estimatedAudience < 2000) {
    return {
      recommended: 3,
      reason: "Three tiers (entry, mid, premium) maximize conversion across different budgets.",
    };
  }
  return {
    recommended: 4,
    reason: "With a large audience, consider 4 tiers including an ultra-premium option.",
  };
}

/**
 * Format price for display
 */
function formatPrice(amount: number, currency: Currency): string {
  const value = amount / 100;
  
  switch (currency) {
    case "INR":
      return `₹${value}`;
    case "NPR":
      return `NPR ${value}`;
    case "USD":
      return `$${value}`;
    default:
      return `${value}`;
  }
}

/**
 * Get pricing guidance for new creators
 */
export function getPricingGuidance(currency: Currency): {
  headline: string;
  tips: string[];
  examples: Array<{ type: string; price: string }>;
} {
  const config = PRICING_RECOMMENDATIONS[currency];
  const sweetMin = formatPrice(config.sweetSpotRange.min, currency);
  const sweetMax = formatPrice(config.sweetSpotRange.max, currency);
  
  return {
    headline: `Most successful creators price their entry tier between ${sweetMin} and ${sweetMax}/month`,
    tips: [
      "Start with an accessible entry tier to maximize conversions",
      "Offer clear value differences between tiers",
      "Consider your time investment for each tier's benefits",
      "You can always adjust prices later based on response",
      "One-time purchases work well for tutorials and guides",
    ],
    examples: [
      { type: "Entry Tier", price: formatPrice(config.recommendedEntryTier, currency) },
      { type: "Mid Tier", price: formatPrice(config.sweetSpotRange.max, currency) },
      { type: "Premium Tier", price: formatPrice(config.sweetSpotRange.max * 2, currency) },
    ],
  };
}
