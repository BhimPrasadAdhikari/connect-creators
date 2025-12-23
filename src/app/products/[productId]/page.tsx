import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { CheckCircle, Heart, Package, FileText, Download, ArrowLeft } from "lucide-react";
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
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Header />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back link */}
        <Link
          href={`/creator/${product.creator.username}`}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to {displayName}
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Product Details */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl p-8">
              {/* Product Header */}
              <div className="flex items-start gap-6 mb-8">
                <div className="w-20 h-20 rounded-2xl bg-gray-50 flex items-center justify-center flex-shrink-0">
                  <Package className="w-10 h-10 text-gray-300" />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2 tracking-tight">
                        {product.title}
                      </h1>
                      {product.fileType && (
                        <Badge variant="accent">
                          {product.fileType.toUpperCase()}
                        </Badge>
                      )}
                    </div>
                    <p className="text-3xl font-bold text-primary">
                      {formatPrice(product.price, product.currency)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="prose prose-gray max-w-none prose-lg">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  About this product
                </h3>
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {product.description || "No description provided."}
                </p>
              </div>

              {/* Creator Info - Minimal */}
              <div className="mt-12">
                <h3 className="text-sm font-medium text-gray-500 mb-4">
                  Created by
                </h3>
                <Link
                  href={`/creator/${product.creator.username}`}
                  className="flex items-center gap-4 group"
                >
                  <div className="w-14 h-14 rounded-full overflow-hidden bg-gray-100 border-2 border-transparent group-hover:border-primary transition-colors">
                    {product.creator.user.image ? (
                      <img
                        src={product.creator.user.image}
                        alt={displayName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold text-xl">
                        {(displayName || "C").charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-gray-900 text-lg group-hover:text-primary transition-colors">{displayName}</p>
                      {product.creator.isVerified && (
                        <CheckCircle className="w-5 h-5 text-primary fill-transparent" />
                      )}
                    </div>
                    <p className="text-gray-500">@{product.creator.username}</p>
                  </div>
                </Link>
              </div>
            </div>
          </div>

          {/* Purchase Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="text-center mb-8">
                  <p className="text-4xl font-bold text-gray-900 mb-2">
                    {formatPrice(product.price, product.currency)}
                  </p>
                  <p className="text-sm text-gray-500 font-medium">One-time purchase</p>
                </div>

                {isOwner ? (
                  <div className="text-center py-6 px-4 bg-gray-50 rounded-xl">
                    <p className="text-gray-900 font-medium">This is your product</p>
                    <Link
                      href="/dashboard/creator/products"
                      className="text-primary hover:underline text-sm font-medium mt-2 block"
                    >
                      Manage Products →
                    </Link>
                  </div>
                ) : hasPurchased ? (
                  <div className="space-y-4">
                    <div className="text-center py-4 px-4 bg-green-50 rounded-xl">
                      <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                      <p className="font-bold text-green-800">You own this product!</p>
                    </div>
                    <a
                      href={product.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full py-4 bg-primary text-white rounded-xl font-bold hover:bg-primary-700 transition-colors"
                    >
                      <Download className="w-5 h-5" />
                      Download Now
                    </a>
                  </div>
                ) : session ? (
                  <Link
                    href={`/checkout/product/${product.id}`}
                    className="flex items-center justify-center gap-2 w-full py-4 bg-primary text-white rounded-xl font-bold hover:bg-primary-700 transition-colors shadow-sm hover:shadow-md"
                  >
                    Buy Now
                  </Link>
                ) : (
                  <div className="space-y-4">
                    <Link
                      href={`/login?callbackUrl=/products/${product.id}`}
                      className="flex items-center justify-center gap-2 w-full py-4 bg-primary text-white rounded-xl font-bold hover:bg-primary-700 transition-colors"
                    >
                      Sign in to Purchase
                    </Link>
                    <p className="text-xs text-center text-gray-500">
                      Already have an account?{" "}
                      <Link href="/login" className="text-primary hover:underline font-medium">
                        Sign in
                      </Link>
                    </p>
                  </div>
                )}

                {/* What's included */}
                <div className="mt-8 pt-6">
                  <h4 className="font-bold text-gray-900 mb-4">What's included</h4>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-3 text-sm text-gray-700">
                      <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="w-3 h-3 text-green-600" />
                      </div>
                      Instant digital download
                    </li>
                    <li className="flex items-center gap-3 text-sm text-gray-700">
                      <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                         <CheckCircle className="w-3 h-3 text-green-600" />
                      </div>
                      Lifetime access
                    </li>
                    {product.fileType && (
                      <li className="flex items-center gap-3 text-sm text-gray-700">
                         <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                           <FileText className="w-3 h-3 text-gray-500" />
                         </div>
                        {product.fileType.toUpperCase()} format
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
