"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { formatCurrency, CHART_COLORS } from "@/lib/format";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { Building2, Receipt, TrendingUp, Users } from "lucide-react";

export default function SuperAdminAnalyticsPage() {
  const [stats, setStats] = useState<any>(null);
  const [growth, setGrowth] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/super/analytics/stats"),
      api.get("/super/analytics/growth"),
      api.get("/super/analytics/plans"),
    ]).then(([s, g, p]) => {
      setStats(s.data.data);
      setGrowth(g.data.data);
      setPlans(p.data.data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const statCards = [
    { label: "Total Companies", value: stats?.totalCompanies ?? 0, icon: Building2, color: "#a0c4ff" },
    { label: "Active Companies", value: stats?.totalActiveCompanies ?? 0, icon: Users, color: "#caffbf" },
    { label: "Platform Revenue", value: formatCurrency(stats?.totalRevenue ?? 0), icon: TrendingUp, color: "#ffd6a5" },
    { label: "Total Invoices", value: stats?.totalInvoices ?? 0, icon: Receipt, color: "#bdb2ff" },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <PageHeader title="Platform Analytics" description="Global insights across all companies" />

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.label} className="border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${card.color}33` }}>
                    <Icon className="w-5 h-5" style={{ color: card.color }} />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{card.label}</p>
                    <p className="text-xl font-bold">{loading ? "..." : card.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Growth Chart */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-base">Company Registration Growth</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-64 w-full" /> : (
              <ResponsiveContainer width="100%" height={256}>
                <LineChart data={growth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                  <Line type="monotone" dataKey="count" stroke="#a0c4ff" strokeWidth={3} dot={{ fill: "#a0c4ff", r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Plan Breakdown */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-base">Subscription Plan Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-64 w-full" /> : (
              <div className="flex items-center gap-4">
                <ResponsiveContainer width="50%" height={200}>
                  <PieChart>
                    <Pie data={plans} dataKey="count" nameKey="plan" cx="50%" cy="50%" outerRadius={70} strokeWidth={2}>
                      {plans.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-3 flex-1">
                  {plans.map((item, i) => (
                    <div key={item.plan} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                        <span className="text-sm font-medium">{item.plan}</span>
                      </div>
                      <span className="text-sm text-muted-foreground font-bold">{item.count} companies</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
