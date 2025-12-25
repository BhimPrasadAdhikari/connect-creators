import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { z } from "zod";

const payoutRequestSchema = z.object({
  amount: z.number().min(100), // Min 1 INR
  payoutMethodId: z.string(),
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const json = await req.json();
    const body = payoutRequestSchema.parse(json);

    const creator = await prisma.creatorProfile.findUnique({
        where: { userId: session.user.id }
    });
    
    if (!creator) return NextResponse.json({ error: "Creator not found" }, { status: 404 });

    // 1. Verify Payout Method ownership
    const method = await prisma.payoutMethod.findUnique({
        where: { id: body.payoutMethodId }
    });
    
    if (!method || method.creatorId !== creator.id) {
        return NextResponse.json({ error: "Invalid payout method" }, { status: 400 });
    }

    // 2. Re-calculate Balance (Copy logic from balance/route.ts or refactor into shared lib)
    // For MVP transparency, I'll inline the critical sum check to avoid stale reads from a separate API call pattern.
    // Ideally this goes into a service function.
    
    // --- Balance Limit Check Start ---
    const subscriptionEarnings = await prisma.payment.aggregate({
      where: { subscription: { creatorId: creator.id }, status: "COMPLETED" },
      _sum: { creatorEarnings: true },
    });
    const postPurchaseEarnings = await prisma.purchase.aggregate({
        where: { post: { creatorId: creator.id }, status: "COMPLETED" },
        _sum: { creatorEarnings: true }
    });
    const productPurchaseEarnings = await prisma.purchase.aggregate({
        where: { product: { creatorId: creator.id }, status: "COMPLETED" },
        _sum: { creatorEarnings: true }
    });
    const tipEarnings = await prisma.tip.aggregate({
        where: { toCreatorId: creator.id },
        _sum: { amount: true }
    });
    const dmEarnings = await prisma.dMPayment.aggregate({
        where: { creatorId: creator.id, status: "COMPLETED" },
        _sum: { creatorEarnings: true }
    });
    
    const totalEarnings = 
        (subscriptionEarnings._sum.creatorEarnings || 0) +
        (postPurchaseEarnings._sum.creatorEarnings || 0) +
        (productPurchaseEarnings._sum.creatorEarnings || 0) +
        (tipEarnings._sum.amount || 0) + 
        (dmEarnings._sum.creatorEarnings || 0);

    const totalPayouts = await prisma.payout.aggregate({
        where: {
            creatorId: creator.id,
            status: { in: ["PENDING", "PROCESSING", "PAID"] }
        },
        _sum: { amount: true }
    });
    
    const paidOut = totalPayouts._sum.amount || 0;
    const availableBalance = totalEarnings - paidOut;
    // --- Balance Check End ---

    if (body.amount > availableBalance) {
        return NextResponse.json({ 
            error: "Insufficient balance", 
            details: { requested: body.amount, available: availableBalance } 
        }, { status: 400 });
    }

    // 3. Create Payout Request
    const payout = await prisma.payout.create({
        data: {
            creatorId: creator.id,
            amount: body.amount,
            payoutMethodId: body.payoutMethodId,
            status: "PENDING",
            currency: "INR",
        }
    });

    return NextResponse.json({ payout });

  } catch (error) {
    if (error instanceof z.ZodError) {
        return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error("Payout request error:", error);
    return NextResponse.json({ error: "Failed to request payout" }, { status: 500 });
  }
}
