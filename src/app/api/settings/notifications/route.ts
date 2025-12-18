import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET /api/settings/notifications - Get notification preferences
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Return default values since notification fields aren't in schema yet
    // This can be extended when notification preferences are added to User model
    return NextResponse.json({
      emailNotifications: true,
      marketingEmails: false,
    });
  } catch (error) {
    console.error("Failed to fetch notification settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch notification settings" },
      { status: 500 }
    );
  }
}

// PUT /api/settings/notifications - Update notification preferences
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
    const { emailNotifications, marketingEmails } = body;

    // Placeholder - in a real implementation, you would update the User model
    // For now, we just acknowledge the settings
    console.log("Notification settings updated:", {
      userId,
      emailNotifications,
      marketingEmails,
    });

    return NextResponse.json({
      success: true,
      emailNotifications,
      marketingEmails,
    });
  } catch (error) {
    console.error("Failed to update notification settings:", error);
    return NextResponse.json(
      { error: "Failed to update notification settings" },
      { status: 500 }
    );
  }
}
