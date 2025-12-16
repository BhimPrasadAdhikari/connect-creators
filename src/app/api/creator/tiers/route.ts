import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET /api/creator/tiers - Get creator's tiers with subscriber counts
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const creator = await prisma.creatorProfile.findUnique({
      where: { userId: session.user.id },
      include: {
        tiers: {
          include: {
            _count: { select: { subscriptions: true } },
          },
          orderBy: { price: "asc" },
        },
      },
    });

    if (!creator) {
      return NextResponse.json({ tiers: [] });
    }

    return NextResponse.json({ tiers: creator.tiers });
  } catch (error) {
    console.error("Error fetching tiers:", error);
    return NextResponse.json({ error: "Failed to fetch tiers" }, { status: 500 });
  }
}

// POST /api/creator/tiers - Create a new tier
export async function POST(request: NextRequest) {
  try {
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

    const body = await request.json();
    const { name, description, price, benefits, currency = "INR" } = body;

    if (!name || !price) {
      return NextResponse.json({ error: "Name and price are required" }, { status: 400 });
    }

    if (price < 4900) {
      return NextResponse.json({ error: "Minimum price is ₹49" }, { status: 400 });
    }

    const tier = await prisma.subscriptionTier.create({
      data: {
        creatorId: creator.id,
        name,
        description,
        price,
        currency,
        benefits: benefits || [],
        isActive: true,
      },
    });

    return NextResponse.json({ tier }, { status: 201 });
  } catch (error) {
    console.error("Error creating tier:", error);
    return NextResponse.json({ error: "Failed to create tier" }, { status: 500 });
  }
}
