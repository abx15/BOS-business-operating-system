"use client";

import { useEffect, useState, useCallback } from "react";
import api from "@/lib/api";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/layout/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  Package,
  Plus,
  Search,
  Pencil,
  Trash2,
  ArrowUpDown,
  AlertTriangle,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

interface Product {
  id: string;
  name: string;
  price: number;
  stockQty: number;
  lowStockThreshold: number;
  category: string | null;
  description: string | null;
  isActive: boolean;
  isLowStock: boolean;
  createdAt: string;
}

const productSchema = z.object({
  name: z.string().min(1, "Name is required"),
  price: z.coerce.number().positive("Price must be positive"),
  stockQty: z.coerce.number().int().min(0, "Stock cannot be negative").default(0),
  lowStockThreshold: z.coerce.number().int().min(0).default(10),
  category: z.string().optional(),
  description: z.string().optional(),
});

const stockSchema = z.object({
  quantity: z.coerce.number().int().positive("Quantity must be positive"),
  type: z.enum(["ADD", "SUBTRACT", "SET"]),
});

type ProductForm = z.infer<typeof productSchema>;
type StockForm = z.infer<typeof stockSchema>;

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Modals
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [stockOpen, setStockOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const productForm = useForm({ resolver: zodResolver(productSchema) });
  const stockForm = useForm({
    resolver: zodResolver(stockSchema),
    defaultValues: { type: "ADD" },
  });

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: "20",
        ...(search && { search }),
        ...(category && category !== "all" && { category }),
      });
      const res = await api.get(`/products?${params}`);
      setProducts(res.data.data);
      setTotalPages(res.data.meta?.totalPages ?? 1);
      setTotal(res.data.meta?.total ?? 0);
    } catch {
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  }, [page, search, category]);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await api.get("/products/categories");
      setCategories(res.data.data ?? []);
    } catch {}
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    fetchCategories();
  }, []);

  // Search debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchProducts();
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const handleAdd = async (data: ProductForm) => {
    setSubmitting(true);
    try {
      await api.post("/products", data);
      toast.success("Product added successfully");
      setAddOpen(false);
      productForm.reset();
      fetchProducts();
      fetchCategories();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed to add product");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async (data: ProductForm) => {
    if (!selectedProduct) return;
    setSubmitting(true);
    try {
      await api.put(`/products/${selectedProduct.id}`, data);
      toast.success("Product updated");
      setEditOpen(false);
      fetchProducts();
    } catch {
      toast.error("Failed to update product");
    } finally {
      setSubmitting(false);
    }
  };

  const handleStockUpdate = async (data: StockForm) => {
    if (!selectedProduct) return;
    setSubmitting(true);
    try {
      await api.patch(`/products/${selectedProduct.id}/stock`, data);
      toast.success("Stock updated successfully");
      setStockOpen(false);
      stockForm.reset({ type: "ADD" });
      fetchProducts();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed to update stock");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedProduct) return;
    setSubmitting(true);
    try {
      await api.delete(`/products/${selectedProduct.id}`);
      toast.success("Product deleted");
      setDeleteOpen(false);
      fetchProducts();
    } catch {
      toast.error("Failed to delete product");
    } finally {
      setSubmitting(false);
    }
  };

  const openEdit = (product: Product) => {
    setSelectedProduct(product);
    productForm.reset({
      name: product.name,
      price: product.price,
      stockQty: product.stockQty,
      lowStockThreshold: product.lowStockThreshold,
      category: product.category ?? "",
      description: product.description ?? "",
    });
    setEditOpen(true);
  };

  const openStock = (product: Product) => {
    setSelectedProduct(product);
    stockForm.reset({ type: "ADD" });
    setStockOpen(true);
  };

  const openDelete = (product: Product) => {
    setSelectedProduct(product);
    setDeleteOpen(true);
  };

  const STOCK_TYPE_COLORS: Record<string, string> = {
    ADD: "#caffbf",
    SUBTRACT: "#ffadad",
    SET: "#a0c4ff",
  };

  return (
    <div className="max-w-7xl mx-auto">
      <PageHeader
        title="Products & Inventory"
        description={`${total} products total`}
        action={
          <Button
            onClick={() => { productForm.reset(); setAddOpen(true); }}
            className="gap-2"
            style={{ background: "#a0c4ff", color: "hsl(220 50% 20%)" }}
          >
            <Plus className="w-4 h-4" /> Add Product
          </Button>
        }
      />

      {/* Filters */}
      <div className="flex gap-3 mb-5 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={category} onValueChange={(v) => { setCategory(v || "all"); setPage(1); }}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="outline" size="icon" onClick={fetchProducts} className="w-10 h-10">
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      {/* Table */}
      <Card className="border-border/50">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-4 space-y-3">
              {[1,2,3,4,5].map((i) => <Skeleton key={i} className="h-12 w-full rounded-lg" />)}
            </div>
          ) : products.length === 0 ? (
            <EmptyState
              icon={Package}
              title="No products found"
              description="Add your first product to start billing"
              action={
                <Button onClick={() => setAddOpen(true)} style={{ background: "#a0c4ff", color: "hsl(220 50% 20%)" }}>
                  <Plus className="w-4 h-4 mr-2" /> Add Product
                </Button>
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Product</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Category</th>
                    <th className="text-right px-4 py-3 font-medium text-muted-foreground">Price</th>
                    <th className="text-right px-4 py-3 font-medium text-muted-foreground">Stock</th>
                    <th className="text-right px-4 py-3 font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr
                      key={product.id}
                      className={cn(
                        "border-b last:border-0 hover:bg-muted/20 transition-colors",
                        product.isLowStock && "bg-red-50/30 dark:bg-red-950/10"
                      )}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold"
                            style={{ background: "#a0c4ff33", color: "#a0c4ff" }}
                          >
                            {product.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium">{product.name}</p>
                            {product.isLowStock && (
                              <p className="text-xs flex items-center gap-1" style={{ color: "#ffadad" }}>
                                <AlertTriangle className="w-3 h-3" /> Low stock
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {product.category ? (
                          <Badge variant="outline" className="text-xs">{product.category}</Badge>
                        ) : "—"}
                      </td>
                      <td className="px-4 py-3 text-right font-medium">
                        {formatCurrency(product.price)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span
                          className="font-semibold"
                          style={{ color: product.isLowStock ? "#ffadad" : "inherit" }}
                        >
                          {product.stockQty}
                        </span>
                        <span className="text-muted-foreground text-xs ml-1">
                          / min {product.lowStockThreshold}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost" size="icon"
                            className="w-8 h-8"
                            onClick={() => openStock(product)}
                            title="Update stock"
                          >
                            <ArrowUpDown className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost" size="icon"
                            className="w-8 h-8"
                            onClick={() => openEdit(product)}
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost" size="icon"
                            className="w-8 h-8 text-destructive hover:text-destructive"
                            onClick={() => openDelete(product)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 text-sm">
          <p className="text-muted-foreground">{total} products</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
              Previous
            </Button>
            <span className="px-3 py-1 rounded-md bg-muted text-sm">
              {page} / {totalPages}
            </span>
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Product</DialogTitle>
          </DialogHeader>
          <form onSubmit={productForm.handleSubmit(handleAdd)} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 space-y-1">
                <Label>Product Name *</Label>
                <Input placeholder="e.g. Tata Salt 1kg" {...productForm.register("name")} />
                {productForm.formState.errors.name && (
                  <p className="text-xs text-destructive">{productForm.formState.errors.name.message}</p>
                )}
              </div>
              <div className="space-y-1">
                <Label>Price (₹) *</Label>
                <Input type="number" step="0.01" placeholder="0.00" {...productForm.register("price")} />
                {productForm.formState.errors.price && (
                  <p className="text-xs text-destructive">{productForm.formState.errors.price.message}</p>
                )}
              </div>
              <div className="space-y-1">
                <Label>Initial Stock</Label>
                <Input type="number" placeholder="0" {...productForm.register("stockQty")} />
              </div>
              <div className="space-y-1">
                <Label>Low Stock Alert</Label>
                <Input type="number" placeholder="10" {...productForm.register("lowStockThreshold")} />
              </div>
              <div className="space-y-1">
                <Label>Category</Label>
                <Input placeholder="e.g. Grocery" {...productForm.register("category")} />
              </div>
              <div className="col-span-2 space-y-1">
                <Label>Description</Label>
                <Input placeholder="Optional description" {...productForm.register("description")} />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={submitting} style={{ background: "#a0c4ff", color: "hsl(220 50% 20%)" }}>
                {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Add Product
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Product Modal */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
          </DialogHeader>
          <form onSubmit={productForm.handleSubmit(handleEdit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 space-y-1">
                <Label>Product Name *</Label>
                <Input {...productForm.register("name")} />
              </div>
              <div className="space-y-1">
                <Label>Price (₹) *</Label>
                <Input type="number" step="0.01" {...productForm.register("price")} />
              </div>
              <div className="space-y-1">
                <Label>Low Stock Alert</Label>
                <Input type="number" {...productForm.register("lowStockThreshold")} />
              </div>
              <div className="col-span-2 space-y-1">
                <Label>Category</Label>
                <Input {...productForm.register("category")} />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={submitting} style={{ background: "#caffbf", color: "hsl(135 50% 20%)" }}>
                {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Stock Update Modal */}
      <Dialog open={stockOpen} onOpenChange={setStockOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Update Stock — {selectedProduct?.name}</DialogTitle>
          </DialogHeader>
          <form onSubmit={stockForm.handleSubmit(handleStockUpdate)} className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Current stock: <span className="font-semibold text-foreground">{selectedProduct?.stockQty}</span>
            </div>
            <div className="space-y-1">
              <Label>Operation Type</Label>
              <div className="grid grid-cols-3 gap-2">
                {(["ADD", "SUBTRACT", "SET"] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => stockForm.setValue("type", type)}
                    className={cn(
                      "py-2 px-3 rounded-lg text-xs font-medium border-2 transition-all",
                      stockForm.watch("type") === type
                        ? "border-transparent"
                        : "border-border bg-transparent text-muted-foreground"
                    )}
                    style={stockForm.watch("type") === type ? {
                      background: STOCK_TYPE_COLORS[type],
                      color: "hsl(220 50% 20%)",
                      borderColor: STOCK_TYPE_COLORS[type],
                    } : {}}
                  >
                    {type === "ADD" ? "+ Add" : type === "SUBTRACT" ? "- Subtract" : "= Set"}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-1">
              <Label>Quantity</Label>
              <Input type="number" placeholder="Enter quantity" {...stockForm.register("quantity")} />
              {stockForm.formState.errors.quantity && (
                <p className="text-xs text-destructive">{stockForm.formState.errors.quantity.message}</p>
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setStockOpen(false)}>Cancel</Button>
              <Button
                type="submit"
                disabled={submitting}
                style={{
                  background: STOCK_TYPE_COLORS[stockForm.watch("type")],
                  color: "hsl(220 50% 20%)",
                }}
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Update Stock
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Modal */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Product?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete <span className="font-semibold text-foreground">{selectedProduct?.name}</span>?
            This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>Cancel</Button>
            <Button
              onClick={handleDelete}
              disabled={submitting}
              style={{ background: "#ffadad", color: "hsl(0 60% 20%)" }}
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
