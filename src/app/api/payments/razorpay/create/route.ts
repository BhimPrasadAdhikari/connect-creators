// Razorpay Subscription Payment Create API
// Creates a Razorpay order for subscription payment

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { razorpayProvider, getRazorpayKeyId } from "@/lib/payments/razorpay";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as { id?: string }).id;
    const userName = session.user.name;
    const userEmail = session.user.email;
    
    if (!userId) {
      return NextResponse.json({ error: "User ID not found" }, { status: 401 });
    }

    const { tierId, currency } = await req.json();

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

    // Check for existing active subscription
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

    // Create Razorpay order
    const result = await razorpayProvider.createOrder({
      provider: "razorpay",
      amount: tier.price, // Amount in paise
      currency: currency || "INR",
      subscriptionId: subscription.id,
      userId,
      metadata: {
        userName: userName || "",
        userEmail: userEmail || "",
        tierName: tier.name,
        creatorName: tier.creator.displayName || tier.creator.username,
      },
    });

    if (!result.success) {
      // Rollback subscription
      await prisma.subscription.delete({ where: { id: subscription.id } });
      return NextResponse.json(
        { error: result.error || "Failed to create Razorpay order" },
        { status: 500 }
      );
    }

    // Create pending payment record
    await prisma.payment.create({
      data: {
        userId,
        subscriptionId: subscription.id,
        amount: tier.price,
        currency: currency || "INR",
        provider: "RAZORPAY",
        status: "PENDING",
        providerOrderId: result.orderId!,
      },
    });

    console.log(`[Razorpay] Order created: ${result.orderId} for subscription ${subscription.id}`);

    return NextResponse.json({
      success: true,
      orderId: result.orderId,
      keyId: getRazorpayKeyId(),
      amount: tier.price,
      currency: currency || "INR",
      name: `${tier.name} Subscription`,
      description: `Monthly subscription to ${tier.creator.displayName || tier.creator.username}`,
      prefill: {
        name: userName || "",
        email: userEmail || "",
      },
      subscriptionId: subscription.id,
    });
  } catch (error) {
    console.error("[Razorpay] Create order error:", error);
    return NextResponse.json(
      { error: "Failed to create payment order", success: false },
      { status: 500 }
    );
  }
}
