import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

interface RouteParams {
  params: Promise<{ productId: string }>;
}

// POST /api/products/[productId]/purchase - Purchase a digital product
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { productId } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const product = await prisma.digitalProduct.findUnique({
      where: { id: productId },
      include: {
        creator: true,
        purchases: {
          where: { userId: session.user.id },
        },
      },
    });

    if (!product || !product.isActive) {
      return NextResponse.json({ error: "Product not found or unavailable" }, { status: 404 });
    }

    // Check if already purchased
    if (product.purchases.length > 0) {
      return NextResponse.json({ error: "You already own this product" }, { status: 400 });
    }

    // Creator can't buy their own product
    if (product.creator.userId === session.user.id) {
      return NextResponse.json({ error: "You can't purchase your own product" }, { status: 400 });
    }

    // Create purchase record
    // In production, integrate with payment gateway first
    const purchase = await prisma.purchase.create({
      data: {
        userId: session.user.id,
        productId: product.id,
        amount: product.price,
        currency: product.currency,
        status: "COMPLETED",
      },
    });

    return NextResponse.json({
      success: true,
      purchase,
      downloadUrl: product.fileUrl,
      message: "Product purchased successfully",
    }, { status: 201 });
  } catch (error) {
    console.error("Error purchasing product:", error);
    return NextResponse.json({ error: "Failed to purchase product" }, { status: 500 });
  }
}
