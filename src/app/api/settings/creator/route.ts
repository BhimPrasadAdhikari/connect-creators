import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET /api/settings/creator - Get creator profile settings
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as { id?: string }).id;
    if (!userId) {
      return NextResponse.json({ error: "User ID not found" }, { status: 401 });
    }

    const creatorProfile = await prisma.creatorProfile.findUnique({
      where: { userId },
      select: {
        id: true,
        username: true,
        displayName: true,
        bio: true,
        coverImage: true,
        socialLinks: true,
        dmPrice: true,
        isVerified: true,
      },
    });

    if (!creatorProfile) {
      return NextResponse.json(
        { error: "Creator profile not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(creatorProfile);
  } catch (error) {
    console.error("Failed to fetch creator profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch creator profile" },
      { status: 500 }
    );
  }
}

// PUT /api/settings/creator - Update creator profile settings
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as { id?: string }).id;
    if (!userId) {
      return NextResponse.json({ error: "User ID not found" }, { status: 401 });
    }

    const body = await req.json();
    const { displayName, bio, coverImage, socialLinks, dmPrice } = body;

    // Build update data
    const updateData: Record<string, unknown> = {};
    if (displayName !== undefined) updateData.displayName = displayName;
    if (bio !== undefined) updateData.bio = bio;
    if (coverImage !== undefined) updateData.coverImage = coverImage;
    if (socialLinks !== undefined) updateData.socialLinks = socialLinks;
    if (dmPrice !== undefined) updateData.dmPrice = dmPrice;

    const updatedProfile = await prisma.creatorProfile.update({
      where: { userId },
      data: updateData,
      select: {
        id: true,
        username: true,
        displayName: true,
        bio: true,
        coverImage: true,
        socialLinks: true,
        dmPrice: true,
      },
    });

    return NextResponse.json(updatedProfile);
  } catch (error) {
    console.error("Failed to update creator profile:", error);
    return NextResponse.json(
      { error: "Failed to update creator profile" },
      { status: 500 }
    );
  }
}
