import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const creator = await prisma.creatorProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!creator) return NextResponse.json({ error: "Creator not found" }, { status: 404 });

    const payouts = await prisma.payout.findMany({
      where: { creatorId: creator.id },
      include: {
        payoutMethod: {
            select: {
                type: true,
                details: true,
            }
        }
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ payouts });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch payout history" }, { status: 500 });
  }
}
