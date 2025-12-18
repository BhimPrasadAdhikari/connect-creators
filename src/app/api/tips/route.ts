import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { createTipSchema, validateBody } from "@/lib/api/validation";
import { ApiErrors, logError } from "@/lib/api/errors";
import { sanitizeMessage } from "@/lib/api/sanitize";

// Pre-defined tip amounts
const TIP_AMOUNTS = {
  small: 5000, // ₹50
  medium: 10000, // ₹100
  large: 25000, // ₹250
};

// POST /api/tips - Send a tip to a creator
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return ApiErrors.unauthorized("Must be logged in to send tips");
    }

    const body = await request.json();
    
    // Validate input
    const validation = validateBody(createTipSchema, body);
    if (!validation.success) {
      return ApiErrors.validationError(validation.errors);
    }
    
    const { creatorId, postId, amount, message } = validation.data;

    // Calculate tip amount
    const tipAmount = typeof amount === "string" 
      ? TIP_AMOUNTS[amount as keyof typeof TIP_AMOUNTS] 
      : amount;
    
    if (!tipAmount || tipAmount < 5000) {
      return ApiErrors.badRequest("Invalid tip amount (minimum ₹50)");
    }

    // Verify creator exists
    const creator = await prisma.creatorProfile.findUnique({
      where: { id: creatorId },
      include: { user: { select: { name: true } } },
    });

    if (!creator) {
      return ApiErrors.notFound("Creator");
    }

    // Cannot tip yourself
    if (creator.userId === session.user.id) {
      return ApiErrors.badRequest("Cannot tip yourself");
    }

    // Verify post if provided
    if (postId) {
      const post = await prisma.post.findUnique({
        where: { id: postId, creatorId },
      });
      if (!post) {
        return ApiErrors.notFound("Post");
      }
    }

    // Sanitize message
    const sanitizedMessage = message ? sanitizeMessage(message, 500) : null;

    // Create tip record (in real app, this would integrate with payment)
    const tip = await prisma.tip.create({
      data: {
        fromUserId: session.user.id,
        toCreatorId: creatorId,
        postId: postId || null,
        amount: tipAmount,
        message: sanitizedMessage,
      },
      include: {
        fromUser: { select: { name: true, image: true } },
        toCreator: {
          include: { user: { select: { name: true } } },
        },
      },
    });

    return NextResponse.json({
      success: true,
      tip,
      message: `Sent ₹${tipAmount / 100} tip to ${creator.user.name || creator.displayName}!`,
    }, { status: 201 });
  } catch (error) {
    logError("tips.POST", error);
    return ApiErrors.internal();
  }
}

// GET /api/tips - Get tips received (for creators) or sent (for fans)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return ApiErrors.unauthorized();
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "received";

    if (type === "received") {
      // Get tips received by creator
      const creator = await prisma.creatorProfile.findUnique({
        where: { userId: session.user.id },
      });

      if (!creator) {
        return NextResponse.json({ tips: [] });
      }

      const tips = await prisma.tip.findMany({
        where: { toCreatorId: creator.id },
        include: {
          fromUser: { select: { name: true, image: true } },
          post: { select: { id: true, title: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 50,
      });

      const totalTips = await prisma.tip.aggregate({
        where: { toCreatorId: creator.id },
        _sum: { amount: true },
        _count: true,
      });

      return NextResponse.json({ tips, stats: totalTips });
    } else {
      // Get tips sent by fan
      const tips = await prisma.tip.findMany({
        where: { fromUserId: session.user.id },
        include: {
          toCreator: {
            include: { user: { select: { name: true, image: true } } },
          },
          post: { select: { id: true, title: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 50,
      });

      return NextResponse.json({ tips });
    }
  } catch (error) {
    logError("tips.GET", error);
    return ApiErrors.internal();
  }
}
