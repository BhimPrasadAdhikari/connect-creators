import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { ApiErrors } from "@/lib/api/errors";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return ApiErrors.forbidden("Admin access required");
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const where: any = {};
    if (status) {
        where.status = status;
    }

    const refunds = await prisma.refund.findMany({
      where,
      include: {
        user: { select: { name: true, email: true, image: true } },
        purchase: { select: { product: { select: { title: true } } } },
        payment: { select: { amount: true, currency: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ refunds });
  } catch (error) {
    console.error("Admin refund list error:", error);
    return ApiErrors.internal("Failed to fetch refunds");
  }
}
