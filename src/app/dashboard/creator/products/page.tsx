"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Edit, Trash2, ArrowLeft, Download, Eye, Package } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Button, Card, CardContent, Badge, Input } from "@/components/ui";

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
        <div className="container mx-auto px-4 py-8">
          <p>Loading...</p>
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
        setShowForm(false);
        setFormData({ title: "", description: "", price: "", fileUrl: "", fileType: "", thumbnailUrl: "" });
        fetchProducts();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to create product");
      }
    } catch (error) {
      console.error("Error creating product:", error);
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

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-3xl mx-auto">
          <Link
            href="/dashboard/creator"
            className="inline-flex items-center text-gray-600 hover:text-blue-600 mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Dashboard
          </Link>

          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Digital Products</h1>
              <p className="text-gray-600">Sell downloadable files to your fans</p>
            </div>
            {!showForm && (
              <Button onClick={() => setShowForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Product
              </Button>
            )}
          </div>

          {/* Create Form */}
          {showForm && (
            <Card className="mb-8">
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold mb-6">Create Digital Product</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <Input
                    label="Product Title"
                    placeholder="e.g., Photography Presets Pack"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      rows={3}
                      placeholder="What's included in this product..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <Input
                    label="Price (₹)"
                    type="number"
                    placeholder="99"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                    min="49"
                  />

                  <Input
                    label="File URL"
                    type="url"
                    placeholder="https://example.com/file.zip"
                    value={formData.fileUrl}
                    onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })}
                    required
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="File Type"
                      placeholder="pdf, zip, mp3..."
                      value={formData.fileType}
                      onChange={(e) => setFormData({ ...formData, fileType: e.target.value })}
                    />
                    <Input
                      label="Thumbnail URL (optional)"
                      type="url"
                      placeholder="https://..."
                      value={formData.thumbnailUrl}
                      onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value })}
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" className="flex-1">
                      Create Product
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Products List */}
          {products.length === 0 && !showForm ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">No digital products yet.</p>
                <Button onClick={() => setShowForm(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Product
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {products.map((product) => (
                <Card key={product.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900">{product.title}</h3>
                          {product.fileType && (
                            <Badge variant="default">{product.fileType.toUpperCase()}</Badge>
                          )}
                          {!product.isActive && <Badge variant="warning">Inactive</Badge>}
                        </div>
                        <p className="text-lg font-bold text-blue-600">₹{product.price / 100}</p>
                        {product.description && (
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">{product.description}</p>
                        )}
                        <div className="flex gap-4 mt-2 text-sm text-gray-500">
                          <span>{product._count?.purchases || 0} sales</span>
                          <span>₹{((product._count?.purchases || 0) * product.price / 100).toLocaleString()} earned</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleDelete(product.id)}>
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
