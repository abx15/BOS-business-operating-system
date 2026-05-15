"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/auth.store";
import { connectSocket, disconnectSocket } from "@/lib/socket";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import api from "@/lib/api";
import {
  LayoutDashboard,
  Package,
  Receipt,
  Users,
  CalendarDays,
  Wallet,
  UserCircle,
  BarChart3,
  Bell,
  LogOut,
  Menu,
  Building2,
  ChevronRight,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, color: "#a0c4ff" },
  { href: "/dashboard/billing", label: "Billing", icon: Receipt, color: "#caffbf" },
  { href: "/dashboard/products", label: "Products", icon: Package, color: "#ffd6a5" },
  { href: "/dashboard/staff", label: "Staff", icon: Users, color: "#bdb2ff" },
  { href: "/dashboard/attendance", label: "Attendance", icon: CalendarDays, color: "#9bf6ff" },
  { href: "/dashboard/salary", label: "Salary", icon: Wallet, color: "#fdffb6" },
  { href: "/dashboard/customers", label: "Customers", icon: UserCircle, color: "#ffc6ff" },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3, color: "#ffadad" },
];

function SidebarContent({
  onClose,
  unreadCount,
}: {
  onClose?: () => void;
  unreadCount: number;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, clearAuth } = useAuthStore();

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
    } catch {}
    clearAuth();
    document.cookie = "accessToken=; path=/; max-age=0";
    document.cookie = "userRole=; path=/; max-age=0";
    disconnectSocket();
    router.push("/login");
    toast.success("Logged out successfully");
  };

  return (
    <div className="flex flex-col h-full bg-sidebar text-sidebar-foreground">
      {/* Logo */}
      <div className="p-5 flex items-center gap-3">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: "#a0c4ff" }}
        >
          <Building2 className="w-5 h-5 text-[hsl(220_50%_20%)]" />
        </div>
        <div>
          <p className="font-bold text-base leading-none">BOS</p>
          <p className="text-xs text-sidebar-foreground/50 mt-0.5">Business OS</p>
        </div>
      </div>

      {/* Pastel rainbow bar */}
      <div className="flex h-0.5 mx-5 rounded-full overflow-hidden mb-4">
        {["#ffadad","#ffd6a5","#fdffb6","#caffbf","#9bf6ff","#a0c4ff","#bdb2ff","#ffc6ff"].map((c) => (
          <div key={c} className="flex-1" style={{ background: c }} />
        ))}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              )}
            >
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110"
                style={{ background: isActive ? item.color : `${item.color}33` }}
              >
                <Icon
                  className="w-4 h-4"
                  style={{ color: isActive ? "hsl(220 50% 20%)" : item.color }}
                />
              </div>
              <span className="flex-1">{item.label}</span>
              {isActive && (
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              )}
            </Link>
          );
        })}
      </nav>

      <Separator className="bg-sidebar-border mx-3 my-3" />

      {/* Notifications */}
      <Link
        href="/dashboard/notifications"
        onClick={onClose}
        className="mx-3 mb-2 flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-all"
      >
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{ background: "#ffadad33" }}
        >
          <Bell className="w-4 h-4" style={{ color: "#ffadad" }} />
        </div>
        <span className="flex-1">Notifications</span>
        {unreadCount > 0 && (
          <Badge
            className="text-xs px-1.5 py-0 h-5 min-w-5 flex items-center justify-center"
            style={{ background: "#ffadad", color: "hsl(0 60% 20%)" }}
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </Badge>
        )}
      </Link>

      {/* User info + logout */}
      <div className="p-3">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-sidebar-accent/50">
          <Avatar className="w-8 h-8 flex-shrink-0">
            <AvatarFallback
              className="text-xs font-bold"
              style={{ background: "#bdb2ff", color: "hsl(252 40% 20%)" }}
            >
              {user?.name?.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.name}</p>
            <p className="text-xs text-sidebar-foreground/50 truncate">{user?.email}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            className="w-7 h-7 text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent flex-shrink-0"
          >
            <LogOut className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, accessToken } = useAuthStore();
  const [unreadCount, setUnreadCount] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!accessToken) return;

    // Connect socket
    const socket = connectSocket(accessToken);

    socket.on("notification:new", () => {
      setUnreadCount((prev) => prev + 1);
    });

    socket.on("dashboard:update", () => {
      // Dashboard page will listen to this
    });

    // Fetch unread count
    api.get("/notifications?limit=1").then((res) => {
      setUnreadCount(res.data.data?.unreadCount ?? 0);
    }).catch(() => {});

    return () => {
      socket.off("notification:new");
      socket.off("dashboard:update");
    };
  }, [accessToken]);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 flex-shrink-0 flex-col border-r border-sidebar-border">
        <SidebarContent unreadCount={unreadCount} />
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="p-0 w-64 border-sidebar-border">
          <SidebarContent
            onClose={() => setMobileOpen(false)}
            unreadCount={unreadCount}
          />
        </SheetContent>
      </Sheet>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile topbar */}
        <header className="lg:hidden flex items-center gap-3 px-4 py-3 border-b bg-card">
          <Button variant="ghost" size="icon" className="w-9 h-9" onClick={() => setMobileOpen(true)}>
            <Menu className="w-5 h-5" />
          </Button>
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: "#a0c4ff" }}
          >
            <Building2 className="w-4 h-4 text-[hsl(220_50%_20%)]" />
          </div>
          <p className="font-bold">BOS</p>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
