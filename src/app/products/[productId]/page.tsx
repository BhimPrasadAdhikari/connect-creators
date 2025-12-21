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
            <Card>
              <CardContent className="p-8">
                {/* Product Header */}
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-16 h-16 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <Package className="w-8 h-8 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                          {product.title}
                        </h1>
                        {product.fileType && (
                          <Badge variant="accent">
                            {product.fileType.toUpperCase()}
                          </Badge>
                        )}
                      </div>
                      <p className="text-2xl font-bold text-purple-600">
                        {formatPrice(product.price, product.currency)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="prose prose-gray max-w-none">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    About this product
                  </h3>
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {product.description || "No description provided."}
                  </p>
                </div>

                {/* Creator Info */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <h3 className="text-sm font-medium text-gray-500 mb-3">
                    Created by
                  </h3>
                  <Link
                    href={`/creator/${product.creator.username}`}
                    className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200">
                      {product.creator.user.image ? (
                        <img
                          src={product.creator.user.image}
                          alt={displayName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-lg">
                          {(displayName || "C").charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-gray-900">{displayName}</p>
                        {product.creator.isVerified && (
                          <CheckCircle className="w-4 h-4 text-blue-500" />
                        )}
                      </div>
                      <p className="text-sm text-gray-500">@{product.creator.username}</p>
                    </div>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Purchase Card */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <p className="text-3xl font-bold text-gray-900 mb-1">
                    {formatPrice(product.price, product.currency)}
                  </p>
                  <p className="text-sm text-gray-500">One-time purchase</p>
                </div>

                {isOwner ? (
                  <div className="text-center py-4 px-4 bg-gray-100 rounded-lg">
                    <p className="text-gray-600">This is your product</p>
                    <Link
                      href="/dashboard/creator/products"
                      className="text-purple-600 hover:underline text-sm font-medium mt-2 block"
                    >
                      Manage Products →
                    </Link>
                  </div>
                ) : hasPurchased ? (
                  <div className="space-y-4">
                    <div className="text-center py-4 px-4 bg-green-50 rounded-lg border border-green-200">
                      <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                      <p className="font-semibold text-green-800">You own this product!</p>
                    </div>
                    <a
                      href={product.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
                    >
                      <Download className="w-5 h-5" />
                      Download Now
                    </a>
                  </div>
                ) : session ? (
                  <Link
                    href={`/checkout/product/${product.id}`}
                    className="flex items-center justify-center gap-2 w-full py-3.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-purple-800 transition-all shadow-lg"
                  >
                    <Heart className="w-5 h-5" />
                    Buy Now
                  </Link>
                ) : (
                  <div className="space-y-3">
                    <Link
                      href={`/login?callbackUrl=/products/${product.id}`}
                      className="flex items-center justify-center gap-2 w-full py-3.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-purple-800 transition-all"
                    >
                      Sign in to Purchase
                    </Link>
                    <p className="text-xs text-center text-gray-500">
                      Already have an account?{" "}
                      <Link href="/login" className="text-purple-600 hover:underline">
                        Sign in
                      </Link>
                    </p>
                  </div>
                )}

                {/* What's included */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-3">What's included</h4>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Instant digital download
                    </li>
                    <li className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Lifetime access
                    </li>
                    {product.fileType && (
                      <li className="flex items-center gap-2 text-sm text-gray-600">
                        <FileText className="w-4 h-4 text-green-500" />
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

      <Footer />
    </main>
  );
}
