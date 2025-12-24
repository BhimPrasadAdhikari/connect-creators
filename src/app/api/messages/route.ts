import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { createMessageSchema, validateBody, idSchema } from "@/lib/api/validation";
import { ApiErrors, logError } from "@/lib/api/errors";
import { sanitizeMessage } from "@/lib/api/sanitize";

// Get user's conversations
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return ApiErrors.unauthorized();
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
    logError("messages.GET", error);
    return ApiErrors.internal();
  }
}

// Start a new conversation or send a message
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return ApiErrors.unauthorized();
    }

    const body = await request.json();
    
    // Validate input
    const validation = validateBody(createMessageSchema, body);
    if (!validation.success) {
      return ApiErrors.validationError(validation.errors);
    }
    
    const { creatorId, content } = validation.data;

    // Get creator
    const creator = await prisma.creatorProfile.findUnique({
      where: { id: creatorId },
    });

    if (!creator) {
      return ApiErrors.notFound("Creator");
    }

    // Can't message yourself
    if (creator.userId === session.user.id) {
      return ApiErrors.badRequest("You can't message yourself");
    }

    // Sanitize message content
    const sanitizedContent = sanitizeMessage(content);

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
    const dmPrice = creator.dmPrice || 0;
    const isPaidDM = dmPrice > 0;

    // For paid DMs, check if user has an available paid message
    const { paymentId } = body;
    
    if (isPaidDM) {
      // Check for a COMPLETED payment with available messages
      // Find payments where messagesUsed < messagesAllowed
      const availablePayment = await prisma.dMPayment.findFirst({
        where: {
          userId: session.user.id,
          creatorId: creatorId,
          status: "COMPLETED",
          OR: [
            { expiresAt: null },
            { expiresAt: { gte: new Date() } },
          ],
        },
        orderBy: { createdAt: "asc" }, // Use oldest payment first
      });

      // Check if payment has available messages
      const hasAvailableMessages = availablePayment && 
        availablePayment.messagesUsed < availablePayment.messagesAllowed;

      if (!hasAvailableMessages) {
        // Return price info so client can initiate payment
        return NextResponse.json({
          requiresPayment: true,
          dmPrice: dmPrice,
          currency: "INR",
          creatorId: creator.id,
          creatorName: creator.displayName || creator.username,
          message: `This creator charges ₹${dmPrice / 100} per message. Please complete payment first.`,
          paymentUrl: `/api/payments/razorpay/dm`,
        }, { status: 402 }); // 402 Payment Required
      }

      // Use the payment - increment messagesUsed
      await prisma.dMPayment.update({
        where: { id: availablePayment.id },
        data: { messagesUsed: { increment: 1 } },
      });

      console.log(`[Messages] Using DM payment ${availablePayment.id} (${availablePayment.messagesUsed + 1}/${availablePayment.messagesAllowed} messages used)`);
    }

    // Create message
    const message = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        senderId: session.user.id,
        content: sanitizedContent,
        isPaid: isPaidDM,
        price: isPaidDM ? dmPrice : null,
      },
    });

    // Update conversation
    await prisma.conversation.update({
      where: { id: conversation.id },
      data: {
        lastMessage: sanitizedContent.substring(0, 100),
        lastMessageAt: new Date(),
      },
    });

    return NextResponse.json({
      message,
      conversationId: conversation.id,
      isPaid: isPaidDM,
      price: dmPrice,
    }, { status: 201 });
  } catch (error) {
    logError("messages.POST", error);
    return ApiErrors.internal();
  }
}
