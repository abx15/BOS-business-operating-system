"use client";

import { useEffect, useState, useCallback } from "react";
import api from "@/lib/api";
import { formatDate } from "@/lib/format";
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
  Building2,
  Plus,
  Search,
  BadgeCheck,
  Ban,
  Power,
  Loader2,
} from "lucide-react";

interface Company {
  id: string;
  name: string;
  slug: string;
  ownerName: string;
  ownerPhone: string;
  ownerEmail: string;
  plan: string;
  planExpiresAt: string;
  isActive: boolean;
  isVerified: boolean;
  isSuspended: boolean;
  createdAt: string;
  _count: { staff: number; invoices: number };
}

const PLAN_STYLES: Record<string, { bg: string; color: string }> = {
  BASIC: { bg: "#9bf6ff", color: "hsl(190 60% 20%)" },
  PRO: { bg: "#bdb2ff", color: "hsl(252 40% 20%)" },
  ENTERPRISE: { bg: "#ffd6a5", color: "hsl(30 60% 20%)" },
};

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [addOpen, setAddOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [planOpen, setPlanOpen] = useState(false);
  const [selected, setSelected] = useState<Company | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [companyForm, setCompanyForm] = useState({
    name: "",
    slug: "",
    ownerName: "",
    ownerPhone: "",
    ownerEmail: "",
    plan: "BASIC",
    planExpiresAt: "",
  });
  const [adminForm, setAdminForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [planForm, setPlanForm] = useState({
    plan: "BASIC",
    planExpiresAt: "",
  });

  const fetchCompanies = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "10" });
      if (search) params.set("search", search);
      const res = await api.get(`/super/companies?${params}`);
      setCompanies(res.data.data ?? []);
      setTotalPages(res.data.meta?.totalPages ?? 1);
      setTotal(res.data.meta?.total ?? 0);
    } catch {
      toast.error("Failed to load companies");
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  const handleCreate = async () => {
    setSubmitting(true);
    try {
      await api.post("/super/companies", {
        ...companyForm,
        planExpiresAt: new Date(companyForm.planExpiresAt).toISOString(),
      });
      toast.success("Company created");
      setAddOpen(false);
      fetchCompanies();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateAdmin = async () => {
    if (!selected) return;
    setSubmitting(true);
    try {
      await api.post(`/super/companies/${selected.id}/admin`, adminForm);
      toast.success("Admin login created");
      setAdminOpen(false);
      setAdminForm({ name: "", email: "", password: "" });
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSetPlan = async () => {
    if (!selected) return;
    setSubmitting(true);
    try {
      await api.patch(`/super/companies/${selected.id}/plan`, {
        ...planForm,
        planExpiresAt: new Date(planForm.planExpiresAt).toISOString(),
      });
      toast.success("Plan updated");
      setPlanOpen(false);
      fetchCompanies();
    } catch {
      toast.error("Failed");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleAction = async (
    id: string,
    action: "suspend" | "activate" | "verify",
  ) => {
    try {
      await api.patch(`/super/companies/${id}/${action}`);
      toast.success(`Company ${action}d`);
      fetchCompanies();
    } catch {
      toast.error(`Failed to ${action}`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <PageHeader
        title="Companies"
        description={`${total} companies on platform`}
        action={
          <Button
            onClick={() => setAddOpen(true)}
            style={{ background: "#caffbf", color: "hsl(135 50% 20%)" }}
            className="gap-2"
          >
            <Plus className="w-4 h-4" /> Add Company
          </Button>
        }
      />

      <div className="relative mb-5 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search companies..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      ) : companies.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No companies"
          description="Add your first company"
          action={
            <Button
              onClick={() => setAddOpen(true)}
              style={{ background: "#caffbf", color: "hsl(135 50% 20%)" }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Company
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {companies.map((company) => {
            const planStyle = PLAN_STYLES[company.plan] ?? PLAN_STYLES.BASIC;
            const isExpired = new Date(company.planExpiresAt) < new Date();
            return (
              <Card
                key={company.id}
                className={`border-border/50 ${company.isSuspended ? "opacity-60" : ""}`}
              >
                <CardContent className="p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: "#a0c4ff" }}
                      >
                        <Building2 className="w-5 h-5 text-[hsl(220_50%_20%)]" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold">{company.name}</p>
                          {company.isVerified && (
                            <BadgeCheck
                              className="w-4 h-4"
                              style={{ color: "#a0c4ff" }}
                            />
                          )}
                          <Badge
                            style={{ ...planStyle, border: "none" }}
                            className="text-xs"
                          >
                            {company.plan}
                          </Badge>
                          {company.isSuspended && (
                            <Badge
                              style={{
                                background: "#ffadad",
                                color: "hsl(0 60% 20%)",
                                border: "none",
                              }}
                              className="text-xs"
                            >
                              Suspended
                            </Badge>
                          )}
                          {isExpired && (
                            <Badge
                              style={{
                                background: "#ffd6a5",
                                color: "hsl(30 60% 20%)",
                                border: "none",
                              }}
                              className="text-xs"
                            >
                              Expired
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {company.ownerName} · {company.ownerPhone}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {company._count.staff} staff ·{" "}
                          {company._count.invoices} invoices · Expires{" "}
                          {formatDate(company.planExpiresAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs"
                        onClick={() => {
                          setSelected(company);
                          setAdminOpen(true);
                        }}
                      >
                        + Admin Login
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs"
                        onClick={() => {
                          setSelected(company);
                          setPlanForm({
                            plan: company.plan,
                            planExpiresAt: "",
                          });
                          setPlanOpen(true);
                        }}
                      >
                        Set Plan
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="w-7 h-7"
                        onClick={() => toggleAction(company.id, "verify")}
                        title="Toggle verify"
                      >
                        <BadgeCheck
                          className="w-3.5 h-3.5"
                          style={{
                            color: company.isVerified ? "#a0c4ff" : undefined,
                          }}
                        />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="w-7 h-7"
                        onClick={() =>
                          toggleAction(
                            company.id,
                            company.isSuspended ? "activate" : "suspend",
                          )
                        }
                        title={company.isSuspended ? "Activate" : "Suspend"}
                      >
                        {company.isSuspended ? (
                          <Power className="w-3.5 h-3.5 text-green-500" />
                        ) : (
                          <Ban className="w-3.5 h-3.5 text-destructive" />
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-end gap-2 mt-4">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </Button>
          <span className="px-3 py-1 rounded-md bg-muted text-sm">
            {page} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      )}

      {/* Add Company Modal */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Company</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            {[
              {
                label: "Company Name *",
                key: "name",
                placeholder: "Sharma Store",
              },
              { label: "Slug *", key: "slug", placeholder: "sharma-store" },
              {
                label: "Owner Name *",
                key: "ownerName",
                placeholder: "Ramesh Sharma",
              },
              {
                label: "Phone *",
                key: "ownerPhone",
                placeholder: "9876543210",
              },
              {
                label: "Email *",
                key: "ownerEmail",
                placeholder: "ramesh@store.com",
                col2: true,
              },
            ].map((f) => (
              <div
                key={f.key}
                className={`space-y-1 ${f.col2 ? "col-span-2" : ""}`}
              >
                <Label className="text-xs">{f.label}</Label>
                <Input
                  placeholder={f.placeholder}
                  value={(companyForm as any)[f.key]}
                  onChange={(e) =>
                    setCompanyForm((p) => ({ ...p, [f.key]: e.target.value }))
                  }
                />
              </div>
            ))}
            <div className="space-y-1">
              <Label className="text-xs">Plan</Label>
              <Select
                value={companyForm.plan}
                onValueChange={(v) =>
                  setCompanyForm((p) => ({ ...p, plan: v }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BASIC">Basic</SelectItem>
                  <SelectItem value="PRO">Pro</SelectItem>
                  <SelectItem value="ENTERPRISE">Enterprise</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Plan Expiry *</Label>
              <Input
                type="date"
                value={companyForm.planExpiresAt}
                onChange={(e) =>
                  setCompanyForm((p) => ({
                    ...p,
                    planExpiresAt: e.target.value,
                  }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={submitting}
              style={{ background: "#caffbf", color: "hsl(135 50% 20%)" }}
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}{" "}
              Create Company
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Admin Login Modal */}
      <Dialog open={adminOpen} onOpenChange={setAdminOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Create Admin Login — {selected?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {[
              { label: "Admin Name", key: "name", placeholder: "Ramesh Admin" },
              {
                label: "Email",
                key: "email",
                placeholder: "admin@sharma.com",
                type: "email",
              },
              {
                label: "Password",
                key: "password",
                placeholder: "Min 8 chars",
                type: "password",
              },
            ].map((f) => (
              <div key={f.key} className="space-y-1">
                <Label className="text-xs">{f.label}</Label>
                <Input
                  type={f.type ?? "text"}
                  placeholder={f.placeholder}
                  value={(adminForm as any)[f.key]}
                  onChange={(e) =>
                    setAdminForm((p) => ({ ...p, [f.key]: e.target.value }))
                  }
                />
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAdminOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateAdmin}
              disabled={submitting}
              style={{ background: "#a0c4ff", color: "hsl(220 50% 20%)" }}
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}{" "}
              Create Login
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Set Plan Modal */}
      <Dialog open={planOpen} onOpenChange={setPlanOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Set Plan — {selected?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label className="text-xs">Plan</Label>
              <Select
                value={planForm.plan}
                onValueChange={(v) => setPlanForm((p) => ({ ...p, plan: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BASIC">Basic</SelectItem>
                  <SelectItem value="PRO">Pro</SelectItem>
                  <SelectItem value="ENTERPRISE">Enterprise</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">New Expiry Date</Label>
              <Input
                type="date"
                value={planForm.planExpiresAt}
                onChange={(e) =>
                  setPlanForm((p) => ({ ...p, planExpiresAt: e.target.value }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPlanOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSetPlan}
              disabled={submitting}
              style={{ background: "#bdb2ff", color: "hsl(252 40% 20%)" }}
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}{" "}
              Update Plan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
