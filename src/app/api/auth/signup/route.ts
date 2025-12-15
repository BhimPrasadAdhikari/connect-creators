import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password, role = "FAN", username } = body;

    // Validate required fields
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    // If creator, validate and check username
    if (role === "CREATOR") {
      if (!username) {
        return NextResponse.json(
          { error: "Username is required for creators" },
          { status: 400 }
        );
      }

      // Validate username format (alphanumeric and underscores only)
      const usernameRegex = /^[a-zA-Z0-9_]+$/;
      if (!usernameRegex.test(username) || username.length < 3) {
        return NextResponse.json(
          { error: "Username must be at least 3 characters and contain only letters, numbers, and underscores" },
          { status: 400 }
        );
      }

      // Check if username is taken
      const existingCreator = await prisma.creatorProfile.findUnique({
        where: { username: username.toLowerCase() },
      });

      if (existingCreator) {
        return NextResponse.json(
          { error: "This username is already taken" },
          { status: 409 }
        );
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        role: role === "CREATOR" ? "CREATOR" : "FAN",
      },
    });

    // If creator, create creator profile
    if (role === "CREATOR" && username) {
      await prisma.creatorProfile.create({
        data: {
          userId: user.id,
          username: username.toLowerCase(),
          displayName: name,
        },
      });
    }

    // Return success (excluding password)
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "An error occurred during signup" },
      { status: 500 }
    );
  }
}
