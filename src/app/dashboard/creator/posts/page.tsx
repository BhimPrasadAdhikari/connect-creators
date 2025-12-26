import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus, Edit, Eye } from "lucide-react";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Button } from "@/components/ui";

async function getCreatorPosts(userId: string) {
  const creator = await prisma.creatorProfile.findUnique({
    where: { userId },
    include: {
      user: {
        select: { name: true, email: true, image: true },
      },
      posts: {
        include: {
          requiredTier: true,
          _count: { select: { comments: true, tips: true } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });
  return creator;
}

export default async function CreatorPostsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id || session.user.role !== "CREATOR") {
    redirect("/login");
  }

  const creator = await getCreatorPosts(session.user.id);

  if (!creator) {
    redirect("/dashboard");
  }

  const posts = creator.posts;

  return (
    <div className="p-4 sm:p-6 lg:p-12 max-w-5xl mx-auto">
        <div className="flex items-end justify-between mb-12">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">My Posts</h1>
            <p className="text-muted-foreground text-lg">
              Manage your exclusive content and community updates.
            </p>
          </div>
          <Link
            href="/dashboard/creator/posts/new"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-foreground text-background rounded-2xl hover:opacity-90 transition-all shadow-lg font-medium"
          >
            <Plus className="w-5 h-5" />
            New Post
          </Link>
        </div>

        {posts.length === 0 ? (
          <div className="py-20 text-center bg-card rounded-3xl border border-border border-dashed">
            <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-6 text-muted-foreground">
              <Edit className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">No posts yet</h3>
            <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
              Start engaging with your audience by creating your first post.
            </p>
            <Link
              href="/dashboard/creator/posts/new"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary-700 font-medium"
            >
              <Plus className="w-4 h-4" />
              Create Post
            </Link>
          </div>
        ) : (
          <div className="grid gap-6">
            {posts.map((post) => (
              <div
                key={post.id}
                className="group bg-card rounded-2xl p-6 border border-border hover:border-primary/20 hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
                        post.isPaid
                          ? "bg-amber-500/10 text-amber-500"
                          : "bg-accent-green/10 text-accent-green"
                      }`}
                    >
                      {post.isPaid ? "Premium" : "Public"}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {new Date(post.createdAt).toLocaleDateString("en-IN", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/post/${post.id}`}>
                      <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </Link>
                    <Link href={`/dashboard/creator/posts/${post.id}/edit`}>
                      <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                  {post.title}
                </h3>

                <p className="text-muted-foreground line-clamp-2 mb-6 leading-relaxed">
                  {post.content}
                </p>

                <div className="flex items-center gap-6 pt-6 border-t border-border">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
                    {!post.isPublished ? (
                      <span className="flex items-center gap-2 text-amber-500">
                        <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                        Draft
                      </span>
                    ) : (
                      <span className="flex items-center gap-2 text-accent-green">
                        <span className="w-2 h-2 rounded-full bg-accent-green"></span>
                        Published
                      </span>
                    )}
                  </div>
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    <span>{post._count.comments} comments</span>
                    <span>{post._count.tips} tips</span>
                  </div>
                  {post.requiredTier && (
                    <div className="text-sm text-muted-foreground ml-auto">
                      For: <span className="font-semibold text-foreground">{post.requiredTier.name}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
    </div>
  );
}
