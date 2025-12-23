"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Trash2, ArrowLeft, Package } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Button, Card, CardContent, Badge, Input, useToastActions } from "@/components/ui";
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
      <main className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-3xl mx-auto">
            <Skeleton className="h-6 w-40 mb-6" />
            <div className="flex justify-between mb-8">
              <div>
                <Skeleton className="h-8 w-48 mb-2" />
                <Skeleton className="h-4 w-64" />
              </div>
              <Skeleton className="h-10 w-32" />
            </div>
            <div className="space-y-4">
              <ProductCardSkeleton />
              <ProductCardSkeleton />
            </div>
          </div>
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

  const handleDelete = async (productId: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    
    try {
      const res = await fetch(`/api/products/${productId}`, { method: "DELETE" });
      if (res.ok) {
        fetchProducts();
      }
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-4xl mx-auto">
          <Link
            href="/dashboard/creator"
            className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>

          <div className="flex items-end justify-between mb-12">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Digital Products</h1>
              <p className="text-gray-500 text-lg">Sell downloadable files directly to your audience.</p>
            </div>
            {!showForm && (
              <Button 
                onClick={() => setShowForm(true)}
                className="rounded-2xl bg-gray-900 hover:bg-black text-white px-6 py-3 shadow-lg shadow-gray-900/10"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Product
              </Button>
            )}
          </div>

          {/* Create Form - Clean Minimal */}
          {showForm && (
            <div className="mb-12 bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl font-bold text-gray-900">Create New Product</h2>
                <Button variant="ghost" size="sm" onClick={() => setShowForm(false)}>
                  Close
                </Button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-6">
                   <div className="grid md:grid-cols-2 gap-6">
                       <Input
                          label="Product Title"
                          placeholder="e.g., Photography Presets Pack"
                          value={formData.title}
                          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                          required
                          className="rounded-xl border-gray-200 focus:ring-gray-900"
                        />
                        <Input
                          label="Price (₹)"
                          type="number"
                          placeholder="99"
                          value={formData.price}
                          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                          required
                          min="49"
                          className="rounded-xl border-gray-200 focus:ring-gray-900"
                        />
                   </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      rows={3}
                      placeholder="What are you selling? (Markdown supported)"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 transition-all placeholder:text-gray-400 bg-white"
                    />
                  </div>

                  <Input
                    label="File URL"
                    type="url"
                    placeholder="https://example.com/file.zip"
                    value={formData.fileUrl}
                    onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })}
                    required
                    className="rounded-xl border-gray-200 focus:ring-gray-900"
                  />

                  <div className="grid grid-cols-2 gap-6">
                    <Input
                      label="File Type"
                      placeholder="pdf, zip, mp3"
                      value={formData.fileType}
                      onChange={(e) => setFormData({ ...formData, fileType: e.target.value })}
                      className="rounded-xl border-gray-200 focus:ring-gray-900"
                    />
                    <Input
                      label="Thumbnail URL (optional)"
                      type="url"
                      placeholder="https://..."
                      value={formData.thumbnailUrl}
                      onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value })}
                      className="rounded-xl border-gray-200 focus:ring-gray-900"
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-4 border-t border-gray-50 mt-8">
                  <Button 
                    type="button" 
                    variant="ghost" 
                    onClick={() => setShowForm(false)}
                    className="text-gray-500 hover:text-gray-900"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    className="flex-1 rounded-xl bg-blue-600 hover:bg-blue-700 text-white py-6 text-lg font-semibold shadow-lg shadow-blue-600/20"
                  >
                    Publish Product
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* Products List - Clean List View */}
          {products.length === 0 && !showForm ? (
            <div className="py-20 text-center bg-white rounded-3xl border border-gray-100 border-dashed">
              <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-gray-400">
                  <Package className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Start Selling Digital Products</h3>
              <p className="text-gray-500 mb-8 max-w-sm mx-auto">
                 Monetize your expertise by selling ebooks, presets, templates, and more.
              </p>
              <Button 
                onClick={() => setShowForm(true)}
                className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-6 py-3"
              >
                Create Your First Product
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {products.map((product) => (
                <div 
                  key={product.id}
                  className="group bg-white rounded-2xl p-6 border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-300 flex items-start gap-6"
                >
                   {/* Thumbnail or Placeholder */}
                   <div className="w-20 h-20 rounded-xl bg-gray-100 flex items-center justify-center shrink-0 text-gray-400">
                      {product.fileType === 'pdf' ? <Package className="w-8 h-8" /> : <Package className="w-8 h-8" />}
                   </div>

                   <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                          <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                              {product.title}
                          </h3>
                          <div className="flex items-center gap-3">
                             {!product.isActive && (
                                <span className="px-2 py-1 rounded-md bg-amber-50 text-amber-600 text-xs font-bold uppercase tracking-wider">
                                   Draft
                                </span>
                             )}
                             <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => handleDelete(product.id)}
                                className="text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg p-2"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                          </div>
                      </div>
                      
                      <p className="text-2xl font-bold text-gray-900 mb-2">
                         ₹{product.price / 100}
                      </p>
                      
                      <div className="flex items-center gap-6 text-sm text-gray-500 font-medium">
                         <span className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                            {product._count?.purchases || 0} purchases
                         </span>
                         <span>
                            Total: ₹{((product._count?.purchases || 0) * product.price / 100).toLocaleString()}
                         </span>
                         {product.fileType && (
                             <span className="uppercase text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600">
                                {product.fileType}
                             </span>
                         )}
                      </div>
                   </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
