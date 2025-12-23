import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// Fetch creator by username
async function getCreator(username: string) {
  const creator = await prisma.creatorProfile.findUnique({
    where: { username },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
      tiers: {
        where: { isActive: true },
        orderBy: { price: "asc" },
      },
      posts: {
        where: { isPublished: true },
        orderBy: { createdAt: "desc" },
        take: 10,
        include: {
          requiredTier: true,
        },
      },
      digitalProducts: {
        where: { isActive: true },
        orderBy: { createdAt: "desc" },
        take: 6,
      },
      _count: {
        select: {
          subscriptions: {
            where: { status: "ACTIVE" },
          },
          posts: true,
          digitalProducts: true,
        },
      },
    },
  });

  return creator;
}

// Fetch user's subscriptions and purchases for this creator
async function getUserPurchaseStatus(userId: string | null, creatorId: string, productIds: string[]) {
  if (!userId) {
    return {
      subscribedTierIds: [] as string[],
      purchasedProductIds: [] as string[],
    };
  }

  const [subscriptions, purchases] = await Promise.all([
    prisma.subscription.findMany({
      where: {
        fanId: userId,
        creatorId: creatorId,
        status: "ACTIVE",
      },
      select: { tierId: true },
    }),
    prisma.purchase.findMany({
      where: {
        userId: userId,
        status: "COMPLETED",
        productId: { in: productIds },
      },
      select: { productId: true },
    }),
  ]);

  return {
    subscribedTierIds: subscriptions.map((s) => s.tierId),
    purchasedProductIds: purchases.map((p) => p.productId).filter(Boolean) as string[],
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params;
    const creator = await getCreator(username);
    const session = await getServerSession(authOptions);

    if (!creator) {
      return NextResponse.json({ error: "Creator not found" }, { status: 404 });
    }

    const userId = (session?.user as { id?: string })?.id || null;
    const productIds = creator.digitalProducts.map((p) => p.id);
    const { subscribedTierIds, purchasedProductIds } = await getUserPurchaseStatus(
      userId,
      creator.id,
      productIds
    );

    const isOwner = session?.user?.id === creator.user.id;

    return NextResponse.json({
      creator: {
        ...creator,
        socialLinks: creator.socialLinks || {},
      },
      userId,
      isOwner,
      subscribedTierIds,
      purchasedProductIds,
    });
  } catch (error) {
    console.error("Error fetching creator:", error);
    return NextResponse.json({ error: "Failed to fetch creator" }, { status: 500 });
  }
}
