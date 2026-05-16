"use client";

import { useEffect, useState, useCallback } from "react";
import api from "@/lib/api";
import { formatCurrency, formatDate, formatMonth } from "@/lib/format";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/layout/EmptyState";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Wallet, ChevronLeft, ChevronRight, CheckCircle2, Loader2 } from "lucide-react";

interface SalaryRecord {
  id: string;
  month: string;
  amount: number;
  status: "PAID" | "PENDING";
  paidAt: string | null;
  staff: { id: string; name: string; designation: string };
}

export default function SalaryPage() {
  const [salaries, setSalaries] = useState<SalaryRecord[]>([]);
  const [summary, setSummary] = useState({ totalPaid: 0, totalPending: 0, month: "" });
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [payingId, setPayingId] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(() => new Date().toISOString().slice(0, 7));

  const fetchSalaries = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/salary?month=${currentMonth}`);
      setSalaries(res.data.data?.salaries ?? []);
      setSummary(res.data.data?.summary ?? { totalPaid: 0, totalPending: 0, month: currentMonth });
    } catch { toast.error("Failed to load salaries"); }
    finally { setLoading(false); }
  }, [currentMonth]);

  useEffect(() => { fetchSalaries(); }, [fetchSalaries]);

  const changeMonth = (dir: number) => {
    const [y, m] = currentMonth.split("-").map(Number);
    const d = new Date(y, m - 1 + dir, 1);
    setCurrentMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const res = await api.post(`/salary/generate?month=${currentMonth}`);
      toast.success(`${res.data.data.generated} salary records generated`);
      fetchSalaries();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed to generate");
    } finally { setGenerating(false); }
  };

  const handlePay = async (id: string, name: string) => {
    setPayingId(id);
    try {
      await api.patch(`/salary/${id}/pay`);
      toast.success(`Salary paid for ${name}`);
      fetchSalaries();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed to mark paid");
    } finally { setPayingId(null); }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <PageHeader
        title="Salary Management"
        description={formatMonth(currentMonth)}
        action={
          <Button onClick={handleGenerate} disabled={generating} style={{ background: "#bc5090", color: "white" }} className="gap-2">
            {generating && <Loader2 className="w-4 h-4 animate-spin" />}
            Generate for {currentMonth}
          </Button>
        }
      />

      {/* Month navigator + summary */}
      <div className="flex flex-wrap items-center gap-4 mb-5">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => changeMonth(-1)}><ChevronLeft className="w-4 h-4" /></Button>
          <span className="font-semibold min-w-36 text-center">{formatMonth(currentMonth)}</span>
          <Button variant="outline" size="icon" onClick={() => changeMonth(1)}><ChevronRight className="w-4 h-4" /></Button>
        </div>
        <div className="flex gap-3">
          <div className="px-4 py-2 rounded-xl text-sm font-medium" style={{ background: "#bc5090", color: "white" }}>
            Paid: {formatCurrency(summary.totalPaid)}
          </div>
          <div className="px-4 py-2 rounded-xl text-sm font-medium" style={{ background: "#ff8531", color: "white" }}>
            Pending: {formatCurrency(summary.totalPending)}
          </div>
        </div>
      </div>

      <Card className="border-border/50">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-4 space-y-3">{[1,2,3].map((i) => <Skeleton key={i} className="h-14 w-full rounded-lg" />)}</div>
          ) : salaries.length === 0 ? (
            <EmptyState
              icon={Wallet}
              title="No salary records"
              description={`Click "Generate for ${currentMonth}" to create salary records for all active staff`}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Employee</th>
                    <th className="text-right px-4 py-3 font-medium text-muted-foreground">Amount</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Paid On</th>
                    <th className="text-right px-4 py-3 font-medium text-muted-foreground">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {salaries.map((sal) => (
                    <tr key={sal.id} className="border-b last:border-0 hover:bg-muted/20">
                      <td className="px-4 py-3">
                        <p className="font-medium">{sal.staff.name}</p>
                        <p className="text-xs text-muted-foreground">{sal.staff.designation}</p>
                      </td>
                      <td className="px-4 py-3 text-right font-semibold">{formatCurrency(sal.amount)}</td>
                      <td className="px-4 py-3">
                        <Badge style={sal.status === "PAID"
                          ? { background: "#bc5090", color: "white", border: "none" }
                          : { background: "#ff8531", color: "white", border: "none" }
                        }>
                          {sal.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">
                        {sal.paidAt ? formatDate(sal.paidAt) : "—"}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {sal.status === "PENDING" && (
                          <Button
                            size="sm"
                            onClick={() => handlePay(sal.id, sal.staff.name)}
                            disabled={payingId === sal.id}
                            style={{ background: "#bc5090", color: "white" }}
                            className="h-7 text-xs gap-1"
                          >
                            {payingId === sal.id
                              ? <Loader2 className="w-3 h-3 animate-spin" />
                              : <CheckCircle2 className="w-3 h-3" />
                            }
                            Mark Paid
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
