"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";

const STEPS = [
  {
    title: "Initialization",
    desc: "Deploy isolated company environments with zero-latency orchestration.",
    time: "0.5s"
  },
  {
    title: "Integration",
    desc: "Seamlessly map inventory and staff hierarchies into the unified mesh.",
    time: "2.0s"
  },
  {
    title: "Operation",
    desc: "High-frequency billing and analytics processing at the edge.",
    time: "Real-time"
  },
  {
    title: "Optimization",
    desc: "System-wide insights derived from multi-dimensional data analysis.",
    time: "Continuous"
  }
];

export function Workflow() {
  const containerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".workflow-item", {
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top center",
          end: "bottom center",
          scrub: 1,
        },
        x: -50,
        opacity: 0.1,
        stagger: 0.5,
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="py-40 bg-black container mx-auto px-6 relative">
      {/* Vertical Progress Line */}
      <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/5 hidden md:block" />

      <div className="text-center mb-32">
        <h2 className="text-5xl md:text-8xl font-bold font-clash uppercase italic tracking-tighter">
          THE <br /> <span className="text-indigo-500">WORKFLOW.</span>
        </h2>
      </div>

      <div className="space-y-40">
        {STEPS.map((step, i) => (
          <div key={i} className={`workflow-item flex flex-col md:flex-row items-center gap-12 ${i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"}`}>
            <div className="flex-1 text-center md:text-left">
               <div className={`text-[12rem] font-bold font-clash leading-none opacity-5 absolute -translate-y-1/2 left-0 right-0 md:static ${i % 2 === 0 ? "md:text-right" : "md:text-left"}`}>
                 0{i + 1}
               </div>
            </div>
            
            <div className="w-4 h-4 rounded-full bg-indigo-500 relative z-10 shadow-[0_0_20px_rgba(99,102,241,0.5)] hidden md:block" />
            
            <div className="flex-1 space-y-6">
              <div className="inline-block px-4 py-1 rounded-full glass border border-white/10 text-xs font-bold uppercase tracking-widest text-indigo-400">
                Latency: {step.time}
              </div>
              <h3 className="text-5xl md:text-7xl font-bold font-clash uppercase tracking-tighter italic">
                {step.title}
              </h3>
              <p className="text-xl md:text-2xl text-white/30 font-satoshi leading-relaxed max-w-lg">
                {step.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
