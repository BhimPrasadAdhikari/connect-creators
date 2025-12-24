// Subscription Expiry Reminder Cron API
// Sends email reminders to users whose subscriptions expire in 7 days
// Should be called daily by Vercel Cron or external scheduler

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sendSubscriptionExpiryReminderEmail } from "@/lib/email/service";

// Secret key to authorize cron jobs (set in env)
const CRON_SECRET = process.env.CRON_SECRET;

export async function POST(req: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = req.headers.get("authorization");
    const providedSecret = authHeader?.replace("Bearer ", "");
    
    if (CRON_SECRET && providedSecret !== CRON_SECRET) {
      console.warn("[Cron] Unauthorized subscription reminder request");
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const now = new Date();
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
    
    // Round to start and end of the target day to catch all subscriptions expiring in 7 days
    const startOfDay = new Date(sevenDaysFromNow);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(sevenDaysFromNow);
    endOfDay.setHours(23, 59, 59, 999);

    // Find all active subscriptions expiring in exactly 7 days
    const expiringSubscriptions = await prisma.subscription.findMany({
      where: {
        status: "ACTIVE",
        endDate: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      include: {
        fan: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        tier: {
          select: {
            name: true,
            price: true,
            currency: true,
          },
        },
        creator: {
          select: {
            id: true,
            username: true,
            displayName: true,
          },
        },
      },
    });

    if (expiringSubscriptions.length === 0) {
      console.log("[Cron] No subscriptions expiring in 7 days");
      return NextResponse.json({
        success: true,
        message: "No subscriptions expiring in 7 days",
        reminderssSent: 0,
      });
    }

    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    let remindersSent = 0;
    const failedReminders: string[] = [];

    // Send reminder emails
    for (const sub of expiringSubscriptions) {
      if (!sub.fan.email || !sub.endDate) continue;

      const daysRemaining = Math.ceil(
        (sub.endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );

      try {
        const success = await sendSubscriptionExpiryReminderEmail(
          sub.fan.email,
          sub.fan.name || "",
          {
            creatorName: sub.creator.displayName || sub.creator.username,
            tierName: sub.tier.name,
            expiryDate: sub.endDate.toLocaleDateString("en-IN", {
              dateStyle: "medium",
            }),
            daysRemaining,
            renewUrl: `${baseUrl}/${sub.creator.username}`,
          }
        );

        if (success) {
          remindersSent++;
          console.log(`[Cron] Sent expiry reminder to ${sub.fan.email} for subscription ${sub.id}`);
        } else {
          failedReminders.push(sub.id);
        }
      } catch (error) {
        console.error(`[Cron] Failed to send reminder for subscription ${sub.id}:`, error);
        failedReminders.push(sub.id);
      }
    }

    console.log(`[Cron] Sent ${remindersSent} expiry reminders, ${failedReminders.length} failed`);

    return NextResponse.json({
      success: true,
      message: `Sent ${remindersSent} expiry reminders`,
      remindersSent,
      totalSubscriptions: expiringSubscriptions.length,
      failedCount: failedReminders.length,
      failedIds: failedReminders,
    });
  } catch (error) {
    console.error("[Cron] Subscription reminder error:", error);
    return NextResponse.json(
      { error: "Failed to send subscription reminders" },
      { status: 500 }
    );
  }
}

// GET endpoint for health check
export async function GET() {
  const now = new Date();
  const sevenDaysFromNow = new Date();
  sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
  
  const startOfDay = new Date(sevenDaysFromNow);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(sevenDaysFromNow);
  endOfDay.setHours(23, 59, 59, 999);

  const pendingReminders = await prisma.subscription.count({
    where: {
      status: "ACTIVE",
      endDate: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
  });

  return NextResponse.json({
    status: "ok",
    pendingReminders,
    targetDate: sevenDaysFromNow.toISOString().split('T')[0],
    message: pendingReminders > 0 
      ? `${pendingReminders} subscriptions expire in 7 days. POST to send reminders.`
      : "No subscriptions expiring in 7 days",
  });
}
