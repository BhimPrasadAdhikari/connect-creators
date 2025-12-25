// Stripe Tip Payment API
// Creates a Stripe Checkout Session for sending tips

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import Stripe from "stripe";
import { ApiErrors, logError } from "@/lib/api/errors";
import { rateLimit } from "@/lib/api/rate-limit";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-11-17.clover",
});

const MIN_TIP_AMOUNT = 100; // ₹1 / $1

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return ApiErrors.unauthorized();
    }

    // Rate limiting
    const rateLimitResponse = rateLimit(req, "PAYMENT_CREATE", session.user.id);
    if (rateLimitResponse) return rateLimitResponse;

    const body = await req.json();
    const { amount, creatorId, message } = body;

    if (!amount || amount < MIN_TIP_AMOUNT) {
      return ApiErrors.badRequest("Invalid tip amount. Minimum ₹1 required.");
    }

    if (!creatorId) {
      return ApiErrors.badRequest("Creator ID is required");
    }

    const creator = await prisma.creatorProfile.findUnique({
      where: { id: creatorId },
      include: { user: true }
    });

    if (!creator) {
      return ApiErrors.notFound("Creator not found");
    }

    if (creator.userId === session.user.id) {
      return ApiErrors.badRequest("You cannot tip yourself");
    }

    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const receiptId = `tip_${Date.now()}_${session.user.id.slice(0, 4)}`;

    // Create Stripe Checkout Session for one-time payment
    const stripeSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: {
              name: `Tip for ${creator.displayName || creator.user.name || "Creator"}`,
              description: message ? `Message: ${message.substring(0, 100)}` : "Thank you for your support!",
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${baseUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}&type=tip`,
      cancel_url: `${baseUrl}/creator/${creator.username}`,
      metadata: {
        type: "tip",
        userId: session.user.id,
        creatorId: creatorId,
        message: message ? message.substring(0, 255) : "",
        receiptId,
      },
    });

    return NextResponse.json({
      success: true,
      sessionId: stripeSession.id,
      redirectUrl: stripeSession.url,
      amount: amount,
      currency: "INR",
      creatorName: creator.displayName || creator.user.name,
    });
  } catch (error) {
    logError("payments.stripe.tip", error);
    return ApiErrors.internal("Failed to create payment session");
  }
}
