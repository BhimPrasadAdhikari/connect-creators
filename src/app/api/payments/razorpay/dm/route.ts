// Razorpay DM Payment Create API
// Creates a payment order for sending paid direct messages

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { razorpayProvider, getRazorpayKeyId } from "@/lib/payments/razorpay";
import { calculateEarnings } from "@/lib/pricing";
import { rateLimit } from "@/lib/api/rate-limit";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as { id?: string }).id;
    
    // Rate limiting
    const rateLimitResponse = rateLimit(req, "PAYMENT_CREATE", userId);
    if (rateLimitResponse) return rateLimitResponse;

    const userName = session.user.name;
    const userEmail = session.user.email;
    
    if (!userId) {
      return NextResponse.json({ error: "User ID not found" }, { status: 401 });
    }

    const { creatorId, messagesCount = 1 } = await req.json();

    if (!creatorId) {
      return NextResponse.json(
        { error: "Creator ID is required" },
        { status: 400 }
      );
    }

    // Find the creator profile
    const creator = await prisma.creatorProfile.findUnique({
      where: { id: creatorId },
    });

    if (!creator) {
      return NextResponse.json(
        { error: "Creator not found" },
        { status: 404 }
      );
    }

    // Verify creator has DM price set
    if (!creator.dmPrice || creator.dmPrice <= 0) {
      return NextResponse.json(
        { error: "This creator accepts free messages" },
        { status: 400 }
      );
    }

    // Can't pay yourself
    if (creator.userId === userId) {
      return NextResponse.json(
        { error: "You can't pay yourself" },
        { status: 400 }
      );
    }

    // Calculate total amount for multiple messages
    const totalAmount = creator.dmPrice * messagesCount;
    const paymentCurrency = "INR";

    // Check for existing unused DM payment
    const existingPayment = await prisma.dMPayment.findFirst({
      where: {
        userId,
        creatorId,
        status: "COMPLETED",
        messagesUsed: { lt: prisma.dMPayment.fields.messagesAllowed },
        OR: [
          { expiresAt: null },
          { expiresAt: { gte: new Date() } },
        ],
      },
    });

    if (existingPayment) {
      const remainingMessages = existingPayment.messagesAllowed - existingPayment.messagesUsed;
      return NextResponse.json({
        error: `You have ${remainingMessages} unused paid message(s) for this creator.`,
        remainingMessages,
        paymentId: existingPayment.id,
      }, { status: 400 });
    }

    // Calculate platform fee and creator earnings (15% platform commission)
    const earnings = calculateEarnings(
      totalAmount,
      "RAZORPAY_UPI",
      "STANDARD",
      paymentCurrency as "INR" | "NPR" | "USD"
    );

    console.log(`[Razorpay DM] Fee calculation for ${totalAmount} ${paymentCurrency}:`, {
      grossAmount: earnings.grossAmount,
      platformCommission: earnings.platformCommission,
      creatorEarnings: earnings.netEarnings,
    });

    // Create pending DM payment
    const dmPayment = await prisma.dMPayment.create({
      data: {
        userId,
        creatorId,
        amount: totalAmount,
        currency: paymentCurrency,
        status: "PENDING",
        messagesAllowed: messagesCount,
        messagesUsed: 0,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours to use
      },
    });

    // Create Razorpay order
    const result = await razorpayProvider.createOrder({
      provider: "razorpay",
      amount: totalAmount,
      currency: paymentCurrency,
      subscriptionId: `dm_${dmPayment.id}`,
      userId,
      metadata: {
        userName: userName || "",
        userEmail: userEmail || "",
        creatorName: creator.displayName || creator.username,
        type: "dm",
        dmPaymentId: dmPayment.id,
        messagesCount: messagesCount.toString(),
        platformFee: earnings.platformCommission.toString(),
        creatorEarnings: earnings.netEarnings.toString(),
      },
    });

    if (!result.success) {
      await prisma.dMPayment.delete({ where: { id: dmPayment.id } });
      return NextResponse.json(
        { error: result.error || "Failed to create payment order" },
        { status: 500 }
      );
    }

    // Update with provider info
    await prisma.dMPayment.update({
      where: { id: dmPayment.id },
      data: {
        providerOrderId: result.orderId,
        provider: "RAZORPAY",
        platformFee: earnings.platformCommission,
        creatorEarnings: earnings.netEarnings,
      },
    });

    console.log(`[Razorpay DM] Order created: ${result.orderId} for ${messagesCount} messages to creator ${creatorId}`);

    return NextResponse.json({
      success: true,
      orderId: result.orderId,
      keyId: getRazorpayKeyId(),
      amount: totalAmount,
      currency: paymentCurrency,
      name: `DM to ${creator.displayName || creator.username}`,
      description: `${messagesCount} paid message(s)`,
      prefill: {
        name: userName || "",
        email: userEmail || "",
      },
      dmPaymentId: dmPayment.id,
      messagesCount,
      type: "dm",
    });
  } catch (error) {
    console.error("[Razorpay DM] Create order error:", error);
    return NextResponse.json(
      { error: "Failed to create payment order", success: false },
      { status: 500 }
    );
  }
}
