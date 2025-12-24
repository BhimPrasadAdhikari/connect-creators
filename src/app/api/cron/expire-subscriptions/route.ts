// Subscription Expiry Cron API
// Called by Vercel Cron or external scheduler to expire old subscriptions
// Should be called daily to ensure subscriptions are properly expired

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Secret key to authorize cron jobs (set in env)
const CRON_SECRET = process.env.CRON_SECRET;

export async function POST(req: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = req.headers.get("authorization");
    const providedSecret = authHeader?.replace("Bearer ", "");
    
    if (CRON_SECRET && providedSecret !== CRON_SECRET) {
      console.warn("[Cron] Unauthorized subscription expiry request");
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const now = new Date();

    // Find all active subscriptions that have expired
    const expiredSubscriptions = await prisma.subscription.findMany({
      where: {
        status: "ACTIVE",
        endDate: {
          lt: now, // endDate is in the past
        },
      },
      select: {
        id: true,
        fanId: true,
        tierId: true,
        endDate: true,
      },
    });

    if (expiredSubscriptions.length === 0) {
      console.log("[Cron] No expired subscriptions found");
      return NextResponse.json({
        success: true,
        message: "No expired subscriptions to process",
        expired: 0,
      });
    }

    // Batch update all expired subscriptions to EXPIRED status
    const result = await prisma.subscription.updateMany({
      where: {
        id: { in: expiredSubscriptions.map(s => s.id) },
      },
      data: {
        status: "EXPIRED",
      },
    });

    console.log(`[Cron] Expired ${result.count} subscriptions`);

    // Log details for audit
    expiredSubscriptions.forEach(sub => {
      console.log(`[Cron] Subscription ${sub.id} expired (user: ${sub.fanId}, tier: ${sub.tierId}, endDate: ${sub.endDate})`);
    });

    return NextResponse.json({
      success: true,
      message: `Expired ${result.count} subscriptions`,
      expired: result.count,
      subscriptionIds: expiredSubscriptions.map(s => s.id),
    });
  } catch (error) {
    console.error("[Cron] Subscription expiry error:", error);
    return NextResponse.json(
      { error: "Failed to process subscription expiry" },
      { status: 500 }
    );
  }
}

// GET endpoint for health check / manual trigger
export async function GET(req: NextRequest) {
  // Check for pending expirations
  const now = new Date();
  
  const pendingExpirations = await prisma.subscription.count({
    where: {
      status: "ACTIVE",
      endDate: {
        lt: now,
      },
    },
  });

  return NextResponse.json({
    status: "ok",
    pendingExpirations,
    message: pendingExpirations > 0 
      ? `${pendingExpirations} subscriptions need to be expired. POST to this endpoint to process.`
      : "No subscriptions pending expiry",
  });
}
