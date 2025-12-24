// Stripe Subscription Payment Create API
// Creates a Stripe Checkout Session for subscription payment

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import Stripe from "stripe";
import { calculateEarnings } from "@/lib/pricing";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-11-17.clover",
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as { id?: string }).id;
    if (!userId) {
      return NextResponse.json({ error: "User ID not found" }, { status: 401 });
    }

    const { tierId } = await req.json();

    if (!tierId) {
      return NextResponse.json(
        { error: "Tier ID is required" },
        { status: 400 }
      );
    }

    // Find the subscription tier
    const tier = await prisma.subscriptionTier.findUnique({
      where: { id: tierId },
      include: { creator: true },
    });

    if (!tier) {
      return NextResponse.json(
        { error: "Subscription tier not found" },
        { status: 404 }
      );
    }

    // Use tier's currency, default to USD for Stripe
    const paymentCurrency = tier.currency || "USD";

    // Check for existing active OR pending subscription (prevent duplicates)
    const existingSubscription = await prisma.subscription.findFirst({
      where: {
        fanId: userId,
        tierId: tier.id,
        status: { in: ["ACTIVE", "PENDING"] },
      },
    });

    if (existingSubscription) {
      if (existingSubscription.status === "ACTIVE") {
        return NextResponse.json(
          { error: "You already have an active subscription to this tier" },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: "You have a pending subscription. Please complete or cancel it first." },
        { status: 400 }
      );
    }

    // Calculate platform fee and creator earnings (15% platform commission)
    const earnings = calculateEarnings(
      tier.price,
      "STRIPE", // Use Stripe payment provider
      "STANDARD", // Standard commission tier
      paymentCurrency as "INR" | "NPR" | "USD"
    );

    console.log(`[Stripe] Fee calculation for ${tier.price} ${paymentCurrency}:`, {
      grossAmount: earnings.grossAmount,
      platformCommission: earnings.platformCommission,
      platformCommissionPercentage: earnings.platformCommissionPercentage,
      paymentFee: earnings.paymentFee,
      creatorEarnings: earnings.netEarnings,
    });

    // Create a pending subscription
    const subscription = await prisma.subscription.create({
      data: {
        fanId: userId,
        tierId: tier.id,
        creatorId: tier.creatorId,
        status: "PENDING",
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

    // Create Stripe Checkout Session
    const stripeSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: paymentCurrency.toLowerCase(),
            product_data: {
              name: `${tier.name} Subscription`,
              description: `Monthly subscription to ${tier.creator.displayName || "Creator"}`,
            },
            unit_amount: tier.price, // Already in smallest unit (paise/cents)
            recurring: {
              interval: "month",
            },
          },
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${baseUrl}/payment/stripe/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/payment/stripe/cancel`,
      metadata: {
        subscriptionId: subscription.id,
        tierId: tier.id,
        userId,
        type: "subscription",
        // NEW: Include fee information in metadata
        platformFee: earnings.platformCommission.toString(),
        creatorEarnings: earnings.netEarnings.toString(),
        platformCommissionPercentage: earnings.platformCommissionPercentage.toString(),
      },
    });

    // Create pending payment record WITH platform fee and creator earnings
    await prisma.payment.create({
      data: {
        userId,
        subscriptionId: subscription.id,
        amount: tier.price,
        currency: paymentCurrency,
        provider: "STRIPE",
        status: "PENDING",
        providerOrderId: stripeSession.id,
        // NEW: Store platform fee and creator earnings
        platformFee: earnings.platformCommission,
        creatorEarnings: earnings.netEarnings,
        metadata: {
          paymentFeePercentage: earnings.paymentFeePercentage,
          platformCommissionPercentage: earnings.platformCommissionPercentage,
          creatorSharePercentage: earnings.creatorSharePercentage,
        },
      },
    });

    console.log(`[Stripe] Checkout session created: ${stripeSession.id} for subscription ${subscription.id}`);
    console.log(`[Stripe] Platform fee: ${earnings.platformCommission}, Creator earnings: ${earnings.netEarnings}`);

    return NextResponse.json({
      success: true,
      sessionId: stripeSession.id,
      redirectUrl: stripeSession.url,
    });
  } catch (error) {
    console.error("[Stripe] Create session error:", error);
    return NextResponse.json(
      { error: "Failed to create payment session", success: false },
      { status: 500 }
    );
  }
}

