"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuthStore } from "@/store/auth.store";
import { getSocket } from "@/lib/socket";
import api from "@/lib/api";
import { formatCurrency, formatDate, CHART_COLORS } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatCard } from "@/components/layout/StatCard";
import { EmptyState } from "@/components/layout/EmptyState";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingUp,
  Package,
  Users,
  AlertTriangle,
  Receipt,
  ArrowUpRight,
} from "lucide-react";

interface DashboardStats {
  today: { sales: number; invoiceCount: number };
  month: { revenue: number };
  totalStaff: number;
  totalProducts: number;
  lowStockCount: number;
  unreadNotifications: number;
  recentInvoices: Array<{
    id: string;
    invoiceNumber: string;
    total: number;
    paymentMethod: string;
    status: string;
    createdAt: string;
    customer: { name: string } | null;
  }>;
}

interface GraphPoint {
  date: string;
  total: number;
}

const STAT_CARDS_CONFIG = [
  {
    key: "todaySales",
    label: "Today's Sales",
    icon: TrendingUp,
    color: "#a0c4ff",
    textColor: "hsl(220 50% 20%)",
  },
  {
    key: "monthRevenue",
    label: "Monthly Revenue",
    icon: Receipt,
    color: "#caffbf",
    textColor: "hsl(135 50% 20%)",
  },
  {
    key: "totalStaff",
    label: "Total Staff",
    icon: Users,
    color: "#bdb2ff",
    textColor: "hsl(252 40% 20%)",
  },
  {
    key: "lowStock",
    label: "Low Stock Items",
    icon: AlertTriangle,
    color: "#ffadad",
    textColor: "hsl(0 60% 20%)",
  },
];

const PAYMENT_COLORS: Record<string, string> = {
  CASH: "#caffbf",
  UPI:  "#a0c4ff",
  CARD: "#bdb2ff",
};

const STATUS_COLORS: Record<string, string> = {
  PAID:      "#caffbf",
  PENDING:   "#ffd6a5",
  CANCELLED: "#ffadad",
};

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [graphData, setGraphData] = useState<GraphPoint[]>([]);
  const [period, setPeriod] = useState<"weekly" | "monthly">("weekly");
  const [loading, setLoading] = useState(true);
  const [graphLoading, setGraphLoading] = useState(false);
  const [liveIndicator, setLiveIndicator] = useState(false);

  const fetchStats = useCallback(async () => {
    try {
      const res = await api.get("/dashboard/stats");
      setStats(res.data.data);
    } catch {}
  }, []);

  const fetchGraph = useCallback(async (p: "weekly" | "monthly") => {
    setGraphLoading(true);
    try {
      const res = await api.get(`/dashboard/graph?period=${p}`);
      setGraphData(res.data.data);
    } catch {} finally {
      setGraphLoading(false);
    }
  }, []);

  useEffect(() => {
    Promise.all([fetchStats(), fetchGraph(period)]).finally(() =>
      setLoading(false)
    );
  }, []);

  useEffect(() => {
    fetchGraph(period);
  }, [period]);

  // Realtime — new invoice → refresh stats
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleUpdate = () => {
      setLiveIndicator(true);
      fetchStats();
      fetchGraph(period);
      setTimeout(() => setLiveIndicator(false), 2000);
    };

    socket.on("dashboard:update", handleUpdate);
    return () => { socket.off("dashboard:update", handleUpdate); };
  }, [period]);

  const statValues = stats
    ? [
        formatCurrency(stats.today.sales),
        formatCurrency(stats.month.revenue),
        String(stats.totalStaff),
        String(stats.lowStockCount),
      ]
    : ["—", "—", "—", "—"];

  const formatGraphDate = (date: string) => {
    const d = new Date(date);
    return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <PageHeader
        title="Dashboard"
        description={`Welcome back, ${user?.name?.split(" ")[0]} 👋`}
        action={
          liveIndicator && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full border border-border/50 animate-in fade-in zoom-in duration-300">
              <span
                className="w-2 h-2 rounded-full animate-pulse"
                style={{ background: "#caffbf" }}
              />
              Live updated
            </div>
          )
        }
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STAT_CARDS_CONFIG.map((card, i) => (
          <StatCard
            key={card.key}
            label={card.label}
            value={statValues[i]}
            icon={card.icon}
            color={card.color}
            textColor={card.textColor}
            loading={loading}
            subtitle={
              card.key === "todaySales" && stats
                ? `${stats.today.invoiceCount} invoices today`
                : card.key === "lowStock" && stats && stats.lowStockCount > 0
                ? "Needs restocking"
                : undefined
            }
          />
        ))}
      </div>

      {/* Sales Chart */}
      <Card className="border-border/50">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <CardTitle className="text-base font-semibold">Sales Overview</CardTitle>
            <Tabs value={period} onValueChange={(v) => setPeriod(v as "weekly" | "monthly")}>
              <TabsList className="h-8">
                <TabsTrigger value="weekly" className="text-xs px-3 h-6">7 Days</TabsTrigger>
                <TabsTrigger value="monthly" className="text-xs px-3 h-6">30 Days</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          {graphLoading || loading ? (
            <Skeleton className="h-56 w-full rounded-xl" />
          ) : (
            <ResponsiveContainer width="100%" height={224}>
              <LineChart data={graphData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatGraphDate}
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(value: any) => [formatCurrency(value), "Sales"]}
                  labelFormatter={(label: any) => formatGraphDate(String(label))}
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke={CHART_COLORS[0]}
                  strokeWidth={2.5}
                  dot={{ fill: CHART_COLORS[0], r: 3 }}
                  activeDot={{ r: 5, fill: CHART_COLORS[0] }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Recent Invoices */}
      <Card className="border-border/50">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold">Recent Invoices</CardTitle>
            <a
              href="/dashboard/invoices"
              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
            >
              View all <ArrowUpRight className="w-3 h-3" />
            </a>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-10 w-full rounded-lg" />
              ))}
            </div>
          ) : !stats?.recentInvoices?.length ? (
            <EmptyState
              icon={Package}
              title="No invoices yet"
              description="Create your first billing to see activity here."
            />
          ) : (
            <div className="space-y-2">
              {stats.recentInvoices.map((inv) => (
                <a
                  key={inv.id}
                  href={`/dashboard/invoices/${inv.id}`}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/50 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                      style={{
                        background: PAYMENT_COLORS[inv.paymentMethod] ?? "#a0c4ff",
                        color: "hsl(220 50% 20%)",
                      }}
                    >
                      {inv.paymentMethod.slice(0, 1)}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{inv.invoiceNumber}</p>
                      <p className="text-xs text-muted-foreground">
                        {inv.customer?.name ?? "Walk-in"} · {formatDate(inv.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge
                      className="text-xs"
                      style={{
                        background: STATUS_COLORS[inv.status] ?? "#a0c4ff",
                        color: "hsl(220 50% 20%)",
                        border: "none",
                      }}
                    >
                      {inv.status}
                    </Badge>
                    <p className="text-sm font-semibold group-hover:translate-x-0.5 transition-transform">
                      {formatCurrency(inv.total)}
                    </p>
                  </div>
                </a>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
