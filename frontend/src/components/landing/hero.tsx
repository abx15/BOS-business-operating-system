"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ArrowRight, Zap } from "lucide-react";
import { motion } from "framer-motion";

export function Hero() {
  const containerRef = useRef<HTMLElement>(null);
  const textRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".hero-reveal", {
        y: 150,
        opacity: 0,
        duration: 1.5,
        stagger: 0.1,
        ease: "power4.out",
      });
      
      gsap.to(".hero-glow", {
        opacity: 0.8,
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="relative min-h-screen flex items-center justify-center pt-24 overflow-hidden bg-black">
      {/* Immersive Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vh] bg-[#bc5090]/10 rounded-full blur-[160px] hero-glow pointer-events-none" />
      
      <div className="container mx-auto px-6 relative z-10 text-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center gap-2 px-5 py-2 rounded-full glass border border-white/10 mb-10"
        >
          <span className="flex h-2 w-2 rounded-full bg-[#ff6361] animate-pulse" />
          <span className="text-sm font-semibold tracking-wider uppercase text-white/40 font-satoshi">The Future of Business Control</span>
        </motion.div>

        <h1 ref={textRef} className="text-[clamp(3.5rem,15vw,12rem)] font-bold font-clash leading-[0.8] tracking-tighter mb-12 uppercase italic">
          <div className="overflow-hidden h-fit py-4">
            <span className="inline-block hero-reveal">Architecting</span>
          </div>
          <div className="overflow-hidden h-fit py-4">
            <span className="inline-block hero-reveal bg-gradient-to-r from-[#bc5090] via-[#ff6361] to-[#ffa600] bg-clip-text text-transparent">Commerce.</span>
          </div>
        </h1>

        <p className="max-w-4xl mx-auto text-xl md:text-3xl text-white/40 font-satoshi leading-tight mb-16 hero-reveal">
          BOS is an immersive neural operating system for elite enterprises. <br />
          <span className="text-white/60">Standardizing global business orchestration through cinematic engineering.</span>
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-8 hero-reveal">
          <button className="group relative px-12 py-6 bg-white text-black font-bold rounded-full overflow-hidden transition-all hover:scale-105 active:scale-95">
            <span className="relative z-10 flex items-center gap-3 text-lg">
              Initialize System <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
            </span>
          </button>
          
          <button className="px-12 py-6 glass border border-white/10 text-white font-bold rounded-full flex items-center gap-3 hover:bg-white/5 transition-all text-lg">
            View Protocol <Zap size={22} className="text-indigo-400" />
          </button>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 opacity-30 animate-bounce">
        <span className="text-[10px] uppercase tracking-[0.4em] font-bold">Scroll to Initiate</span>
        <div className="w-px h-12 bg-gradient-to-b from-white to-transparent" />
      </div>
    </section>
  );
}
