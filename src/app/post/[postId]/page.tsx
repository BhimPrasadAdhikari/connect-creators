"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Lock, Heart, MessageCircle, Send, ArrowLeft, CheckCircle } from "lucide-react";
import Image from "next/image";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Avatar, Button, Card, CardContent, Badge } from "@/components/ui";

interface Post {
  id: string;
  title: string;
  content: string;
  mediaUrl?: string;
  mediaType?: string;
  isPaid: boolean;
  hasAccess: boolean;
  createdAt: string;
  creator: {
    id: string;
    username: string;
    displayName?: string;
    user: { name: string; image?: string };
  };
  requiredTier?: { id: string; name: string; price: number };
  comments: Array<{
    id: string;
    content: string;
    createdAt: string;
    user: { id: string; name: string; image?: string };
  }>;
  _count: { comments: number; tips: number };
}

const TIP_AMOUNTS = [
  { label: "₹50", value: "small", amount: 5000 },
  { label: "₹100", value: "medium", amount: 10000 },
  { label: "₹250", value: "large", amount: 25000 },
];

export default function PostDetailPage() {
  const params = useParams();
  const postId = params.postId as string;
  const { data: session } = useSession();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [showTipModal, setShowTipModal] = useState(false);
  const [tipSent, setTipSent] = useState(false);

  useEffect(() => {
    async function fetchPost() {
      try {
        const res = await fetch(`/api/posts/${postId}`);
        if (res.ok) {
          const data = await res.json();
          setPost(data.post);
        }
      } catch (error) {
        console.error("Failed to fetch post:", error);
      } finally {
        setLoading(false);
      }
    }
    if (postId) fetchPost();
  }, [postId]);

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    
    setSubmittingComment(true);
    try {
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: comment }),
      });
      
      if (res.ok) {
        const data = await res.json();
        setPost((prev) =>
          prev
            ? {
                ...prev,
                comments: [data.comment, ...prev.comments],
                _count: { ...prev._count, comments: prev._count.comments + 1 },
              }
            : null
        );
        setComment("");
      }
    } catch (error) {
      console.error("Failed to add comment:", error);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleTip = async (amount: string) => {
    try {
      const res = await fetch("/api/tips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          creatorId: post?.creator.id,
          postId: post?.id,
          amount,
        }),
      });
      
      if (res.ok) {
        setTipSent(true);
        setTimeout(() => {
          setShowTipModal(false);
          setTipSent(false);
        }, 2000);
      }
    } catch (error) {
      console.error("Failed to send tip:", error);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/2 mb-4" />
            <div className="h-64 bg-gray-200 rounded" />
          </div>
        </div>
      </main>
    );
  }

  if (!post) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Post Not Found</h1>
          <Link href="/explore">
            <Button>Explore Creators</Button>
          </Link>
        </div>
        <Footer />
      </main>
    );
  }

  const displayName = post.creator.displayName || post.creator.user.name;

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-3xl mx-auto">
          {/* Back Link */}
          <Link
            href={`/creator/${post.creator.username}`}
            className="inline-flex items-center text-gray-600 hover:text-blue-600 mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to {displayName}
          </Link>

          {/* Post Card */}
          <Card className="mb-8">
            <CardContent className="p-6 sm:p-8">
              {/* Creator Info */}
              <div className="flex items-center gap-3 mb-6">
                <Link href={`/creator/${post.creator.username}`}>
                  <Avatar src={post.creator.user.image} name={displayName} size="md" />
                </Link>
                <div>
                  <Link
                    href={`/creator/${post.creator.username}`}
                    className="font-medium text-gray-900 hover:text-blue-600"
                  >
                    {displayName}
                  </Link>
                  <p className="text-sm text-gray-500">
                    {new Date(post.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
                {post.isPaid && (
                  <Badge variant={post.hasAccess ? "success" : "accent"} className="ml-auto">
                    {post.hasAccess ? "Unlocked" : "Premium"}
                  </Badge>
                )}
              </div>

              {/* Title */}
              <h1 className="text-2xl font-bold text-gray-900 mb-4">{post.title}</h1>

              {/* Media */}
              {post.mediaUrl && post.hasAccess && (
                <div className="mb-6 rounded-lg overflow-hidden">
                  {post.mediaType === "image" && (
                    <Image
                      src={post.mediaUrl}
                      alt={post.title}
                      width={800}
                      height={450}
                      className="w-full object-cover"
                    />
                  )}
                  {post.mediaType === "video" && (
                    <video src={post.mediaUrl} controls className="w-full" />
                  )}
                  {post.mediaType === "audio" && (
                    <audio src={post.mediaUrl} controls className="w-full" />
                  )}
                </div>
              )}

              {/* Content */}
              {post.hasAccess ? (
                <div className="prose prose-gray max-w-none">
                  <p className="text-gray-700 whitespace-pre-wrap">{post.content}</p>
                </div>
              ) : (
                <div className="relative">
                  <p className="text-gray-700 blur-sm select-none">{post.content}</p>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Card className="bg-white/95 shadow-lg">
                      <CardContent className="p-6 text-center">
                        <Lock className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                        <h3 className="font-semibold text-gray-900 mb-2">Premium Content</h3>
                        <p className="text-gray-600 text-sm mb-4">
                          Subscribe to {displayName}&apos;s {post.requiredTier?.name || "paid tier"} to unlock
                        </p>
                        <Link
                          href={post.requiredTier ? `/checkout/${post.requiredTier.id}` : `/creator/${post.creator.username}`}
                        >
                          <Button>
                            Subscribe for ₹{(post.requiredTier?.price || 0) / 100}/month
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-4 mt-6 pt-6 border-t">
                <div className="flex items-center gap-2 text-gray-500">
                  <MessageCircle className="w-5 h-5" />
                  <span>{post._count.comments} comments</span>
                </div>
                
                {session && post.hasAccess && (
                  <Button
                    variant="outline"
                    onClick={() => setShowTipModal(true)}
                    className="ml-auto"
                  >
                    <Heart className="w-4 h-4 mr-2 text-red-500" />
                    Send Tip
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Comments Section */}
          {post.hasAccess && (
            <Card>
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Comments ({post._count.comments})
                </h2>

                {/* Add Comment */}
                {session ? (
                  <form onSubmit={handleComment} className="mb-6">
                    <div className="flex gap-3">
                      <Avatar src={session.user?.image} name={session.user?.name || ""} size="sm" />
                      <div className="flex-1">
                        <textarea
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          placeholder="Add a comment..."
                          rows={2}
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        />
                        <div className="flex justify-end mt-2">
                          <Button type="submit" disabled={submittingComment || !comment.trim()} size="sm">
                            {submittingComment ? "Posting..." : "Post"}
                            <Send className="w-4 h-4 ml-2" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </form>
                ) : (
                  <div className="text-center py-4 mb-6 bg-gray-50 rounded-lg">
                    <p className="text-gray-600 mb-2">Sign in to comment</p>
                    <Link href="/login">
                      <Button size="sm">Sign In</Button>
                    </Link>
                  </div>
                )}

                {/* Comments List */}
                <div className="space-y-4">
                  {post.comments.map((c) => (
                    <div key={c.id} className="flex gap-3">
                      <Avatar src={c.user.image} name={c.user.name} size="sm" />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900">{c.user.name}</span>
                          <span className="text-sm text-gray-500">
                            {new Date(c.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-gray-700">{c.content}</p>
                      </div>
                    </div>
                  ))}
                  
                  {post.comments.length === 0 && (
                    <p className="text-center text-gray-500 py-4">
                      No comments yet. Be the first to comment!
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Tip Modal */}
      {showTipModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-sm">
            <CardContent className="p-6">
              {tipSent ? (
                <div className="text-center py-4">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Tip Sent!</h3>
                  <p className="text-gray-600">Thank you for supporting {displayName}!</p>
                </div>
              ) : (
                <>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Send a Tip</h3>
                  <p className="text-gray-600 mb-4">
                    Show your appreciation to {displayName}
                  </p>
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    {TIP_AMOUNTS.map((tip) => (
                      <button
                        key={tip.value}
                        onClick={() => handleTip(tip.value)}
                        className="py-3 px-4 rounded-lg border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 font-semibold text-gray-900 transition-colors"
                      >
                        {tip.label}
                      </button>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setShowTipModal(false)}
                    className="w-full"
                  >
                    Cancel
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      <Footer />
    </main>
  );
}
