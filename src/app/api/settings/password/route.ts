import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import bcrypt from "bcryptjs";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { validatePassword } from "@/lib/auth/validation";
import { invalidateUserSessions } from "@/lib/auth/session";
import { logAudit, getClientIp, AuditAction } from "@/lib/security/audit";
import { notifyPasswordChange } from "@/lib/security/notifications";

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    if (!userId) {
      return NextResponse.json({ error: "User ID not found" }, { status: 401 });
    }

    const body = await req.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "Current and new password are required" },
        { status: 400 }
      );
    }

    // Validate new password against security policy
    const validation = validatePassword(newPassword);
    if (!validation.valid) {
      return NextResponse.json(
        { 
          error: "Password does not meet security requirements",
          details: validation.errors,
          strength: validation.strength
        },
        { status: 400 }
      );
    }

    // Get user with password
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { password: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if user has a password (might be OAuth only)
    if (!user.password) {
      return NextResponse.json(
        { error: "Cannot change password for OAuth accounts" },
        { status: 400 }
      );
    }

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      // Log failed attempt
      await logAudit({
        userId,
        action: AuditAction.PASSWORD_CHANGE,
        resource: "user",
        resourceId: userId,
        status: "FAILURE",
        metadata: { reason: "Invalid current password" },
      });
      return NextResponse.json(
        { error: "Current password is incorrect" },
        { status: 400 }
      );
    }

    // Prevent reuse of current password
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      return NextResponse.json(
        { error: "New password must be different from current password" },
        { status: 400 }
      );
    }

    // Hash new password with strong cost factor
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    // SECURITY: Invalidate all existing sessions after password change
    await invalidateUserSessions(userId);

    // Log successful password change
    const ipAddress = await getClientIp();
    await logAudit({
      userId,
      action: AuditAction.PASSWORD_CHANGE,
      resource: "user",
      resourceId: userId,
      status: "SUCCESS",
    });

    // Send email notification
    await notifyPasswordChange(userId, ipAddress);

    return NextResponse.json({ 
      success: true,
      message: "Password changed successfully. You may need to log in again on other devices."
    });
  } catch (error) {
    console.error("Failed to change password:", error);
    return NextResponse.json(
      { error: "Failed to change password" },
      { status: 500 }
    );
  }
}
