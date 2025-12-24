// Khalti Payment Verification API
// Verifies payment using Khalti lookup API

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { khaltiProvider } from "@/lib/payments/khalti";
import { sendSubscriptionConfirmationEmail, sendPurchaseConfirmationEmail } from "@/lib/email/service";
import { formatAmount } from "@/lib/payments/types";
import { generateSecureDownloadUrl } from "@/lib/downloads";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as { id?: string }).id;
    const userEmail = session.user.email;
    const userName = session.user.name;

    const { pidx } = await req.json();

    if (!pidx) {
      return NextResponse.json(
        { error: "Payment identifier (pidx) is required" },
        { status: 400 }
      );
    }

    // Verify payment with Khalti
    const verification = await khaltiProvider.verifyPayment(pidx, "");

    if (!verification.success) {
      console.error("[Khalti] Payment verification failed:", verification);
      return NextResponse.json(
        { error: "Payment verification failed", success: false },
        { status: 400 }
      );
    }

    // Find subscription payment first
    const payment = await prisma.payment.findFirst({
      where: {
        providerOrderId: pidx,
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
      // This is a subscription payment
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: "COMPLETED",
          providerPayId: verification.paymentId,
        },
      });

      if (payment.subscriptionId && payment.subscription) {
        // Calculate subscription period (30 days from now)
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + 30);

        await prisma.subscription.update({
          where: { id: payment.subscriptionId },
          data: { 
            status: "ACTIVE",
            startDate: startDate,
            endDate: endDate,
          },
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
          
          console.log(`[Khalti] Subscription confirmation email sent to: ${userEmail}`);
        }
      }

      console.log(`[Khalti] Subscription payment verified: ${verification.paymentId}`);
    } else {
      // Check if this is a product purchase
      const pendingPurchase = await prisma.purchase.findFirst({
        where: {
          userId: userId!,
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
        // Update purchase status
        await prisma.purchase.update({
          where: { id: pendingPurchase.id },
          data: { 
            status: "COMPLETED",
            providerPayId: verification.paymentId,
          },
        });

        // Send purchase confirmation email with SECURE download URL
        if (userEmail && userId) {
          // Generate secure download URL (expires in 24 hours)
          const secureDownloadUrl = generateSecureDownloadUrl(
            pendingPurchase.id,
            pendingPurchase.product.id,
            userId
          );

          await sendPurchaseConfirmationEmail(userEmail, userName || "", {
            productName: pendingPurchase.product.title,
            creatorName: pendingPurchase.product.creator.displayName || "Creator",
            amount: formatAmount(pendingPurchase.amount, pendingPurchase.currency),
            downloadUrl: secureDownloadUrl, // Use secure URL instead of raw fileUrl
          });
          
          console.log(`[Khalti] Purchase confirmation email sent to: ${userEmail}`);
        }

        console.log(`[Khalti] Product purchase verified: ${verification.paymentId}`);
      } else {
        console.log(`[Khalti] No pending payment/purchase found for pidx: ${pidx}`);
      }
    }

    return NextResponse.json({
      success: true,
      paymentId: verification.paymentId,
      amount: verification.amount,
    });
  } catch (error) {
    console.error("[Khalti] Verification error:", error);
    return NextResponse.json(
      { error: "Verification failed", success: false },
      { status: 500 }
    );
  }
}
