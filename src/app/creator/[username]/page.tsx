"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import { useState, useEffect } from "react";
import {
  CheckCircle,
  Instagram,
  Youtube,
  Twitter,
  Link as LinkIcon,
  MessageCircle,
  Package,
  Heart,
  Users,
  FileText,
  Share2,
  ExternalLink,
  Lock,
  Info,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { Card, CardContent, Badge, Breadcrumbs, Button } from "@/components/ui";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

interface PageProps {
  params: Promise<{ username: string }>;
}

// Types for data
interface Tier {
  id: string;
  name: string;
  price: number;
  description: string | null;
  benefits: string[];
}

interface Post {
  id: string;
  title: string;
  content: string;
  isPaid: boolean;
  mediaUrl: string | null;
  mediaType: string | null;
  createdAt: Date;
  requiredTier: { name: string } | null;
}

interface DigitalProduct {
  id: string;
  title: string;
  description: string | null;
  price: number;
  fileType: string | null;
  coverImage: string | null;
}

interface Creator {
  id: string;
  username: string;
  displayName: string | null;
  bio: string | null;
  isVerified: boolean;
  socialLinks: Record<string, string>;
  user: {
    id: string;
    name: string | null;
    image: string | null;
  };
  tiers: Tier[];
  posts: Post[];
  digitalProducts: DigitalProduct[];
  _count: {
    subscriptions: number;
    posts: number;
    digitalProducts: number;
  };
}

// Parse social links
function getSocialIcon(key: string) {
  switch (key.toLowerCase()) {
    case "instagram":
      return Instagram;
    case "youtube":
      return Youtube;
    case "twitter":
      return Twitter;
    default:
      return LinkIcon;
  }
}

// Format price helper
function formatPrice(amountInPaise: number): string {
  const amount = amountInPaise / 100;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// Share profile function
function shareProfile(username: string, displayName: string) {
  const url = `${window.location.origin}/creator/${username}`;
  if (navigator.share) {
    navigator.share({
      title: `${displayName} on CreatorConnect`,
      text: `Check out ${displayName}'s exclusive content!`,
      url: url,
    });
  } else {
    navigator.clipboard.writeText(url);
    alert("Profile link copied!");
  }
}

export default function CreatorProfilePage({ params }: PageProps) {
  const [creator, setCreator] = useState<Creator | null>(null);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState<string>("");
  const [userId, setUserId] = useState<string | null>(null);
  const [subscribedTierIds, setSubscribedTierIds] = useState<Set<string>>(new Set());
  const [purchasedProductIds, setPurchasedProductIds] = useState<Set<string>>(new Set());
  const [isOwner, setIsOwner] = useState(false);
  const [activeTab, setActiveTab] = useState("posts");

  useEffect(() => {
    async function loadData() {
      const { username: usernameParam } = await params;
      setUsername(usernameParam);

      // Fetch creator data
      try {
        const response = await fetch(`/api/creator/${usernameParam}`);
        if (!response.ok) {
          setLoading(false);
          return;
        }
        const data = await response.json();
        setCreator(data.creator);
        setUserId(data.userId);
        setIsOwner(data.isOwner);
        setSubscribedTierIds(new Set(data.subscribedTierIds || []));
        setPurchasedProductIds(new Set(data.purchasedProductIds || []));
      } catch (error) {
        console.error("Failed to load creator", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [params]);

  if (loading) {
    return (
      <main className="min-h-screen bg-white">
        <Header />
        <div className="container mx-auto px-4 py-12 max-w-5xl">
          <div className="animate-pulse space-y-8">
            <div className="flex gap-6 items-center">
              <div className="w-24 h-24 bg-gray-100 rounded-full" />
              <div className="space-y-4 flex-1">
                <div className="h-6 bg-gray-100 rounded w-1/4" />
                <div className="h-4 bg-gray-100 rounded w-1/3" />
              </div>
            </div>
            <div className="h-8 bg-gray-100 rounded w-full" />
          </div>
        </div>
      </main>
    );
  }

  if (!creator) {
    notFound();
  }

  const displayName = creator.displayName || creator.user.name || creator.username;
  const socialLinks = creator.socialLinks || {};

  const tabs = [
    { id: "posts", label: "Posts", count: creator._count.posts },
    { id: "products", label: "Products", count: creator._count.digitalProducts },
    { id: "tiers", label: "Membership" },
    { id: "about", label: "About" },
  ];

  return (
    <main className="min-h-screen bg-white text-text-primary font-sans">
      <Header />

      {/* Breadcrumbs */}
      <div className="container mx-auto px-4 py-4 max-w-6xl">
        <Breadcrumbs
          items={[
            { label: "Explore", href: "/explore" },
            { label: displayName, href: `/creator/${username}` },
          ]}
        />
      </div>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid lg:grid-cols-12 gap-12">
          {/* Left Column: Creator Info & Content (8 cols) */}
          <div className="lg:col-span-8">
            
            {/* Header / Bio Section */}
            <div className="mb-10">
              <div className="flex items-start gap-6 mb-6">
                <div className="relative">
                  <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border border-border overflow-hidden bg-gray-50">
                    {creator.user.image ? (
                      <img
                        src={creator.user.image}
                        alt={displayName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-3xl font-medium">
                        {displayName.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex-1 pt-2">
                  <div className="flex items-center gap-2 mb-1">
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-primary">
                      {displayName}
                    </h1>
                    {creator.isVerified && (
                      <CheckCircle className="w-5 h-5 text-primary fill-transparent" strokeWidth={2.5} />
                    )}
                  </div>
                  <p className="text-text-secondary font-medium mb-3">@{creator.username}</p>
                  <p className="text-gray-700 leading-relaxed max-w-2xl mb-4">
                    {creator.bio || "Digital creator."}
                  </p>
                  
                  <div className="flex flex-wrap gap-4 items-center">
                     {/* Social Links - Minimal text links */}
                    {Object.entries(socialLinks).map(([key, url]) => {
                      return (
                        <a
                          key={key}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-medium text-text-secondary hover:text-primary transition-colors capitalize"
                        >
                          {key}
                        </a>
                      );
                    })}
                    {Object.keys(socialLinks).length > 0 && <span className="text-gray-300">|</span>}
                    <button
                      onClick={() => shareProfile(creator.username, displayName)}
                      className="text-sm font-medium text-text-secondary hover:text-primary transition-colors flex items-center gap-1"
                    >
                      <Share2 className="w-4 h-4" />
                      Share
                    </button>
                  </div>
                </div>
              </div>

              {/* Stats Bar */}
              <div className="flex gap-8 py-4">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-text-primary">{creator._count.subscriptions}</span>
                  <span className="text-text-secondary text-sm">Musters</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-text-primary">{creator._count.posts}</span>
                  <span className="text-text-secondary text-sm">Posts</span>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="mb-8">
              <nav className="flex gap-8">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`pb-3 text-sm font-medium transition-colors border-b-2 ${
                      activeTab === tab.id
                        ? "border-primary text-primary"
                        : "border-transparent text-text-secondary hover:text-text-primary"
                    }`}
                  >
                    {tab.label}
                    {tab.count !== undefined && (
                      <span className="ml-2 text-text-tertiary font-normal">{tab.count}</span>
                    )}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="space-y-8">
              {activeTab === "posts" && (
                <div className="space-y-6">
                  {creator.posts.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-lg border border-border">
                      <p className="text-text-secondary">No posts yet.</p>
                    </div>
                  ) : (
                    creator.posts.map((post) => (
                      <PostCard
                        key={post.id}
                        post={post}
                        creator={creator}
                        displayName={displayName}
                        formatPrice={formatPrice}
                      />
                    ))
                  )}
                </div>
              )}

              {activeTab === "products" && (
                <div className="grid sm:grid-cols-2 gap-4">
                  {creator.digitalProducts.length === 0 ? (
                    <div className="col-span-full text-center py-12 bg-gray-50 rounded-lg border border-border">
                      <p className="text-text-secondary">No products available.</p>
                    </div>
                  ) : (
                    creator.digitalProducts.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        isPurchased={purchasedProductIds.has(product.id)}
                        formatPrice={formatPrice}
                      />
                    ))
                  )}
                </div>
              )}

              {activeTab === "tiers" && (
                 <div className="space-y-4">
                  {creator.tiers.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-lg border border-border">
                      <p className="text-text-secondary">No membership tiers.</p>
                    </div>
                  ) : (
                    creator.tiers.map((tier) => (
                      <div key={tier.id} className="bg-gray-50 rounded-xl p-8 hover:bg-gray-100 transition-colors">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="font-bold text-lg text-text-primary">{tier.name}</h3>
                            <p className="text-text-secondary mt-1">{tier.description}</p>
                          </div>
                          <div className="text-right">
                            <span className="block font-bold text-xl text-primary">{formatPrice(tier.price)}</span>
                            <span className="text-sm text-text-secondary">/month</span>
                          </div>
                        </div>
                        <ul className="mb-6 space-y-2">
                          {tier.benefits.map((benefit, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                              <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                              <span>{benefit}</span>
                            </li>
                          ))}
                        </ul>
                        {subscribedTierIds.has(tier.id) ? (
                           <Link
                            href="/subscriptions"
                            className="inline-flex items-center justify-center gap-2 w-full px-4 py-3 rounded-lg border border-border bg-gray-50 text-text-primary font-medium hover:bg-gray-100 transition-colors"
                          >
                            Manage Subscription
                          </Link>
                        ) : (
                          <Link
                            href={`/checkout/${tier.id}`}
                            className="inline-flex items-center justify-center gap-2 w-full px-4 py-3 rounded-lg bg-primary text-white font-medium hover:bg-primary-700 transition-colors shadow-sm"
                          >
                            Join
                          </Link>
                        )}
                      </div>
                    ))
                  )}
                 </div>
              )}

              {activeTab === "about" && (
                <div className="max-w-2xl">
                  <h3 className="text-lg font-bold text-text-primary mb-4">About</h3>
                  <div className="prose prose-gray">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {creator.bio || "No bio available."}
                    </p>
                  </div>
                  
                  {Object.keys(socialLinks).length > 0 && (
                     <div className="marginTop-8 pt-8">
                        <h4 className="font-bold text-text-primary mb-4">Links</h4>
                        <ul className="space-y-2">
                           {Object.entries(socialLinks).map(([key, url]) => (
                              <li key={key}>
                                 <a href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-text-secondary hover:text-primary transition-colors">
                                    <ExternalLink className="w-4 h-4" />
                                    <span className="capitalize">{key}</span>
                                 </a>
                              </li>
                           ))}
                        </ul>
                     </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Sticky Sidebar (4 cols) */}
          <div className="lg:col-span-4 pl-8 hidden lg:block">
            <div className="sticky top-24 space-y-8">
              
              {/* Membership CTA */}
              <div>
                <h3 className="font-bold text-text-primary mb-4 flex items-center gap-2">
                  Support {displayName.split(" ")[0]}
                </h3>
                {creator.tiers.length > 0 ? (
                  <div className="bg-gray-50 rounded-xl p-6">
                    <p className="text-sm text-text-secondary mb-4">
                      Get exclusive access to posts and content.
                    </p>
                    <Link
                      href={`/checkout/${creator.tiers[0].id}`}
                      className="block w-full text-center py-3 bg-primary text-white rounded font-medium hover:bg-primary-700 transition-colors mb-3 shadow-sm"
                    >
                      Join for {formatPrice(creator.tiers[0].price)}
                    </Link>
                     <button
                        onClick={() => setActiveTab("tiers")}
                        className="block w-full text-center text-sm text-text-secondary hover:text-primary transition-colors"
                     >
                        View all options
                     </button>
                  </div>
                ) : (
                  <p className="text-text-secondary text-sm">No memberships available yet.</p>
                )}
              </div>
              
              {/* Products CTA */}
              {creator.digitalProducts.length > 0 && (
                 <div>
                    <h3 className="font-bold text-text-primary mb-4">Latest Products</h3>
                    <div className="space-y-3">
                       {creator.digitalProducts.slice(0, 3).map(product => (
                          <Link key={product.id} href={`/products/${product.id}`} className="block bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors">
                             <div className="flex justify-between items-start">
                                <span className="font-medium text-text-primary line-clamp-1">{product.title}</span>
                                <span className="text-sm font-semibold text-primary">{formatPrice(product.price)}</span>
                             </div>
                             <span className="text-xs text-text-secondary mt-1 block">Digital Download</span>
                          </Link>
                       ))}
                    </div>
                 </div>
              )}

              {!isOwner && (
                 <Link
                   href={`/messages?creator=${creator.id}`}
                   className="flex items-center justify-center gap-2 w-full py-2.5 bg-gray-50 rounded text-text-secondary font-medium hover:bg-gray-100 hover:text-text-primary transition-colors"
                 >
                   <MessageCircle className="w-4 h-4" />
                   Message
                 </Link>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}

// Minimal Post Card - Borderless
function PostCard({
  post,
  creator,
  displayName,
  formatPrice,
}: {
  post: Post;
  creator: Creator;
  displayName: string;
  formatPrice: (price: number) => string;
}) {
  return (
    <article className="group bg-white rounded-lg transition-colors hover:bg-gray-50/50">
      <div className="py-6 border-gray-100 last:border-0 border-b-0">
        <div className="flex items-center justify-between mb-3 text-sm">
          <div className="flex items-center gap-2 text-text-secondary">
             <span className="font-medium text-text-primary">{displayName}</span>
             <span>•</span>
             <span>{new Date(post.createdAt).toLocaleDateString()}</span>
          </div>
          {post.isPaid && (
            <Badge variant="warning" className="flex items-center gap-1">
              <Lock className="w-3 h-3" />
              Premium
            </Badge>
          )}
        </div>

        <Link href={`/post/${post.id}`}>
          <h3 className="text-xl font-bold text-text-primary mb-3 leading-tight group-hover:text-primary transition-colors">
            {post.title}
          </h3>
        </Link>
        
        {post.isPaid ? (
          <div className="mt-4 bg-gray-50 rounded-xl p-8 text-center">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
               <Lock className="w-5 h-5 text-text-tertiary" />
            </div>
            <p className="text-text-primary font-bold mb-1">Locked Content</p>
            <p className="text-text-secondary text-sm mb-5">Join membership to view this post.</p>
             {creator.tiers[0] && (
               <Link
                 href={`/checkout/${creator.tiers[0].id}`}
                 className="inline-block px-5 py-2.5 bg-primary text-white text-sm font-medium rounded-full hover:bg-primary-700 transition-colors shadow-sm"
               >
                 Unlock for {formatPrice(creator.tiers[0].price)}
               </Link>
             )}
          </div>
        ) : (
          <div className="mt-2 text-gray-700 leading-relaxed max-w-none prose prose-gray">
             <p className="line-clamp-3">{post.content}</p>
          </div>
        )}
        
        {post.mediaUrl && !post.isPaid && (
          <div className="mt-4 rounded-xl overflow-hidden bg-gray-100">
             <div className="aspect-video w-full flex items-center justify-center">
               {post.mediaType === "image" ? (
                 <img src={post.mediaUrl} alt="Post media" className="w-full h-full object-cover" />
               ) : (
                 <video src={post.mediaUrl} controls className="w-full h-full object-cover" />
               )}
             </div>
          </div>
        )}

        {!post.isPaid && (
           <div className="mt-4 flex justify-between items-center">
              <Link href={`/post/${post.id}`} className="text-sm font-medium text-text-secondary hover:text-primary">
                 Read more
              </Link>
              <div className="flex gap-5">
                 <button className="text-text-tertiary hover:text-red-500 transition-colors"><Heart className="w-5 h-5" /></button>
                 <button className="text-text-tertiary hover:text-text-primary transition-colors"><Share2 className="w-5 h-5" /></button>
              </div>
           </div>
        )}
      </div>
    </article>
  );
}

// Minimal Product Card - Borderless
function ProductCard({
  product,
  isPurchased,
  formatPrice,
}: {
  product: DigitalProduct;
  isPurchased: boolean;
  formatPrice: (price: number) => string;
}) {
  return (
    <Link
      href={`/products/${product.id}`}
      className="group block rounded-xl p-4 hover:bg-gray-50 transition-colors"
    >
      <div className="mb-4 aspect-[4/3] bg-gray-50 rounded-lg flex items-center justify-center overflow-hidden">
        {product.coverImage ? (
           <img src={product.coverImage} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
           <Package className="w-10 h-10 text-gray-200" />
        )}
      </div>
      <div>
        <h4 className="font-bold text-lg text-text-primary group-hover:text-primary transition-colors line-clamp-1">{product.title}</h4>
        <p className="text-sm text-text-secondary mt-1 line-clamp-2">{product.description}</p>
      </div>
      <div className="mt-4 pt-4 flex items-center justify-between">
        {isPurchased ? (
          <span className="flex items-center gap-1.5 text-sm font-medium text-green-600">
            <CheckCircle className="w-4 h-4" /> Owned
          </span>
        ) : (
          <span className="font-bold text-primary">{formatPrice(product.price)}</span>
        )}
      </div>
    </Link>
  );
}
