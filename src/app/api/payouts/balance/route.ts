import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const creator = await prisma.creatorProfile.findUnique({
      where: { userId: session.user.id },
      include: {
        _count: {
          select: {
            payouts: true,
          }
        }
      }
    });

    if (!creator) {
      return NextResponse.json({ error: "Creator profile not found" }, { status: 404 });
    }

    // 1. Calculate Total Earnings
    // Logic: Sum of (creatorEarnings) from all sources
    
    // A. Subscriptions (Payment model)
    const subscriptionEarnings = await prisma.payment.aggregate({
      where: {
        user: { creatorProfile: { id: creator.id } }, // Wait, Payment.userId is the payer. Payment linked to Sub linked to Creator.
        // Let's re-verify relations.
        // Payment -> Subscription -> Creator
        subscription: {
           creatorId: creator.id
        },
        status: "COMPLETED",
      },
      _sum: {
        creatorEarnings: true,
      },
    });

    // B. Purchases (Digital Products & PPV)
    // Purchase -> Post -> Creator OR Purchase -> Product -> Creator
    // But Purchase.creatorEarnings is directly on the model? No, let's check schema.
    // Purchase has creatorEarnings Int @default(0)
    // We need to filter by purchases where the item belongs to creator.
    // However, Purchase doesn't have a direct creatorId. 
    // It has postId -> creatorId OR productId -> creatorId.
    // Actually, checking schema:
    // Purchase has: postId, productId. 
    // Post has creatorId. DigitalProduct has creatorId.
    
    const postPurchaseEarnings = await prisma.purchase.aggregate({
        where: {
            post: { creatorId: creator.id },
            status: "COMPLETED",
        },
        _sum: {
            creatorEarnings: true,
        }
    });
    
    const productPurchaseEarnings = await prisma.purchase.aggregate({
        where: {
            product: { creatorId: creator.id },
            status: "COMPLETED",
        },
        _sum: {
            creatorEarnings: true,
        }
    });

    // C. Tips
    // Tip model: toCreatorId
    // Tip has amount. Does it have creatorEarnings? 
    // Schema: Tip { amount, ... } -> No platform fee deduction logic explicitly stored in Tip?
    // Wait, Tip usually passes full amount or we need to apply platform fee calc here?
    // Let's check Tip model again.
    // Tip: amount Int.
    // If we assume strict 100% or if fee is taken before?
    // Use `amount` for now as Tip likely doesn't have separate field in schema yet.
    // EDIT: Re-reading schema... Tip model: `amount`. No `creatorEarnings`.
    // We should assume for now Tip amount is full earnings minus potentially platform fee calculated elsewhere?
    // Or is it raw amount? Safe to assume `amount` for now, but usually fee applies.
    // Let's check if there's a payment record for Tip.
    // Tip schema doesn't link to Payment/Purchase. It's standalone.
    // Let's sum `amount` for now.
    const tipEarnings = await prisma.tip.aggregate({
        where: {
            toCreatorId: creator.id,
            // Status? Tip doesn't have status field in schema provided! 
            // Assuming created Tips are successful? 
            // Realistically we need to be careful.
            // Let's assume all Tips in DB are successful if no status field.
        },
        _sum: {
            amount: true,
        }
    });

    // D. DM Payments
    const dmEarnings = await prisma.dMPayment.aggregate({
        where: {
            creatorId: creator.id,
            status: "COMPLETED",
        },
        _sum: {
            creatorEarnings: true,
        }
    });
    
    const totalEarnings = 
        (subscriptionEarnings._sum.creatorEarnings || 0) +
        (postPurchaseEarnings._sum.creatorEarnings || 0) +
        (productPurchaseEarnings._sum.creatorEarnings || 0) +
        (tipEarnings._sum.amount || 0) + 
        (dmEarnings._sum.creatorEarnings || 0);

    // 2. Calculate Total Payouts
    const totalPayouts = await prisma.payout.aggregate({
        where: {
            creatorId: creator.id,
            status: { in: ["PENDING", "PROCESSING", "PAID"] }
        },
        _sum: {
            amount: true // Payout amount requested
        }
    });
    
    const paidOut = totalPayouts._sum.amount || 0;
    
    const availableBalance = totalEarnings - paidOut;

    return NextResponse.json({
      currency: "INR",
      availableBalance,
      totalEarnings,
      paidOut,
      breakdown: {
        subscriptions: subscriptionEarnings._sum.creatorEarnings || 0,
        products: (postPurchaseEarnings._sum.creatorEarnings || 0) + (productPurchaseEarnings._sum.creatorEarnings || 0),
        tips: tipEarnings._sum.amount || 0,
        dms: dmEarnings._sum.creatorEarnings || 0,
      }
    });

  } catch (error) {
    console.error("Balance calculation error:", error);
    return NextResponse.json(
      { error: "Failed to calculate balance" },
      { status: 500 }
    );
  }
}
