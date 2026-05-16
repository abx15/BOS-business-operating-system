"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/auth.store";
import { disconnectSocket } from "@/lib/socket";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import api from "@/lib/api";
import Image from "next/image";
import { LayoutDashboard, Building2, BarChart3, LogOut, Menu, ChevronRight } from "lucide-react";

const NAV = [
  { href: "/super-admin", label: "Overview", icon: LayoutDashboard, color: "#8a508f" },
  { href: "/super-admin/companies", label: "Companies", icon: Building2, color: "#bc5090" },
  { href: "/super-admin/analytics", label: "Analytics", icon: BarChart3, color: "#ff6361" },
];

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, clearAuth } = useAuthStore();

  const handleLogout = async () => {
    try { await api.post("/auth/logout"); } catch {}
    clearAuth();
    document.cookie = "accessToken=; path=/; max-age=0";
    document.cookie = "userRole=; path=/; max-age=0";
    disconnectSocket();
    router.push("/login");
    toast.success("Logged out");
  };

  return (
    <div className="flex flex-col h-full bg-sidebar text-sidebar-foreground">
      <div className="p-5 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-white overflow-hidden shadow-sm">
          <Image 
            src="/assets/icons/logo.png" 
            alt="Logo" 
            width={32} 
            height={32} 
            className="object-contain p-1"
          />
        </div>
        <div>
          <p className="font-bold text-base leading-none">BOS Admin</p>
          <p className="text-xs text-sidebar-foreground/50 mt-0.5">Super Admin Panel</p>
        </div>
      </div>
      <div className="flex h-0.5 mx-5 rounded-full overflow-hidden mb-4">
        {["#003f5c","#2c4875","#8a508f","#bc5090","#ff6361","#ff8531","#ffa600","#ffd380"].map((c) => (
          <div key={c} className="flex-1" style={{ background: c }} />
        ))}
      </div>
      <nav className="flex-1 px-3 space-y-0.5">
        {NAV.map((item) => {
          const Icon = item.icon;
          const isActive = item.href === "/super-admin" ? pathname === "/super-admin" : pathname.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href} onClick={onClose}
              className={cn("flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group",
                isActive ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50"
              )}>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110"
                style={{ background: isActive ? item.color : `${item.color}33` }}>
                <Icon className="w-4 h-4" style={{ color: isActive ? "white" : item.color }} />
              </div>
              <span className="flex-1">{item.label}</span>
              {isActive && <ChevronRight className="w-3.5 h-3.5 opacity-60" />}
            </Link>
          );
        })}
      </nav>
      <Separator className="bg-sidebar-border mx-3 my-3" />
      <div className="p-3">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-sidebar-accent/50">
          <Avatar className="w-8 h-8 flex-shrink-0">
            <AvatarFallback className="text-xs font-bold" style={{ background: "#8a508f", color: "white" }}>
              {user?.name?.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.name}</p>
            <p className="text-xs text-sidebar-foreground/50">Super Admin</p>
          </div>
          <Button variant="ghost" size="icon" onClick={handleLogout} className="w-7 h-7 text-sidebar-foreground/50 hover:text-sidebar-foreground">
            <LogOut className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <aside className="hidden lg:flex w-60 flex-shrink-0 flex-col border-r border-sidebar-border">
        <SidebarContent />
      </aside>
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="p-0 w-60">
          <SidebarContent onClose={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="lg:hidden flex items-center gap-3 px-4 py-3 border-b bg-card">
          <Button variant="ghost" size="icon" className="w-9 h-9" onClick={() => setMobileOpen(true)}>
            <Menu className="w-5 h-5" />
          </Button>
          <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-white overflow-hidden shadow-sm">
            <Image 
              src="/assets/icons/logo.png" 
              alt="Logo" 
              width={24} 
              height={24} 
              className="object-contain p-0.5"
            />
          </div>
          <p className="font-bold">BOS Admin</p>
        </header>
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
