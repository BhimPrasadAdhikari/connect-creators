import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

interface RouteParams {
  params: Promise<{ postId: string }>;
}

// GET /api/posts/[postId] - Get single post
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { postId } = await params;
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
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
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
    console.error("Error fetching post:", error);
    return NextResponse.json({ error: "Failed to fetch post" }, { status: 500 });
  }
}

// PUT /api/posts/[postId] - Update post (creator only)
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { postId } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: { creator: true },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    if (post.creator.userId !== session.user.id) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    const body = await request.json();
    const { title, content, mediaUrl, mediaType, isPaid, requiredTierId, isPublished } = body;

    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data: {
        ...(title && { title }),
        ...(content && { content }),
        ...(mediaUrl !== undefined && { mediaUrl }),
        ...(mediaType !== undefined && { mediaType }),
        ...(isPaid !== undefined && { isPaid }),
        ...(requiredTierId !== undefined && { requiredTierId: isPaid ? requiredTierId : null }),
        ...(isPublished !== undefined && { isPublished }),
      },
      include: {
        creator: { include: { user: { select: { name: true, image: true } } } },
        requiredTier: true,
      },
    });

    return NextResponse.json({ post: updatedPost });
  } catch (error) {
    console.error("Error updating post:", error);
    return NextResponse.json({ error: "Failed to update post" }, { status: 500 });
  }
}

// DELETE /api/posts/[postId] - Delete post (creator only)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { postId } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: { creator: true },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    if (post.creator.userId !== session.user.id) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    await prisma.post.delete({ where: { id: postId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting post:", error);
    return NextResponse.json({ error: "Failed to delete post" }, { status: 500 });
  }
}
