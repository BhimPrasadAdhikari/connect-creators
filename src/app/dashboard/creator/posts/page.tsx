import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus, Edit, Trash2, Eye, Lock, Unlock } from "lucide-react";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Header } from "@/components/layout/Header";
import { Button, Card, CardContent, Badge } from "@/components/ui";

async function getCreatorPosts(userId: string) {
  const creator = await prisma.creatorProfile.findUnique({
    where: { userId },
    include: {
      posts: {
        include: {
          requiredTier: true,
          _count: { select: { comments: true, tips: true } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });
  return creator?.posts || [];
}

export default async function CreatorPostsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id || session.user.role !== "CREATOR") {
    redirect("/login");
  }

  const posts = await getCreatorPosts(session.user.id);

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Your Posts</h1>
            <p className="text-gray-600">Manage your content</p>
          </div>
          <Link href="/dashboard/creator/posts/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Post
            </Button>
          </Link>
        </div>

        {/* Posts List */}
        {posts.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-500 mb-4">You haven&apos;t created any posts yet.</p>
              <Link href="/dashboard/creator/posts/new">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Post
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <Card key={post.id}>
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {post.title}
                        </h3>
                        {post.isPaid ? (
                          <Badge variant="accent">
                            <Lock className="w-3 h-3 mr-1" />
                            Paid
                          </Badge>
                        ) : (
                          <Badge variant="success">
                            <Unlock className="w-3 h-3 mr-1" />
                            Free
                          </Badge>
                        )}
                        {!post.isPublished && (
                          <Badge variant="warning">Draft</Badge>
                        )}
                      </div>
                      <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                        {post.content}
                      </p>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                        <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                        <span>{post._count.comments} comments</span>
                        <span>{post._count.tips} tips</span>
                        {post.requiredTier && (
                          <span className="text-blue-600">
                            Requires: {post.requiredTier.name}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Link href={`/post/${post.id}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Link href={`/dashboard/creator/posts/${post.id}/edit`}>
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </Link>
                      <form action={`/api/posts/${post.id}`} method="DELETE">
                        <Button variant="outline" size="sm" className="text-red-600 hover:bg-red-50">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </form>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Back to Dashboard */}
        <div className="mt-8">
          <Link href="/dashboard/creator" className="text-gray-600 hover:text-blue-600">
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
