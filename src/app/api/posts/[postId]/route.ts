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

    // Check access
    let hasAccess = !post.isPaid;
    
    if (post.isPaid && session?.user?.id) {
      // Check if viewer is the creator
      if (post.creator.userId === session.user.id) {
        hasAccess = true;
      } else if (post.requiredTierId) {
        // Check if viewer is subscribed to required tier
        const subscription = await prisma.subscription.findFirst({
          where: {
            fanId: session.user.id,
            tierId: post.requiredTierId,
            status: "ACTIVE",
          },
        });
        hasAccess = !!subscription;
      }
    }

    return NextResponse.json({
      post: {
        ...post,
        hasAccess,
        content: hasAccess ? post.content : post.content.substring(0, 100) + "...",
        comments: hasAccess ? post.comments : [],
      },
    });
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
