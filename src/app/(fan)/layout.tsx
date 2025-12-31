import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import prisma from "@/lib/prisma";
import { DatabaseError } from "@/components/ui/DatabaseError";

export default async function FanLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const userId = (session.user as { id?: string }).id;
  
  // Check if user is a creator - if so, redirect to creator dashboard
  if (userId) {
    try {
      const creatorProfile = await prisma.creatorProfile.findUnique({
        where: { userId },
        select: { id: true },
      });

      if (creatorProfile) {
        redirect("/dashboard/creator");
      }
    } catch (error) {
      // Re-throw redirect errors (Next.js uses exceptions for redirects)
      if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
        throw error;
      }
      console.error("Database connection error:", error);
      return <DatabaseError />;
    }
  }

  return (
    <DashboardLayout
      variant="fan"
      user={{
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
      }}
    >
      {children}
    </DashboardLayout>
  );
}
