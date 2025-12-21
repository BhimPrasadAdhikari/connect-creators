// Razorpay Product Payment Create API
// Creates a Razorpay order for one-time product purchase

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { razorpayProvider, getRazorpayKeyId } from "@/lib/payments/razorpay";

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

    const { productId, currency } = await req.json();

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

    // Check if already purchased
    const existingPurchase = await prisma.purchase.findFirst({
      where: {
        userId,
        productId: product.id,
        status: "COMPLETED",
      },
    });

    if (existingPurchase) {
      return NextResponse.json(
        { error: "You already own this product" },
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

    // Create pending purchase
    const purchase = await prisma.purchase.create({
      data: {
        userId,
        productId: product.id,
        amount: product.price,
        currency: currency || "INR",
        status: "PENDING",
      },
    });

    // Create Razorpay order
    const result = await razorpayProvider.createOrder({
      provider: "razorpay",
      amount: product.price,
      currency: currency || "INR",
      subscriptionId: `product_${purchase.id}`,
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
        { error: result.error || "Failed to create Razorpay order" },
        { status: 500 }
      );
    }

    console.log(`[Razorpay] Product order created: ${result.orderId} for purchase ${purchase.id}`);

    return NextResponse.json({
      success: true,
      orderId: result.orderId,
      keyId: getRazorpayKeyId(),
      amount: product.price,
      currency: currency || "INR",
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
