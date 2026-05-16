"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import Link from "next/link";

export function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const followerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      gsap.to(cursorRef.current, { x: e.clientX, y: e.clientY, duration: 0.1 });
      gsap.to(followerRef.current, { x: e.clientX, y: e.clientY, duration: 0.3 });
    };

    window.addEventListener("mousemove", onMouseMove);
    return () => window.removeEventListener("mousemove", onMouseMove);
  }, []);

  return (
    <>
      <div ref={cursorRef} className="fixed w-2 h-2 bg-white rounded-full pointer-events-none z-[9999] mix-blend-difference" />
      <div ref={followerRef} className="fixed w-10 h-10 border border-white/20 rounded-full pointer-events-none z-[9998] -translate-x-1/2 -translate-y-1/2" />
    </>
  );
}

export function MagneticButton({ children, className, href }: { children: React.ReactNode; className?: string; href?: string }) {
  const btnRef = useRef<HTMLDivElement>(null);

  const onMouseMove = (e: React.MouseEvent) => {
    const { clientX, clientY } = e;
    const { left, top, width, height } = btnRef.current!.getBoundingClientRect();
    const x = clientX - (left + width / 2);
    const y = clientY - (top + height / 2);
    gsap.to(btnRef.current, { x: x * 0.3, y: y * 0.3, duration: 0.4, ease: "power2.out" });
  };

  const onMouseLeave = () => {
    gsap.to(btnRef.current, { x: 0, y: 0, duration: 0.6, ease: "elastic.out(1, 0.3)" });
  };

  const content = (
    <div
      ref={btnRef}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      className={`relative inline-block cursor-pointer ${className}`}
    >
      {children}
    </div>
  );

  return href ? <Link href={href}>{content}</Link> : content;
}
