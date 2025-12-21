// Get subscription tier by ID
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ tierId: string }> }
) {
  try {
    const { tierId } = await params;
    
    const tier = await prisma.subscriptionTier.findUnique({
      where: { id: tierId },
      include: {
        creator: {
          include: {
            user: {
              select: {
                image: true,
              },
            },
          },
        },
      },
    });

    if (!tier) {
      return NextResponse.json(
        { error: "Subscription tier not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(tier);
  } catch (error) {
    console.error("[Tiers] Error fetching tier:", error);
    return NextResponse.json(
      { error: "Failed to fetch tier" },
      { status: 500 }
    );
  }
}
