import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { ApiErrors } from "@/lib/api/errors";
import { razorpayProvider } from "@/lib/payments/razorpay";
import { logRefundAction } from "@/lib/security/audit";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ refundId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return ApiErrors.forbidden("Admin access required");
    }

    const { refundId } = await params;
    const body = await req.json();
    const { status, note } = body;

    if (!["APPROVED", "REJECTED"].includes(status)) {
      return ApiErrors.badRequest("Invalid status. Must be APPROVED or REJECTED");
    }

    const refund = await prisma.refund.findUnique({
      where: { id: refundId },
      include: {
        payment: true,
        purchase: true,
      },
    });

    if (!refund) {
      return ApiErrors.notFound("Refund request");
    }

    if (refund.status !== "PENDING") {
      return ApiErrors.badRequest("Refund request has already been processed");
    }

    // Handle Rejection
    if (status === "REJECTED") {
      await prisma.refund.update({
        where: { id: refundId },
        data: {
          status: "REJECTED",
          reviewedBy: session.user.id,
          reviewedAt: new Date(),
          reviewNote: note,
        },
      });
      await logRefundAction(session.user.id, refundId, "REJECTED", note);
      return NextResponse.json({ success: true, status: "REJECTED" });
    }

    // Handle Approval
    if (status === "APPROVED") {
      let providerPayId = refund.purchase?.providerPayId || refund.payment?.providerPayId;
      let provider = refund.provider; // Should be set on creation, but fallback to purchase/payment provider

      if (!provider) {
           provider = refund.purchase?.provider || refund.payment?.provider || "RAZORPAY"; // Fallback default
      }

      if (!providerPayId) {
        return ApiErrors.badRequest("Cannot process refund: verify original payment ID is missing");
      }

      // Process Refund via Provider
      let refundResult;
      const providerName = provider.toString().toLowerCase();
      
      if (providerName === "razorpay") {
          // Check if we have functionality
          if (!razorpayProvider.refundPayment) {
               return ApiErrors.internal("Refund not supported by provider implementation");
          }
          refundResult = await razorpayProvider.refundPayment(providerPayId, refund.amount);
      } else {
          // Placeholder for other providers
           return ApiErrors.badRequest(`Refund provider ${provider} not supported yet`);
      }

      if (!refundResult.success) {
          return NextResponse.json({ error: refundResult.error || "Provider refund failed" }, { status: 502 });
      }

      // Update Database on Success
      await prisma.$transaction(async (tx) => {
          // Update Refund
          await tx.refund.update({
            where: { id: refundId },
            data: {
              status: "COMPLETED", // Assuming instant success
              reviewedBy: session.user.id,
              reviewedAt: new Date(),
              reviewNote: note,
              completedAt: new Date(),
              providerRefundId: refundResult.refundId,
            },
          });

          // Update Original Record Status
          if (refund.purchaseId) {
              await tx.purchase.update({
                  where: { id: refund.purchaseId },
                  data: { status: "REFUNDED" }
              });
          }
           if (refund.paymentId) {
              await tx.payment.update({
                  where: { id: refund.paymentId },
                  data: { status: "REFUNDED" } // PaymentStatus enum
              });
          }
      });

      await logRefundAction(session.user.id, refundId, "APPROVED", note);
      return NextResponse.json({ success: true, status: "COMPLETED" });
    }

    return ApiErrors.badRequest("Invalid action"); // Should not reach here
  } catch (error) {
    console.error("Admin refund action error:", error);
    return ApiErrors.internal("Failed to process refund action");
  }
}
