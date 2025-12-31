"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Package, AlertTriangle, FileText, Upload } from "lucide-react";
import { Button, Input, useToastActions, Modal, Card, CardContent, Textarea } from "@/components/ui";
import { Skeleton, ProductCardSkeleton } from "@/components/ui/Skeleton";

interface Product {
  id: string;
  title: string;
  description?: string;
  price: number;
  fileType?: string;
  isActive: boolean;
  _count?: { purchases: number };
  createdAt: string;
}

export default function ProductsManagementPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const toast = useToastActions();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    fileUrl: "",
    fileType: "",
    thumbnailUrl: "",
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    try {
      const res = await fetch("/api/products?mine=true");
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products || []);
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setLoading(false);
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-12 max-w-5xl mx-auto">
        <Skeleton className="h-10 w-48 mb-6" />
        <div className="flex justify-between mb-8">
          <div>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-48" />
          </div>
          <Skeleton className="h-12 w-40" />
        </div>
        <div className="space-y-4">
          <ProductCardSkeleton />
          <ProductCardSkeleton />
        </div>
      </div>
    );
  }

  if (!session || session.user?.role !== "CREATOR") {
    router.push("/login");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const priceInPaise = Math.round(parseFloat(formData.price) * 100);

    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          price: priceInPaise,
          fileUrl: formData.fileUrl,
          fileType: formData.fileType,
          thumbnailUrl: formData.thumbnailUrl,
        }),
      });

      if (res.ok) {
        toast.success("Product created!", "Your product is now available for sale.");
        setShowForm(false);
        setFormData({ title: "", description: "", price: "", fileUrl: "", fileType: "", thumbnailUrl: "" });
        fetchProducts();
      } else {
        const data = await res.json();
        toast.error("Failed to create product", data.error || "Please try again.");
      }
    } catch (error) {
      console.error("Error creating product:", error);
      toast.error("Failed to create product", "Please try again.");
    }
  };

  const [deleteConfirmation, setDeleteConfirmation] = useState<{ isOpen: boolean; productId: string | null }>({
    isOpen: false,
    productId: null,
  });

  const handleDeleteClick = (productId: string) => {
    setDeleteConfirmation({ isOpen: true, productId });
  };

  const confirmDelete = async () => {
    if (!deleteConfirmation.productId) return;
    
    try {
      const res = await fetch(`/api/products/${deleteConfirmation.productId}`, { method: "DELETE" });
      const data = await res.json();
      
      if (res.ok) {
        if (data.message && data.message.includes("deactivated")) {
             toast.info("Product Deactivated", "This product has existing purchases, so it was deactivated instead of deleted to preserve history.");
        } else {
             toast.success("Product Deleted", "The product has been permanently removed.");
        }
        fetchProducts();
      } else {
        toast.error("Error", data.error || "Failed to delete product");
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Error", "Something went wrong sending the request");
    } finally {
        setDeleteConfirmation({ isOpen: false, productId: null });
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-12 max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12">
          <div>
            <h1 className="font-display text-4xl font-bold text-foreground mb-2">Digital Products</h1>
            <p className="font-mono text-muted-foreground text-lg">Sell downloadable files directly to your audience.</p>
          </div>
          {!showForm && (
            <Button
              variant="brutal"
              onClick={() => setShowForm(true)}
              className="text-lg px-6 py-6"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Product
            </Button>
          )}
        </div>

        {/* Create Form */}
        {showForm && (
          <Card variant="brutal" className="mb-12 border-l-8 border-l-primary">
            <CardContent className="p-8">
              <div className="flex justify-between items-center mb-8 border-b-4 border-brutal-black pb-4">
                <h2 className="font-display text-2xl font-bold uppercase">Create New Product</h2>
                <Button variant="ghost" size="sm" onClick={() => setShowForm(false)} className="border-2 border-transparent hover:border-brutal-black">
                  Close
                </Button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <Input
                    variant="brutal"
                    label="Product Title"
                    placeholder="e.g., Photography Presets Pack"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                  <div className="relative">
                    <label className="block text-sm font-bold text-foreground mb-1.5 uppercase tracking-wide font-display">
                        Price (₹)
                    </label>
                    <div className="flex items-center">
                        <span className="px-4 py-3 bg-secondary/20 text-foreground border-2 border-r-0 border-brutal-black font-display font-bold text-xl">
                            ₹
                        </span>
                        <Input
                            type="number"
                            placeholder="99"
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                            required
                            min="49"
                            variant="brutal"
                            className="rounded-none border-l-0 text-xl font-bold"
                            containerClassName="mb-0 w-full"
                        />
                    </div>
                  </div>
                </div>

                <Textarea
                  variant="brutal"
                  label="Description"
                  rows={3}
                  placeholder="What are you selling?"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />

                <div className="p-6 bg-secondary/10 border-2 border-dashed border-brutal-black">
                    <div className="flex items-center gap-3 mb-4">
                        <Upload className="w-5 h-5 text-foreground" />
                        <h3 className="font-display font-bold uppercase">File Details</h3>
                    </div>
                    <Input
                        variant="brutal"
                        label="File URL"
                        type="url"
                        placeholder="https://example.com/file.zip"
                        value={formData.fileUrl}
                        onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })}
                        required
                        containerClassName="bg-background"
                    />

                    <div className="grid grid-cols-2 gap-6 mt-4">
                        <Input
                        variant="brutal"
                        label="File Type"
                        placeholder="pdf, zip, mp3"
                        value={formData.fileType}
                        onChange={(e) => setFormData({ ...formData, fileType: e.target.value })}
                        containerClassName="bg-background"
                        />
                        <Input
                        variant="brutal"
                        label="Thumbnail URL (optional)"
                        type="url"
                        placeholder="https://..."
                        value={formData.thumbnailUrl}
                        onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value })}
                        containerClassName="bg-background"
                        />
                    </div>
                </div>

                <div className="flex gap-4 pt-6 border-t-2 border-brutal-black/10 mt-8">
                  <Button type="button" variant="ghost" onClick={() => setShowForm(false)} className="border-2 border-transparent hover:border-brutal-black">
                    Cancel
                  </Button>
                  <Button type="submit" variant="brutal" className="flex-1 py-6 text-lg">
                    Publish Product
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Products List */}
        {products.length === 0 && !showForm ? (
          <div className="py-20 text-center bg-card border-3 border-brutal-black shadow-brutal p-12">
            <div className="w-20 h-20 bg-secondary/20 rounded-full flex items-center justify-center mx-auto mb-6 border-3 border-brutal-black">
              <Package className="w-10 h-10 text-foreground" />
            </div>
            <h3 className="font-display text-2xl font-bold text-foreground mb-2 uppercase">Start Selling Digital Products</h3>
            <p className="font-mono text-muted-foreground mb-8 max-w-md mx-auto">
              Monetize your expertise by selling ebooks, presets, templates, and more.
            </p>
            <Button onClick={() => setShowForm(true)} variant="brutal-accent" size="lg">
              Create Your First Product
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {products.map((product) => (
              <Card 
                key={product.id}
                variant="brutal"
                className="group hover:border-primary transition-all duration-300"
              >
                <CardContent className="p-6 flex flex-col sm:flex-row items-start gap-6">
                  <div className="w-20 h-20 bg-secondary/20 border-2 border-brutal-black flex items-center justify-center shrink-0 shadow-brutal-sm group-hover:rotate-3 transition-transform">
                    {product.fileType === 'pdf' ? <FileText className="w-8 h-8" /> : <Package className="w-8 h-8" />}
                  </div>

                  <div className="flex-1 min-w-0 w-full">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-display text-xl font-bold text-foreground group-hover:text-primary transition-colors truncate pr-4">
                        {product.title}
                      </h3>
                      <div className="flex items-center gap-3 shrink-0">
                        {!product.isActive && (
                          <span className="px-2 py-1 bg-amber-100 border-2 border-brutal-black text-amber-800 text-xs font-bold uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                            Draft
                          </span>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteClick(product.id)}
                          className="hover:text-red-600 hover:bg-red-50 border-2 border-transparent hover:border-red-600 hover:shadow-brutal-sm transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <p className="font-display text-2xl font-bold text-foreground mb-3">₹{product.price / 100}</p>

                    <div className="flex flex-wrap items-center gap-4 text-sm font-mono font-bold text-muted-foreground">
                      <span className="flex items-center gap-2 px-3 py-1 bg-secondary/20 border-2 border-brutal-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-xs">
                        <span className="w-2 h-2 rounded-full bg-accent-green border border-black"></span>
                        {product._count?.purchases || 0} purchases
                      </span>
                      <span className="px-3 py-1 bg-secondary/20 border-2 border-brutal-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-xs">
                        Total: ₹{((product._count?.purchases || 0) * product.price / 100).toLocaleString()}
                      </span>
                      {product.fileType && (
                        <span className="uppercase text-xs bg-muted border-2 border-brutal-black px-2 py-1">
                          {product.fileType}
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        {/* Delete Confirmation Modal */}
        <Modal
            isOpen={deleteConfirmation.isOpen}
            onClose={() => setDeleteConfirmation({ isOpen: false, productId: null })}
            title="Delete Product"
        >
            <div className="space-y-6">
                <div className="flex items-center gap-3 text-accent-red bg-accent-red/10 p-4 border-2 border-accent-red shadow-brutal-sm">
                    <AlertTriangle className="w-6 h-6 shrink-0" />
                    <p className="font-bold text-sm">This action cannot be undone.</p>
                </div>
                <p className="font-mono text-muted-foreground">
                    Are you sure you want to delete this product? If users have already purchased it, it will be deactivated instead of deleted to preserve their access.
                </p>
                <div className="flex justify-end gap-3 mt-8">
                    <Button 
                        variant="ghost" 
                        onClick={() => setDeleteConfirmation({ isOpen: false, productId: null })}
                        className="border-2 border-transparent hover:border-brutal-black"
                    >
                        Cancel
                    </Button>
                    <Button 
                        onClick={confirmDelete}
                        className="bg-accent-red text-white hover:bg-accent-red/90 border-2 border-brutal-black shadow-brutal-sm hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-brutal"
                    >
                        Delete Product
                    </Button>
                </div>
            </div>
        </Modal>
    </div>
  );
}
