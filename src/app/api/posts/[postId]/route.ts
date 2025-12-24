import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { updatePostSchema, validateBody, idSchema } from "@/lib/api/validation";
import { ApiErrors, logError } from "@/lib/api/errors";
import { sanitizeContent, sanitizeUrl } from "@/lib/api/sanitize";

interface RouteParams {
  params: Promise<{ postId: string }>;
}

// GET /api/posts/[postId] - Get single post
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { postId } = await params;
    
    // Validate postId format
    const idResult = idSchema.safeParse(postId);
    if (!idResult.success) {
      return ApiErrors.badRequest("Invalid post ID format");
    }
    
    const session = await getServerSession(authOptions);

    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        creator: {
          include: {
            user: { select: { name: true, image: true } },
          },
        },
        requiredTier: true,
        comments: {
          include: {
            user: { select: { id: true, name: true, image: true } },
          },
          orderBy: { createdAt: "desc" },
        },
        _count: { select: { comments: true, tips: true } },
      },
    });

    if (!post) {
      return ApiErrors.notFound("Post");
    }

    // Comprehensive access control for paid content
    // Two types of paid content:
    // 1. isPaid (subscription-gated) - requires active subscription to specific tier
    // 2. isPPV (pay-per-view) - requires one-time purchase
    
    let hasAccess = true;
    let accessReason = "free";
    
    // Check if user is the creator (always has access to own posts)
    const isCreator = session?.user?.id && post.creator.userId === session.user.id;
    
    if (isCreator) {
      hasAccess = true;
      accessReason = "creator";
    } else if (post.isPPV && post.ppvPrice) {
      // PPV Post - Check if user has purchased this specific post
      hasAccess = false;
      accessReason = "ppv_required";
      
      if (session?.user?.id) {
        const ppvPurchase = await prisma.purchase.findFirst({
          where: {
            postId: post.id,
            userId: session.user.id,
            status: "COMPLETED",
          },
        });
        
        if (ppvPurchase) {
          hasAccess = true;
          accessReason = "ppv_purchased";
        }
      }
    } else if (post.isPaid && post.requiredTierId) {
      // Subscription-gated Post - Check if user is subscribed to required tier
      hasAccess = false;
      accessReason = "subscription_required";
      
      if (session?.user?.id) {
        const subscription = await prisma.subscription.findFirst({
          where: {
            fanId: session.user.id,
            tierId: post.requiredTierId,
            status: "ACTIVE",
          },
        });
        
        if (subscription) {
          hasAccess = true;
          accessReason = "subscribed";
        }
      }
    }

    // Build response - hide sensitive content if no access
    const response = {
      post: {
        ...post,
        hasAccess,
        accessReason,
        // Protect content: show preview only if no access
        content: hasAccess ? post.content : (post.content.substring(0, 100) + "..."),
        // Hide media URL for PPV posts without access
        mediaUrl: hasAccess ? post.mediaUrl : null,
        // Hide comments for paid content without access
        comments: hasAccess ? post.comments : [],
        // Include purchase info for PPV posts
        ...(post.isPPV && {
          isPPV: true,
          ppvPrice: post.ppvPrice,
          ppvPurchaseRequired: !hasAccess,
        }),
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    logError("posts.[postId].GET", error);
    return ApiErrors.internal();
  }
}

// PUT /api/posts/[postId] - Update post (creator only)
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { postId } = await params;
    
    // Validate postId format
    const idResult = idSchema.safeParse(postId);
    if (!idResult.success) {
      return ApiErrors.badRequest("Invalid post ID format");
    }
    
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return ApiErrors.unauthorized();
    }

    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: { creator: true },
    });

    if (!post) {
      return ApiErrors.notFound("Post");
    }

    // IDOR protection: verify ownership
    if (post.creator.userId !== session.user.id) {
      return ApiErrors.forbidden("You can only edit your own posts");
    }

    const body = await request.json();
    
    // Validate input
    const validation = validateBody(updatePostSchema, body);
    if (!validation.success) {
      return ApiErrors.validationError(validation.errors);
    }
    
    const { title, content, mediaUrl, mediaType, isPaid, requiredTierId, isPublished } = validation.data;

    // Sanitize content if provided
    const updateData: Record<string, unknown> = {};
    if (title) updateData.title = sanitizeContent(title);
    if (content) updateData.content = sanitizeContent(content);
    if (mediaUrl !== undefined) updateData.mediaUrl = sanitizeUrl(mediaUrl);
    if (mediaType !== undefined) updateData.mediaType = mediaType;
    if (isPaid !== undefined) updateData.isPaid = isPaid;
    if (requiredTierId !== undefined) updateData.requiredTierId = isPaid ? requiredTierId : null;
    if (isPublished !== undefined) updateData.isPublished = isPublished;

    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data: updateData,
      include: {
        creator: { include: { user: { select: { name: true, image: true } } } },
        requiredTier: true,
      },
    });

    return NextResponse.json({ post: updatedPost });
  } catch (error) {
    logError("posts.[postId].PUT", error);
    return ApiErrors.internal();
  }
}

// DELETE /api/posts/[postId] - Delete post (creator only)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { postId } = await params;
    
    // Validate postId format
    const idResult = idSchema.safeParse(postId);
    if (!idResult.success) {
      return ApiErrors.badRequest("Invalid post ID format");
    }
    
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return ApiErrors.unauthorized();
    }

    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: { creator: true },
    });

    if (!post) {
      return ApiErrors.notFound("Post");
    }

    // IDOR protection: verify ownership
    if (post.creator.userId !== session.user.id) {
      return ApiErrors.forbidden("You can only delete your own posts");
    }

    await prisma.post.delete({ where: { id: postId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    logError("posts.[postId].DELETE", error);
    return ApiErrors.internal();
  }
}
