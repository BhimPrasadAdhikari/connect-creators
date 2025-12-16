import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

interface RouteParams {
  params: Promise<{ productId: string }>;
}

// GET /api/products/[productId] - Get single product
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { productId } = await params;
    const session = await getServerSession(authOptions);

    const product = await prisma.digitalProduct.findUnique({
      where: { id: productId },
      include: {
        creator: {
          include: {
            user: { select: { name: true, image: true } },
          },
        },
        _count: { select: { purchases: true } },
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Check if user has purchased this product
    let hasPurchased = false;
    if (session?.user?.id) {
      const purchase = await prisma.purchase.findFirst({
        where: {
          productId,
          userId: session.user.id,
          status: "COMPLETED",
        },
      });
      hasPurchased = !!purchase;
    }

    // Don't expose file URL unless purchased or creator
    const isCreator = product.creator.userId === session?.user?.id;
    const responseProduct = {
      ...product,
      fileUrl: (hasPurchased || isCreator) ? product.fileUrl : null,
      hasPurchased,
      isCreator,
    };

    return NextResponse.json({ product: responseProduct });
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 });
  }
}

// PUT /api/products/[productId] - Update product (creator only)
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { productId } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const product = await prisma.digitalProduct.findUnique({
      where: { id: productId },
      include: { creator: true },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    if (product.creator.userId !== session.user.id) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    const body = await request.json();
    const { title, description, price, fileUrl, fileType, thumbnailUrl, isActive } = body;

    const updated = await prisma.digitalProduct.update({
      where: { id: productId },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(price && { price }),
        ...(fileUrl && { fileUrl }),
        ...(fileType && { fileType }),
        ...(thumbnailUrl && { thumbnailUrl }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    return NextResponse.json({ product: updated });
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}

// DELETE /api/products/[productId] - Delete product (creator only)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { productId } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const product = await prisma.digitalProduct.findUnique({
      where: { id: productId },
      include: { creator: true, _count: { select: { purchases: true } } },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    if (product.creator.userId !== session.user.id) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    // If has purchases, just deactivate
    if (product._count.purchases > 0) {
      await prisma.digitalProduct.update({
        where: { id: productId },
        data: { isActive: false },
      });
      return NextResponse.json({ message: "Product deactivated" });
    }

    await prisma.digitalProduct.delete({ where: { id: productId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}
