import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET /api/posts - Get posts (for feed or by creator)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(request.url);
    const creatorId = searchParams.get("creatorId");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");

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
    console.error("Error fetching posts:", error);
    return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 });
  }
}

// POST /api/posts - Create a new post (creators only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is a creator
    const creator = await prisma.creatorProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!creator) {
      return NextResponse.json({ error: "Must be a creator to post" }, { status: 403 });
    }

    const body = await request.json();
    const { title, content, mediaUrl, mediaType, isPaid, requiredTierId } = body;

    if (!title || !content) {
      return NextResponse.json({ error: "Title and content are required" }, { status: 400 });
    }

    // Validate tier if provided
    if (requiredTierId) {
      const tier = await prisma.subscriptionTier.findFirst({
        where: { id: requiredTierId, creatorId: creator.id },
      });
      if (!tier) {
        return NextResponse.json({ error: "Invalid tier" }, { status: 400 });
      }
    }

    const post = await prisma.post.create({
      data: {
        creatorId: creator.id,
        title,
        content,
        mediaUrl: mediaUrl || null,
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
    console.error("Error creating post:", error);
    return NextResponse.json({ error: "Failed to create post" }, { status: 500 });
  }
}
