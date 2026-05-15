"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { formatCurrency, CHART_COLORS } from "@/lib/format";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { TrendingUp, TrendingDown } from "lucide-react";

export default function AnalyticsPage() {
  const [monthlyRevenue, setMonthlyRevenue] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [comparison, setComparison] = useState<any>(null);
  const [paymentBreakdown, setPaymentBreakdown] = useState<any[]>([]);
  const [attendanceSummary, setAttendanceSummary] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/analytics/revenue/monthly"),
      api.get("/analytics/products/top?limit=8"),
      api.get("/analytics/revenue/comparison"),
      api.get("/analytics/payments/breakdown"),
      api.get("/analytics/attendance/summary"),
    ]).then(([monthly, top, comp, payment, att]) => {
      setMonthlyRevenue(monthly.data.data ?? []);
      setTopProducts(top.data.data ?? []);
      setComparison(comp.data.data);
      setPaymentBreakdown(payment.data.data ?? []);
      setAttendanceSummary(att.data.data ?? []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const growth = comparison?.growthPercent ?? 0;
  const isPositive = growth >= 0;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <PageHeader title="Analytics" description="Sales, revenue, and staff insights" />

      {/* Revenue comparison cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "This Month", value: comparison?.thisMonth?.revenue ?? 0, color: "#a0c4ff", sub: `${comparison?.thisMonth?.invoiceCount ?? 0} invoices` },
          { label: "Last Month", value: comparison?.lastMonth?.revenue ?? 0, color: "#bdb2ff", sub: `${comparison?.lastMonth?.invoiceCount ?? 0} invoices` },
          { label: "Growth", value: null, color: isPositive ? "#caffbf" : "#ffadad", sub: "vs last month" },
        ].map((card) => (
          <Card key={card.label} className="border-border/50">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">{card.label}</p>
              {card.value !== null ? (
                <p className="text-2xl font-bold mt-1">{formatCurrency(card.value)}</p>
              ) : (
                <div className="flex items-center gap-2 mt-1">
                  {isPositive
                    ? <TrendingUp className="w-6 h-6" style={{ color: "#caffbf" }} />
                    : <TrendingDown className="w-6 h-6" style={{ color: "#ffadad" }} />
                  }
                  <p className="text-2xl font-bold" style={{ color: isPositive ? "#caffbf" : "#ffadad" }}>
                    {isPositive ? "+" : ""}{growth}%
                  </p>
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-1">{card.sub}</p>
              <div className="h-1 rounded-full mt-3" style={{ background: card.color, opacity: 0.6 }} />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Monthly Revenue Chart */}
      <Card className="border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Revenue — Last 12 Months</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? <Skeleton className="h-56 w-full rounded-xl" /> : (
            <ResponsiveContainer width="100%" height={224}>
              <BarChart data={monthlyRevenue} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} tickFormatter={(v: any) => `₹${(Number(v)/1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: any) => [formatCurrency(v), "Revenue"]} contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }} />
                <Bar dataKey="revenue" radius={[4, 4, 0, 0]} fill={CHART_COLORS[0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top Products */}
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Top Products</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-48 w-full rounded-xl" /> : topProducts.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No sales data yet</p>
            ) : (
              <div className="space-y-2">
                {topProducts.map((product, i) => (
                  <div key={product.productId} className="flex items-center gap-3">
                    <span
                      className="w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold flex-shrink-0"
                      style={{ background: CHART_COLORS[i % CHART_COLORS.length], color: "hsl(220 50% 20%)" }}
                    >
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{product.productName}</p>
                      <div className="h-1.5 bg-muted rounded-full mt-1 overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            background: CHART_COLORS[i % CHART_COLORS.length],
                            width: `${Math.min(100, (product.totalRevenue / topProducts[0].totalRevenue) * 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-semibold">{formatCurrency(product.totalRevenue)}</p>
                      <p className="text-xs text-muted-foreground">{product.totalQuantity} sold</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment Breakdown Pie */}
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Payment Methods</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-48 w-full rounded-xl" /> : paymentBreakdown.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No payment data yet</p>
            ) : (
              <div className="flex items-center gap-4">
                <ResponsiveContainer width="50%" height={160}>
                  <PieChart>
                    <Pie data={paymentBreakdown} dataKey="total" nameKey="method" cx="50%" cy="50%" outerRadius={60} strokeWidth={2}>
                      {paymentBreakdown.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: any) => formatCurrency(v)} contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2 flex-1">
                  {paymentBreakdown.map((item, i) => (
                    <div key={item.method} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                        <span className="text-sm">{item.method}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold">{formatCurrency(item.total)}</p>
                        <p className="text-xs text-muted-foreground">{item.count} txns</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Attendance Summary */}
      {attendanceSummary.length > 0 && (
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Staff Attendance — This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {attendanceSummary.map((staff) => {
                const total = staff.present + staff.absent + staff.halfDay || 1;
                return (
                  <div key={staff.staffId} className="flex items-center gap-4">
                    <p className="text-sm font-medium w-32 truncate">{staff.name}</p>
                    <div className="flex-1 flex h-4 rounded-full overflow-hidden gap-0.5">
                      {staff.present > 0 && <div style={{ flex: staff.present, background: "#caffbf" }} />}
                      {staff.halfDay > 0 && <div style={{ flex: staff.halfDay * 0.5, background: "#ffd6a5" }} />}
                      {staff.absent > 0 && <div style={{ flex: staff.absent, background: "#ffadad" }} />}
                    </div>
                    <div className="flex gap-2 text-xs text-muted-foreground w-28 justify-end">
                      <span style={{ color: "#caffbf" }}>{staff.present}P</span>
                      <span style={{ color: "#ffadad" }}>{staff.absent}A</span>
                      <span style={{ color: "#ffd6a5" }}>{staff.halfDay}H</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
