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
      <main className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/2 mb-4" />
            <div className="h-64 bg-muted rounded" />
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  if (!post) {
    return (
      <main className="min-h-screen bg-background font-sans">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-4xl font-black text-foreground mb-4 font-display uppercase">Post Not Found</h1>
          <Link href="/explore">
            <Button variant="brutal">Explore Creators</Button>
          </Link>
        </div>
        <Footer />
      </main>
    );
  }

  const displayName = post.creator.displayName || post.creator.user.name;

  return (
    <main className="min-h-screen bg-background font-sans">
      <Header />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-3xl mx-auto">
          {/* Back Link */}
          <Link
            href={`/creator/${post.creator.username}`}
            className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6 font-bold font-mono group"
          >
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to {displayName}
          </Link>

          {/* Post Card */}
          <Card variant="brutal" className="mb-8 p-0 overflow-hidden">
            <CardContent className="p-0">
               {/* Header of Card */}
               <div className="p-6 bg-card border-b-4 border-brutal-black">
                 <div className="flex items-center gap-4">
                    <Link href={`/creator/${post.creator.username}`} className="flex-shrink-0">
                      <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-brutal-black hover:scale-105 transition-transform shadow-brutal-sm">
                        <Avatar src={post.creator.user.image} name={displayName} size="md" />
                      </div>
                    </Link>
                    <div className="flex-1">
                       <Link
                        href={`/creator/${post.creator.username}`}
                        className="font-black text-xl text-foreground hover:underline decoration-4 underline-offset-4 decoration-primary font-display uppercase"
                      >
                        {displayName}
                      </Link>
                      <p className="text-sm font-bold font-mono text-muted-foreground">
                        {new Date(post.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                     {post.isPaid && (
                      <Badge variant={post.hasAccess ? "success" : "accent"} className="ml-auto text-sm font-black uppercase">
                        {post.hasAccess ? "Unlocked" : "Premium"}
                      </Badge>
                    )}
                 </div>
               </div>

              <div className="p-6 sm:p-8">
                {/* Title */}
                <h1 className="text-4xl font-black text-foreground mb-6 font-display uppercase leading-tight">{post.title}</h1>

                {/* Media */}
                {post.mediaUrl && post.hasAccess && (
                  <div className="mb-8 rounded-none border-4 border-brutal-black shadow-brutal overflow-hidden">
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
                      <div className="p-6 bg-secondary/10 flex items-center justify-center">
                          <audio src={post.mediaUrl} controls className="w-full" />
                      </div>
                    )}
                  </div>
                )}

                {/* Content */}
                {post.hasAccess ? (
                  <div className="prose prose-neutral dark:prose-invert max-w-none mb-8">
                    <p className="text-foreground text-lg whitespace-pre-wrap leading-relaxed font-medium">{post.content}</p>
                  </div>
                ) : (
                  <div className="relative mb-8">
                    <div className="filter blur-sm select-none bg-muted/20 p-8 h-48 mb-4">
                       <p className="text-muted-foreground/30 font-display text-4xl font-black">
                         This content is locked.
                         Subscribe to view.
                       </p>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Card className="bg-card shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] border-4 border-brutal-black max-w-sm w-full mx-4">
                        <CardContent className="p-8 text-center">
                          <div className="w-16 h-16 bg-accent-yellow border-2 border-brutal-black flex items-center justify-center mx-auto mb-4 rounded-full shadow-brutal-sm">
                              <Lock className="w-8 h-8 text-brutal-black" strokeWidth={2.5} />
                          </div>
                          <h3 className="text-xl font-black text-foreground mb-2 font-display uppercase">Premium Content</h3>
                          <p className="text-muted-foreground font-bold mb-6">
                            Subscribe to {displayName}&apos;s {post.requiredTier?.name || "paid tier"} to unlock
                          </p>
                          <Link
                            href={post.requiredTier ? `/checkout/${post.requiredTier.id}` : `/creator/${post.creator.username}`}
                          >
                            <Button variant="brutal" className="w-full">
                              Subscribe for ₹{(post.requiredTier?.price || 0) / 100}/month
                            </Button>
                          </Link>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-4 mt-8 pt-8 border-t-4 border-brutal-black border-dashed">
                  <div className="flex items-center gap-2 text-foreground font-bold">
                    <MessageCircle className="w-6 h-6 stroke-[2.5px]" />
                    <span>{post._count.comments} comments</span>
                  </div>
                  
                  {session && post.hasAccess && (
                    <Button
                      variant="outline"
                      onClick={() => setShowTipModal(true)}
                      className="ml-auto border-2 border-brutal-black hover:bg-accent-pink/10 hover:border-accent-pink hover:text-accent-pink font-bold"
                    >
                      <Heart className="w-5 h-5 mr-2" />
                      Send Tip
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Comments Section */}
          {post.hasAccess && (
            <Card variant="brutal">
              <CardContent className="p-6">
                <h2 className="text-2xl font-black text-foreground mb-6 font-display uppercase flex items-center gap-2">
                   Comments <span className="text-lg text-muted-foreground ml-1">({post._count.comments})</span>
                </h2>

                {/* Add Comment */}
                {session ? (
                  <form onSubmit={handleComment} className="mb-8 bg-secondary/10 p-4 border-2 border-brutal-black shadow-brutal-sm">
                    <div className="flex gap-4">
                      <div className="hidden sm:block">
                          <Avatar src={session.user?.image} name={session.user?.name || ""} size="md" />
                      </div>
                      <div className="flex-1">
                        <textarea
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          placeholder="Add a comment..."
                          rows={2}
                          className="w-full px-4 py-3 rounded-none border-2 border-brutal-black bg-card text-foreground focus:outline-none focus:ring-0 focus:border-primary resize-none placeholder:text-muted-foreground/70 font-medium"
                        />
                        <div className="flex justify-end mt-3">
                          <Button type="submit" disabled={submittingComment || !comment.trim()} size="sm" variant="brutal" className="px-6">
                            {submittingComment ? "Posting..." : "Post Comment"}
                            <Send className="w-4 h-4 ml-2" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </form>
                ) : (
                  <div className="text-center py-8 mb-8 bg-secondary/10 border-2 border-brutal-black border-dashed">
                    <p className="text-foreground font-bold mb-4">Sign in to join the conversation</p>
                    <Link href="/login">
                      <Button size="sm" variant="brutal">Sign In</Button>
                    </Link>
                  </div>
                )}

                {/* Comments List */}
                <div className="space-y-6">
                  {post.comments.map((c) => (
                    <div key={c.id} className="flex gap-4 p-4 border-b-2 border-border last:border-0 hover:bg-muted/5 transition-colors">
                      <Avatar src={c.user.image} name={c.user.name} size="sm" />
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-black text-foreground uppercase text-sm">{c.user.name}</span>
                          <span className="text-xs font-mono font-bold text-muted-foreground">
                            {new Date(c.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-foreground font-medium text-sm leading-relaxed">{c.content}</p>
                      </div>
                    </div>
                  ))}
                  
                  {post.comments.length === 0 && (
                    <p className="text-center text-muted-foreground py-8 font-medium italic">
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
        <div className="fixed inset-0 bg-brutal-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <Card variant="brutal" className="w-full max-w-sm bg-card shadow-[12px_12px_0px_0px_#8b5cf6] border-4 border-white">
            <CardContent className="p-8">
              {tipSent ? (
                <div className="text-center py-6">
                  <div className="w-16 h-16 bg-accent-green border-4 border-brutal-black rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                     <CheckCircle className="w-8 h-8 text-brutal-black" strokeWidth={3} />
                  </div>
                  <h3 className="text-2xl font-black text-foreground mb-2 font-display uppercase">Tip Sent!</h3>
                  <p className="text-muted-foreground font-bold">Thank you for supporting {displayName}!</p>
                </div>
              ) : (
                <>
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-black text-foreground mb-2 font-display uppercase">Send a Tip</h3>
                    <p className="text-muted-foreground font-medium">
                        Show your appreciation to {displayName}
                    </p>
                  </div>
                  <div className="grid grid-cols-3 gap-3 mb-6">
                    {TIP_AMOUNTS.map((tip) => (
                      <button
                        key={tip.value}
                        onClick={() => handleTip(tip.value)}
                        className="py-3 px-2 rounded-none border-2 border-brutal-black hover:bg-accent-yellow hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all font-black text-foreground bg-card"
                      >
                        {tip.label}
                      </button>
                    ))}
                  </div>
                  <Button
                    variant="ghost"
                    onClick={() => setShowTipModal(false)}
                    className="w-full border-2 border-transparent hover:border-brutal-black hover:bg-secondary/10 font-bold"
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
