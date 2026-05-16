"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export function Footer() {
  return (
    <footer className="py-40 bg-black border-t border-white/5">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-32 mb-40">
          <div>
            <div className="flex items-center gap-3 mb-12">
              <div className="w-12 h-12 rounded-xl bg-indigo-500 flex items-center justify-center font-black text-2xl">B</div>
              <span className="text-4xl font-black font-clash uppercase tracking-tighter">BOS</span>
            </div>
            <p className="text-3xl text-white/30 font-satoshi max-w-lg leading-tight">
              We are building the future of autonomous business infrastructure.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-12">
            {[
              { title: "Protocol", links: ["Specifications", "Latency", "Uptime", "Security"] },
              { title: "System", links: ["Modules", "API", "Nodes", "CLI"] },
              { title: "Network", links: ["Status", "Region", "Scale", "Trust"] }
            ].map(col => (
              <div key={col.title}>
                <h4 className="text-xs font-black uppercase tracking-[0.4em] text-indigo-400 mb-8">{col.title}</h4>
                <ul className="space-y-6">
                  {col.links.map(link => (
                    <li key={link} className="text-lg text-white/20 font-bold font-clash hover:text-white transition-colors cursor-pointer uppercase italic">
                      {link}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-end gap-12 pt-20 border-t border-white/5">
          <div className="space-y-4">
             <div className="text-[12vw] font-black font-clash leading-none opacity-5 pointer-events-none uppercase italic select-none">
               FUTUREPROOF.
             </div>
             <p className="text-white/10 text-xs font-bold uppercase tracking-[1em]">© 2026 // BOS PROTOCOL</p>
          </div>
          
          <div className="flex gap-12 pb-8">
             {["Twitter", "GitHub", "Discord"].map(s => (
               <span key={s} className="text-white/30 hover:text-white transition-colors cursor-pointer text-sm font-bold uppercase tracking-widest">{s}</span>
             ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
