// Session Management Utilities
// Handles session invalidation via security version

import prisma from "@/lib/prisma";

// Invalidates all sessions for a user by incrementing their security version.
// Any JWT tokens with an older security version will be rejected.
export async function invalidateUserSessions(userId: string): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: {
      securityVersion: {
        increment: 1,
      },
    },
  });
}

// Gets the current security version for a user
export async function getUserSecurityVersion(userId: string): Promise<number | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { securityVersion: true },
  });
  return user?.securityVersion ?? null;
}

// Validates that a token's security version matches the current user's version.
// Returns false if the token should be invalidated.
export async function validateSecurityVersion(
  userId: string,
  tokenSecurityVersion: number
): Promise<boolean> {
  const currentVersion = await getUserSecurityVersion(userId);
  if (currentVersion === null) return false;
  return tokenSecurityVersion === currentVersion;
}
