// Session Management API
// Handle listing and revoking all sessions

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revokeAllSessions, getActiveSessions } from "@/lib/security/session";

// GET /api/settings/sessions - List active sessions
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

    const sessions = await getActiveSessions(userId);

    return NextResponse.json({
      sessions,
      note: "With JWT strategy, we can only show database sessions. JWT sessions are tracked via securityVersion.",
    });
  } catch (error) {
    console.error("Failed to get sessions:", error);
    return NextResponse.json(
      { error: "Failed to get sessions" },
      { status: 500 }
    );
  }
}

// DELETE /api/settings/sessions - Revoke all sessions (sign out everywhere)
export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as { id?: string }).id;
    if (!userId) {
      return NextResponse.json({ error: "User ID not found" }, { status: 401 });
    }

    await revokeAllSessions(userId);

    return NextResponse.json({
      success: true,
      message: "All sessions have been revoked. Please sign in again.",
    });
  } catch (error) {
    console.error("Failed to revoke sessions:", error);
    return NextResponse.json(
      { error: "Failed to revoke sessions" },
      { status: 500 }
    );
  }
}
