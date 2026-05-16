"use client";

import { motion } from "framer-motion";

const TESTIMONIALS = [
  { name: "Arjun Mehta", company: "TechLogistics", text: "Absolute paradigm shift. We scaled our operations 300% in a month." },
  { name: "Sarah Khan", company: "BloomRetail", text: "The most beautiful interface I've ever interacted with. Pure magic." },
  { name: "David Chen", company: "SwiftCommerce", text: "BOS is the silent engine that powers our entire global supply chain." },
  { name: "Priya Gupta", company: "NovaSaaS", text: "Engineering perfection. The security and latency are unmatched." }
];

export function Testimonials() {
  return (
    <section className="py-60 bg-black overflow-hidden">
      <div className="container mx-auto px-6 mb-32 text-center">
        <h2 className="text-6xl md:text-9xl font-bold font-clash uppercase tracking-tighter">
          ELITE <br /> <span className="text-white/20">TESTIMONY.</span>
        </h2>
      </div>

      <div className="flex whitespace-nowrap animate-marquee-slow py-20">
        {[1, 2].map((group) => (
          <div key={group} className="flex gap-12 px-6">
            {TESTIMONIALS.map((t, i) => (
              <div 
                key={i}
                className="w-[500px] p-16 rounded-[4rem] glass border border-white/5 flex flex-col justify-between"
              >
                <p className="text-3xl text-white/60 font-satoshi italic leading-relaxed mb-12">
                  "{t.text}"
                </p>
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center font-bold text-2xl">
                    {t.name[0]}
                  </div>
                  <div>
                    <div className="text-2xl font-bold font-clash uppercase">{t.name}</div>
                    <div className="text-indigo-400 font-bold tracking-widest text-xs uppercase">{t.company}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      <style jsx>{`
        @keyframes marquee-slow {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee-slow {
          animation: marquee-slow 60s linear infinite;
        }
      `}</style>
    </section>
  );
}
