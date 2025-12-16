import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET /api/messages - Get user's conversations
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get creator profile if exists
    const creator = await prisma.creatorProfile.findUnique({
      where: { userId: session.user.id },
    });

    // Find conversations where user is either fan or creator
    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [
          { fanId: session.user.id },
          ...(creator ? [{ creatorId: creator.id }] : []),
        ],
      },
      include: {
        creator: {
          include: { user: { select: { name: true, image: true } } },
        },
        fan: { select: { id: true, name: true, image: true } },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: { lastMessageAt: "desc" },
    });

    // Format conversations for display
    const formatted = conversations.map((conv) => {
      const isCreator = creator?.id === conv.creatorId;
      const otherUser = isCreator
        ? { id: conv.fanId, name: conv.fan.name, image: conv.fan.image }
        : { id: conv.creator.userId, name: conv.creator.displayName || conv.creator.user.name, image: conv.creator.user.image };

      return {
        id: conv.id,
        otherUser,
        lastMessage: conv.messages[0]?.content || null,
        lastMessageAt: conv.lastMessageAt,
        isCreator,
        dmPrice: conv.creator.dmPrice,
      };
    });

    return NextResponse.json({ conversations: formatted });
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return NextResponse.json({ error: "Failed to fetch conversations" }, { status: 500 });
  }
}

// POST /api/messages - Start a new conversation or send a message
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { creatorId, content } = body;

    if (!creatorId || !content) {
      return NextResponse.json({ error: "Creator ID and content are required" }, { status: 400 });
    }

    // Get creator
    const creator = await prisma.creatorProfile.findUnique({
      where: { id: creatorId },
    });

    if (!creator) {
      return NextResponse.json({ error: "Creator not found" }, { status: 404 });
    }

    // Can't message yourself
    if (creator.userId === session.user.id) {
      return NextResponse.json({ error: "You can't message yourself" }, { status: 400 });
    }

    // Find or create conversation
    let conversation = await prisma.conversation.findUnique({
      where: {
        creatorId_fanId: {
          creatorId,
          fanId: session.user.id,
        },
      },
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          creatorId,
          fanId: session.user.id,
        },
      });
    }

    // Check if DM is paid
    const isPaid = !!creator.dmPrice && creator.dmPrice > 0;

    // Create message
    const message = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        senderId: session.user.id,
        content,
        isPaid,
        price: isPaid ? creator.dmPrice : null,
      },
    });

    // Update conversation
    await prisma.conversation.update({
      where: { id: conversation.id },
      data: {
        lastMessage: content.substring(0, 100),
        lastMessageAt: new Date(),
      },
    });

    return NextResponse.json({
      message,
      conversationId: conversation.id,
      isPaid,
      price: creator.dmPrice,
    }, { status: 201 });
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
