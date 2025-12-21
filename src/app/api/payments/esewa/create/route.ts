// eSewa Payment Create API
// Creates a payment and returns form data for eSewa redirect

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { esewaProvider } from "@/lib/payments/esewa";

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

    const { tierId, amount, currency } = await req.json();

    if (!tierId || !amount) {
      return NextResponse.json(
        { error: "Tier ID and amount are required" },
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

    // Check if user already has an active subscription to this tier
    const existingSubscription = await prisma.subscription.findFirst({
      where: {
        fanId: userId,
        tierId: tier.id,
        status: "ACTIVE",
      },
    });

    if (existingSubscription) {
      return NextResponse.json(
        { error: "You already have an active subscription to this tier" },
        { status: 400 }
      );
    }

    // Create eSewa payment order first to get the orderId
    const result = await esewaProvider.createOrder({
      provider: "esewa",
      amount: tier.price,
      currency: currency || "NPR",
      subscriptionId: "pending", // Will update after subscription creation
      userId,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to create payment" },
        { status: 500 }
      );
    }

    // Create a pending subscription
    const subscription = await prisma.subscription.create({
      data: {
        fanId: userId,
        tierId: tier.id,
        creatorId: tier.creatorId,
        status: "PENDING",
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      },
    });

    // Create pending payment record
    await prisma.payment.create({
      data: {
        userId,
        subscriptionId: subscription.id,
        amount: tier.price,
        currency: currency || "NPR",
        provider: "ESEWA",
        status: "PENDING",
        providerOrderId: result.orderId,
      },
    });

    console.log(`[eSewa] Payment created: ${result.orderId} for subscription ${subscription.id}`);

    return NextResponse.json({
      success: true,
      orderId: result.orderId,
      redirectUrl: result.redirectUrl,
      formData: result.formData,
      subscriptionId: subscription.id,
    });
  } catch (error) {
    console.error("[eSewa] Create payment error:", error);
    return NextResponse.json(
      { error: "Failed to create payment", success: false },
      { status: 500 }
    );
  }
}

