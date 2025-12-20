import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { updateProfileSchema, validateBody } from "@/lib/api/validation";
import { ApiErrors, logError } from "@/lib/api/errors";
import { sanitizeUrl } from "@/lib/api/sanitize";

// GET /api/settings/profile - Get user profile settings
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return ApiErrors.unauthorized();
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        emailVerified: true,
      },
    });

    if (!user) {
      return ApiErrors.notFound("User");
    }

    return NextResponse.json(user);
  } catch (error) {
    logError("settings.profile.GET", error);
    return ApiErrors.internal();
  }
}

// PUT /api/settings/profile - Update user profile
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return ApiErrors.unauthorized();
    }

    const body = await req.json();
    
    // Validate input
    const validation = validateBody(updateProfileSchema, body);
    if (!validation.success) {
      return ApiErrors.validationError(validation.errors);
    }
    
    const { name, image } = validation.data;

    // Build update data
    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (image !== undefined) updateData.image = sanitizeUrl(image);

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    logError("settings.profile.PUT", error);
    return ApiErrors.internal();
  }
}

// DELETE /api/settings/profile - Delete user account
export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return ApiErrors.unauthorized();
    }

    // Delete user (cascades to related records due to onDelete: Cascade)
    await prisma.user.delete({
      where: { id: session.user.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    logError("settings.profile.DELETE", error);
    return ApiErrors.internal();
  }
}
