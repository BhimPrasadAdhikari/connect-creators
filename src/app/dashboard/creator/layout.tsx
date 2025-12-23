import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { CreatorDashboardShell } from "@/components/layout/CreatorDashboardShell";

export default async function CreatorDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const userId = (session.user as { id?: string }).id;
  if (!userId) {
    redirect("/login");
  }

  // Fetch creator profile for sidebar
  const creatorProfile = await prisma.creatorProfile.findUnique({
    where: { userId },
    select: {
      displayName: true,
      username: true,
      user: {
        select: { name: true, email: true, image: true },
      },
    },
  });

  if (!creatorProfile) {
    redirect("/dashboard");
  }

  return (
    <CreatorDashboardShell
      user={{
        name: creatorProfile.user.name,
        email: creatorProfile.user.email,
        image: creatorProfile.user.image,
      }}
      creatorProfile={{
        displayName: creatorProfile.displayName,
        username: creatorProfile.username,
      }}
    >
      {children}
    </CreatorDashboardShell>
  );
}
