"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Package,
  Download,
  Compass,
  ShoppingBag,
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
    <Card variant="brutal" className="mb-4">
      <CardContent className="p-6">
        <div className="flex gap-4">
          <Skeleton className="w-16 h-16 rounded-none border-2 border-brutal-black flex-shrink-0" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <div className="flex gap-2">
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-8 w-20" />
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
    <>
      <div className="p-6 lg:p-8 font-sans">
        {/* Page Header */}
        <div className="mb-8 border-b-4 border-brutal-black pb-6">
          <h1 className="text-3xl lg:text-5xl font-black text-foreground flex items-center gap-3 font-display uppercase tracking-tight">
             <div className="w-12 h-12 bg-accent-purple border-3 border-brutal-black flex items-center justify-center shadow-brutal-sm">
                <ShoppingBag className="w-6 h-6 text-brutal-black" strokeWidth={2.5}/>
             </div>
            My Purchases
          </h1>
          <p className="text-muted-foreground mt-2 font-mono font-bold text-lg">
            Your purchased digital products
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="space-y-6">
            <PurchaseSkeleton />
            <PurchaseSkeleton />
            <PurchaseSkeleton />
          </div>
        )}

        {/* Error State */}
        {error && (
          <Card variant="brutal" className="bg-accent-red/10 border-accent-red">
            <CardContent className="py-12 text-center">
              <p className="text-accent-red font-bold font-mono text-lg mb-4">{error}</p>
              <Button
                variant="brutal"
                className="bg-card text-brutal-black"
                onClick={() => window.location.reload()}
              >
                Try Again
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {!loading && !error && purchases.length === 0 && (
          <Card variant="brutal" className="bg-card">
            <CardContent className="py-20 text-center">
              <div className="w-24 h-24 bg-accent-purple border-4 border-brutal-black flex items-center justify-center mx-auto mb-6 shadow-brutal">
                <ShoppingBag className="w-12 h-12 text-brutal-black" strokeWidth={2.5} />
              </div>
              <h2 className="text-3xl font-black text-foreground mb-3 font-display uppercase">
                No purchases yet
              </h2>
              <p className="text-muted-foreground mb-8 max-w-sm mx-auto font-medium text-lg">
                Explore creator products and make your first purchase to see them here!
              </p>
              <Link href="/explore">
                <Button variant="brutal" className="text-lg px-8 py-6">
                  <Compass className="w-5 h-5 mr-3" />
                  Explore Creators
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Purchases List */}
        {!loading && !error && purchases.length > 0 && (
          <div className="space-y-6">
            {purchases.map((purchase) => (
              <Card key={purchase.id} variant="brutal" className="hover:translate-x-[-4px] hover:translate-y-[-4px] transition-transform">
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row gap-6">
                    {/* Product Icon */}
                    <div className="w-24 h-24 bg-secondary/20 border-3 border-brutal-black flex items-center justify-center flex-shrink-0 shadow-brutal-sm">
                      {purchase.product.thumbnailUrl ? (
                        <img
                          src={purchase.product.thumbnailUrl}
                          alt={purchase.product.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Package className="w-10 h-10 text-brutal-black" strokeWidth={1.5} />
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/products/${purchase.product.id}`}
                        className="text-2xl font-black text-foreground hover:underline decoration-4 underline-offset-4 decoration-accent-purple font-display uppercase"
                      >
                        {purchase.product.title}
                      </Link>
                      
                      <Link
                        href={`/creator/${purchase.product.creator.username}`}
                        className="flex items-center gap-2 mt-2 group w-fit"
                      >
                         <div className="border-2 border-brutal-black rounded-full overflow-hidden w-6 h-6">
                            <Avatar
                            src={purchase.product.creator.avatar}
                            name={purchase.product.creator.displayName || purchase.product.creator.username}
                            size="sm"
                            />
                         </div>
                        <span className="font-bold font-mono text-sm group-hover:bg-brutal-black group-hover:text-brutal-white px-1 transition-colors">
                            @{purchase.product.creator.displayName || purchase.product.creator.username}
                        </span>
                      </Link>

                      <div className="flex flex-wrap items-center gap-3 mt-4">
                        {purchase.product.fileType && (
                          <span className="inline-block bg-accent-blue text-brutal-black border-2 border-brutal-black px-2 py-0.5 text-xs font-black uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                            {purchase.product.fileType.toUpperCase()}
                          </span>
                        )}
                        <span className="text-sm font-bold bg-secondary/10 px-2 py-0.5 border border-brutal-black/20">
                          Purchased {formatDate(purchase.purchasedAt)}
                        </span>
                        <span className="text-sm font-black text-foreground bg-accent-green px-2 py-0.5 border-2 border-brutal-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                          {formatPrice(purchase.amount, purchase.currency)}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex-shrink-0 flex sm:flex-col items-center gap-3 mt-4 sm:mt-0">
                      <a
                        href={purchase.product.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full sm:w-auto"
                      >
                        <Button variant="brutal" className="w-full bg-brutal-black text-brutal-white hover:bg-card hover:text-brutal-black">
                            <Download className="w-4 h-4 mr-2" /> Download
                        </Button>
                      </a>
                      
                      {isRefundable(purchase.purchasedAt) && (
                        <Button 
                          variant="ghost" 
                          className="text-muted-foreground hover:text-accent-red hover:bg-accent-red/10 border-2 border-transparent hover:border-accent-red w-full sm:w-auto font-bold"
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

      {/* Refund Modal */}
      <Modal
        variant="brutal"
        isOpen={refundModalOpen}
        onClose={() => setRefundModalOpen(false)}
        title="Request Refund"
      >
        <div className="space-y-6">
          <div className="bg-accent-yellow/20 p-4 border-l-4 border-accent-yellow flex gap-3 text-sm font-bold text-foreground">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-brutal-black" />
            <p>
              Refund requests are reviewed manually. Please allow up to 48 hours.
              Generally only approved for technical issues within 7 days.
            </p>
          </div>

          <div>
            <label className="block text-sm font-black uppercase tracking-wider text-foreground mb-2">
              Product
            </label>
            <div className="p-4 bg-secondary/10 border-2 border-brutal-black font-bold text-foreground shadow-brutal-sm">
              {selectedPurchase?.product.title}
            </div>
          </div>

          <div>
            <label className="block text-sm font-black uppercase tracking-wider text-foreground mb-2">
              Reason for Refund
            </label>
            <Textarea
              variant="brutal"
              placeholder="Please explain why you are requesting a refund..."
              value={refundReason}
              onChange={(e) => setRefundReason(e.target.value)}
              className="min-h-[100px]"
            />
            <p className="text-xs font-bold font-mono text-muted-foreground mt-2 uppercase">
              Min 10 characters required.
            </p>
          </div>

          {refundError && (
            <div className="p-3 bg-accent-red/20 border-2 border-accent-red text-accent-red font-bold text-sm">
              {refundError}
            </div>
          )}

          <div className="flex gap-4 justify-end pt-2">
            <Button
              variant="outline"
              className="border-2 border-brutal-black font-bold hover:bg-secondary/20"
              onClick={() => setRefundModalOpen(false)}
              disabled={refundLoading}
            >
              Cancel
            </Button>
            <Button
              variant="brutal"
              className="bg-accent-red text-white hover:bg-white hover:text-accent-red"
              onClick={handleSubmitRefund}
              disabled={refundLoading || refundReason.trim().length < 10}
            >
              {refundLoading ? "Submitting..." : "Submit Request"}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
