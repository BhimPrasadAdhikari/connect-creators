import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

interface RouteParams {
  params: Promise<{ postId: string }>;
}

// GET /api/posts/[postId]/comments - Get comments for a post
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { postId } = await params;

    const comments = await prisma.comment.findMany({
      where: { postId },
      include: {
        user: {
          select: { id: true, name: true, image: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ comments });
  } catch (error) {
    console.error("Error fetching comments:", error);
    return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 });
  }
}

// POST /api/posts/[postId]/comments - Add a comment
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { postId } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Must be logged in to comment" }, { status: 401 });
    }

    const body = await request.json();
    const { content } = body;

    if (!content || content.trim().length === 0) {
      return NextResponse.json({ error: "Comment cannot be empty" }, { status: 400 });
    }

    // Check if post exists and user has access
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: { creator: true },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Check access for paid posts
    if (post.isPaid && post.creator.userId !== session.user.id) {
      if (post.requiredTierId) {
        const subscription = await prisma.subscription.findFirst({
          where: {
            fanId: session.user.id,
            tierId: post.requiredTierId,
            status: "ACTIVE",
          },
        });
        if (!subscription) {
          return NextResponse.json({ error: "Subscribe to comment on this post" }, { status: 403 });
        }
      }
    }

    const comment = await prisma.comment.create({
      data: {
        postId,
        userId: session.user.id,
        content: content.trim(),
      },
      include: {
        user: {
          select: { id: true, name: true, image: true },
        },
      },
    });

    return NextResponse.json({ comment }, { status: 201 });
  } catch (error) {
    console.error("Error creating comment:", error);
    return NextResponse.json({ error: "Failed to create comment" }, { status: 500 });
  }
}
