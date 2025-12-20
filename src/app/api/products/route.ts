import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { 
  createProductSchema, 
  paginationSchema, 
  validateBody, 
  validateQuery,
  idSchema 
} from "@/lib/api/validation";
import { ApiErrors, logError } from "@/lib/api/errors";
import { sanitizeContent, sanitizeUrl } from "@/lib/api/sanitize";

// GET /api/products - List digital products
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Validate pagination
    const paginationResult = validateQuery(paginationSchema, searchParams);
    if (!paginationResult.success) {
      return ApiErrors.validationError(paginationResult.errors);
    }
    const { limit, offset } = paginationResult.data;
    
    // Validate creatorId if provided
    const creatorId = searchParams.get("creatorId");
    if (creatorId) {
      const idResult = idSchema.safeParse(creatorId);
      if (!idResult.success) {
        return ApiErrors.badRequest("Invalid creator ID format");
      }
    }

    const where: { creatorId?: string; isActive: boolean } = {
      isActive: true,
    };

    if (creatorId) {
      where.creatorId = creatorId;
    }

    const products = await prisma.digitalProduct.findMany({
      where,
      include: {
        creator: {
          include: {
            user: { select: { name: true, image: true } },
          },
        },
        _count: { select: { purchases: true } },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
    });

    return NextResponse.json({ products });
  } catch (error) {
    logError("products.GET", error);
    return ApiErrors.internal();
  }
}

// POST /api/products - Create a digital product (creator only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return ApiErrors.unauthorized();
    }

    if (session.user.role !== "CREATOR") {
      return ApiErrors.forbidden("Only creators can create products");
    }

    const creator = await prisma.creatorProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!creator) {
      return ApiErrors.notFound("Creator profile");
    }

    const body = await request.json();
    
    // Validate input
    const validation = validateBody(createProductSchema, body);
    if (!validation.success) {
      return ApiErrors.validationError(validation.errors);
    }
    
    const { title, description, price, fileUrl, fileType, thumbnailUrl } = validation.data;

    // Sanitize content
    const sanitizedTitle = sanitizeContent(title);
    const sanitizedDescription = description ? sanitizeContent(description) : null;
    const sanitizedFileUrl = sanitizeUrl(fileUrl);
    const sanitizedThumbnailUrl = sanitizeUrl(thumbnailUrl);

    if (!sanitizedFileUrl) {
      return ApiErrors.badRequest("Invalid file URL");
    }

    const product = await prisma.digitalProduct.create({
      data: {
        creatorId: creator.id,
        title: sanitizedTitle,
        description: sanitizedDescription,
        price,
        fileUrl: sanitizedFileUrl,
        fileType,
        thumbnailUrl: sanitizedThumbnailUrl,
      },
    });

    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    logError("products.POST", error);
    return ApiErrors.internal();
  }
}
