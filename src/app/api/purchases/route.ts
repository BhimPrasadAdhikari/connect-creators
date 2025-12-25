// API to get user's purchases
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { generateSecureDownloadUrl } from "@/lib/downloads";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as { id?: string }).id;
    if (!userId) {
      return NextResponse.json({ error: "User ID not found" }, { status: 401 });
    }

    // Get all completed purchases for this user
    const purchases = await prisma.purchase.findMany({
      where: {
        userId,
        status: "COMPLETED",
      },
      include: {
        product: {
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
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Format the response
    const formattedPurchases = purchases
      .filter(p => p.product) // Only include product purchases
      .map(purchase => ({
        id: purchase.id,
        productId: purchase.productId,
        amount: purchase.amount,
        currency: purchase.currency,
        purchasedAt: purchase.createdAt,
        product: {
          id: purchase.product!.id,
          title: purchase.product!.title,
          description: purchase.product!.description,
          // Use secure download URL
          fileUrl: generateSecureDownloadUrl(
            purchase.id,
            purchase.product!.id,
            userId
          ),
          fileType: purchase.product!.fileType,
          thumbnailUrl: purchase.product!.thumbnailUrl,
          creator: {
            id: purchase.product!.creator.id,
            username: purchase.product!.creator.username,
            displayName: purchase.product!.creator.displayName,
            avatar: purchase.product!.creator.user.image,
          },
        },
      }));

    return NextResponse.json({ purchases: formattedPurchases });
  } catch (error) {
    console.error("[Purchases API] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch purchases" },
      { status: 500 }
    );
  }
}
