// Khalti Product Payment Create API
// Creates a payment for product purchase using Khalti

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { khaltiProvider } from "@/lib/payments/khalti";
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

    // Use product's currency, default to NPR for Khalti
    const paymentCurrency = product.currency || "NPR";

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
      "KHALTI",
      "STANDARD",
      paymentCurrency as "INR" | "NPR" | "USD"
    );

    console.log(`[Khalti Product] Fee calculation for ${product.price} ${paymentCurrency}:`, {
      grossAmount: earnings.grossAmount,
      platformCommission: earnings.platformCommission,
      creatorEarnings: earnings.netEarnings,
    });

    // Create pending purchase
    const purchase = await prisma.purchase.create({
      data: {
        userId,
        productId: product.id,
        amount: product.price,
        currency: paymentCurrency,
        status: "PENDING",
      },
    });

    // Create Khalti payment
    const result = await khaltiProvider.createOrder({
      provider: "khalti",
      amount: product.price,
      currency: paymentCurrency,
      subscriptionId: `product_${purchase.id}`, // Use purchase ID as reference
      userId,
      metadata: {
        userName: userName || "",
        userEmail: userEmail || "",
        productName: product.title,
        creatorName: product.creator.displayName || product.creator.username,
        type: "product",
        purchaseId: purchase.id,
      },
    });

    if (!result.success) {
      // Rollback purchase
      await prisma.purchase.delete({ where: { id: purchase.id } });
      return NextResponse.json(
        { error: result.error || "Failed to create Khalti payment" },
        { status: 500 }
      );
    }

    console.log(`[Khalti] Product payment created: ${result.orderId} for purchase ${purchase.id}`);
    console.log(`[Khalti Product] Platform fee: ${earnings.platformCommission}, Creator earnings: ${earnings.netEarnings}`);

    return NextResponse.json({
      success: true,
      pidx: result.orderId,
      redirectUrl: result.redirectUrl,
    });
  } catch (error) {
    console.error("[Khalti] Create product payment error:", error);
    return NextResponse.json(
      { error: "Failed to create payment", success: false },
      { status: 500 }
    );
  }
}

