// Stripe Payment Verification API
// Verifies a Stripe Checkout Session

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-11-17.clover",
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { sessionId } = await req.json();

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 }
      );
    }

    // Retrieve the session from Stripe
    const stripeSession = await stripe.checkout.sessions.retrieve(sessionId);

    return NextResponse.json({
      success: stripeSession.payment_status === "paid",
      status: stripeSession.payment_status,
      type: stripeSession.metadata?.type || "subscription",
    });
  } catch (error) {
    console.error("[Stripe] Verify session error:", error);
    return NextResponse.json(
      { error: "Failed to verify payment", success: false },
      { status: 500 }
    );
  }
}
