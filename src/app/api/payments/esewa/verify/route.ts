// eSewa Payment Verification API
// Verifies the base64-encoded response from eSewa

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

    const { data } = await req.json();

    if (!data) {
      return NextResponse.json(
        { error: "No payment data provided" },
        { status: 400 }
      );
    }

    // Decode base64 data to get transaction details
    let decodedData;
    try {
      decodedData = JSON.parse(Buffer.from(data, "base64").toString());
      console.log("[eSewa] Decoded payment data:", decodedData);
    } catch (e) {
      console.error("[eSewa] Failed to decode payment data:", e);
      return NextResponse.json(
        { error: "Invalid payment data" },
        { status: 400 }
      );
    }

    // Verify the payment using our provider
    const verification = await esewaProvider.verifyPayment(
      decodedData.transaction_uuid,
      data // Pass the original base64 data for signature verification
    );

    if (!verification.success) {
      console.error("[eSewa] Payment verification failed:", verification);
      return NextResponse.json(
        { error: "Payment verification failed", success: false },
        { status: 400 }
      );
    }

    // Find pending payment record and update it
    const payment = await prisma.payment.findFirst({
      where: {
        transactionId: decodedData.transaction_uuid,
        status: "PENDING",
      },
    });

    if (payment) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: "COMPLETED",
          provider: "ESEWA",
        },
      });

      // Activate subscription if this was a subscription payment
      if (payment.subscriptionId) {
        await prisma.subscription.update({
          where: { id: payment.subscriptionId },
          data: { status: "ACTIVE" },
        });
      }
    }

    console.log(`[eSewa] Payment verified successfully: ${verification.paymentId}`);

    return NextResponse.json({
      success: true,
      orderId: verification.orderId,
      paymentId: verification.paymentId,
      amount: verification.amount,
    });
  } catch (error) {
    console.error("[eSewa] Verification error:", error);
    return NextResponse.json(
      { error: "Verification failed", success: false },
      { status: 500 }
    );
  }
}
