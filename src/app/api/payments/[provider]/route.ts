import { NextRequest, NextResponse } from "next/server";
import { createPaymentOrder, getAvailableProviders } from "@/lib/payments";
import type { PaymentProvider } from "@/lib/payments/types";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  try {
    const { provider } = await params;
    const body = await request.json();

    const { subscriptionId, tierId, userId, amount, currency = "INR", metadata } = body;

    if (!subscriptionId || !userId || !amount) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate provider
    const validProviders: PaymentProvider[] = ["stripe", "razorpay", "esewa", "khalti", "bank_transfer"];
    if (!validProviders.includes(provider as PaymentProvider)) {
      return NextResponse.json(
        { error: "Invalid payment provider" },
        { status: 400 }
      );
    }

    const result = await createPaymentOrder(provider as PaymentProvider, {
      provider: provider as PaymentProvider,
      subscriptionId,
      userId,
      amount,
      currency,
      metadata: {
        tierId,
        ...metadata,
      },
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Payment creation failed" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      orderId: result.orderId,
      redirectUrl: result.redirectUrl,
    });
  } catch (error) {
    console.error("Payment creation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  // Return available payment methods for a region
  const { searchParams } = new URL(request.url);
  const countryCode = searchParams.get("country") || "IN";
  
  const providers = getAvailableProviders(countryCode);
  
  return NextResponse.json({ providers });
}
