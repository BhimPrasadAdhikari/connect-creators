import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { 
  createPostSchema, 
  paginationSchema, 
  validateBody, 
  validateQuery,
  idSchema 
} from "@/lib/api/validation";
import { ApiErrors, logError } from "@/lib/api/errors";
import { sanitizeContent, sanitizeUrl } from "@/lib/api/sanitize";

// Get posts (for feed or by creator)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
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

    const where: Record<string, unknown> = {
      isPublished: true,
    };

    if (creatorId) {
      where.creatorId = creatorId;
    }

    const posts = await prisma.post.findMany({
      where,
      include: {
        creator: {
          include: {
            user: {
              select: {
                name: true,
                image: true,
              },
            },
          },
        },
        requiredTier: true,
        _count: {
          select: {
            comments: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
    });

    // Check if user has access to each post
    let userSubscriptions: string[] = [];
    if (session?.user?.id) {
      const subs = await prisma.subscription.findMany({
        where: {
          fanId: session.user.id,
          status: "ACTIVE",
        },
        select: { tierId: true },
      });
      userSubscriptions = subs.map((s) => s.tierId);
    }

    const postsWithAccess = posts.map((post) => {
      const hasAccess =
        !post.isPaid ||
        (session?.user?.id && post.creator.userId === session.user.id) ||
        (post.requiredTierId && userSubscriptions.includes(post.requiredTierId));

      return {
        ...post,
        hasAccess,
        content: hasAccess ? post.content : post.content.substring(0, 100) + "...",
      };
    });

    return NextResponse.json({ posts: postsWithAccess });
  } catch (error) {
    logError("posts.GET", error);
    return ApiErrors.internal();
  }
}

// Create a new post (creators only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return ApiErrors.unauthorized();
    }

    // Check if user is a creator
    const creator = await prisma.creatorProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!creator) {
      return ApiErrors.forbidden("Must be a creator to post");
    }

    const body = await request.json();
    
    // Validate input
    const validation = validateBody(createPostSchema, body);
    if (!validation.success) {
      return ApiErrors.validationError(validation.errors);
    }
    
    const { title, content, mediaUrl, mediaType, isPaid, requiredTierId } = validation.data;

    // Sanitize content to prevent XSS
    const sanitizedTitle = sanitizeContent(title);
    const sanitizedContent = sanitizeContent(content);
    const sanitizedMediaUrl = sanitizeUrl(mediaUrl);

    // Validate tier if provided
    if (requiredTierId) {
      const tier = await prisma.subscriptionTier.findFirst({
        where: { id: requiredTierId, creatorId: creator.id },
      });
      if (!tier) {
        return ApiErrors.badRequest("Invalid tier - it must belong to you");
      }
    }

    const post = await prisma.post.create({
      data: {
        creatorId: creator.id,
        title: sanitizedTitle,
        content: sanitizedContent,
        mediaUrl: sanitizedMediaUrl,
        mediaType: mediaType || null,
        isPaid: isPaid || false,
        requiredTierId: isPaid ? requiredTierId : null,
      },
      include: {
        creator: {
          include: {
            user: { select: { name: true, image: true } },
          },
        },
        requiredTier: true,
      },
    });

    return NextResponse.json({ post }, { status: 201 });
  } catch (error) {
    logError("posts.POST", error);
    return ApiErrors.internal();
  }
}
