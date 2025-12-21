// Forgot Password API
// Send password reset email with secure token

import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/email/service";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: { id: true, email: true, name: true, password: true },
    });

    // Always return success to prevent email enumeration
    if (!user) {
      console.log(`[Auth] Password reset requested for non-existent email: ${email}`);
      return NextResponse.json({
        message: "If an account exists, a reset link has been sent",
      });
    }

    // Check if user has a password (OAuth only users can't reset)
    if (!user.password) {
      console.log(`[Auth] Password reset requested for OAuth user: ${email}`);
      return NextResponse.json({
        message: "If an account exists, a reset link has been sent",
      });
    }

    // Delete any existing tokens for this email
    await prisma.passwordResetToken.deleteMany({
      where: { email: user.email },
    });

    // Generate secure token
    const token = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // Create token with 1 hour expiry
    await prisma.passwordResetToken.create({
      data: {
        email: user.email,
        token: hashedToken,
        expires: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
      },
    });

    // Build reset URL
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const resetUrl = `${baseUrl}/reset-password?token=${token}`;

    // Send email
    await sendPasswordResetEmail(user.email, user.name || "", resetUrl);

    console.log(`[Auth] Password reset email sent to: ${email}`);

    return NextResponse.json({
      message: "If an account exists, a reset link has been sent",
    });
  } catch (error) {
    console.error("[Auth] Forgot password error:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
