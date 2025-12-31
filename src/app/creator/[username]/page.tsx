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
  Send,
  Loader2
} from "lucide-react";
import { Card, CardContent, Badge, Breadcrumbs, Button, Modal, Input, Textarea, Tabs } from "@/components/ui";
import { Header } from "@/components/layout/Header";

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
  
  // Tip State
  const [tipModalOpen, setTipModalOpen] = useState(false);
  const [tipAmountRupees, setTipAmountRupees] = useState("50");
  const [tipMessage, setTipMessage] = useState("");
  const [tipLoading, setTipLoading] = useState(false);
  const [tipPaymentMethod, setTipPaymentMethod] = useState<"razorpay" | "stripe" | "esewa" | "khalti">("razorpay");

  const paymentMethods = [
    { id: "razorpay", name: "Razorpay", description: "UPI, Cards", icon: "💳" },
    { id: "stripe", name: "Stripe", description: "Intl. Cards", icon: "🌏" },
    { id: "esewa", name: "eSewa", description: "Nepal Wallet", icon: "🇳🇵" },
    { id: "khalti", name: "Khalti", description: "Nepal Wallet", icon: "🇳🇵" },
  ] as const;

  const handleSendTip = async () => {
    if (!creator) return;
    const amountPaise = parseFloat(tipAmountRupees) * 100;
    if (isNaN(amountPaise) || amountPaise < 100) {
      alert("Minimum tip amount is ₹1");
      return;
    }

    setTipLoading(true);
    // ... simulate tip process for now ...
    setTimeout(() => {
        alert(`Tip of ₹${tipAmountRupees} sent via ${tipPaymentMethod}! (Simulation)`);
        setTipLoading(false);
        setTipModalOpen(false);
        setTipMessage("");
    }, 1500);
  };

  useEffect(() => {
    async function loadData() {
      const { username: usernameParam } = await params;
      setUsername(usernameParam);

      // Fetch creator data
      try {
        const response = await fetch(`/api/creator/${usernameParam}`);
        if (!response.ok) {
          // Fallback mock data if API fails (for development)
           setCreator({
                id: "1",
                username: usernameParam,
                displayName: "Sarah Jenkins",
                bio: "Digital artist & tutor. Creating weekly tutorials and asset packs for aspiring game designers.",
                isVerified: true,
                socialLinks: { instagram: "https://instagram.com", youtube: "https://youtube.com" },
                user: { id: "1", name: "Sarah Jenkins", image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah" },
                tiers: [
                    { id: "1", name: "Supporter", price: 29900, description: "Support my work", benefits: ["Discord Access", "Weekly Updates"] },
                    { id: "2", name: "Inner Circle", price: 99900, description: "Get everything", benefits: ["Source Files", "1-on-1 Feedback", "All Previous Rewards"] }
                ],
                posts: [
                    { id: "1", title: "Advanced Shading Techniques", content: "Today we dive deep into node-based shading...", isPaid: true, mediaUrl: null, mediaType: null, createdAt: new Date(), requiredTier: { name: "Inner Circle" } },
                    { id: "2", title: "Weekly Update #42", content: "Just finished the new character model!", isPaid: false, mediaUrl: "https://placehold.co/600x400", mediaType: "image", createdAt: new Date(), requiredTier: null }
                ],
                digitalProducts: [
                     { id: "1", title: "Character Base Mesh Pack", description: "Production ready base meshes.", price: 149900, fileType: "zip", coverImage: null }
                ],
                _count: { subscriptions: 1240, posts: 45, digitalProducts: 8 }
           });
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
      <main className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </main>
    );
  }

  if (!creator) {
    notFound();
    return null;
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
    <div className="min-h-screen bg-background font-sans text-foreground">
      <Header />

      {/* Breadcrumbs */}
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <Breadcrumbs
          items={[
            { label: "Explore", href: "/explore" },
            { label: displayName, href: `/creator/${username}` },
          ]}
        />
      </div>

      <div className="container mx-auto px-4 pb-12 max-w-6xl">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Left Column: Creator Info & Content (8 cols) */}
          <div className="lg:col-span-8">
            
            {/* Header / Bio Section */}
            <Card variant="brutal" className="mb-10 p-0 border-l-8 border-l-primary">
              <CardContent className="p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-6">
                  <div className="relative flex-shrink-0">
                    <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-none border-4 border-brutal-black shadow-brutal overflow-hidden bg-secondary/20">
                      {creator.user.image ? (
                        <img
                          src={creator.user.image}
                          alt={displayName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-foreground text-4xl font-black font-display bg-accent-yellow">
                          {displayName.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex-1 text-center sm:text-left">
                    <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
                      <h1 className="text-3xl sm:text-4xl font-black tracking-tight font-display text-foreground uppercase">
                        {displayName}
                      </h1>
                      {creator.isVerified && (
                        <div className="bg-primary text-white p-1 border-2 border-brutal-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                             <CheckCircle className="w-4 h-4" strokeWidth={3} />
                        </div>
                      )}
                    </div>
                    <div className="inline-block bg-brutal-black text-brutal-white px-2 py-0.5 text-sm font-bold font-mono mb-3">
                         @{creator.username}
                    </div>
                    <p className="text-foreground font-medium leading-relaxed max-w-2xl mb-4 border-l-4 border-brutal-black pl-3 py-1 bg-secondary/10">
                      {creator.bio || "Digital creator."}
                    </p>
                    
                    <div className="flex flex-wrap gap-4 items-center justify-center sm:justify-start">
                       {/* Social Links - Brutal Buttons */}
                      {Object.entries(socialLinks).map(([key, url]) => {
                        return (
                          <a
                            key={key}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-card border-2 border-brutal-black px-2 py-1 text-xs font-bold uppercase hover:bg-secondary/20 hover:shadow-brutal-sm transition-all"
                          >
                            {key}
                          </a>
                        );
                      })}
                      <button
                        onClick={() => shareProfile(creator.username, displayName)}
                        className="bg-accent-yellow text-brutal-black border-2 border-brutal-black px-2 py-1 text-xs font-bold uppercase hover:bg-accent-yellow/80 hover:shadow-brutal-sm transition-all flex items-center gap-1"
                      >
                        <Share2 className="w-3 h-3" />
                        Share
                      </button>
                    </div>
                  </div>
                </div>

                {/* Stats Bar */}
                <div className="flex justify-center sm:justify-start gap-8 py-4 border-t-2 border-brutal-black border-dashed mt-6">
                  <div className="flex flex-col items-center sm:items-start">
                    <span className="font-black text-2xl font-display text-foreground">{creator._count.subscriptions}</span>
                    <span className="text-muted-foreground text-xs font-bold uppercase font-mono">Members</span>
                  </div>
                  <div className="w-0.5 bg-brutal-black/20 h-auto"></div>
                  <div className="flex flex-col items-center sm:items-start">
                    <span className="font-black text-2xl font-display text-foreground">{creator._count.posts}</span>
                    <span className="text-muted-foreground text-xs font-bold uppercase font-mono">Posts</span>
                  </div>
                  <div className="w-0.5 bg-brutal-black/20 h-auto"></div>
                  <div className="flex flex-col items-center sm:items-start">
                    <span className="font-black text-2xl font-display text-foreground">{creator._count.digitalProducts}</span>
                    <span className="text-muted-foreground text-xs font-bold uppercase font-mono">Products</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tabs */}
            <Tabs 
               variant="brutal"
               tabs={tabs}
               defaultTab="posts"
               className="mb-8"
            >
               {(activeTab) => (
                   <div className="space-y-8 mt-6">
                      {activeTab === "posts" && (
                         <div className="space-y-6">
                           {creator.posts.length === 0 ? (
                             <EmptyState message="No posts yet." />
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
                         <div className="grid sm:grid-cols-2 gap-6">
                           {creator.digitalProducts.length === 0 ? (
                             <div className="col-span-full">
                                <EmptyState message="No products available." />
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
                          <div className="space-y-6">
                           {creator.tiers.length === 0 ? (
                             <EmptyState message="No membership tiers." />
                           ) : (
                             creator.tiers.map((tier) => (
                               <Card key={tier.id} variant="brutal" className="hover:translate-x-[-4px] hover:translate-y-[-4px] transition-transform">
                                 <CardContent className="p-8">
                                   <div className="flex flex-col sm:flex-row justify-between items-start mb-6 gap-4">
                                     <div>
                                       <h3 className="font-display font-black text-2xl uppercase text-foreground">{tier.name}</h3>
                                       <p className="text-muted-foreground font-medium mt-1">{tier.description}</p>
                                     </div>
                                     <div className="text-right bg-secondary/20 p-2 border-2 border-brutal-black shadow-brutal-sm transform rotate-2">
                                       <span className="block font-display font-black text-2xl text-primary">{formatPrice(tier.price)}</span>
                                       <span className="text-xs font-bold uppercase font-mono text-muted-foreground">/month</span>
                                     </div>
                                   </div>
                                   <div className="border-t-2 border-brutal-black border-dashed my-6"></div>
                                   <ul className="mb-8 space-y-3">
                                     {tier.benefits.map((benefit, i) => (
                                       <li key={i} className="flex items-start gap-3 text-sm font-bold text-foreground">
                                         <div className="bg-accent-green text-white border border-brutal-black p-0.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex-shrink-0 mt-0.5">
                                             <CheckCircle className="w-3 h-3" strokeWidth={3} />
                                         </div>
                                         <span className="uppercase tracking-wide">{benefit}</span>
                                       </li>
                                     ))}
                                   </ul>
                                   {subscribedTierIds.has(tier.id) ? (
                                      <Link href="/subscriptions">
                                        <Button variant="brutal" className="w-full bg-card text-foreground hover:bg-secondary/20">Manage Subscription</Button>
                                      </Link>
                                   ) : (
                                     <Link href={`/checkout/${tier.id}`}>
                                       <Button variant="brutal" className="w-full">Join Now</Button>
                                     </Link>
                                   )}
                                 </CardContent>
                               </Card>
                             ))
                           )}
                          </div>
                       )}

                       {activeTab === "about" && (
                         <Card variant="brutal">
                            <CardContent className="p-8">
                               <h3 className="font-display text-2xl font-bold uppercase mb-6 border-b-4 border-brutal-black pb-2 inline-block">About</h3>
                               <div className="prose prose-gray max-w-none">
                                 <p className="text-foreground font-medium leading-relaxed whitespace-pre-wrap font-sans text-lg">
                                   {creator.bio || "No bio available."}
                                 </p>
                               </div>
                               
                               {Object.keys(socialLinks).length > 0 && (
                                  <div className="mt-8 pt-8 border-t-2 border-brutal-black/20 border-dashed">
                                     <h4 className="font-bold text-foreground uppercase mb-4 font-display">Links</h4>
                                     <ul className="space-y-2">
                                        {Object.entries(socialLinks).map(([key, url]) => (
                                           <li key={key}>
                                              <a href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-primary hover:underline font-bold font-mono">
                                                 <ExternalLink className="w-4 h-4" />
                                                 <span className="capitalize">{key}</span>
                                              </a>
                                           </li>
                                        ))}
                                     </ul>
                                  </div>
                               )}
                            </CardContent>
                         </Card>
                       )}
                   </div>
               )}
            </Tabs>
          </div>

          {/* Right Column: Sticky Sidebar (4 cols) - Show on desktop, hidden on mobile */}
          <div className="lg:col-span-4 lg:pl-8 hidden lg:block">
            <div className="sticky top-24 space-y-8">
              
              {/* Membership CTA */}
              <Card variant="brutal" className="bg-accent-yellow/10 border-accent-yellow">
                 <CardContent className="p-6">
                    <h3 className="font-display font-bold text-xl uppercase mb-4 flex items-center gap-2">
                      Support {displayName.split(" ")[0]}
                    </h3>
                    {creator.tiers.length > 0 ? (
                      <div>
                        <p className="text-sm font-bold text-muted-foreground mb-4 font-mono">
                          Get exclusive access to posts and content.
                        </p>
                        <Link href={`/checkout/${creator.tiers[0].id}`}>
                           <Button variant="brutal" className="w-full mb-3 bg-accent-yellow text-brutal-black border-brutal-black hover:bg-yellow-400">
                               Join for {formatPrice(creator.tiers[0].price)}
                           </Button>
                        </Link>
                         <button
                            onClick={() => {
                                const el = document.querySelector('[role="tablist"] button[aria-selected="false"]');
                                // Simple hack to switch tab, ideally modify state
                            }}
                            className="block w-full text-center text-xs font-bold uppercase tracking-wide text-muted-foreground hover:text-primary transition-colors hover:underline decoration-2 underline-offset-4"
                         >
                            View all options
                         </button>
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-sm font-bold font-mono">No memberships available yet.</p>
                    )}
                 </CardContent>
              </Card>
              
              {/* Products CTA */}
              {creator.digitalProducts.length > 0 && (
                 <Card variant="brutal">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Package className="w-5 h-5" />
                            <h3 className="font-display font-bold text-lg uppercase">Latest Products</h3>
                        </div>
                        <div className="space-y-3">
                           {creator.digitalProducts.slice(0, 3).map(product => (
                              <Link key={product.id} href={`/products/${product.id}`} className="block bg-secondary/10 border-2 border-brutal-black p-3 hover:bg-secondary/20 hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-brutal-sm transition-all">
                                 <div className="flex justify-between items-start mb-1">
                                    <span className="font-bold text-foreground line-clamp-1 text-sm font-display uppercase">{product.title}</span>
                                    <span className="text-xs font-black text-primary bg-card px-1 border border-brutal-black">{formatPrice(product.price)}</span>
                                 </div>
                                 <span className="text-[10px] font-mono font-bold text-muted-foreground uppercase block">Digital Download</span>
                              </Link>
                           ))}
                        </div>
                    </CardContent>
                 </Card>
              )}

              {/* Sidebar Actions */}
              {!isOwner && (
                 <div className="space-y-4">
                   <Link href={`/messages?creator=${creator.id}`}>
                      <Button variant="brutal" className="w-full bg-card text-foreground hover:bg-secondary/20">
                         <MessageCircle className="w-4 h-4 mr-2" />
                         Message
                      </Button>
                   </Link>
                   
                   <Button 
                      variant="brutal" 
                      onClick={() => setTipModalOpen(true)}
                      className="w-full bg-accent-pink text-white border-brutal-black hover:bg-pink-600"
                    >
                      <Heart className="w-4 h-4 mr-2 fill-current" />
                      Send a Tip
                    </Button>
                 </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tip Modal */}
      <Modal
        isOpen={tipModalOpen}
        onClose={() => setTipModalOpen(false)}
        title={`Tip ${creator ? (creator.displayName || creator.username) : "Creator"}`}
        variant="brutal"
      >
        <div className="space-y-6">
            <div className="bg-secondary/10 p-4 border-2 border-brutal-black border-dashed">
                <label className="block text-sm font-bold text-foreground mb-1.5 uppercase tracking-wide font-display">Amount (INR)</label>
                <div className="flex items-center">
                    <span className="px-4 py-3 bg-secondary/20 text-foreground border-2 border-r-0 border-brutal-black font-display font-bold text-xl">
                        ₹
                    </span>
                    <Input 
                        type="number" 
                        min="1" 
                        variant="brutal"
                        value={tipAmountRupees} 
                        onChange={(e) => setTipAmountRupees(e.target.value)}
                        className="rounded-none border-l-0 text-xl font-bold"
                        containerClassName="mb-0 w-full"
                    />
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                    {["50", "100", "500", "1000"].map(amt => (
                        <button 
                            key={amt}
                            onClick={() => setTipAmountRupees(amt)}
                            className={`px-3 py-1 text-xs font-bold border-2 transition-all shadow-brutal-sm ${
                                tipAmountRupees === amt 
                                ? "bg-accent-pink text-white border-brutal-black translate-x-[-1px] translate-y-[-1px]" 
                                : "bg-card border-brutal-black text-foreground hover:bg-secondary/20"
                            }`}
                        >
                            ₹{amt}
                        </button>
                    ))}
                </div>
            </div>
            
            {/* Payment Method Selection */}
            <div>
                <label className="block text-sm font-bold text-foreground mb-2 uppercase tracking-wide font-display">Payment Method</label>
                <div className="grid grid-cols-2 gap-3">
                    {paymentMethods.map((method) => (
                        <button
                            key={method.id}
                            type="button"
                            onClick={() => setTipPaymentMethod(method.id)}
                            className={`flex items-center gap-3 p-3 border-2 transition-all text-left shadow-brutal-sm ${
                                tipPaymentMethod === method.id
                                    ? "bg-primary text-white border-brutal-black translate-x-[-2px] translate-y-[-2px]"
                                    : "bg-card border-brutal-black hover:bg-secondary/10"
                            }`}
                        >
                            <span className="text-xl">{method.icon}</span>
                            <div>
                                <div className="font-bold text-sm uppercase font-display">{method.name}</div>
                                <div className={`text-[10px] font-mono font-bold ${tipPaymentMethod === method.id ? "text-white/80" : "text-muted-foreground"}`}>{method.description}</div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
            
            <div>
                <Textarea 
                    variant="brutal"
                    label="Message (Optional)"
                    placeholder="Say something nice..." 
                    value={tipMessage}
                    onChange={(e) => setTipMessage(e.target.value)}
                    rows={3}
                />
            </div>
            
            <div className="flex gap-4 pt-4 border-t-2 border-dashed border-brutal-black/20">
                <Button variant="ghost" onClick={() => setTipModalOpen(false)} className="flex-1 border-2 border-transparent hover:border-brutal-black">Cancel</Button>
                <Button 
                    variant="brutal" 
                    className="flex-1 bg-accent-pink text-white border-brutal-black hover:bg-pink-600"
                    onClick={handleSendTip}
                    disabled={tipLoading}
                >
                    {tipLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : `Pay ₹${tipAmountRupees}`}
                </Button>
            </div>
        </div>
      </Modal>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
    return (
        <div className="flex flex-col items-center justify-center py-16 bg-secondary/5 border-2 border-dashed border-brutal-black">
            <div className="w-16 h-16 bg-secondary/20 rounded-full border-2 border-brutal-black flex items-center justify-center mb-4">
                <Info className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="font-mono font-bold text-muted-foreground text-lg uppercase">{message}</p>
        </div>
    );
}

// Minimal Post Card - Brutal
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
    <Card variant="brutal" className="hover:border-primary transition-colors">
      <CardContent className="p-0">
        <div className="p-6 border-b-2 border-brutal-black bg-secondary/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
                 <div className="font-bold text-foreground text-sm uppercase font-display">{displayName}</div>
                 <span className="w-1 h-1 bg-brutal-black rounded-full"></span>
                 <span className="font-mono text-xs font-bold text-muted-foreground">{new Date(post.createdAt).toLocaleDateString()}</span>
            </div>
             {post.isPaid && (
                <div className="bg-accent-yellow text-brutal-black text-xs font-black uppercase px-2 py-1 border-2 border-brutal-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center gap-1">
                     <Lock className="w-3 h-3" />
                     Premium
                </div>
             )}
        </div>

        <div className="p-6">
            <Link href={`/post/${post.id}`}>
            <h3 className="text-2xl font-black text-foreground mb-4 leading-tight hover:underline decoration-4 underline-offset-4 decoration-primary transition-all uppercase font-display">
                {post.title}
            </h3>
            </Link>
            
            {post.isPaid ? (
            <div className="mt-4 bg-muted border-2 border-brutal-black p-8 text-center shadow-brutal-sm">
                <div className="w-16 h-16 bg-card border-2 border-brutal-black flex items-center justify-center mx-auto mb-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                   <Lock className="w-8 h-8 text-foreground" />
                </div>
                <p className="text-foreground font-black text-lg uppercase mb-1 font-display">Locked Content</p>
                <p className="text-muted-foreground font-mono font-bold text-sm mb-6">Join membership to view this post.</p>
                {creator.tiers[0] && (
                    <Link href={`/checkout/${creator.tiers[0].id}`}>
                       <Button variant="brutal">Unlock for {formatPrice(creator.tiers[0].price)}</Button>
                    </Link>
                )}
            </div>
            ) : (
            <div className="mt-2 text-foreground/80 leading-relaxed font-medium prose max-w-none">
                <p className="line-clamp-3">{post.content}</p>
            </div>
            )}
            
            {post.mediaUrl && !post.isPaid && (
            <div className="mt-6 border-2 border-brutal-black shadow-brutal-sm overflow-hidden">
                <div className="aspect-video w-full flex items-center justify-center bg-black">
                {post.mediaType === "image" ? (
                    <img src={post.mediaUrl} alt="Post media" className="w-full h-full object-cover" />
                ) : (
                    <video src={post.mediaUrl} controls className="w-full h-full object-cover" />
                )}
                </div>
            </div>
            )}

            {!post.isPaid && (
            <div className="mt-6 flex justify-between items-center pt-4 border-t-2 border-dashed border-brutal-black/20">
                <Link href={`/post/${post.id}`} className="text-sm font-bold uppercase tracking-wide text-foreground hover:text-primary hover:underline decoration-2 underline-offset-4">
                    Read full post <ChevronRight className="w-4 h-4 inline" />
                </Link>
                <div className="flex gap-3">
                    <Button variant="ghost" size="sm" className="border-2 border-transparent hover:border-brutal-black hover:bg-secondary/20">
                        <Heart className="w-5 h-5" />
                    </Button>
                    <Button variant="ghost" size="sm" className="border-2 border-transparent hover:border-brutal-black hover:bg-secondary/20">
                        <Share2 className="w-5 h-5" />
                    </Button>
                </div>
            </div>
            )}
        </div>
      </CardContent>
    </Card>
  );
}

// Minimal Product Card - Brutal
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
      className="group block"
    >
      <Card variant="brutal" className="h-full hover:translate-x-[-4px] hover:translate-y-[-4px] transition-transform hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
         <CardContent className="p-0 flex flex-col h-full">
            <div className="aspect-[4/3] bg-secondary/20 border-b-2 border-brutal-black flex items-center justify-center overflow-hidden relative">
                {product.coverImage ? (
                <img src={product.coverImage} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                <div className="flex flex-col items-center gap-2">
                    <Package className="w-12 h-12 text-muted-foreground/50" />
                    <span className="font-mono text-xs font-bold text-muted-foreground/50 uppercase">No Cover</span>
                </div>
                )}
                {isPurchased && (
                    <div className="absolute top-2 right-2 bg-accent-green text-white px-2 py-1 text-xs font-black uppercase border-2 border-brutal-black shadow-sm flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Owned
                    </div>
                )}
            </div>
            <div className="p-5 flex-1 flex flex-col">
                <h4 className="font-black text-xl text-foreground group-hover:text-primary transition-colors line-clamp-1 uppercase font-display mb-2">{product.title}</h4>
                <p className="text-sm text-muted-foreground font-medium line-clamp-2 mb-4 flex-1">{product.description}</p>
                
                <div className="pt-4 border-t-2 border-dashed border-brutal-black/20 flex items-center justify-between mt-auto">
                    <span className="text-[10px] font-mono font-bold uppercase text-muted-foreground bg-secondary/20 px-2 py-1 border border-brutal-black/20">
                        {product.fileType || "Digital"}
                    </span>
                    {!isPurchased && (
                        <span className="font-black text-lg text-foreground">{formatPrice(product.price)}</span>
                    )}
                </div>
            </div>
         </CardContent>
      </Card>
    </Link>
  );
}
