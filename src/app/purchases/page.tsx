"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Package,
  Download,
  ArrowLeft,
  Heart,
  Home,
  Compass,
  Settings,
  ShoppingBag,
  Users,
  CreditCard,
  RotateCcw,
  AlertCircle
} from "lucide-react";
import { Card, CardContent, Button, Avatar, Badge, Skeleton, Modal, Textarea } from "@/components/ui";

interface Purchase {
  id: string;
  productId: string;
  amount: number;
  currency: string;
  purchasedAt: string;
  product: {
    id: string;
    title: string;
    description: string | null;
    fileUrl: string;
    fileType: string | null;
    thumbnailUrl: string | null;
    creator: {
      id: string;
      username: string;
      displayName: string | null;
      avatar: string | null;
    };
  };
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

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function PurchaseSkeleton() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex gap-4">
          <Skeleton className="w-16 h-16 rounded-xl flex-shrink-0" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <div className="flex gap-2">
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-6 w-20" />
            </div>
          </div>
          <Skeleton className="h-10 w-28" />
        </div>
      </CardContent>
    </Card>
  );
}

export default function PurchasesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Refund State
  const [refundModalOpen, setRefundModalOpen] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null);
  const [refundReason, setRefundReason] = useState("");
  const [refundLoading, setRefundLoading] = useState(false);
  const [refundError, setRefundError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/purchases");
      return;
    }

    if (status === "authenticated") {
      fetch("/api/purchases")
        .then(res => {
          if (!res.ok) throw new Error("Failed to fetch purchases");
          return res.json();
        })
        .then(data => {
          setPurchases(data.purchases || []);
          setLoading(false);
        })
        .catch(err => {
          setError(err.message);
          setLoading(false);
        });
    }
  }, [status, router]);

  const sidebarItems = [
    { icon: Home, label: "Dashboard", href: "/dashboard" },
    { icon: Compass, label: "Explore", href: "/explore" },
    { icon: Users, label: "My Subscriptions", href: "/subscriptions" },
    { icon: ShoppingBag, label: "My Purchases", href: "/purchases", active: true },
    { icon: CreditCard, label: "Billing", href: "/billing" },
    { icon: Settings, label: "Settings", href: "/settings" },
  ];

  const handleOpenRefund = (purchase: Purchase) => {
    setSelectedPurchase(purchase);
    setRefundReason("");
    setRefundError(null);
    setRefundModalOpen(true);
  };

  const handleSubmitRefund = async () => {
    if (!selectedPurchase) return;
    if (refundReason.trim().length < 10) {
      setRefundError("Please provide a more detailed reason (at least 10 characters)");
      return;
    }

    setRefundLoading(true);
    setRefundError(null);

    try {
      const res = await fetch("/api/refunds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          purchaseId: selectedPurchase.id,
          reason: refundReason,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to submit refund request");
      }

      setRefundModalOpen(false);
      alert("Refund request submitted successfully! We will review it shortly.");
    } catch (err: any) {
      setRefundError(err.message);
    } finally {
      setRefundLoading(false);
    }
  };

  // Check if purchase is eligible for refund (within 7 days)
  const isRefundable = (createdAt: string) => {
    const purchaseDate = new Date(createdAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - purchaseDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    return diffDays <= 7;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 z-40 hidden lg:block">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-gray-200">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-semibold text-gray-900">
                CreatorConnect
              </span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {sidebarItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  item.active
                    ? "bg-purple-50 text-purple-600 font-medium"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            ))}
          </nav>

          {/* User */}
          {session?.user && (
            <div className="p-4 border-t border-gray-200">
              <div className="flex items-center gap-3">
                <Avatar src={session.user.image} name={session.user.name || ""} />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">
                    {session.user.name}
                  </p>
                  <p className="text-sm text-gray-500 truncate">
                    {session.user.email}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 min-h-screen">
        {/* Mobile Header */}
        <header className="lg:hidden sticky top-0 z-30 bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="p-2 -ml-2 rounded-lg hover:bg-gray-100">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="font-semibold text-gray-900">My Purchases</h1>
          </div>
        </header>

        <div className="p-6 lg:p-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 flex items-center gap-3">
              <ShoppingBag className="w-8 h-8 text-purple-500" />
              My Purchases
            </h1>
            <p className="text-gray-500 mt-1">
              Your purchased digital products
            </p>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="space-y-4">
              <PurchaseSkeleton />
              <PurchaseSkeleton />
              <PurchaseSkeleton />
            </div>
          )}

          {/* Error State */}
          {error && (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-red-600">{error}</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => window.location.reload()}
                >
                  Try Again
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Empty State */}
          {!loading && !error && purchases.length === 0 && (
            <Card>
              <CardContent className="py-16 text-center">
                <div className="w-20 h-20 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-4">
                  <ShoppingBag className="w-10 h-10 text-purple-500" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  No purchases yet
                </h2>
                <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                  Explore creator products and make your first purchase to see them here!
                </p>
                <Link href="/explore">
                  <Button variant="primary">
                    <Compass className="w-4 h-4 mr-2" />
                    Explore Creators
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {/* Purchases List */}
          {!loading && !error && purchases.length > 0 && (
            <div className="space-y-4">
              {purchases.map((purchase) => (
                <Card key={purchase.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                      {/* Product Icon */}
                      <div className="w-16 h-16 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">
                        {purchase.product.thumbnailUrl ? (
                          <img
                            src={purchase.product.thumbnailUrl}
                            alt={purchase.product.title}
                            className="w-full h-full object-cover rounded-xl"
                          />
                        ) : (
                          <Package className="w-8 h-8 text-purple-600" />
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/products/${purchase.product.id}`}
                          className="text-lg font-semibold text-gray-900 hover:text-purple-600 transition-colors"
                        >
                          {purchase.product.title}
                        </Link>
                        
                        <Link
                          href={`/creator/${purchase.product.creator.username}`}
                          className="flex items-center gap-2 mt-1 text-sm text-gray-500 hover:text-gray-700"
                        >
                          <Avatar
                            src={purchase.product.creator.avatar}
                            name={purchase.product.creator.displayName || purchase.product.creator.username}
                            size="sm"
                          />
                          <span>{purchase.product.creator.displayName || purchase.product.creator.username}</span>
                        </Link>

                        <div className="flex flex-wrap items-center gap-2 mt-3">
                          {purchase.product.fileType && (
                            <Badge variant="accent">
                              {purchase.product.fileType.toUpperCase()}
                            </Badge>
                          )}
                          <span className="text-sm text-gray-500">
                            Purchased {formatDate(purchase.purchasedAt)}
                          </span>
                          <span className="text-sm font-medium text-gray-700">
                            {formatPrice(purchase.amount, purchase.currency)}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex-shrink-0 flex sm:flex-col items-center gap-2">
                        <a
                          href={purchase.product.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-5 py-2.5 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors shadow-sm w-full sm:w-auto justify-center"
                        >
                          <Download className="w-5 h-5" />
                          Download
                        </a>
                        
                        {isRefundable(purchase.purchasedAt) && (
                          <Button 
                            variant="ghost" 
                            className="text-gray-500 hover:text-red-600 w-full sm:w-auto"
                            onClick={() => handleOpenRefund(purchase)}
                          >
                            <RotateCcw className="w-4 h-4 mr-2" />
                            Refund
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Refund Modal */}
      <Modal
        isOpen={refundModalOpen}
        onClose={() => setRefundModalOpen(false)}
        title="Request Refund"
      >
        <div className="space-y-4">
          <div className="bg-yellow-50 p-4 rounded-lg flex gap-3 text-sm text-yellow-800">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p>
              Refund requests are reviewed manually. Please allow up to 48 hours for a response.
              Refunds are generally only approved for technical issues or accidental purchases within 7 days.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product
            </label>
            <div className="p-3 bg-gray-50 rounded-lg text-sm font-medium text-gray-900">
              {selectedPurchase?.product.title}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reason for Refund
            </label>
            <Textarea
              placeholder="Please explain why you are requesting a refund..."
              value={refundReason}
              onChange={(e) => setRefundReason(e.target.value)}
              className="min-h-[100px]"
            />
            <p className="text-xs text-gray-500 mt-1">
              Minimum 10 characters required.
            </p>
          </div>

          {refundError && (
            <div className="text-sm text-red-600">
              {refundError}
            </div>
          )}

          <div className="flex gap-3 justify-end pt-2">
            <Button
              variant="outline"
              onClick={() => setRefundModalOpen(false)}
              disabled={refundLoading}
            >
              Cancel
            </Button>
            <Button
              variant="primary" // Assuming primary assumes destructiveness if colored red, but here we keep it standard
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={handleSubmitRefund}
              disabled={refundLoading || refundReason.trim().length < 10}
            >
              {refundLoading ? "Submitting..." : "Submit Request"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
