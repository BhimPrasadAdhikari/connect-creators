import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;

    const creator = await prisma.creatorProfile.findUnique({
      where: { userId: session.user.id },
    });
    
    if (!creator) return NextResponse.json({ error: "Creator not found" }, { status: 404 });

    const method = await prisma.payoutMethod.findUnique({
      where: { id },
    });

    if (!method || method.creatorId !== creator.id) {
       return NextResponse.json({ error: "Method not found or unauthorized" }, { status: 404 });
    }

    await prisma.payoutMethod.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete payout method" }, { status: 500 });
  }
}
