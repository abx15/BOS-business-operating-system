"use client";

import { useEffect, useState, useCallback } from "react";
import api from "@/lib/api";
import { formatRelative } from "@/lib/format";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/layout/EmptyState";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Bell, Package, Wallet, AlertTriangle, CheckCheck, Trash2 } from "lucide-react";

interface Notification {
  id: string;
  type: "LOW_STOCK" | "SALARY_PENDING" | "PLAN_EXPIRY" | "GENERAL";
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

const NOTIF_STYLES = {
  LOW_STOCK:      { icon: Package, bg: "#ffadad33", iconColor: "#ffadad", border: "#ffadad" },
  SALARY_PENDING: { icon: Wallet,  bg: "#ffd6a533", iconColor: "#ffd6a5", border: "#ffd6a5" },
  PLAN_EXPIRY:    { icon: AlertTriangle, bg: "#fdffb633", iconColor: "#fdffb6", border: "#fdffb6" },
  GENERAL:        { icon: Bell,    bg: "#a0c4ff33", iconColor: "#a0c4ff", border: "#a0c4ff" },
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/notifications?limit=50");
      setNotifications(res.data.data ?? []);
    } catch { toast.error("Failed to load notifications"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  const markRead = async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, isRead: true } : n));
    } catch {}
  };

  const markAllRead = async () => {
    setMarkingAll(true);
    try {
      await api.patch("/notifications/read-all");
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      toast.success("All marked as read");
    } catch { toast.error("Failed"); }
    finally { setMarkingAll(false); }
  };

  const deleteNotif = async (id: string) => {
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch { toast.error("Failed to delete"); }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="max-w-2xl mx-auto">
      <PageHeader
        title={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ""}`}
        action={unreadCount > 0 ? (
          <Button variant="outline" size="sm" onClick={markAllRead} disabled={markingAll} className="gap-1.5 text-xs">
            <CheckCheck className="w-3.5 h-3.5" /> Mark all read
          </Button>
        ) : undefined}
      />

      {loading ? (
        <div className="space-y-3">{[1,2,3,4].map((i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}</div>
      ) : notifications.length === 0 ? (
        <EmptyState icon={Bell} title="No notifications" description="You're all caught up!" />
      ) : (
        <div className="space-y-2">
          {notifications.map((notif) => {
            const style = NOTIF_STYLES[notif.type] ?? NOTIF_STYLES.GENERAL;
            const Icon = style.icon;
            return (
              <div
                key={notif.id}
                onClick={() => !notif.isRead && markRead(notif.id)}
                className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${!notif.isRead ? "hover:opacity-90" : "opacity-60"}`}
                style={{ background: style.bg, borderColor: notif.isRead ? "hsl(var(--border))" : style.border }}
              >
                <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: style.iconColor + "33" }}>
                  <Icon className="w-4 h-4" style={{ color: style.iconColor }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold">{notif.title}</p>
                    {!notif.isRead && (
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: style.iconColor }} />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{notif.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">{formatRelative(notif.createdAt)}</p>
                </div>
                <Button
                  variant="ghost" size="icon" className="w-7 h-7 flex-shrink-0 opacity-0 group-hover:opacity-100"
                  onClick={(e) => { e.stopPropagation(); deleteNotif(notif.id); }}
                >
                  <Trash2 className="w-3.5 h-3.5 text-muted-foreground" />
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
