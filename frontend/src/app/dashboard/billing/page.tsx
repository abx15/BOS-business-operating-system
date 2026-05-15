"use client";

import { useEffect, useState, useCallback } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode } from "swiper/modules";
import "swiper/css";
import "swiper/css/free-mode";
import api from "@/lib/api";
import { useCartStore } from "@/store/cart.store";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  Search,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  Receipt,
  Loader2,
  Download,
  CheckCircle2,
  X,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Product {
  id: string;
  name: string;
  price: number;
  stockQty: number;
  category: string | null;
  isLowStock: boolean;
}

const PAYMENT_OPTIONS = [
  { value: "CASH", label: "Cash", color: "#caffbf", textColor: "hsl(135 50% 20%)" },
  { value: "UPI",  label: "UPI",  color: "#a0c4ff", textColor: "hsl(220 50% 20%)" },
  { value: "CARD", label: "Card", color: "#bdb2ff", textColor: "hsl(252 40% 20%)" },
] as const;

const CATEGORY_COLORS = [
  "#a0c4ff", "#caffbf", "#bdb2ff", "#ffd6a5",
  "#9bf6ff", "#ffc6ff", "#ffadad", "#fdffb6",
];

export default function BillingPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successInvoice, setSuccessInvoice] = useState<{ id: string; invoiceNumber: string } | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerId, setCustomerId] = useState<string | undefined>(undefined);
  const [customers, setCustomers] = useState<{id:string, name:string, phone:string|null}[]>([]);

  const {
    items, paymentMethod, tax, discount,
    addItem, removeItem, updateQuantity,
    setPaymentMethod, setTax, setDiscount,
    clearCart, getSubtotal, getTotal,
  } = useCartStore();

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: "100" });
      if (search) params.set("search", search);
      if (activeCategory !== "all") params.set("category", activeCategory);
      const res = await api.get(`/products?${params}`);
      setProducts(res.data.data ?? []);
    } catch {
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  }, [search, activeCategory]);

  useEffect(() => {
    api.get("/products/categories").then((res) => {
      setCategories(res.data.data ?? []);
    }).catch(() => {});

    api.get("/customers?limit=100").then((res) => {
      setCustomers(res.data.data ?? []);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    const t = setTimeout(fetchProducts, 300);
    return () => clearTimeout(t);
  }, [fetchProducts]);

  const handleSubmitInvoice = async () => {
    if (items.length === 0) {
      toast.error("Cart is empty. Add products first.");
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        paymentMethod,
        tax,
        discount,
        customerId,
        customerName: customerName || undefined,
        customerPhone: customerPhone || undefined,
      };
      const res = await api.post("/invoices", payload);
      const inv = res.data.data;
      setSuccessInvoice({ id: inv.id, invoiceNumber: inv.invoiceNumber });
      clearCart();
      setCustomerName("");
      setCustomerPhone("");
      setCustomerId(undefined);
      fetchProducts();
      toast.success(`Invoice ${inv.invoiceNumber} created!`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed to create invoice");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!successInvoice) return;
    try {
      const res = await api.get(`/invoices/${successInvoice.id}/pdf`, { responseType: "blob" });
      const url = URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = `${successInvoice.invoiceNumber}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Failed to download PDF");
    }
  };

  const subtotal = getSubtotal();
  const taxAmount = (subtotal * tax) / 100;
  const total = getTotal();

  // Success screen
  if (successInvoice) {
    return (
      <div className="max-w-md mx-auto mt-20 text-center space-y-6">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center mx-auto"
          style={{ background: "#caffbf" }}
        >
          <CheckCircle2 className="w-10 h-10" style={{ color: "hsl(135 50% 20%)" }} />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Invoice Created!</h2>
          <p className="text-muted-foreground mt-1">
            Invoice number:{" "}
            <span className="font-semibold text-foreground">{successInvoice.invoiceNumber}</span>
          </p>
        </div>
        <div className="flex gap-3 justify-center">
          <Button
            onClick={handleDownloadPDF}
            style={{ background: "#a0c4ff", color: "hsl(220 50% 20%)" }}
            className="gap-2"
          >
            <Download className="w-4 h-4" /> Download PDF
          </Button>
          <Button
            variant="outline"
            onClick={() => setSuccessInvoice(null)}
          >
            New Bill
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto h-[calc(100vh-6rem)] flex flex-col">
      <h1 className="text-xl font-bold mb-4">Billing</h1>

      <div className="flex flex-col lg:flex-row gap-4 flex-1 overflow-hidden">

        {/* LEFT — Products */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Category Swiper */}
          <div className="mb-3 flex-shrink-0">
            <Swiper
              modules={[FreeMode]}
              slidesPerView="auto"
              spaceBetween={8}
              freeMode
              className="!overflow-visible"
            >
              <SwiperSlide className="!w-auto">
                <button
                  onClick={() => setActiveCategory("all")}
                  className={cn(
                    "px-4 py-2 rounded-xl text-sm font-medium border-2 transition-all whitespace-nowrap",
                    activeCategory === "all"
                      ? "border-transparent"
                      : "border-border bg-transparent text-muted-foreground"
                  )}
                  style={activeCategory === "all" ? { background: "#a0c4ff", color: "hsl(220 50% 20%)", borderColor: "#a0c4ff" } : {}}
                >
                  All Products
                </button>
              </SwiperSlide>
              {categories.map((cat, i) => (
                <SwiperSlide key={cat} className="!w-auto">
                  <button
                    onClick={() => setActiveCategory(cat)}
                    className={cn(
                      "px-4 py-2 rounded-xl text-sm font-medium border-2 transition-all whitespace-nowrap",
                      activeCategory === cat
                        ? "border-transparent"
                        : "border-border bg-transparent text-muted-foreground"
                    )}
                    style={activeCategory === cat ? {
                      background: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
                      color: "hsl(220 50% 20%)",
                      borderColor: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
                    } : {}}
                  >
                    {cat}
                  </button>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>

          {/* Search */}
          <div className="relative mb-3 flex-shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Products Grid */}
          <ScrollArea className="flex-1 pr-4">
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[1,2,3,4,5,6].map((i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground text-sm">
                No products found
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {products.map((product, i) => {
                  const inCart = items.find((item) => item.productId === product.id);
                  const color = CATEGORY_COLORS[i % CATEGORY_COLORS.length];
                  const outOfStock = product.stockQty === 0;
                  return (
                    <button
                      key={product.id}
                      onClick={() => !outOfStock && addItem({ id: product.id, name: product.name, price: product.price })}
                      disabled={outOfStock}
                      className={cn(
                        "relative p-3 rounded-xl border-2 text-left transition-all group",
                        outOfStock
                          ? "opacity-50 cursor-not-allowed border-border bg-muted/20"
                          : inCart
                          ? "border-transparent shadow-md"
                          : "border-border bg-card hover:border-transparent hover:shadow-lg"
                      )}
                      style={inCart ? { borderColor: color, background: `${color}15` } : {}}
                    >
                      <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold mb-2 transition-transform group-hover:scale-110"
                        style={{ background: color, color: "hsl(220 50% 20%)" }}
                      >
                        {product.name.slice(0, 2).toUpperCase()}
                      </div>
                      <p className="text-sm font-medium leading-tight line-clamp-2">{product.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {formatCurrency(product.price)}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className={cn(
                          "text-[10px] px-1.5 py-0.5 rounded-md font-medium",
                          outOfStock ? "bg-destructive/10 text-destructive" : product.isLowStock ? "bg-orange-500/10 text-orange-500" : "bg-muted text-muted-foreground"
                        )}>
                          {outOfStock ? "OUT OF STOCK" : `STOCK: ${product.stockQty}`}
                        </span>
                        {inCart && (
                          <Badge className="text-xs px-1.5 py-0 h-5" style={{ background: color, color: "hsl(220 50% 20%)", border: "none" }}>
                            x{inCart.quantity}
                          </Badge>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </div>

        {/* RIGHT — Cart */}
        <div className="lg:w-80 xl:w-96 flex flex-col h-full">
          <Card className="flex-1 flex flex-col border-border/50 overflow-hidden shadow-sm">
            <CardHeader className="pb-3 border-b flex-shrink-0">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4" />
                  Cart
                  {items.length > 0 && (
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
                      {items.reduce((acc, curr) => acc + curr.quantity, 0)}
                    </Badge>
                  )}
                </CardTitle>
                {items.length > 0 && (
                  <Button variant="ghost" size="sm" onClick={clearCart} className="h-7 text-xs text-muted-foreground hover:text-destructive">
                    Clear
                  </Button>
                )}
              </div>
            </CardHeader>

            <ScrollArea className="flex-1 px-4">
              {items.length === 0 ? (
                <div className="text-center py-20 text-muted-foreground">
                  <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-3">
                    <ShoppingCart className="w-6 h-6 opacity-20" />
                  </div>
                  <p className="text-sm font-medium">Your cart is empty</p>
                  <p className="text-xs mt-1">Select products to start billing</p>
                </div>
              ) : (
                <div className="space-y-2 py-4">
                  {items.map((item) => (
                    <div key={item.productId} className="group flex items-center gap-3 p-2.5 rounded-xl bg-muted/20 border border-transparent hover:border-border transition-all">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">{item.name}</p>
                        <p className="text-[11px] text-muted-foreground">{formatCurrency(item.price)} × {item.quantity}</p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="flex items-center bg-card rounded-lg border border-border/50">
                          <Button
                            variant="ghost" size="icon"
                            className="w-6 h-6 rounded-none hover:bg-muted"
                            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="w-7 text-center text-xs font-bold">{item.quantity}</span>
                          <Button
                            variant="ghost" size="icon"
                            className="w-6 h-6 rounded-none hover:bg-muted"
                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                        <Button
                          variant="ghost" size="icon"
                          className="w-7 h-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          onClick={() => removeItem(item.productId)}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>

            <div className="p-4 border-t space-y-4 bg-muted/5 flex-shrink-0">
              {/* Customer Selection */}
              <div className="space-y-3">
                <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Customer Selection</Label>
                <div className="space-y-2">
                  <Select 
                    value={customerId || "new"} 
                    onValueChange={(v) => {
                      if (v === "new") {
                        setCustomerId(undefined);
                        setCustomerName("");
                        setCustomerPhone("");
                      } else {
                        const c = customers.find(x => x.id === v);
                        if (c) {
                          setCustomerId(c.id);
                          setCustomerName(c.name);
                          setCustomerPhone(c.phone || "");
                        }
                      }
                    }}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Select existing or new" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">+ New Customer</SelectItem>
                      {customers.map(c => (
                        <SelectItem key={c.id} value={c.id}>{c.name} ({c.phone || "No phone"})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {!customerId && (
                    <div className="grid grid-cols-2 gap-2 animate-in fade-in slide-in-from-top-1">
                      <Input
                        placeholder="New Name"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="h-8 text-xs"
                      />
                      <Input
                        placeholder="New Phone"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        className="h-8 text-xs"
                      />
                    </div>
                  )}
                  {customerId && (
                    <div className="p-2 rounded bg-muted/50 border border-dashed text-[11px] flex justify-between items-center">
                      <span className="font-medium">{customerName}</span>
                      <span className="text-muted-foreground">{customerPhone}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Tax + Discount */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Tax (%)</Label>
                  <Input
                    type="number" min="0" max="100"
                    value={tax}
                    onChange={(e) => setTax(Number(e.target.value))}
                    className="h-8 text-sm font-medium"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Discount (₹)</Label>
                  <Input
                    type="number" min="0"
                    value={discount}
                    onChange={(e) => setDiscount(Number(e.target.value))}
                    className="h-8 text-sm font-medium"
                  />
                </div>
              </div>

              {/* Payment method */}
              <div className="space-y-1.5">
                <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Payment Method</Label>
                <div className="grid grid-cols-3 gap-2">
                  {PAYMENT_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setPaymentMethod(opt.value)}
                      className={cn(
                        "py-2 rounded-lg text-[10px] font-bold border-2 transition-all uppercase tracking-wide",
                        paymentMethod === opt.value ? "border-transparent shadow-sm" : "border-border bg-card text-muted-foreground"
                      )}
                      style={paymentMethod === opt.value ? {
                        background: opt.color,
                        color: opt.textColor,
                        borderColor: opt.color,
                      } : {}}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 space-y-2 text-sm border-t border-dashed">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span className="font-medium">{formatCurrency(subtotal)}</span>
                </div>
                {tax > 0 && (
                  <div className="flex justify-between text-muted-foreground">
                    <span>Tax ({tax}%)</span>
                    <span className="font-medium text-foreground">+{formatCurrency(taxAmount)}</span>
                  </div>
                )}
                {discount > 0 && (
                  <div className="flex justify-between font-medium" style={{ color: "#caffbf" }}>
                    <span>Discount</span>
                    <span>-{formatCurrency(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg pt-2 text-foreground">
                  <span>Total</span>
                  <span className="text-xl">{formatCurrency(total)}</span>
                </div>
              </div>

              <Button
                className="w-full h-12 font-bold gap-2 text-sm uppercase tracking-wider shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
                onClick={handleSubmitInvoice}
                disabled={submitting || items.length === 0}
                style={{ background: "#caffbf", color: "hsl(135 50% 20%)" }}
              >
                {submitting
                  ? <><Loader2 className="w-5 h-5 animate-spin" /> Creating...</>
                  : <><Receipt className="w-5 h-5" /> Generate Invoice</>
                }
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
