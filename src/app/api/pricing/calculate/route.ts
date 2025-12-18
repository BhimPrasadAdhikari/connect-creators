import { NextRequest, NextResponse } from "next/server";
import {
  calculateEarnings,
  getSuggestedTiers,
  getPricingGuidance,
  PAYMENT_FEES,
  type Currency,
  type PaymentProvider,
} from "@/lib/pricing";

/**
 * POST /api/pricing/calculate - Calculate earnings breakdown
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, provider, currency = "INR" } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: "Valid amount is required" },
        { status: 400 }
      );
    }

    // Map payment provider to fee config
    const providerMap: Record<string, PaymentProvider> = {
      stripe: "STRIPE",
      razorpay: "RAZORPAY_UPI",
      razorpay_card: "RAZORPAY_CARD",
      esewa: "ESEWA",
      khalti: "KHALTI",
      bank_transfer: "BANK_TRANSFER",
    };

    const feeProvider = providerMap[provider?.toLowerCase()] || "RAZORPAY_UPI";
    const earnings = calculateEarnings(amount, feeProvider, "STANDARD", currency as Currency);

    return NextResponse.json({
      earnings,
      formatted: {
        gross: `₹${(earnings.grossAmount / 100).toFixed(0)}`,
        paymentFee: `₹${(earnings.paymentFee / 100).toFixed(0)}`,
        platformFee: `₹${(earnings.platformCommission / 100).toFixed(0)}`,
        youEarn: `₹${(earnings.netEarnings / 100).toFixed(0)}`,
        creatorShare: `${earnings.creatorSharePercentage.toFixed(1)}%`,
      },
    });
  } catch (error) {
    console.error("Error calculating earnings:", error);
    return NextResponse.json(
      { error: "Failed to calculate earnings" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/pricing/calculate - Get pricing guidance and suggestions
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const currency = (searchParams.get("currency") || "INR") as Currency;

    const suggestedTiers = getSuggestedTiers(currency);
    const guidance = getPricingGuidance(currency);
    const paymentMethods = Object.entries(PAYMENT_FEES).map(([key, value]) => ({
      id: key,
      name: value.name,
      feePercentage: value.percentage * 100,
      fixedFee: value.fixed,
    }));

    return NextResponse.json({
      suggestedTiers,
      guidance,
      paymentMethods,
      currency,
    });
  } catch (error) {
    console.error("Error fetching pricing info:", error);
    return NextResponse.json(
      { error: "Failed to fetch pricing info" },
      { status: 500 }
    );
  }
}
