"use client";

import { useEffect, useState, useCallback } from "react";
import api from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/format";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/layout/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  UserCircle,
  Search,
  Phone,
  Mail,
  Receipt,
  ArrowRight,
  History,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Customer {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  createdAt: string;
  _count: {
    invoices: number;
  };
  totalSpend?: number;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  total: number;
  status: string;
  createdAt: string;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [history, setHistory] = useState<Invoice[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/customers${search ? `?search=${search}` : ""}`);
      setCustomers(res.data.data);
    } catch {
      toast.error("Failed to load customers");
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const t = setTimeout(fetchCustomers, 400);
    return () => clearTimeout(t);
  }, [fetchCustomers]);

  const fetchHistory = async (customer: Customer) => {
    setSelectedCustomer(customer);
    setLoadingHistory(true);
    try {
      // Assuming backend has an endpoint for customer invoices or we filter invoices by customerId
      const res = await api.get(`/invoices?customerId=${customer.id}&limit=50`);
      setHistory(res.data.data);
    } catch {
      toast.error("Failed to load invoice history");
    } finally {
      setLoadingHistory(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <PageHeader
        title="Customers"
        description="Manage your customer base and view purchase history"
      />

      <div className="relative mb-6 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search by name or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-40 rounded-2xl" />
          ))}
        </div>
      ) : customers.length === 0 ? (
        <EmptyState
          icon={UserCircle}
          title="No customers found"
          description="Customers are automatically added when you create an invoice with their details."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {customers.map((customer) => (
            <Card 
              key={customer.id} 
              className="border-border/50 hover:border-border transition-all group overflow-hidden"
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm"
                      style={{ background: "#bc509033", color: "#bc5090" }}
                    >
                      {customer.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground">{customer.name}</h3>
                      <p className="text-xs text-muted-foreground">Member since {formatDate(customer.createdAt)}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  {customer.phone && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="w-3.5 h-3.5" />
                      {customer.phone}
                    </div>
                  )}
                  {customer.email && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="w-3.5 h-3.5" />
                      {customer.email}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-4 pt-4 border-t border-dashed">
                  <div className="flex-1">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Total Bills</p>
                    <p className="font-bold flex items-center gap-1.5">
                      <Receipt className="w-3.5 h-3.5 text-brand-gold" style={{ color: "#ffa600" }} />
                      {customer._count.invoices}
                    </p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="gap-1.5 group-hover:bg-primary group-hover:text-primary-foreground transition-all"
                    onClick={() => fetchHistory(customer)}
                  >
                    History <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* History Dialog */}
      <Dialog open={!!selectedCustomer} onOpenChange={(open) => !open && setSelectedCustomer(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col p-0 overflow-hidden">
          <DialogHeader className="p-6 pb-2">
            <DialogTitle className="flex items-center gap-2">
              <History className="w-5 h-5 text-brand-magenta" style={{ color: "#bc5090" }} />
              Purchase History — {selectedCustomer?.name}
            </DialogTitle>
          </DialogHeader>

          <ScrollArea className="flex-1 p-6 pt-2">
            {loadingHistory ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
              </div>
            ) : history.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                No invoices found for this customer.
              </div>
            ) : (
              <div className="space-y-3">
                {history.map((inv) => (
                  <div 
                    key={inv.id}
                    className="flex items-center justify-between p-4 rounded-xl bg-muted/20 border border-border/50 hover:border-border transition-all"
                  >
                    <div>
                      <p className="font-bold">{inv.invoiceNumber}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(inv.createdAt)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">{formatCurrency(inv.total)}</p>
                      <p className="text-[10px] uppercase tracking-wider text-brand-magenta" style={{ color: "#bc5090" }}>{inv.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
