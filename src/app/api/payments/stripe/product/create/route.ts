// Stripe Product Payment Create API
// Creates a Stripe Checkout Session for one-time product purchase

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

    const { productId } = await req.json();

    if (!productId) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

    // Find the product
    const product = await prisma.digitalProduct.findUnique({
      where: { id: productId, isActive: true },
      include: { creator: true },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found or unavailable" },
        { status: 404 }
      );
    }

    // Use product's currency, default to USD for Stripe
    const paymentCurrency = product.currency || "USD";

    // Check if already purchased (including PENDING to prevent duplicates)
    const existingPurchase = await prisma.purchase.findFirst({
      where: {
        userId,
        productId: product.id,
        status: { in: ["COMPLETED", "PENDING"] },
      },
    });

    if (existingPurchase) {
      if (existingPurchase.status === "COMPLETED") {
        return NextResponse.json(
          { error: "You already own this product" },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: "You have a pending purchase. Please complete or cancel it first." },
        { status: 400 }
      );
    }

    // Can't buy own product
    if (product.creator.userId === userId) {
      return NextResponse.json(
        { error: "You can't purchase your own product" },
        { status: 400 }
      );
    }

    // Calculate platform fee and creator earnings (15% platform commission)
    const earnings = calculateEarnings(
      product.price,
      "STRIPE",
      "STANDARD",
      paymentCurrency as "INR" | "NPR" | "USD"
    );

    console.log(`[Stripe Product] Fee calculation for ${product.price} ${paymentCurrency}:`, {
      grossAmount: earnings.grossAmount,
      platformCommission: earnings.platformCommission,
      creatorEarnings: earnings.netEarnings,
    });

    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

    // Create pending purchase
    const purchase = await prisma.purchase.create({
      data: {
        userId,
        productId: product.id,
        amount: product.price,
        currency: paymentCurrency,
        status: "PENDING",
      },
    });

    // Create Stripe Checkout Session for one-time payment
    const stripeSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: paymentCurrency.toLowerCase(),
            product_data: {
              name: product.title,
              description: product.description || `Digital product by ${product.creator.displayName || "Creator"}`,
            },
            unit_amount: product.price,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${baseUrl}/payment/stripe/success?session_id={CHECKOUT_SESSION_ID}&type=product`,
      cancel_url: `${baseUrl}/payment/stripe/cancel`,
      metadata: {
        purchaseId: purchase.id,
        productId: product.id,
        userId,
        type: "product",
        // NEW: Include fee information in metadata
        platformFee: earnings.platformCommission.toString(),
        creatorEarnings: earnings.netEarnings.toString(),
        platformCommissionPercentage: earnings.platformCommissionPercentage.toString(),
      },
    });

    console.log(`[Stripe] Product checkout session created: ${stripeSession.id} for product ${product.id}`);
    console.log(`[Stripe Product] Platform fee: ${earnings.platformCommission}, Creator earnings: ${earnings.netEarnings}`);

    return NextResponse.json({
      success: true,
      sessionId: stripeSession.id,
      redirectUrl: stripeSession.url,
    });
  } catch (error) {
    console.error("[Stripe] Create product session error:", error);
    return NextResponse.json(
      { error: "Failed to create payment session", success: false },
      { status: 500 }
    );
  }
}

