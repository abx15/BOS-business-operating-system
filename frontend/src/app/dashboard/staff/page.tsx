"use client";

import { useEffect, useState, useCallback } from "react";
import api from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/format";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/layout/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Users, Plus, Search, Pencil, Trash2, BadgeCheck, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

interface StaffMember {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  designation: string;
  joinDate: string;
  monthlySalary: number;
  isVerified: boolean;
  isActive: boolean;
  photoUrl: string | null;
}

const staffSchema = z.object({
  name: z.string().min(2, "Name required"),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Valid 10-digit number").optional().or(z.literal("")),
  email: z.string().email().optional().or(z.literal("")),
  designation: z.string().min(1, "Designation required"),
  joinDate: z.string().min(1, "Join date required"),
  monthlySalary: z.coerce.number().positive("Salary must be positive"),
});

type StaffForm = z.infer<typeof staffSchema>;

const AVATAR_COLORS = ["#a0c4ff","#caffbf","#bdb2ff","#ffd6a5","#9bf6ff","#ffc6ff","#ffadad","#fdffb6"];

export default function StaffPage() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState<StaffMember | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm({ resolver: zodResolver(staffSchema) });

  const fetchStaff = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "20" });
      if (search) params.set("search", search);
      const res = await api.get(`/staff?${params}`);
      setStaff(res.data.data ?? []);
      setTotalPages(res.data.meta?.totalPages ?? 1);
      setTotal(res.data.meta?.total ?? 0);
    } catch { toast.error("Failed to load staff"); }
    finally { setLoading(false); }
  }, [page, search]);

  useEffect(() => { fetchStaff(); }, [fetchStaff]);

  useEffect(() => {
    const t = setTimeout(() => { setPage(1); fetchStaff(); }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const handleAdd = async (data: StaffForm) => {
    setSubmitting(true);
    try {
      await api.post("/staff", {
        ...data,
        joinDate: new Date(data.joinDate).toISOString(),
        phone: data.phone || undefined,
        email: data.email || undefined,
      });
      toast.success("Staff member added");
      setAddOpen(false);
      form.reset();
      fetchStaff();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed to add staff");
    } finally { setSubmitting(false); }
  };

  const handleEdit = async (data: StaffForm) => {
    if (!selected) return;
    setSubmitting(true);
    try {
      await api.put(`/staff/${selected.id}`, {
        ...data,
        phone: data.phone || undefined,
        email: data.email || undefined,
      });
      toast.success("Staff updated");
      setEditOpen(false);
      fetchStaff();
    } catch { toast.error("Failed to update staff"); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async () => {
    if (!selected) return;
    setSubmitting(true);
    try {
      await api.delete(`/staff/${selected.id}`);
      toast.success("Staff removed");
      setDeleteOpen(false);
      fetchStaff();
    } catch { toast.error("Failed to delete staff"); }
    finally { setSubmitting(false); }
  };

  const handleVerify = async (member: StaffMember) => {
    try {
      await api.patch(`/staff/${member.id}/verify`);
      toast.success(member.isVerified ? "Unverified" : "Verified");
      fetchStaff();
    } catch { toast.error("Failed to toggle verify"); }
  };

  const openEdit = (member: StaffMember) => {
    setSelected(member);
    form.reset({
      name: member.name,
      phone: member.phone ?? "",
      email: member.email ?? "",
      designation: member.designation,
      joinDate: member.joinDate.slice(0, 10),
      monthlySalary: member.monthlySalary,
    });
    setEditOpen(true);
  };

  const StaffFormFields = () => (
    <div className="grid grid-cols-2 gap-3">
      <div className="col-span-2 space-y-1">
        <Label>Full Name *</Label>
        <Input placeholder="Ramesh Patel" {...form.register("name")} />
        {form.formState.errors.name && <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>}
      </div>
      <div className="space-y-1">
        <Label>Phone</Label>
        <Input placeholder="9876543210" {...form.register("phone")} />
        {form.formState.errors.phone && <p className="text-xs text-destructive">{form.formState.errors.phone.message}</p>}
      </div>
      <div className="space-y-1">
        <Label>Designation *</Label>
        <Input placeholder="Cashier" {...form.register("designation")} />
        {form.formState.errors.designation && <p className="text-xs text-destructive">{form.formState.errors.designation.message}</p>}
      </div>
      <div className="space-y-1">
        <Label>Join Date *</Label>
        <Input type="date" {...form.register("joinDate")} />
        {form.formState.errors.joinDate && <p className="text-xs text-destructive">{form.formState.errors.joinDate.message}</p>}
      </div>
      <div className="space-y-1">
        <Label>Monthly Salary (₹) *</Label>
        <Input type="number" placeholder="15000" {...form.register("monthlySalary")} />
        {form.formState.errors.monthlySalary && <p className="text-xs text-destructive">{form.formState.errors.monthlySalary.message}</p>}
      </div>
      <div className="col-span-2 space-y-1">
        <Label>Email</Label>
        <Input type="email" placeholder="ramesh@example.com" {...form.register("email")} />
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto">
      <PageHeader
        title="Staff Management"
        description={`${total} employees`}
        action={
          <Button onClick={() => { form.reset(); setAddOpen(true); }} style={{ background: "#bdb2ff", color: "hsl(252 40% 20%)" }} className="gap-2">
            <Plus className="w-4 h-4" /> Add Staff
          </Button>
        }
      />

      <div className="relative mb-5 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search staff..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map((i) => <Skeleton key={i} className="h-40 rounded-xl" />)}
        </div>
      ) : staff.length === 0 ? (
        <EmptyState icon={Users} title="No staff members" description="Add your first employee"
          action={<Button onClick={() => setAddOpen(true)} style={{ background: "#bdb2ff", color: "hsl(252 40% 20%)" }}><Plus className="w-4 h-4 mr-2" />Add Staff</Button>}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {staff.map((member, i) => {
            const color = AVATAR_COLORS[i % AVATAR_COLORS.length];
            return (
              <Card key={member.id} className="border-border/50 hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-11 h-11">
                        <AvatarFallback className="text-sm font-bold" style={{ background: color, color: "hsl(220 50% 20%)" }}>
                          {member.name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="font-semibold text-sm">{member.name}</p>
                          {member.isVerified && (
                            <BadgeCheck className="w-4 h-4" style={{ color: "#a0c4ff" }} />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">{member.designation}</p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="w-7 h-7" onClick={() => openEdit(member)}>
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="w-7 h-7 text-destructive" onClick={() => { setSelected(member); setDeleteOpen(true); }}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-1.5 text-xs text-muted-foreground">
                    {member.phone && <p>📞 {member.phone}</p>}
                    <p>📅 Joined {formatDate(member.joinDate)}</p>
                    <p>💰 {formatCurrency(member.monthlySalary)}/month</p>
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t">
                    <Badge
                      className="text-xs cursor-pointer"
                      onClick={() => handleVerify(member)}
                      style={member.isVerified
                        ? { background: "#caffbf", color: "hsl(135 50% 20%)", border: "none" }
                        : { background: "#ffd6a5", color: "hsl(30 60% 20%)", border: "none" }
                      }
                    >
                      {member.isVerified ? "✓ Verified" : "Unverified"}
                    </Badge>
                    <p className="text-xs text-muted-foreground">Click badge to toggle</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
          <span className="px-3 py-1 rounded-md bg-muted text-sm">{page} / {totalPages}</span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Next</Button>
        </div>
      )}

      {/* Add Modal */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Add Staff Member</DialogTitle></DialogHeader>
          <form onSubmit={form.handleSubmit(handleAdd)} className="space-y-4">
            <StaffFormFields />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={submitting} style={{ background: "#bdb2ff", color: "hsl(252 40% 20%)" }}>
                {submitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />} Add Staff
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Edit Staff — {selected?.name}</DialogTitle></DialogHeader>
          <form onSubmit={form.handleSubmit(handleEdit)} className="space-y-4">
            <StaffFormFields />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={submitting} style={{ background: "#caffbf", color: "hsl(135 50% 20%)" }}>
                {submitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />} Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Modal */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Remove Staff Member?</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">Remove <span className="font-semibold text-foreground">{selected?.name}</span> from your staff records?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>Cancel</Button>
            <Button onClick={handleDelete} disabled={submitting} style={{ background: "#ffadad", color: "hsl(0 60% 20%)" }}>
              {submitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />} Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
