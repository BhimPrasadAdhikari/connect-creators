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
    <div className="p-6 lg:p-12 max-w-5xl mx-auto">
        <div className="flex items-end justify-between mb-12">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Posts</h1>
            <p className="text-gray-500 text-lg">
              Manage your exclusive content and community updates.
            </p>
          </div>
          <Link
            href="/dashboard/creator/posts/new"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-2xl hover:bg-black transition-all shadow-lg shadow-gray-900/10 font-medium"
          >
            <Plus className="w-5 h-5" />
            New Post
          </Link>
        </div>

        {posts.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-3xl border border-gray-100 border-dashed">
            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-gray-400">
              <Edit className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No posts yet</h3>
            <p className="text-gray-500 mb-8 max-w-sm mx-auto">
              Start engaging with your audience by creating your first post.
            </p>
            <Link
              href="/dashboard/creator/posts/new"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium"
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
                className="group bg-white rounded-2xl p-6 border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
                        post.isPaid
                          ? "bg-amber-50 text-amber-600"
                          : "bg-green-50 text-green-600"
                      }`}
                    >
                      {post.isPaid ? "Premium" : "Public"}
                    </span>
                    <span className="text-sm text-gray-400">
                      {new Date(post.createdAt).toLocaleDateString("en-IN", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/post/${post.id}`}>
                      <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-900">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </Link>
                    <Link href={`/dashboard/creator/posts/${post.id}/edit`}>
                      <Button variant="ghost" size="sm" className="text-gray-400 hover:text-blue-600">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                  {post.title}
                </h3>

                <p className="text-gray-600 line-clamp-2 mb-6 leading-relaxed">
                  {post.content}
                </p>

                <div className="flex items-center gap-6 pt-6 border-t border-gray-50">
                  <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                    {!post.isPublished ? (
                      <span className="flex items-center gap-2 text-amber-600">
                        <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                        Draft
                      </span>
                    ) : (
                      <span className="flex items-center gap-2 text-green-600">
                        <span className="w-2 h-2 rounded-full bg-green-500"></span>
                        Published
                      </span>
                    )}
                  </div>
                  <div className="flex gap-4 text-sm text-gray-400">
                    <span>{post._count.comments} comments</span>
                    <span>{post._count.tips} tips</span>
                  </div>
                  {post.requiredTier && (
                    <div className="text-sm text-gray-500 ml-auto">
                      For: <span className="font-semibold text-gray-900">{post.requiredTier.name}</span>
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
