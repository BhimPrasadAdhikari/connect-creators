import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

interface RouteParams {
  params: Promise<{ conversationId: string }>;
}

// GET /api/messages/[conversationId] - Get messages in a conversation
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { conversationId } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's creator profile if exists
    const creator = await prisma.creatorProfile.findUnique({
      where: { userId: session.user.id },
    });

    // Verify user is part of conversation
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        creator: {
          include: { user: { select: { id: true, name: true, image: true } } },
        },
        fan: { select: { id: true, name: true, image: true } },
      },
    });

    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    const isFan = conversation.fanId === session.user.id;
    const isCreator = creator?.id === conversation.creatorId;

    if (!isFan && !isCreator) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    // Get messages
    const messages = await prisma.message.findMany({
      where: { conversationId },
      include: {
        sender: { select: { id: true, name: true, image: true } },
      },
      orderBy: { createdAt: "asc" },
    });

    // Mark messages as read
    await prisma.message.updateMany({
      where: {
        conversationId,
        senderId: { not: session.user.id },
        isRead: false,
      },
      data: { isRead: true },
    });

    // Get other participant info
    const otherUser = isCreator
      ? conversation.fan
      : {
          id: conversation.creator.user.id,
          name: conversation.creator.displayName || conversation.creator.user.name,
          image: conversation.creator.user.image,
        };

    return NextResponse.json({
      conversation: {
        id: conversation.id,
        dmPrice: conversation.creator.dmPrice,
        isCreator,
        otherUser,
      },
      messages,
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
  }
}

// POST /api/messages/[conversationId] - Send a message in conversation
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { conversationId } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { content } = body;

    if (!content || content.trim().length === 0) {
      return NextResponse.json({ error: "Message cannot be empty" }, { status: 400 });
    }

    // Get user's creator profile if exists
    const userCreator = await prisma.creatorProfile.findUnique({
      where: { userId: session.user.id },
    });

    // Verify user is part of conversation
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: { creator: true },
    });

    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    const isFan = conversation.fanId === session.user.id;
    const isCreator = userCreator?.id === conversation.creatorId;

    if (!isFan && !isCreator) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    // Only fans pay for messages (if creator has DM pricing)
    const isPaid = isFan && !!conversation.creator.dmPrice && conversation.creator.dmPrice > 0;

    const message = await prisma.message.create({
      data: {
        conversationId,
        senderId: session.user.id,
        content: content.trim(),
        isPaid,
        price: isPaid ? conversation.creator.dmPrice : null,
      },
      include: {
        sender: { select: { id: true, name: true, image: true } },
      },
    });

    // Update conversation
    await prisma.conversation.update({
      where: { id: conversationId },
      data: {
        lastMessage: content.substring(0, 100),
        lastMessageAt: new Date(),
      },
    });

    return NextResponse.json({ message }, { status: 201 });
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
