import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { createCommentSchema, validateBody, idSchema } from "@/lib/api/validation";
import { ApiErrors, logError } from "@/lib/api/errors";
import { sanitizeContent } from "@/lib/api/sanitize";

interface RouteParams {
  params: Promise<{ postId: string }>;
}

// GET /api/posts/[postId]/comments - Get comments for a post
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { postId } = await params;
    
    // Validate postId format
    const idResult = idSchema.safeParse(postId);
    if (!idResult.success) {
      return ApiErrors.badRequest("Invalid post ID format");
    }

    const comments = await prisma.comment.findMany({
      where: { postId },
      include: {
        user: { select: { id: true, name: true, image: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ comments });
  } catch (error) {
    logError("posts.[postId].comments.GET", error);
    return ApiErrors.internal();
  }
}

// POST /api/posts/[postId]/comments - Add a comment
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { postId } = await params;
    
    // Validate postId format
    const idResult = idSchema.safeParse(postId);
    if (!idResult.success) {
      return ApiErrors.badRequest("Invalid post ID format");
    }
    
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return ApiErrors.unauthorized("Must be logged in to comment");
    }

    // Check post exists
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: { creator: true },
    });

    if (!post) {
      return ApiErrors.notFound("Post");
    }

    const body = await request.json();
    
    // Validate input
    const validation = validateBody(createCommentSchema, body);
    if (!validation.success) {
      return ApiErrors.validationError(validation.errors);
    }
    
    const { content } = validation.data;

    // Sanitize comment content to prevent XSS
    const sanitizedContent = sanitizeContent(content);

    // If post is paid, check if user has access
    if (post.isPaid) {
      const hasAccess = 
        post.creator.userId === session.user.id ||
        (post.requiredTierId && await prisma.subscription.findFirst({
          where: {
            fanId: session.user.id,
            tierId: post.requiredTierId,
            status: "ACTIVE",
          },
        }));
      
      if (!hasAccess) {
        return ApiErrors.forbidden("You must be subscribed to comment on this post");
      }
    }

    const comment = await prisma.comment.create({
      data: {
        postId,
        userId: session.user.id,
        content: sanitizedContent,
      },
      include: {
        user: { select: { id: true, name: true, image: true } },
      },
    });

    return NextResponse.json({ comment }, { status: 201 });
  } catch (error) {
    logError("posts.[postId].comments.POST", error);
    return ApiErrors.internal();
  }
}
