// Razorpay Product Payment Create API
// Creates a Razorpay order for one-time product purchase

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { razorpayProvider, getRazorpayKeyId } from "@/lib/payments/razorpay";
import { calculateEarnings } from "@/lib/pricing";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as { id?: string }).id;
    const userName = session.user.name;
    const userEmail = session.user.email;
    
    if (!userId) {
      return NextResponse.json({ error: "User ID not found" }, { status: 401 });
    }

    const { productId } = await req.json();

    if (!productId) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

    // Find the product
    const product = await prisma.digitalProduct.findUnique({
      where: { id: productId, isActive: true },
      include: { creator: true },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found or unavailable" },
        { status: 404 }
      );
    }

    // Use product's currency, not client-provided (security fix)
    const paymentCurrency = product.currency || "INR";

    // Check if already purchased (including PENDING to prevent duplicates)
    const existingPurchase = await prisma.purchase.findFirst({
      where: {
        userId,
        productId: product.id,
        status: { in: ["COMPLETED", "PENDING"] },
      },
    });

    if (existingPurchase) {
      if (existingPurchase.status === "COMPLETED") {
        return NextResponse.json(
          { error: "You already own this product" },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: "You have a pending purchase. Please complete or cancel it first." },
        { status: 400 }
      );
    }

    // Can't buy own product
    if (product.creator.userId === userId) {
      return NextResponse.json(
        { error: "You can't purchase your own product" },
        { status: 400 }
      );
    }

    // Calculate platform fee and creator earnings (15% platform commission)
    const earnings = calculateEarnings(
      product.price,
      "RAZORPAY_UPI", // Default to UPI for Razorpay
      "STANDARD", // Standard commission tier
      paymentCurrency as "INR" | "NPR" | "USD"
    );

    console.log(`[Razorpay] Product fee calculation for ${product.price} ${paymentCurrency}:`, {
      grossAmount: earnings.grossAmount,
      platformCommission: earnings.platformCommission,
      platformCommissionPercentage: earnings.platformCommissionPercentage,
      paymentFee: earnings.paymentFee,
      creatorEarnings: earnings.netEarnings,
    });

    // Create pending purchase with fee metadata
    const purchase = await prisma.purchase.create({
      data: {
        userId,
        productId: product.id,
        amount: product.price,
        currency: paymentCurrency,
        status: "PENDING",
      },
    });

    // Create Razorpay order
    const result = await razorpayProvider.createOrder({
      provider: "razorpay",
      amount: product.price,
      currency: paymentCurrency,
      subscriptionId: `product_${purchase.id}`,
      userId,
      metadata: {
        userName: userName || "",
        userEmail: userEmail || "",
        productName: product.title,
        creatorName: product.creator.displayName || product.creator.username,
        type: "product",
        purchaseId: purchase.id,
        // NEW: Include fee information in metadata (as strings for Razorpay)
        platformFee: earnings.platformCommission.toString(),
        creatorEarnings: earnings.netEarnings.toString(),
        platformCommissionPercentage: earnings.platformCommissionPercentage.toString(),
        creatorSharePercentage: earnings.creatorSharePercentage.toString(),
      },
    });

    if (!result.success) {
      // Rollback purchase
      await prisma.purchase.delete({ where: { id: purchase.id } });
      return NextResponse.json(
        { error: result.error || "Failed to create Razorpay order" },
        { status: 500 }
      );
    }

    console.log(`[Razorpay] Product order created: ${result.orderId} for purchase ${purchase.id}`);
    console.log(`[Razorpay] Platform fee: ${earnings.platformCommission}, Creator earnings: ${earnings.netEarnings}`);

    return NextResponse.json({
      success: true,
      orderId: result.orderId,
      keyId: getRazorpayKeyId(),
      amount: product.price,
      currency: paymentCurrency,
      name: product.title,
      description: `Digital product by ${product.creator.displayName || product.creator.username}`,
      prefill: {
        name: userName || "",
        email: userEmail || "",
      },
      purchaseId: purchase.id,
      type: "product",
    });
  } catch (error) {
    console.error("[Razorpay] Create product order error:", error);
    return NextResponse.json(
      { error: "Failed to create payment order", success: false },
      { status: 500 }
    );
  }
}

