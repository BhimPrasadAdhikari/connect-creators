// eSewa Tip Payment API
// Creates a payment and returns form data for eSewa redirect

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { esewaProvider } from "@/lib/payments/esewa";
import { ApiErrors, logError } from "@/lib/api/errors";
import { rateLimit } from "@/lib/api/rate-limit";

const MIN_TIP_AMOUNT = 100; // NPR 1

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
    const { amount, creatorId, message } = body;

    if (!amount || amount < MIN_TIP_AMOUNT) {
      return ApiErrors.badRequest("Invalid tip amount. Minimum NPR 1 required.");
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

    const receiptId = `tip_${Date.now()}_${session.user.id.slice(0, 4)}`;

    // Create eSewa payment order
    const result = await esewaProvider.createOrder({
      provider: "esewa",
      amount: amount,
      currency: "NPR",
      subscriptionId: receiptId,
      userId: session.user.id,
      metadata: {
        type: "tip",
        creatorId: creatorId,
        message: message ? message.substring(0, 255) : "",
      },
    });

    if (!result.success) {
      return ApiErrors.internal(result.error || "Failed to create payment");
    }

    return NextResponse.json({
      success: true,
      orderId: result.orderId,
      redirectUrl: result.redirectUrl,
      formData: result.formData,
      amount: amount,
      currency: "NPR",
      creatorName: creator.displayName || creator.user.name,
    });
  } catch (error) {
    logError("payments.esewa.tip", error);
    return ApiErrors.internal("Failed to create payment");
  }
}
