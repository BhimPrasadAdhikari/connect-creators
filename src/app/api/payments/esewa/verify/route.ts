// eSewa Payment Verification API
// Verifies the base64-encoded response from eSewa

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { esewaProvider } from "@/lib/payments/esewa";
import { sendSubscriptionConfirmationEmail } from "@/lib/email/service";
import { formatAmount } from "@/lib/payments/types";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as { id?: string }).id;
    const userEmail = session.user.email;
    const userName = session.user.name;

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
        providerOrderId: decodedData.transaction_uuid,
        status: "PENDING",
      },
      include: {
        subscription: {
          include: {
            tier: true,
            creator: true,
          },
        },
      },
    });

    if (payment) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: "COMPLETED",
          providerPayId: decodedData.transaction_code,
        },
      });

      // Activate subscription if this was a subscription payment
      if (payment.subscriptionId && payment.subscription) {
        await prisma.subscription.update({
          where: { id: payment.subscriptionId },
          data: { status: "ACTIVE" },
        });

        // Send subscription confirmation email
        if (userEmail) {
          const nextBillingDate = new Date();
          nextBillingDate.setDate(nextBillingDate.getDate() + 30);
          
          await sendSubscriptionConfirmationEmail(userEmail, userName || "", {
            creatorName: payment.subscription.creator.displayName || "Creator",
            tierName: payment.subscription.tier.name,
            amount: formatAmount(payment.amount, payment.currency),
            nextBillingDate: nextBillingDate.toLocaleDateString("en-IN", {
              dateStyle: "medium",
            }),
          });
          
          console.log(`[eSewa] Subscription confirmation email sent to: ${userEmail}`);
        }
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

