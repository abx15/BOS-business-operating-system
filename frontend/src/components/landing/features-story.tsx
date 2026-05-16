"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import { Receipt, Box, BarChart3, Globe } from "lucide-react";
import Image from "next/image";

const CARDS = [
  {
    title: "Cinematic Billing",
    desc: "Every transaction is a choreographed movement of data. Precision, speed, and elegance in every invoice generated.",
    icon: <Receipt className="w-12 h-12" />,
    color: "#8a508f",
    image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?q=80&w=2011"
  },
  {
    title: "Neural Inventory",
    desc: "Predictive stock analysis that thinks ahead. Real-time mapping of global logistics with zero latency.",
    icon: <Box className="w-12 h-12" />,
    color: "#bc5090",
    image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=2070"
  },
  {
    title: "Quantum Analytics",
    desc: "Visualize the invisible. High-dimensional data simplified into actionable wisdom through neural processing.",
    icon: <BarChart3 className="w-12 h-12" />,
    color: "#ff6361",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070"
  },
  {
    title: "Global Mesh",
    desc: "Scale without friction. Your business infrastructure distributed across the planet in a unified neural network.",
    icon: <Globe className="w-12 h-12" />,
    color: "#ff8531",
    image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc48?q=80&w=2070"
  }
];

export function FeaturesStory() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const horizontalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const pin = gsap.to(horizontalRef.current, {
        x: () => -(horizontalRef.current!.scrollWidth - window.innerWidth),
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          pin: true,
          scrub: 1,
          start: "top top",
          end: () => `+=${horizontalRef.current!.scrollWidth}`,
          invalidateOnRefresh: true,
        }
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section id="modules" ref={sectionRef} className="bg-black overflow-hidden">
      <div ref={horizontalRef} className="flex h-screen w-fit items-center px-[10vw] gap-32">
        {/* Section Header */}
        <div className="flex-shrink-0 w-[40vw]">
          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full glass border border-white/10 mb-8">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Neural Modules</span>
          </div>
          <h2 className="text-7xl md:text-9xl font-bold font-clash leading-[0.8] tracking-tighter mb-8 italic uppercase">
            CORE <br /> <span className="text-white/20">SYSTEM.</span>
          </h2>
          <p className="text-2xl text-white/40 font-satoshi max-w-md leading-relaxed">
            Four pillars of absolute control. Engineered for the next century of business orchestration.
          </p>
        </div>

        {/* Feature Cards */}
        {CARDS.map((card, i) => (
          <div 
            key={i}
            className="flex-shrink-0 w-[85vw] md:w-[70vw] h-[80vh] glass rounded-[4rem] border border-white/5 overflow-hidden flex flex-col md:flex-row group hover:bg-white/[0.02] transition-colors duration-700"
          >
            {/* Image side */}
            <div className="w-full md:w-1/2 h-1/2 md:h-full relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-black to-transparent z-10 hidden md:block" />
              <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent z-10 md:hidden" />
              <Image 
                src={card.image} 
                alt={card.title} 
                fill 
                className="object-cover group-hover:scale-110 transition-transform duration-[2s] opacity-60"
              />
            </div>

            {/* Content side */}
            <div className="w-full md:w-1/2 h-1/2 md:h-full p-12 md:p-20 flex flex-col justify-between relative z-20">
              <div 
                className="w-20 h-20 rounded-2xl flex items-center justify-center mb-8 glass border border-white/10 shadow-2xl"
                style={{ color: card.color }}
              >
                {card.icon}
              </div>
              
              <div className="space-y-8">
                <h3 className="text-5xl md:text-8xl font-bold font-clash tracking-tight group-hover:translate-x-4 transition-transform duration-700 leading-none">
                  {card.title}
                </h3>
                <p className="text-xl md:text-3xl text-white/30 font-satoshi leading-relaxed max-w-xl">
                  {card.desc}
                </p>
              </div>

              <div className="flex items-center gap-4 text-white/20 font-bold uppercase tracking-[0.4em] text-xs">
                <div className="h-px w-20 bg-white/10" />
                <span>Protocol {i + 1} // Online</span>
              </div>
            </div>
          </div>
        ))}

        {/* Ending Spacer */}
        <div className="flex-shrink-0 w-[20vw]" />
      </div>
    </section>
  );
}
