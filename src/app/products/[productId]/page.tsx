import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { CheckCircle, Heart, Package, FileText, Download, ArrowLeft, Shield, Star } from "lucide-react";
import { Button, Card, CardContent, Badge } from "@/components/ui";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

interface PageProps {
  params: Promise<{ productId: string }>;
}

function formatPrice(amountInPaise: number, currency: string = "INR"): string {
  const amount = amountInPaise / 100;
  return new Intl.NumberFormat(currency === "INR" ? "en-IN" : "en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export default async function ProductPage({ params }: PageProps) {
  const { productId } = await params;
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string })?.id;

  const product = await prisma.digitalProduct.findUnique({
    where: { id: productId, isActive: true },
    include: {
      creator: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      },
      purchases: userId
        ? {
            where: { userId },
          }
        : false,
    },
  });

  if (!product) {
    notFound();
  }

  const isOwner = userId === product.creator.userId;
  const hasPurchased = product.purchases && product.purchases.length > 0;
  const displayName = product.creator.displayName || product.creator.user.name || product.creator.username;

  return (
    <main className="min-h-screen bg-background font-sans">
      <Header />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back link */}
        <Link
          href={`/creator/${product.creator.username}`}
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 font-bold font-mono group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to {displayName}
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Product Details */}
          <div className="lg:col-span-2">
            <Card variant="brutal" className="mb-0">
             <CardContent className="p-8">
              {/* Product Header */}
              <div className="flex flex-col sm:flex-row items-start gap-8 mb-8">
                <div className="w-24 h-24 sm:w-32 sm:h-32 bg-accent-purple border-4 border-brutal-black flex items-center justify-center flex-shrink-0 shadow-brutal">
                   {product.thumbnailUrl ? (
                      <img src={product.thumbnailUrl} alt={product.title} className="w-full h-full object-cover"/>
                   ) : (
                      <Package className="w-12 h-12 text-brutal-black" strokeWidth={2}/>
                   )}
                </div>
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                    <div>
                      <h1 className="text-3xl sm:text-5xl font-black text-foreground mb-3 font-display uppercase tracking-tight leading-none">
                        {product.title}
                      </h1>
                      {product.fileType && (
                        <span className="inline-block bg-accent-blue text-brutal-black border-2 border-brutal-black px-3 py-1 text-sm font-black uppercase shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                          {product.fileType.toUpperCase()}
                        </span>
                      )}
                    </div>
                    
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="prose prose-neutral max-w-none prose-lg border-t-4 border-brutal-black pt-8 mt-8">
                <h3 className="text-2xl font-black text-foreground mb-4 font-display uppercase">
                  About this product
                </h3>
                <p className="text-foreground/90 whitespace-pre-wrap leading-relaxed font-medium">
                  {product.description || "No description provided."}
                </p>
              </div>

              {/* Creator Info - Minimal */}
              <div className="mt-12 bg-secondary/5 border-2 border-brutal-black p-6">
                <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-4">
                  Created by
                </h3>
                <Link
                  href={`/creator/${product.creator.username}`}
                  className="flex items-center gap-4 group"
                >
                  <div className="w-16 h-16 rounded-full overflow-hidden border-3 border-brutal-black group-hover:scale-105 transition-transform">
                    {product.creator.user.image ? (
                      <img
                        src={product.creator.user.image}
                        alt={displayName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-accent-yellow text-brutal-black font-black text-xl">
                        {(displayName || "C").charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-black text-foreground text-xl font-display uppercase group-hover:underline decoration-4 underline-offset-4 decoration-primary">{displayName}</p>
                      {product.creator.isVerified && (
                        <div className="bg-primary text-white p-0.5 border-2 border-brutal-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                             <CheckCircle className="w-4 h-4" strokeWidth={4} />
                        </div>
                      )}
                    </div>
                    <p className="text-muted-foreground font-mono font-bold">@{product.creator.username}</p>
                  </div>
                </Link>
              </div>
             </CardContent>
            </Card>
          </div>

          {/* Purchase Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <Card variant="brutal" className="bg-accent-yellow">
                <CardContent className="p-8">
                <div className="text-center mb-8">
                   <div className="bg-card border-4 border-brutal-black p-4 shadow-brutal mb-4 transform -rotate-2">
                      <p className="text-5xl font-black text-brutal-black font-display">
                        {formatPrice(product.price, product.currency)}
                      </p>
                   </div>
                  <p className="text-sm text-brutal-black font-black uppercase tracking-widest">One-time purchase</p>
                </div>

                {isOwner ? (
                  <div className="text-center py-6 px-4 bg-card border-2 border-brutal-black shadow-brutal-sm">
                    <p className="text-brutal-black font-bold mb-2">This is your product</p>
                    <Link
                      href="/dashboard/creator/products"
                      className="text-primary hover:underline font-black uppercase tracking-wide block"
                    >
                      Manage Products →
                    </Link>
                  </div>
                ) : hasPurchased ? (
                  <div className="space-y-4">
                    <div className="text-center py-4 px-4 bg-accent-green border-2 border-brutal-black shadow-brutal-sm">
                      <div className="flex justify-center mb-2">
                         <Star className="w-8 h-8 text-brutal-black fill-white" strokeWidth={2.5}/>
                      </div>
                      <p className="font-black text-brutal-black uppercase">You own this product!</p>
                    </div>
                    <a
                      href={product.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                        <Button variant="brutal" className="w-full bg-brutal-black text-brutal-white hover:bg-card hover:text-brutal-black">
                            <Download className="w-5 h-5 mr-2" /> Download Now
                        </Button>
                    </a>
                  </div>
                ) : session ? (
                  <Link
                    href={`/checkout/product/${product.id}`}
                  >
                     <Button variant="brutal" className="w-full bg-brutal-black text-brutal-white hover:bg-card hover:text-brutal-black h-16 text-xl">
                        Buy Now
                     </Button>
                  </Link>
                ) : (
                  <div className="space-y-4">
                    <Link
                      href={`/login?callbackUrl=/products/${product.id}`}
                    >
                       <Button variant="brutal" className="w-full bg-brutal-black text-brutal-white px-2">
                         Sign in to Purchase
                       </Button>
                    </Link>
                    <p className="text-xs text-center font-bold font-mono">
                      Already have an account?{" "}
                      <Link href="/login" className="text-primary hover:underline font-black uppercase">
                        Sign in
                      </Link>
                    </p>
                  </div>
                )}

                {/* What's included */}
                <div className="mt-8 pt-6 border-t-2 border-brutal-black border-dashed">
                  <h4 className="font-black text-brutal-black mb-4 uppercase text-sm tracking-wide">Included</h4>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-3 text-sm font-bold text-brutal-black/80">
                      <div className="w-6 h-6 border-2 border-brutal-black bg-card flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="w-4 h-4 text-accent-green" />
                      </div>
                      Instant digital download
                    </li>
                    <li className="flex items-center gap-3 text-sm font-bold text-brutal-black/80">
                      <div className="w-6 h-6 border-2 border-brutal-black bg-card flex items-center justify-center flex-shrink-0">
                         <Shield className="w-4 h-4 text-accent-blue" />
                      </div>
                      Lifetime access
                    </li>
                    {product.fileType && (
                      <li className="flex items-center gap-3 text-sm font-bold text-brutal-black/80">
                         <div className="w-6 h-6 border-2 border-brutal-black bg-card flex items-center justify-center flex-shrink-0">
                           <FileText className="w-4 h-4 text-accent-purple" />
                         </div>
                        {product.fileType.toUpperCase()} format
                      </li>
                    )}
                  </ul>
                </div>
               </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
