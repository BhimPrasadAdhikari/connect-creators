// eSewa Product Payment Create API
// Creates a payment for digital product purchase

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { esewaProvider } from "@/lib/payments/esewa";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as { id?: string }).id;
    if (!userId) {
      return NextResponse.json({ error: "User ID not found" }, { status: 401 });
    }

    const { productId, amount, currency } = await req.json();

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

    // Check if user already owns this product
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

    // Create eSewa payment order
    const result = await esewaProvider.createOrder({
      provider: "esewa",
      amount: product.price,
      currency: currency || "NPR",
      subscriptionId: `product_${product.id}`, // Use product ID as reference
      userId,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to create payment" },
        { status: 500 }
      );
    }

    // Create pending purchase record
    const purchase = await prisma.purchase.create({
      data: {
        userId,
        productId: product.id,
        amount: product.price,
        currency: currency || "NPR",
        status: "PENDING",
      },
    });

    // Store the mapping between eSewa order ID and purchase ID
    // We'll use metadata or a separate lookup - for now store in console
    console.log(`[eSewa Product] Payment created: ${result.orderId} for purchase ${purchase.id}, product ${product.id}`);

    // Store purchase ID in a way we can retrieve on callback
    // Using cookies or session storage is one approach, or we can parse from the callback

    return NextResponse.json({
      success: true,
      orderId: result.orderId,
      redirectUrl: result.redirectUrl,
      formData: result.formData,
      purchaseId: purchase.id,
    });
  } catch (error) {
    console.error("[eSewa Product] Create payment error:", error);
    return NextResponse.json(
      { error: "Failed to create payment", success: false },
      { status: 500 }
    );
  }
}
