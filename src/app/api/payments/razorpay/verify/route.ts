// Razorpay Payment Verification API
// Verifies payment signature and updates records

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { razorpayProvider } from "@/lib/payments/razorpay";
import { sendSubscriptionConfirmationEmail, sendPurchaseConfirmationEmail } from "@/lib/email/service";
import { formatAmount } from "@/lib/payments/types";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userEmail = session.user.email;
    const userName = session.user.name;

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, type } = await req.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { error: "Missing payment verification parameters" },
        { status: 400 }
      );
    }

    // Verify payment with Razorpay
    const verification = await razorpayProvider.verifyPayment(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    if (!verification.success) {
      console.error("[Razorpay] Payment verification failed:", verification);
      return NextResponse.json(
        { error: "Payment verification failed", success: false },
        { status: 400 }
      );
    }

    // Check if this is a product purchase or subscription
    if (type === "product") {
      // Find the pending purchase
      const pendingPurchase = await prisma.purchase.findFirst({
        where: {
          status: "PENDING",
        },
        include: {
          product: {
            include: {
              creator: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      if (pendingPurchase && pendingPurchase.product) {
        await prisma.purchase.update({
          where: { id: pendingPurchase.id },
          data: { status: "COMPLETED" },
        });

        // Send purchase confirmation email
        if (userEmail) {
          await sendPurchaseConfirmationEmail(userEmail, userName || "", {
            productName: pendingPurchase.product.title,
            creatorName: pendingPurchase.product.creator.displayName || "Creator",
            amount: formatAmount(pendingPurchase.amount, pendingPurchase.currency),
            downloadUrl: pendingPurchase.product.fileUrl,
          });
          
          console.log(`[Razorpay] Purchase confirmation email sent to: ${userEmail}`);
        }

        console.log(`[Razorpay] Product purchase verified: ${razorpay_payment_id}`);
      }
    } else {
      // Find subscription payment
      const payment = await prisma.payment.findFirst({
        where: {
          providerOrderId: razorpay_order_id,
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
            providerPayId: razorpay_payment_id,
          },
        });

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
            
            console.log(`[Razorpay] Subscription confirmation email sent to: ${userEmail}`);
          }
        }

        console.log(`[Razorpay] Subscription payment verified: ${razorpay_payment_id}`);
      }
    }

    return NextResponse.json({
      success: true,
      paymentId: razorpay_payment_id,
    });
  } catch (error) {
    console.error("[Razorpay] Verification error:", error);
    return NextResponse.json(
      { error: "Verification failed", success: false },
      { status: 500 }
    );
  }
}
