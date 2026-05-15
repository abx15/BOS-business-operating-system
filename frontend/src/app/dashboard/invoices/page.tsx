"use client";

import { useEffect, useState, useCallback } from "react";
import api from "@/lib/api";
import { formatCurrency, formatDateTime, PAYMENT_METHOD_LABELS } from "@/lib/format";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/layout/EmptyState";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Receipt, Download, X, Loader2, RefreshCw } from "lucide-react";

interface Invoice {
  id: string;
  invoiceNumber: string;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paymentMethod: "CASH" | "UPI" | "CARD";
  status: "PAID" | "PENDING" | "CANCELLED";
  createdAt: string;
  customer: { name: string } | null;
  createdBy: { name: string };
  _count: { items: number };
}

const STATUS_STYLES: Record<string, { bg: string; color: string }> = {
  PAID:      { bg: "#caffbf", color: "hsl(135 50% 20%)" },
  PENDING:   { bg: "#ffd6a5", color: "hsl(30 60% 20%)" },
  CANCELLED: { bg: "#ffadad", color: "hsl(0 60% 20%)" },
};

const PAYMENT_STYLES: Record<string, { bg: string; color: string }> = {
  CASH: { bg: "#caffbf", color: "hsl(135 50% 20%)" },
  UPI:  { bg: "#a0c4ff", color: "hsl(220 50% 20%)" },
  CARD: { bg: "#bdb2ff", color: "hsl(252 40% 20%)" },
};

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [cancelId, setCancelId] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "20" });
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (paymentFilter !== "all") params.set("paymentMethod", paymentFilter);
      const res = await api.get(`/invoices?${params}`);
      setInvoices(res.data.data ?? []);
      setTotalPages(res.data.meta?.totalPages ?? 1);
      setTotal(res.data.meta?.total ?? 0);
    } catch {
      toast.error("Failed to load invoices");
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, paymentFilter]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const handleDownload = async (invoice: Invoice) => {
    setDownloadingId(invoice.id);
    try {
      const res = await api.get(`/invoices/${invoice.id}/pdf`, { responseType: "blob" });
      const url = URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = `${invoice.invoiceNumber}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Failed to download PDF");
    } finally {
      setDownloadingId(null);
    }
  };

  const handleCancel = async () => {
    if (!cancelId) return;
    setCancelling(true);
    try {
      await api.patch(`/invoices/${cancelId}/cancel`);
      toast.success("Invoice cancelled and stock restored");
      setCancelId(null);
      fetchInvoices();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed to cancel invoice");
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <PageHeader
        title="Invoices"
        description={`${total} invoices total`}
        action={
          <Button variant="outline" size="icon" onClick={fetchInvoices}>
            <RefreshCw className="w-4 h-4" />
          </Button>
        }
      />

      {/* Filters */}
      <div className="flex gap-3 mb-5 flex-wrap">
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="All status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="PAID">Paid</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="CANCELLED">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        <Select value={paymentFilter} onValueChange={(v) => { setPaymentFilter(v); setPage(1); }}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="All payments" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Payments</SelectItem>
            <SelectItem value="CASH">Cash</SelectItem>
            <SelectItem value="UPI">UPI</SelectItem>
            <SelectItem value="CARD">Card</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="border-border/50">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-4 space-y-3">
              {[1,2,3,4,5].map((i) => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}
            </div>
          ) : invoices.length === 0 ? (
            <EmptyState
              icon={Receipt}
              title="No invoices yet"
              description="Go to Billing to create your first invoice"
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Invoice</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Customer</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Payment</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                    <th className="text-right px-4 py-3 font-medium text-muted-foreground">Total</th>
                    <th className="text-right px-4 py-3 font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((inv) => {
                    const statusStyle = STATUS_STYLES[inv.status];
                    const payStyle = PAYMENT_STYLES[inv.paymentMethod];
                    return (
                      <tr key={inv.id} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                        <td className="px-4 py-3">
                          <p className="font-medium">{inv.invoiceNumber}</p>
                          <p className="text-xs text-muted-foreground">{formatDateTime(inv.createdAt)}</p>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {inv.customer?.name ?? "Walk-in"}
                        </td>
                        <td className="px-4 py-3">
                          <Badge style={{ background: payStyle.bg, color: payStyle.color, border: "none" }}>
                            {PAYMENT_METHOD_LABELS[inv.paymentMethod]}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <Badge style={{ background: statusStyle.bg, color: statusStyle.color, border: "none" }}>
                            {inv.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-right font-semibold">
                          {formatCurrency(inv.total)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost" size="icon" className="w-8 h-8"
                              onClick={() => handleDownload(inv)}
                              disabled={downloadingId === inv.id}
                              title="Download PDF"
                            >
                              {downloadingId === inv.id
                                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                : <Download className="w-3.5 h-3.5" />
                              }
                            </Button>
                            {inv.status === "PAID" && (
                              <Button
                                variant="ghost" size="icon"
                                className="w-8 h-8 text-destructive hover:text-destructive"
                                onClick={() => setCancelId(inv.id)}
                                title="Cancel invoice"
                              >
                                <X className="w-3.5 h-3.5" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 text-sm">
          <p className="text-muted-foreground">{total} invoices</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
              Previous
            </Button>
            <span className="px-3 py-1 rounded-md bg-muted">
              {page} / {totalPages}
            </span>
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Cancel Confirm Dialog */}
      <Dialog open={!!cancelId} onOpenChange={() => setCancelId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Cancel Invoice?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            This will cancel the invoice and restore all product stock. This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelId(null)}>Keep Invoice</Button>
            <Button
              onClick={handleCancel}
              disabled={cancelling}
              style={{ background: "#ffadad", color: "hsl(0 60% 20%)" }}
            >
              {cancelling ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Cancel Invoice
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
