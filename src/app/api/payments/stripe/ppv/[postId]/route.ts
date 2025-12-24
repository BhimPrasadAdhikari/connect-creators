// Stripe PPV Post Payment Create API
// Creates a Stripe Checkout Session for pay-per-view post purchase

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import Stripe from "stripe";
import { calculateEarnings } from "@/lib/pricing";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-11-17.clover",
});

interface RouteParams {
  params: Promise<{ postId: string }>;
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const { postId } = await params;
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as { id?: string }).id;
    if (!userId) {
      return NextResponse.json({ error: "User ID not found" }, { status: 401 });
    }

    // Find the post
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: { creator: true },
    });

    if (!post) {
      return NextResponse.json(
        { error: "Post not found" },
        { status: 404 }
      );
    }

    // Verify post is PPV
    if (!post.isPPV || !post.ppvPrice) {
      return NextResponse.json(
        { error: "This post is not available for purchase" },
        { status: 400 }
      );
    }

    // Can't buy own post
    if (post.creator.userId === userId) {
      return NextResponse.json(
        { error: "You can't purchase your own post" },
        { status: 400 }
      );
    }

    // Check if already purchased
    const existingPurchase = await prisma.purchase.findFirst({
      where: {
        userId,
        postId: post.id,
        status: { in: ["COMPLETED", "PENDING"] },
      },
    });

    if (existingPurchase) {
      if (existingPurchase.status === "COMPLETED") {
        return NextResponse.json(
          { error: "You already own this post" },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: "You have a pending purchase. Please complete or cancel it first." },
        { status: 400 }
      );
    }

    const paymentCurrency = "USD";

    // Calculate platform fee
    const earnings = calculateEarnings(
      post.ppvPrice,
      "STRIPE",
      "STANDARD",
      paymentCurrency as "INR" | "NPR" | "USD"
    );

    console.log(`[Stripe PPV] Fee calculation for ${post.ppvPrice} ${paymentCurrency}:`, {
      grossAmount: earnings.grossAmount,
      platformCommission: earnings.platformCommission,
      creatorEarnings: earnings.netEarnings,
    });

    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

    // Create pending purchase
    const purchase = await prisma.purchase.create({
      data: {
        userId,
        postId: post.id,
        amount: post.ppvPrice,
        currency: paymentCurrency,
        status: "PENDING",
      },
    });

    // Create Stripe Checkout Session
    const stripeSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: paymentCurrency.toLowerCase(),
            product_data: {
              name: `Unlock: ${post.title}`,
              description: `Pay-per-view post by ${post.creator.displayName || "Creator"}`,
            },
            unit_amount: post.ppvPrice,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${baseUrl}/payment/stripe/success?session_id={CHECKOUT_SESSION_ID}&type=ppv`,
      cancel_url: `${baseUrl}/payment/stripe/cancel`,
      metadata: {
        purchaseId: purchase.id,
        postId: post.id,
        userId,
        type: "ppv",
        platformFee: earnings.platformCommission.toString(),
        creatorEarnings: earnings.netEarnings.toString(),
      },
    });

    // Update purchase with session ID and fee info
    await prisma.purchase.update({
      where: { id: purchase.id },
      data: {
        providerOrderId: stripeSession.id,
        provider: "STRIPE",
        platformFee: earnings.platformCommission,
        creatorEarnings: earnings.netEarnings,
      },
    });

    console.log(`[Stripe PPV] Session created: ${stripeSession.id} for post ${post.id}`);

    return NextResponse.json({
      success: true,
      sessionId: stripeSession.id,
      redirectUrl: stripeSession.url,
    });
  } catch (error) {
    console.error("[Stripe PPV] Create session error:", error);
    return NextResponse.json(
      { error: "Failed to create payment session", success: false },
      { status: 500 }
    );
  }
}
