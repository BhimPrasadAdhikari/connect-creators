// Refund Request API
// Allows users to request refunds for purchases

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { ApiErrors, logError } from "@/lib/api/errors";
import { rateLimit } from "@/lib/api/rate-limit";
import { logRefundRequest } from "@/lib/security/audit";

// POST /api/refunds - Request a refund
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return ApiErrors.unauthorized();
    }

    // Rate limiting
    const rateLimitResponse = rateLimit(request, "GENERAL", session.user.id);
    if (rateLimitResponse) return rateLimitResponse;

    const body = await request.json();
    const { purchaseId, paymentId, reason } = body;

    if (!purchaseId && !paymentId) {
      return ApiErrors.badRequest("Either purchaseId or paymentId is required");
    }

    if (!reason || reason.trim().length < 10) {
      return ApiErrors.badRequest("Please provide a reason for the refund (minimum 10 characters)");
    }

    let purchase = null;
    let payment = null;
    let amount = 0;
    let currency = "INR";
    let provider = null;

    // Find the purchase or payment
    if (purchaseId) {
      purchase = await prisma.purchase.findFirst({
        where: {
          id: purchaseId,
          userId: session.user.id,
          status: "COMPLETED",
        },
        include: {
          product: { select: { title: true } },
          post: { select: { title: true } },
        },
      });

      if (!purchase) {
        return ApiErrors.notFound("Purchase not found or already refunded");
      }

      amount = purchase.amount;
      currency = purchase.currency;
      provider = purchase.provider;
    } else if (paymentId) {
      payment = await prisma.payment.findFirst({
        where: {
          id: paymentId,
          userId: session.user.id,
          status: "COMPLETED",
        },
        include: {
          subscription: {
            include: {
              tier: { select: { name: true } },
              creator: { select: { displayName: true, username: true } },
            },
          },
        },
      });

      if (!payment) {
        return ApiErrors.notFound("Payment not found or already refunded");
      }

      amount = payment.amount;
      currency = payment.currency;
      provider = payment.provider;
    }

    // Check if refund already requested
    const existingRefund = await prisma.refund.findFirst({
      where: {
        userId: session.user.id,
        OR: [
          { purchaseId: purchaseId || undefined },
          { paymentId: paymentId || undefined },
        ],
        status: { in: ["PENDING", "APPROVED"] },
      },
    });

    if (existingRefund) {
      return ApiErrors.badRequest(
        `You already have a pending refund request (Status: ${existingRefund.status})`
      );
    }

    // Check refund window (7 days for most purchases)
    const purchaseDate = purchase?.createdAt || payment?.createdAt;
    if (purchaseDate) {
      const daysSincePurchase = Math.floor(
        (Date.now() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      if (daysSincePurchase > 7) {
        return ApiErrors.badRequest(
          "Refund period has expired. Refunds must be requested within 7 days of purchase."
        );
      }
    }

    // Create refund request
    const refund = await prisma.refund.create({
      data: {
        userId: session.user.id,
        purchaseId: purchaseId || null,
        paymentId: paymentId || null,
        amount,
        currency,
        reason: reason.trim(),
        status: "PENDING",
        provider,
      },
    });

    console.log(`[Refund] Created refund request ${refund.id} for user ${session.user.id}`);

    // Audit log: refund request
    logRefundRequest(session.user.id, refund.id, amount, reason.trim()).catch(console.error);

    return NextResponse.json({
      success: true,
      refund: {
        id: refund.id,
        amount,
        currency,
        status: refund.status,
        createdAt: refund.createdAt,
      },
      message: "Refund request submitted. You will be notified once it is reviewed.",
    }, { status: 201 });
  } catch (error) {
    logError("refunds.POST", error);
    return ApiErrors.internal();
  }
}

// GET /api/refunds - Get user's refund requests
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return ApiErrors.unauthorized();
    }

    const refunds = await prisma.refund.findMany({
      where: { userId: session.user.id },
      include: {
        purchase: {
          include: {
            product: { select: { title: true } },
            post: { select: { title: true } },
          },
        },
        payment: {
          include: {
            subscription: {
              include: {
                tier: { select: { name: true } },
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      refunds: refunds.map((r) => ({
        id: r.id,
        amount: r.amount,
        currency: r.currency,
        reason: r.reason,
        status: r.status,
        reviewNote: r.reviewNote,
        itemName: r.purchase?.product?.title || 
                  r.purchase?.post?.title || 
                  r.payment?.subscription?.tier?.name || 
                  "Unknown",
        createdAt: r.createdAt,
        reviewedAt: r.reviewedAt,
        completedAt: r.completedAt,
      })),
    });
  } catch (error) {
    logError("refunds.GET", error);
    return ApiErrors.internal();
  }
}
