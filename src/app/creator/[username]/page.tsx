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
import { Card, CardContent, Badge, Breadcrumbs, Button, Modal, Input, Textarea } from "@/components/ui";
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
  
  // Tip State
  const [tipModalOpen, setTipModalOpen] = useState(false);
  const [tipAmountRupees, setTipAmountRupees] = useState("50");
  const [tipMessage, setTipMessage] = useState("");
  const [tipLoading, setTipLoading] = useState(false);
  const [tipPaymentMethod, setTipPaymentMethod] = useState<"razorpay" | "stripe" | "esewa" | "khalti">("razorpay");

  const paymentMethods = [
    { id: "razorpay", name: "Razorpay", description: "UPI, Cards, Netbanking", icon: "💳" },
    { id: "stripe", name: "Stripe", description: "International Cards", icon: "💳" },
    { id: "esewa", name: "eSewa", description: "Nepal Digital Wallet", icon: "📱" },
    { id: "khalti", name: "Khalti", description: "Nepal Digital Wallet", icon: "📱" },
  ] as const;

  const handleSendTip = async () => {
    if (!creator) return;
    const amountPaise = parseFloat(tipAmountRupees) * 100;
    if (isNaN(amountPaise) || amountPaise < 100) {
      alert("Minimum tip amount is ₹1");
      return;
    }

    setTipLoading(true);
    try {
      // Create Order based on selected payment method
      const endpoint = `/api/payments/${tipPaymentMethod}/tip`;
      
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: amountPaise,
          creatorId: creator.id,
          message: tipMessage,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || data.error || "Failed to initiate tip");

      // Handle different payment providers
      if (tipPaymentMethod === "razorpay") {
        // Load and open Razorpay checkout
        const loadRazorpay = () => {
          return new Promise((resolve) => {
            if ((window as any).Razorpay) {
              resolve(true);
              return;
            }
            const script = document.createElement("script");
            script.src = "https://checkout.razorpay.com/v1/checkout.js";
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
          });
        };
        
        const scriptLoaded = await loadRazorpay();
        if (!scriptLoaded) {
          alert("Razorpay SDK failed to load");
          setTipLoading(false);
          return;
        }

        const options = {
          key: data.key,
          amount: data.amount,
          currency: data.currency,
          name: "Tip " + (creator.displayName || creator.username),
          description: `Tip of ₹${tipAmountRupees}`,
          order_id: data.orderId,
          handler: async function (response: any) {
            const verifyRes = await fetch("/api/payments/razorpay/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                type: "tip",
              }),
            });
            
            if (verifyRes.ok) {
              alert("Tip sent successfully! Thank you for your support.");
              setTipModalOpen(false);
              setTipMessage("");
            } else {
              alert("Tip verification failed.");
            }
          },
          theme: { color: "#9333ea" }
        };
        
        const rzp = new (window as any).Razorpay(options);
        rzp.open();
        
      } else if (tipPaymentMethod === "stripe") {
        // Stripe uses redirect URL
        if (data.redirectUrl) {
          const redirectUrl = data.redirectUrl;
          // Close modal and reset body overflow before redirect to prevent black overlay
          setTipModalOpen(false);
          document.body.style.overflow = "";
          // Use setTimeout to allow React to process state update before redirect
          setTimeout(() => {
            window.location.href = redirectUrl;
          }, 100);
        } else {
          throw new Error("Stripe checkout URL not received");
        }
        
      } else if (tipPaymentMethod === "esewa") {
        // eSewa requires form submission with POST
        if (data.formData && data.redirectUrl) {
          const formData = data.formData as Record<string, string>;
          const redirectUrl = data.redirectUrl;
          // Close modal and reset body overflow before redirect to prevent black overlay
          setTipModalOpen(false);
          document.body.style.overflow = "";
          
          // Use setTimeout to allow React to process state update before form submit
          setTimeout(() => {
            const form = document.createElement("form");
            form.method = "POST";
            form.action = redirectUrl;
            
            Object.entries(formData).forEach(([key, value]) => {
              const input = document.createElement("input");
              input.type = "hidden";
              input.name = key;
              input.value = value;
              form.appendChild(input);
            });
            
            document.body.appendChild(form);
            form.submit();
          }, 100);
          return; // Form will redirect to eSewa
        } else {
          throw new Error("eSewa payment details not received");
        }
        
      } else if (tipPaymentMethod === "khalti") {
        // Khalti uses direct redirect
        if (data.redirectUrl) {
          const redirectUrl = data.redirectUrl;
          // Close modal and reset body overflow before redirect to prevent black overlay
          setTipModalOpen(false);
          document.body.style.overflow = "";
          // Use setTimeout to allow React to process state update before redirect
          setTimeout(() => {
            window.location.href = redirectUrl;
          }, 100);
        } else {
          throw new Error("Khalti payment URL not received");
        }
      }
      
    } catch (error: any) {
      console.error("Tip failed:", error);
      alert(error.message);
      setTipLoading(false);
    }
  };

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
    <div>
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

      <div className="container mx-auto px-4 py-6 sm:py-8 max-w-6xl">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Left Column: Creator Info & Content (8 cols) */}
          <div className="lg:col-span-8">
            
            {/* Header / Bio Section */}
            <div className="mb-10">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 mb-6">
                <div className="relative flex-shrink-0">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full border border-border overflow-hidden bg-gray-50">
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
                
                <div className="flex-1 text-center sm:text-left">
                  <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
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
              <div className="flex justify-center sm:justify-start gap-6 sm:gap-8 py-4">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-text-primary">{creator._count.subscriptions}</span>
                  <span className="text-text-secondary text-sm">Members</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-text-primary">{creator._count.posts}</span>
                  <span className="text-text-secondary text-sm">Posts</span>
                </div>
              </div>

              {/* Mobile Subscribe CTA - Only shows on mobile */}
              {creator.tiers.length > 0 && (
                <div className="lg:hidden mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl">
                  <p className="text-sm text-gray-600 mb-3 text-center">Get exclusive access to posts and content</p>
                  <Link
                    href={`/checkout/${creator.tiers[0].id}`}
                    className="block w-full text-center py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors shadow-sm"
                  >
                    Join for {formatPrice(creator.tiers[0].price)}/month
                  </Link>
                </div>
              )}
            </div>

            {/* Tabs - Horizontal scroll on mobile */}
            <div className="mb-6 sm:mb-8 -mx-4 px-4 sm:mx-0 sm:px-0">
              <nav className="flex gap-6 sm:gap-8 overflow-x-auto scrollbar-hide pb-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`pb-3 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${
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

          {/* Right Column: Sticky Sidebar (4 cols) - Show on desktop, hidden on mobile */}
          <div className="lg:col-span-4 lg:pl-8 hidden lg:block">
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

              {/* Sidebar Actions */}
              {!isOwner && (
                 <div className="space-y-3 pt-6 border-t border-gray-100">
                   <Link
                     href={`/messages?creator=${creator.id}`}
                     className="flex items-center justify-center gap-2 w-full py-2.5 bg-gray-50 rounded text-text-secondary font-medium hover:bg-gray-100 hover:text-text-primary transition-colors"
                   >
                     <MessageCircle className="w-4 h-4" />
                     Message
                   </Link>
                   
                   <button
                     onClick={() => setTipModalOpen(true)}
                     className="flex items-center justify-center gap-2 w-full py-2.5 bg-pink-50 text-pink-600 rounded font-medium hover:bg-pink-100 transition-colors"
                   >
                     <Heart className="w-4 h-4 fill-current" />
                     Send a Tip
                   </button>
                 </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>

      {/* Tip Modal */}
      <Modal
        isOpen={tipModalOpen}
        onClose={() => setTipModalOpen(false)}
        title={`Send a Tip to ${creator ? (creator.displayName || creator.username) : "Creator"}`}
      >
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹)</label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500">₹</span>
                    </div>
                    <Input 
                        type="number" 
                        min="1" 
                        value={tipAmountRupees} 
                        onChange={(e) => setTipAmountRupees(e.target.value)}
                        className="pl-7"
                    />
                </div>
                <div className="flex gap-2 mt-2">
                    {["50", "100", "500", "1000"].map(amt => (
                        <button 
                            key={amt}
                            onClick={() => setTipAmountRupees(amt)}
                            className={`px-3 py-1 text-xs rounded-full border ${
                                tipAmountRupees === amt 
                                ? "bg-pink-50 border-pink-200 text-pink-700 font-medium" 
                                : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                            }`}
                        >
                            ₹{amt}
                        </button>
                    ))}
                </div>
            </div>
            
            {/* Payment Method Selection */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                <div className="grid grid-cols-2 gap-2">
                    {paymentMethods.map((method) => (
                        <button
                            key={method.id}
                            type="button"
                            onClick={() => setTipPaymentMethod(method.id)}
                            className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-all text-left ${
                                tipPaymentMethod === method.id
                                    ? "border-pink-500 bg-pink-50"
                                    : "border-gray-200 hover:border-gray-300 bg-white"
                            }`}
                        >
                            <span className="text-xl">{method.icon}</span>
                            <div>
                                <div className="font-medium text-sm text-gray-900">{method.name}</div>
                                <div className="text-xs text-gray-500">{method.description}</div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
            
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message (Optional)</label>
                <Textarea 
                    placeholder="Say something nice..." 
                    value={tipMessage}
                    onChange={(e) => setTipMessage(e.target.value)}
                    rows={3}
                />
            </div>
            
            <div className="flex justify-end gap-3 pt-2">
                <Button variant="outline" onClick={() => setTipModalOpen(false)}>Cancel</Button>
                <Button 
                    variant="primary" 
                    className="bg-pink-600 hover:bg-pink-700 text-white"
                    onClick={handleSendTip}
                    disabled={tipLoading}
                >
                    {tipLoading ? "Processing..." : `Pay ₹${tipAmountRupees}`}
                </Button>
            </div>
        </div>
      </Modal>
    </div>
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
