import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET /api/tiers - Get creator's subscription tiers
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
          where: { isActive: true },
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
