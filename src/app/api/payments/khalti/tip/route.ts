// Khalti Tip Payment API
// Creates a payment for tip using Khalti

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { khaltiProvider } from "@/lib/payments/khalti";
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

    // Create Khalti payment order
    const result = await khaltiProvider.createOrder({
      provider: "khalti",
      amount: amount,
      currency: "NPR",
      subscriptionId: receiptId,
      userId: session.user.id,
      metadata: {
        type: "tip",
        creatorId: creatorId,
        purchaseName: `Tip for ${creator.displayName || creator.user.name}`,
        message: message ? message.substring(0, 255) : "",
        customerName: session.user.name || "Supporter",
        customerEmail: session.user.email || "",
      },
    });

    if (!result.success) {
      return ApiErrors.internal(result.error || "Failed to create payment");
    }

    return NextResponse.json({
      success: true,
      orderId: result.orderId,
      redirectUrl: result.redirectUrl,
      amount: amount,
      currency: "NPR",
      creatorName: creator.displayName || creator.user.name,
    });
  } catch (error) {
    logError("payments.khalti.tip", error);
    return ApiErrors.internal("Failed to create payment");
  }
}
