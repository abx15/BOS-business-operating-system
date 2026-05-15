"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Building2, Users, TrendingUp, AlertCircle } from "lucide-react";
import { formatCurrency } from "@/lib/format";

export default function SuperAdminOverview() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/super/companies/analytics").then((res) => {
      setAnalytics(res.data.data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const stats = [
    { label: "Total Companies", value: analytics?.totalCompanies ?? 0, icon: Building2, color: "#a0c4ff" },
    { label: "Active Companies", value: analytics?.activeCompanies ?? 0, icon: TrendingUp, color: "#caffbf" },
    { label: "Total Staff", value: analytics?.totalStaff ?? 0, icon: Users, color: "#bdb2ff" },
    { label: "Expired Plans", value: analytics?.expiredCompanies ?? 0, icon: AlertCircle, color: "#ffadad" },
  ];

  return (
    <div className="max-w-5xl mx-auto">
      <PageHeader title="Platform Overview" description="BOS multi-tenant analytics" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label} className="border-border/50">
              <CardContent className="p-4">
                {loading ? <Skeleton className="h-20 w-full" /> : (
                  <>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: s.color }}>
                      <Icon className="w-5 h-5 text-[hsl(220_50%_20%)]" />
                    </div>
                    <p className="text-sm text-muted-foreground">{s.label}</p>
                    <p className="text-2xl font-bold mt-0.5">{s.value}</p>
                  </>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
      {analytics?.planDistribution && (
        <Card className="border-border/50">
          <CardContent className="p-4">
            <p className="text-sm font-semibold mb-3">Plan Distribution</p>
            <div className="flex gap-3 flex-wrap">
              {analytics.planDistribution.map((p: any, i: number) => {
                const colors = ["#a0c4ff","#caffbf","#bdb2ff"];
                return (
                  <div key={p.plan} className="px-4 py-2 rounded-xl text-sm font-medium" style={{ background: colors[i % 3], color: "hsl(220 50% 20%)" }}>
                    {p.plan}: {p.count} companies
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
