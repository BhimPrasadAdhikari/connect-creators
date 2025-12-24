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
    // Need to check both subscriptions (for isPaid) and purchases (for isPPV)
    let userSubscriptions: string[] = [];
    let userPPVPurchases: string[] = [];
    
    if (session?.user?.id) {
      // Get active subscriptions (also check endDate for defense in depth)
      const now = new Date();
      const subs = await prisma.subscription.findMany({
        where: {
          fanId: session.user.id,
          status: "ACTIVE",
          OR: [
            { endDate: null }, // No expiry set (legacy subscriptions)
            { endDate: { gte: now } }, // Not yet expired
          ],
        },
        select: { tierId: true },
      });
      userSubscriptions = subs.map((s) => s.tierId);
      
      // Get PPV post purchases
      const ppvPurchases = await prisma.purchase.findMany({
        where: {
          userId: session.user.id,
          postId: { not: null },
          status: "COMPLETED",
        },
        select: { postId: true },
      });
      userPPVPurchases = ppvPurchases.map((p) => p.postId).filter(Boolean) as string[];
    }

    const postsWithAccess = posts.map((post) => {
      const isCreator = session?.user?.id && post.creator.userId === session.user.id;
      
      // Determine access based on post type
      let hasAccess = true;
      let accessReason = "free";
      
      if (isCreator) {
        hasAccess = true;
        accessReason = "creator";
      } else if (post.isPPV && post.ppvPrice) {
        // PPV post - check if purchased
        hasAccess = userPPVPurchases.includes(post.id);
        accessReason = hasAccess ? "ppv_purchased" : "ppv_required";
      } else if (post.isPaid && post.requiredTierId) {
        // Subscription-gated post - check tier subscription
        hasAccess = userSubscriptions.includes(post.requiredTierId);
        accessReason = hasAccess ? "subscribed" : "subscription_required";
      }

      return {
        ...post,
        hasAccess,
        accessReason,
        content: hasAccess ? post.content : post.content.substring(0, 100) + "...",
        // Hide media for PPV/paid posts without access
        mediaUrl: hasAccess ? post.mediaUrl : null,
        // Include PPV info for UI
        ...(post.isPPV && {
          isPPV: true,
          ppvPrice: post.ppvPrice,
          ppvPurchaseRequired: !hasAccess && accessReason === "ppv_required",
        }),
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
