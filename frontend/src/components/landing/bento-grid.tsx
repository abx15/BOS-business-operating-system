"use client";

import { motion } from "framer-motion";
import { Zap, ShieldCheck, Cpu, Smartphone, Bell, Clock } from "lucide-react";

const BENTO_ITEMS = [
  {
    title: "Real-time Sync",
    desc: "Global state synchronization with sub-50ms latency across 140+ neural nodes.",
    icon: <Zap className="text-yellow-400" />,
    className: "md:col-span-2 md:row-span-1",
    color: "rgba(250, 204, 21, 0.1)"
  },
  {
    title: "Encrypted Core",
    desc: "Military-grade AES-256 encryption ensuring absolute data sovereignty for your enterprise.",
    icon: <ShieldCheck className="text-green-400" />,
    className: "md:col-span-1 md:row-span-2",
    color: "rgba(74, 222, 128, 0.1)"
  },
  {
    title: "Edge Engine",
    desc: "High-frequency processing at the edge of the network for instant decision making.",
    icon: <Cpu className="text-blue-400" />,
    className: "md:col-span-1 md:row-span-1",
    color: "rgba(96, 165, 250, 0.1)"
  },
  {
    title: "Unified App",
    desc: "Native-grade experience on mobile, desktop, and embedded systems.",
    icon: <Smartphone className="text-purple-400" />,
    className: "md:col-span-1 md:row-span-1",
    color: "rgba(192, 132, 252, 0.1)"
  },
  {
    title: "Neural Alerts",
    desc: "Advanced AI-driven anomaly detection protecting your business 24/7/365.",
    icon: <Bell className="text-pink-400" />,
    className: "md:col-span-2 md:row-span-1",
    color: "rgba(244, 114, 182, 0.1)"
  }
];

export function BentoGrid() {
  return (
    <section id="bento" className="py-40 bg-black container mx-auto px-6">
      <div className="mb-24">
        <h2 className="text-5xl md:text-7xl font-bold font-clash mb-6 uppercase italic tracking-tighter">
          High Performance <br /> <span className="text-white/20">Standard.</span>
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[250px]">
        {BENTO_ITEMS.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            whileHover={{ y: -5 }}
            className={`group relative p-10 rounded-[3rem] border border-white/5 bg-white/[0.01] overflow-hidden flex flex-col justify-between ${item.className}`}
          >
            <div 
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
              style={{ background: `radial-gradient(circle at 0% 0%, ${item.color}, transparent 70%)` }}
            />
            
            <div className="relative z-10 w-12 h-12 rounded-2xl glass flex items-center justify-center mb-6">
              {item.icon}
            </div>

            <div className="relative z-10">
              <h3 className="text-2xl font-bold font-clash mb-2 uppercase italic">{item.title}</h3>
              <p className="text-white/40 font-satoshi leading-relaxed">{item.desc}</p>
            </div>

            {/* Micro interaction lines */}
            <div className="absolute top-0 right-0 w-px h-full bg-gradient-to-b from-transparent via-white/5 to-transparent group-hover:via-white/20 transition-all duration-700" />
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/5 to-transparent group-hover:via-white/20 transition-all duration-700" />
          </motion.div>
        ))}
      </div>
    </section>
  );
}
