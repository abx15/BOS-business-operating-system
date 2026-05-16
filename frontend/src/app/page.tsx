"use client";

import { useEffect, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import { ThreeBackground } from "@/components/landing/three-background";
import { Hero } from "@/components/landing/hero";
import { IntroShowcase } from "@/components/landing/intro-showcase";
import { FeaturesStory } from "@/components/landing/features-story";
import { BentoGrid } from "@/components/landing/bento-grid";
import { StatsSection } from "@/components/landing/stats-section";
import { Workflow } from "@/components/landing/workflow";
import { Testimonials } from "@/components/landing/testimonials";
import { CTAFinal } from "@/components/landing/cta-final";
import { Footer } from "@/components/landing/footer";
import { CustomCursor, MagneticButton } from "@/components/landing/ui";
import Link from "next/link";

// Register GSAP plugins
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function CinematicLanding() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // Smooth page entrance
    gsap.to("body", { opacity: 1, duration: 1.5, ease: "power2.inOut" });
    
    // Refresh ScrollTrigger on mount
    ScrollTrigger.refresh();
  }, []);

  if (!isMounted) return <div className="bg-black min-h-screen" />;

  return (
    <div className="bg-black text-white selection:bg-indigo-500/30 selection:text-indigo-200 overflow-x-hidden">
      <CustomCursor />
      <ThreeBackground />
      
      {/* Cinematic Navbar */}
      <nav className="fixed top-0 left-0 w-full z-[100] py-8 px-10">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between glass px-10 py-6 rounded-full border border-white/10 backdrop-blur-3xl shadow-[0_0_40px_rgba(0,0,0,0.5)]">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#bc5090] flex items-center justify-center font-black text-xl">B</div>
            <span className="font-clash font-black text-3xl tracking-tighter uppercase italic">BOS</span>
          </Link>
          
          <div className="hidden lg:flex items-center gap-16">
            {[
              { label: "System", id: "system" },
              { label: "Modules", id: "modules" },
              { label: "Standard", id: "bento" },
              { label: "Network", id: "network" }
            ].map(item => (
              <MagneticButton key={item.id}>
                <Link href={`#${item.id}`} className="text-xs font-black uppercase tracking-[0.4em] text-white/40 hover:text-white transition-colors">
                  {item.label}
                </Link>
              </MagneticButton>
            ))}
          </div>

          <MagneticButton href="/login">
            <div className="px-8 py-3 bg-[#ffa600] text-black text-sm font-black rounded-full hover:scale-110 transition-transform uppercase italic tracking-widest shadow-[0_0_30px_rgba(255,166,0,0.3)]">
              Initialize
            </div>
          </MagneticButton>
        </div>
      </nav>

      <main>
        <Hero />
        <div className="relative z-10 bg-black">
          <IntroShowcase />
          <FeaturesStory />
          <BentoGrid />
          <StatsSection />
          <Workflow />
          <Testimonials />
          <CTAFinal />
        </div>
      </main>

      <Footer />

      {/* Global Cinematic Styles */}
      <style jsx global>{`
        * { cursor: none !important; }
        a, button, [role="button"] { cursor: none !important; }
        
        .font-clash { font-family: 'Clash Display', sans-serif; }
        .font-satoshi { font-family: 'Satoshi', sans-serif; }
        
        .glass {
          background: rgba(255, 255, 255, 0.02);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.05);
        }
        
        .gradient-text {
          background: linear-gradient(135deg, #818cf8, #ffffff, #c084fc);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        /* Lenis specific tweaks */
        html.lenis {
          height: auto;
        }
        .lenis.lenis-smooth {
          scroll-behavior: auto !important;
        }
        .lenis.lenis-smooth [data-lenis-prevent] {
          overscroll-behavior: contain;
        }
        .lenis.lenis-stopped {
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}
