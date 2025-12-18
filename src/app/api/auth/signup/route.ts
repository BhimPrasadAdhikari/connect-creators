import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { signupSchema, validateBody } from "@/lib/api/validation";
import { ApiErrors, logError } from "@/lib/api/errors";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input with Zod
    const validation = validateBody(signupSchema, body);
    if (!validation.success) {
      return ApiErrors.validationError(validation.errors);
    }
    
    const { name, email, password, role, username } = validation.data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return ApiErrors.conflict("An account with this email already exists");
    }

    // If creator, validate and check username
    if (role === "CREATOR") {
      if (!username) {
        return ApiErrors.validationError(["Username is required for creators"]);
      }

      // Check if username is taken
      const existingCreator = await prisma.creatorProfile.findUnique({
        where: { username },
      });

      if (existingCreator) {
        return ApiErrors.conflict("This username is already taken");
      }
    }

    // Hash password with strong cost factor
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role === "CREATOR" ? "CREATOR" : "FAN",
      },
    });

    // If creator, create creator profile
    if (role === "CREATOR" && username) {
      await prisma.creatorProfile.create({
        data: {
          userId: user.id,
          username,
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
    logError("signup", error);
    return ApiErrors.internal();
  }
}
