import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface StatCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  color: string;
  textColor?: string;
  subtitle?: string;
  loading?: boolean;
  className?: string;
}

export function StatCard({
  label,
  value,
  icon: Icon,
  color,
  textColor = "hsl(220 50% 20%)",
  subtitle,
  loading,
  className,
}: StatCardProps) {
  if (loading) {
    return (
      <Card className={cn("border-border/50", className)}>
        <CardContent className="p-4 space-y-2">
          <Skeleton className="h-10 w-10 rounded-xl" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-6 w-20" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("border-border/50 overflow-hidden group hover:shadow-md transition-shadow", className)}>
      <CardContent className="p-4">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 group-hover:scale-105 transition-transform"
          style={{ background: color }}
        >
          <Icon className="w-5 h-5" style={{ color: textColor }} />
        </div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-xl font-bold mt-0.5">{value}</p>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        )}
      </CardContent>
    </Card>
  );
}
