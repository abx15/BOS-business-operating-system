"use client";

import { useEffect } from "react";
import { Toaster } from "@/components/ui/sonner";
import { initLenis } from "@/lib/lenis";

export function ClientProviders({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    initLenis();
  }, []);

  return (
    <>
      {children}
      <Toaster position="top-right" richColors />
    </>
  );
}
