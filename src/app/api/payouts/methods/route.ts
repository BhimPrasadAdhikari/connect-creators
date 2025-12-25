import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { z } from "zod";

const payoutMethodSchema = z.object({
  type: z.enum(["BANK_TRANSFER", "UPI"]),
  details: z.any(), // Flexible JSON for details
  isDefault: z.boolean().optional(),
});

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const creator = await prisma.creatorProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!creator) return NextResponse.json({ error: "Creator not found" }, { status: 404 });

    const methods = await prisma.payoutMethod.findMany({
      where: { creatorId: creator.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ methods });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch payout methods" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const json = await req.json();
    const body = payoutMethodSchema.parse(json);

    const creator = await prisma.creatorProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!creator) return NextResponse.json({ error: "Creator not found" }, { status: 404 });

    // If making this default, unset other defaults
    if (body.isDefault) {
      await prisma.payoutMethod.updateMany({
        where: { creatorId: creator.id, isDefault: true },
        data: { isDefault: false },
      });
    }

    const method = await prisma.payoutMethod.create({
      data: {
        creatorId: creator.id,
        type: body.type,
        details: body.details,
        isDefault: body.isDefault || false,
      },
    });

    return NextResponse.json({ method });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create payout method" }, { status: 500 });
  }
}
