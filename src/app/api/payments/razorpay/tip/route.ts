import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { razorpayProvider } from "@/lib/payments/razorpay";
import { validateBody, createTipSchema } from "@/lib/api/validation";
import { ApiErrors, logError } from "@/lib/api/errors";
import { rateLimit } from "@/lib/api/rate-limit";
import prisma from "@/lib/prisma";

// TIP_LIMITS shared with validation schema logic
const MIN_TIP_AMOUNT = 100; // ₹1

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return ApiErrors.unauthorized();
    }

    // Rate limiting
    const rateLimitResponse = rateLimit(req, "PAYMENT_CREATE", session.user.id);
    if (rateLimitResponse) return rateLimitResponse;

    const body = await req.json();
    const { amount, creatorId, message, postId } = body;

    if (!amount || amount < MIN_TIP_AMOUNT) {
      return ApiErrors.badRequest("Invalid tip amount. Minimum ₹1 required.");
    }

    if (!creatorId) {
      return ApiErrors.badRequest("Creator ID is required");
    }

    const creator = await prisma.creatorProfile.findUnique({
      where: { id: creatorId },
      include: { user: true }
    });

    if (!creator) {
      return ApiErrors.notFound("Creator not found");
    }

    if (creator.userId === session.user.id) {
      return ApiErrors.badRequest("You cannot tip yourself");
    }

    // Create Razorpay Order
    // We pass receipt ID as subscriptionId since createOrder maps it to receipt
    const receiptId = `tip_${Date.now()}_${session.user.id.slice(0, 4)}`;
    
    const order = await razorpayProvider.createOrder({
      provider: "razorpay", 
      amount: amount, 
      currency: "INR",
      subscriptionId: receiptId, 
      userId: session.user.id,
      metadata: {
        type: "tip", 
        userId: session.user.id,
        creatorId: creatorId,
        postId: postId || "", 
        message: message ? message.substring(0, 255) : "",
      },
    });

    if (!order.success) {
       throw new Error(order.error || "Payment creation failed");
    }

    return NextResponse.json({
      success: true,
      orderId: order.orderId,
      amount: amount, 
      currency: "INR",
      key: process.env.RAZORPAY_KEY_ID,
      creatorName: creator.displayName || creator.user.name,
    });
  } catch (error) {
    logError("payments.razorpay.tip", error);
    return ApiErrors.internal("Failed to create payment order");
  }
}
