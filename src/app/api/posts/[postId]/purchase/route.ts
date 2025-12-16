import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

interface RouteParams {
  params: Promise<{ postId: string }>;
}

// POST /api/posts/[postId]/purchase - Purchase a PPV post
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { postId } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the post
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        creator: true,
        purchases: {
          where: { userId: session.user.id },
        },
      },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    if (!post.isPPV || !post.ppvPrice) {
      return NextResponse.json({ error: "This post is not available for purchase" }, { status: 400 });
    }

    // Check if already purchased
    if (post.purchases.length > 0) {
      return NextResponse.json({ error: "You already own this post" }, { status: 400 });
    }

    // Creator can't buy their own post
    if (post.creator.userId === session.user.id) {
      return NextResponse.json({ error: "You can't purchase your own post" }, { status: 400 });
    }

    // Create purchase record
    // In production, this would integrate with payment gateway first
    const purchase = await prisma.purchase.create({
      data: {
        userId: session.user.id,
        postId: post.id,
        amount: post.ppvPrice,
        currency: "INR",
        status: "COMPLETED",
      },
    });

    return NextResponse.json({
      success: true,
      purchase,
      message: "Post unlocked successfully",
    }, { status: 201 });
  } catch (error) {
    console.error("Error purchasing post:", error);
    return NextResponse.json({ error: "Failed to purchase post" }, { status: 500 });
  }
}

// GET /api/posts/[postId]/purchase - Check if user owns the post
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { postId } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ owned: false });
    }

    const purchase = await prisma.purchase.findFirst({
      where: {
        postId,
        userId: session.user.id,
        status: "COMPLETED",
      },
    });

    return NextResponse.json({ owned: !!purchase });
  } catch (error) {
    console.error("Error checking purchase:", error);
    return NextResponse.json({ error: "Failed to check purchase" }, { status: 500 });
  }
}
