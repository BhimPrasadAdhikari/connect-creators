"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ArrowLeft, Upload, Eye, Lock } from "lucide-react";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Button, Card, CardContent, Input, useToastActions } from "@/components/ui";

interface Tier {
  id: string;
  name: string;
  price: number;
}

export default function NewPostPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const toast = useToastActions();
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    mediaUrl: "",
    mediaType: "",
    isPaid: false,
    requiredTierId: "",
  });

  useEffect(() => {
    // Fetch creator's tiers
    async function fetchTiers() {
      try {
        const res = await fetch("/api/tiers");
        if (res.ok) {
          const data = await res.json();
          setTiers(data.tiers || []);
        }
      } catch (error) {
        console.error("Failed to fetch tiers:", error);
      }
    }
    fetchTiers();
  }, []);

  if (status === "loading") {
    return (
      <main className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <p>Loading...</p>
        </div>
      </main>
    );
  }

  if (!session || session.user?.role !== "CREATOR") {
    router.push("/login");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        toast.success("Post published!", "Your post is now live.");
        router.push("/dashboard/creator/posts");
      } else {
        const data = await res.json();
        toast.error("Failed to create post", data.error || "Please try again.");
      }
    } catch (error) {
      console.error("Error creating post:", error);
      toast.error("Failed to create post", "Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Back Link */}
          <Link
            href="/dashboard/creator"
            className="inline-flex items-center text-gray-600 hover:text-blue-600 mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Dashboard
          </Link>

          <Card>
            <CardContent className="p-6 sm:p-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-6">Create New Post</h1>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Title */}
                <Input
                  label="Post Title"
                  placeholder="Enter a catchy title..."
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />

                {/* Content */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Content
                  </label>
                  <textarea
                    rows={8}
                    placeholder="Write your post content here..."
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    required
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>

                {/* Media URL */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Media URL (Optional)
                  </label>
                  <div className="flex gap-3">
                    <input
                      type="url"
                      placeholder="https://example.com/image.jpg"
                      value={formData.mediaUrl}
                      onChange={(e) => setFormData({ ...formData, mediaUrl: e.target.value })}
                      className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <select
                      value={formData.mediaType}
                      onChange={(e) => setFormData({ ...formData, mediaType: e.target.value })}
                      className="px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Type</option>
                      <option value="image">Image</option>
                      <option value="video">Video</option>
                      <option value="audio">Audio</option>
                    </select>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Paste a URL to an image, video, or audio file
                  </p>
                </div>

                {/* Paid Toggle */}
                <div className="border rounded-lg p-4">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isPaid}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        isPaid: e.target.checked,
                        requiredTierId: e.target.checked ? formData.requiredTierId : ""
                      })}
                      className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <span className="font-medium text-gray-900 flex items-center gap-2">
                        <Lock className="w-4 h-4" />
                        Paid Content
                      </span>
                      <p className="text-sm text-gray-500">
                        Only subscribers can view this post
                      </p>
                    </div>
                  </label>

                  {/* Tier Selection */}
                  {formData.isPaid && (
                    <div className="mt-4 ml-8">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Required Tier
                      </label>
                      <select
                        value={formData.requiredTierId}
                        onChange={(e) => setFormData({ ...formData, requiredTierId: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required={formData.isPaid}
                      >
                        <option value="">Select a tier...</option>
                        {tiers.map((tier) => (
                          <option key={tier.id} value={tier.id}>
                            {tier.name} (₹{tier.price / 100}/month)
                          </option>
                        ))}
                      </select>
                      {tiers.length === 0 && (
                        <p className="text-sm text-amber-600 mt-2">
                          You need to create subscription tiers first.{" "}
                          <Link href="/dashboard/creator/tiers" className="underline">
                            Create tiers
                          </Link>
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Preview */}
                <div className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center gap-2 text-gray-600 mb-2">
                    <Eye className="w-4 h-4" />
                    <span className="text-sm font-medium">Post Preview</span>
                  </div>
                  <div className="bg-white rounded-lg p-4 border">
                    <h3 className="font-semibold text-gray-900 mb-2">
                      {formData.title || "Your post title"}
                    </h3>
                    <p className="text-gray-600 text-sm line-clamp-3">
                      {formData.content || "Your post content will appear here..."}
                    </p>
                    {formData.isPaid && (
                      <div className="mt-3 pt-3 border-t flex items-center gap-2 text-amber-600">
                        <Lock className="w-4 h-4" />
                        <span className="text-sm">Paid content - subscribers only</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Submit */}
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading} className="flex-1">
                    {loading ? "Publishing..." : "Publish Post"}
                    <Upload className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
