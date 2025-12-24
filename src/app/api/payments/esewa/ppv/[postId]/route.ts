// eSewa PPV Post Payment Create API
// Creates an eSewa payment for pay-per-view post purchase

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { esewaProvider } from "@/lib/payments/esewa";
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

    const paymentCurrency = "NPR";

    // Calculate platform fee
    const earnings = calculateEarnings(
      post.ppvPrice,
      "ESEWA",
      "STANDARD",
      paymentCurrency as "INR" | "NPR" | "USD"
    );

    console.log(`[eSewa PPV] Fee calculation for ${post.ppvPrice} ${paymentCurrency}:`, {
      grossAmount: earnings.grossAmount,
      platformCommission: earnings.platformCommission,
      creatorEarnings: earnings.netEarnings,
    });

    // Create eSewa payment order
    const result = await esewaProvider.createOrder({
      provider: "esewa",
      amount: post.ppvPrice,
      currency: paymentCurrency,
      subscriptionId: `ppv_${postId}`,
      userId,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to create payment" },
        { status: 500 }
      );
    }

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

    // Update with provider info
    await prisma.purchase.update({
      where: { id: purchase.id },
      data: {
        providerOrderId: result.orderId,
        provider: "ESEWA",
        platformFee: earnings.platformCommission,
        creatorEarnings: earnings.netEarnings,
      },
    });

    console.log(`[eSewa PPV] Payment created: ${result.orderId} for post ${post.id}`);

    return NextResponse.json({
      success: true,
      orderId: result.orderId,
      redirectUrl: result.redirectUrl,
      formData: result.formData,
      purchaseId: purchase.id,
    });
  } catch (error) {
    console.error("[eSewa PPV] Create payment error:", error);
    return NextResponse.json(
      { error: "Failed to create payment", success: false },
      { status: 500 }
    );
  }
}
