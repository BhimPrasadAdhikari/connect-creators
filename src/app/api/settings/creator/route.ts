import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { updateCreatorProfileSchema, validateBody } from "@/lib/api/validation";
import { ApiErrors, logError } from "@/lib/api/errors";
import { sanitizeContent, sanitizeUrl } from "@/lib/api/sanitize";

// GET /api/settings/creator - Get creator profile settings
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return ApiErrors.unauthorized();
    }

    const creatorProfile = await prisma.creatorProfile.findUnique({
      where: { userId: session.user.id },
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
      return ApiErrors.notFound("Creator profile");
    }

    return NextResponse.json(creatorProfile);
  } catch (error) {
    logError("settings.creator.GET", error);
    return ApiErrors.internal();
  }
}

// PUT /api/settings/creator - Update creator profile settings
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return ApiErrors.unauthorized();
    }

    const body = await req.json();
    
    // Validate input
    const validation = validateBody(updateCreatorProfileSchema, body);
    if (!validation.success) {
      return ApiErrors.validationError(validation.errors);
    }
    
    const { displayName, bio, coverImage, socialLinks, dmPrice } = validation.data;

    // Build update data with sanitization
    const updateData: Record<string, unknown> = {};
    if (displayName !== undefined) updateData.displayName = displayName ? sanitizeContent(displayName) : null;
    if (bio !== undefined) updateData.bio = bio ? sanitizeContent(bio) : null;
    if (coverImage !== undefined) updateData.coverImage = sanitizeUrl(coverImage);
    if (socialLinks !== undefined) updateData.socialLinks = socialLinks;
    if (dmPrice !== undefined) updateData.dmPrice = dmPrice;

    const updatedProfile = await prisma.creatorProfile.update({
      where: { userId: session.user.id },
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
    logError("settings.creator.PUT", error);
    return ApiErrors.internal();
  }
}
