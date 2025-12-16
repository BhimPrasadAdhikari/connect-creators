import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

interface RouteParams {
  params: Promise<{ tierId: string }>;
}

// PUT /api/creator/tiers/[tierId] - Update a tier
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { tierId } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const creator = await prisma.creatorProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!creator) {
      return NextResponse.json({ error: "Creator profile not found" }, { status: 404 });
    }

    // Verify tier belongs to creator
    const tier = await prisma.subscriptionTier.findFirst({
      where: { id: tierId, creatorId: creator.id },
    });

    if (!tier) {
      return NextResponse.json({ error: "Tier not found" }, { status: 404 });
    }

    const body = await request.json();
    const { name, description, price, benefits, isActive } = body;

    const updatedTier = await prisma.subscriptionTier.update({
      where: { id: tierId },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(price && { price }),
        ...(benefits && { benefits }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    return NextResponse.json({ tier: updatedTier });
  } catch (error) {
    console.error("Error updating tier:", error);
    return NextResponse.json({ error: "Failed to update tier" }, { status: 500 });
  }
}

// DELETE /api/creator/tiers/[tierId] - Delete a tier
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { tierId } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const creator = await prisma.creatorProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!creator) {
      return NextResponse.json({ error: "Creator profile not found" }, { status: 404 });
    }

    // Verify tier belongs to creator
    const tier = await prisma.subscriptionTier.findFirst({
      where: { id: tierId, creatorId: creator.id },
      include: { _count: { select: { subscriptions: true } } },
    });

    if (!tier) {
      return NextResponse.json({ error: "Tier not found" }, { status: 404 });
    }

    // If tier has active subscribers, just deactivate instead of delete
    if (tier._count.subscriptions > 0) {
      await prisma.subscriptionTier.update({
        where: { id: tierId },
        data: { isActive: false },
      });
      return NextResponse.json({ message: "Tier deactivated (has active subscribers)" });
    }

    await prisma.subscriptionTier.delete({ where: { id: tierId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting tier:", error);
    return NextResponse.json({ error: "Failed to delete tier" }, { status: 500 });
  }
}
