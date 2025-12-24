import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { updateProductSchema, validateBody, idSchema } from "@/lib/api/validation";
import { ApiErrors, logError } from "@/lib/api/errors";
import { sanitizeContent, sanitizeUrl } from "@/lib/api/sanitize";
import { logContent } from "@/lib/security/audit";

interface RouteParams {
  params: Promise<{ productId: string }>;
}

// GET /api/products/[productId] - Get single product
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { productId } = await params;
    
    // Validate ID format
    const idResult = idSchema.safeParse(productId);
    if (!idResult.success) {
      return ApiErrors.badRequest("Invalid product ID format");
    }
    
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
      return ApiErrors.notFound("Product");
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
    logError("products.[productId].GET", error);
    return ApiErrors.internal();
  }
}

// PUT /api/products/[productId] - Update product (creator only)
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { productId } = await params;
    
    // Validate ID format
    const idResult = idSchema.safeParse(productId);
    if (!idResult.success) {
      return ApiErrors.badRequest("Invalid product ID format");
    }
    
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return ApiErrors.unauthorized();
    }

    const product = await prisma.digitalProduct.findUnique({
      where: { id: productId },
      include: { creator: true },
    });

    if (!product) {
      return ApiErrors.notFound("Product");
    }

    // IDOR protection
    if (product.creator.userId !== session.user.id) {
      return ApiErrors.forbidden("You can only edit your own products");
    }

    const body = await request.json();
    
    // Validate input
    const validation = validateBody(updateProductSchema, body);
    if (!validation.success) {
      return ApiErrors.validationError(validation.errors);
    }
    
    const { title, description, price, fileUrl, fileType, thumbnailUrl, isActive } = validation.data;

    // Build update data with sanitization
    const updateData: Record<string, unknown> = {};
    if (title) updateData.title = sanitizeContent(title);
    if (description !== undefined) updateData.description = description ? sanitizeContent(description) : null;
    if (price) updateData.price = price;
    if (fileUrl) updateData.fileUrl = sanitizeUrl(fileUrl);
    if (fileType) updateData.fileType = fileType;
    if (thumbnailUrl) updateData.thumbnailUrl = sanitizeUrl(thumbnailUrl);
    if (isActive !== undefined) updateData.isActive = isActive;

    const updated = await prisma.digitalProduct.update({
      where: { id: productId },
      data: updateData,
    });

    return NextResponse.json({ product: updated });
  } catch (error) {
    logError("products.[productId].PUT", error);
    return ApiErrors.internal();
  }
}

// DELETE /api/products/[productId] - Delete product (creator only)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { productId } = await params;
    
    // Validate ID format
    const idResult = idSchema.safeParse(productId);
    if (!idResult.success) {
      return ApiErrors.badRequest("Invalid product ID format");
    }
    
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return ApiErrors.unauthorized();
    }

    const product = await prisma.digitalProduct.findUnique({
      where: { id: productId },
      include: { creator: true, _count: { select: { purchases: true } } },
    });

    if (!product) {
      return ApiErrors.notFound("Product");
    }

    // IDOR protection
    if (product.creator.userId !== session.user.id) {
      return ApiErrors.forbidden("You can only delete your own products");
    }

    // If has purchases, just deactivate
    if (product._count.purchases > 0) {
      await prisma.digitalProduct.update({
        where: { id: productId },
        data: { isActive: false },
      });
      return NextResponse.json({ message: "Product deactivated (has purchases)" });
    }

    await prisma.digitalProduct.delete({ where: { id: productId } });

    // Audit log: product deleted
    logContent(session.user.id, productId, "product", "deleted").catch(console.error);

    return NextResponse.json({ success: true });
  } catch (error) {
    logError("products.[productId].DELETE", error);
    return ApiErrors.internal();
  }
}
