"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export function CTAFinal() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black">
      {/* Cinematic Background Image */}
      <div className="absolute inset-0 z-0">
        <Image 
          src="/assets/images/cta-bg.png" 
          alt="CTA Background" 
          fill 
          className="object-cover opacity-40 mix-blend-screen"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black z-10" />
      </div>
      
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100vw] h-[100vh] bg-[#bc5090]/10 rounded-full blur-[200px] pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="space-y-12"
        >
          <h2 className="text-6xl md:text-[15rem] font-bold font-clash leading-none tracking-tighter uppercase italic">
            READY TO <br /> <span className="gradient-text bg-gradient-to-r from-[#bc5090] via-[#ff6361] to-[#ffa600] bg-clip-text text-transparent">ASCEND?</span>
          </h2>
          
          <p className="text-2xl md:text-4xl text-white/40 font-satoshi max-w-4xl mx-auto leading-tight">
            The era of legacy business software is over. <br /> 
            Join the elite circle of data-driven enterprises.
          </p>

          <div className="flex flex-col md:flex-row items-center justify-center gap-12 pt-12">
            <Link href="/login" className="group relative px-20 py-8 bg-white text-black font-black rounded-full text-2xl transition-all hover:scale-110 active:scale-95 shadow-[0_0_50px_rgba(255,255,255,0.2)]">
              INITIATE ACCESS
              <ArrowRight className="inline-block ml-4 group-hover:translate-x-2 transition-transform" size={32} />
            </Link>
            
            <button className="text-2xl font-bold font-clash uppercase tracking-widest text-white/40 hover:text-white transition-colors underline underline-offset-8">
              Protocol Documentation
            </button>
          </div>
        </motion.div>
      </div>

      {/* Decorative footer text */}
      <div className="absolute bottom-12 left-0 right-0 flex justify-between px-12 text-[10px] font-bold uppercase tracking-[0.5em] text-white/10 pointer-events-none">
        <span>EST. 2026 // BOS PROTOCOL</span>
        <span>VERSION 2.0.4 // STABLE</span>
      </div>
    </section>
  );
}
