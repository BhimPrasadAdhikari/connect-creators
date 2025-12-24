// Razorpay PPV Post Payment Create API
// Creates a Razorpay order for pay-per-view post purchase

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { razorpayProvider, getRazorpayKeyId } from "@/lib/payments/razorpay";
import { calculateEarnings } from "@/lib/pricing";

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
    const userName = session.user.name;
    const userEmail = session.user.email;
    
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

    // Check if already purchased (including PENDING to prevent duplicates)
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

    // Use INR as default currency for Razorpay
    const paymentCurrency = "INR";

    // Calculate platform fee and creator earnings (15% commission)
    const earnings = calculateEarnings(
      post.ppvPrice,
      "RAZORPAY_UPI",
      "STANDARD",
      paymentCurrency as "INR" | "NPR" | "USD"
    );

    console.log(`[Razorpay PPV] Fee calculation for ${post.ppvPrice} ${paymentCurrency}:`, {
      grossAmount: earnings.grossAmount,
      platformCommission: earnings.platformCommission,
      creatorEarnings: earnings.netEarnings,
    });

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

    // Create Razorpay order
    const result = await razorpayProvider.createOrder({
      provider: "razorpay",
      amount: post.ppvPrice,
      currency: paymentCurrency,
      subscriptionId: `ppv_${purchase.id}`,
      userId,
      metadata: {
        userName: userName || "",
        userEmail: userEmail || "",
        postTitle: post.title,
        creatorName: post.creator.displayName || post.creator.username,
        type: "ppv",
        purchaseId: purchase.id,
        platformFee: earnings.platformCommission.toString(),
        creatorEarnings: earnings.netEarnings.toString(),
      },
    });

    if (!result.success) {
      // Rollback purchase
      await prisma.purchase.delete({ where: { id: purchase.id } });
      return NextResponse.json(
        { error: result.error || "Failed to create Razorpay order" },
        { status: 500 }
      );
    }

    // Update purchase with providerOrderId and fee info
    await prisma.purchase.update({
      where: { id: purchase.id },
      data: {
        providerOrderId: result.orderId,
        provider: "RAZORPAY",
        platformFee: earnings.platformCommission,
        creatorEarnings: earnings.netEarnings,
      },
    });

    console.log(`[Razorpay PPV] Order created: ${result.orderId} for purchase ${purchase.id}`);

    return NextResponse.json({
      success: true,
      orderId: result.orderId,
      keyId: getRazorpayKeyId(),
      amount: post.ppvPrice,
      currency: paymentCurrency,
      name: `Unlock: ${post.title}`,
      description: `Pay-per-view post by ${post.creator.displayName || post.creator.username}`,
      prefill: {
        name: userName || "",
        email: userEmail || "",
      },
      purchaseId: purchase.id,
      type: "ppv",
    });
  } catch (error) {
    console.error("[Razorpay PPV] Create order error:", error);
    return NextResponse.json(
      { error: "Failed to create payment order", success: false },
      { status: 500 }
    );
  }
}
