"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import Image from "next/image";

export function IntroShowcase() {
  const containerRef = useRef(null);
  const triggerRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: triggerRef.current,
          start: "top top",
          end: "+=300%",
          scrub: 1,
          pin: true,
          anticipatePin: 1,
        }
      });

      tl.to(".intro-bg", { scale: 1.5, opacity: 0.2, duration: 1 })
        .to(".intro-text-1", { y: -50, opacity: 1, duration: 0.5 }, "-=0.5")
        .to(".intro-text-1", { y: -100, opacity: 0, duration: 0.5 })
        .to(".intro-text-2", { y: -50, opacity: 1, duration: 0.5 })
        .to(".intro-text-2", { y: -100, opacity: 0, duration: 0.5 })
        .to(".intro-text-3", { scale: 1.2, opacity: 1, duration: 0.5 })
        .to(".intro-card", { y: 0, opacity: 1, stagger: 0.2, duration: 1 });

    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="bg-black">
      <div ref={triggerRef} className="h-screen flex items-center justify-center relative overflow-hidden">
        {/* Background Layer */}
        <div className="intro-bg absolute inset-0 bg-gradient-to-b from-indigo-900/20 to-black opacity-0 transition-opacity duration-1000" />
        
        {/* Text Storytelling */}
        <div className="relative z-10 text-center px-6">
          <h2 className="intro-text-1 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-5xl md:text-8xl font-bold font-clash opacity-0">
            A New Paradigm.
          </h2>
          <h2 className="intro-text-2 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-5xl md:text-8xl font-bold font-clash opacity-0">
            Beyond Boundaries.
          </h2>
          <h2 className="intro-text-3 text-6xl md:text-[10rem] font-bold font-clash opacity-0 leading-none">
            ULTRAFLUID.
          </h2>
        </div>

        {/* Floating Cards Reveal */}
        <div className="absolute inset-0 flex items-center justify-center gap-12 px-6 mt-32">
          {[
            { id: "100", title: "Neural Sync", img: "/assets/images/feature-network.png" },
            { id: "200", title: "Quantum Ops", img: "/assets/images/feature-analytics.png" },
            { id: "300", title: "Edge Control", img: "/assets/images/feature-inventory.png" }
          ].map((item, i) => (
            <div 
              key={i}
              className="intro-card w-full max-w-sm aspect-[3/4.5] glass rounded-[3rem] border border-white/10 overflow-hidden flex flex-col opacity-0 translate-y-20 group"
            >
              <div className="relative h-2/3 w-full overflow-hidden">
                <Image src={item.img} alt={item.title} fill className="object-cover group-hover:scale-110 transition-transform duration-[2s] opacity-40" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
              </div>
              <div className="p-10 space-y-4">
                <div className="h-1 w-12 bg-indigo-500 mb-6" />
                <h3 className="text-3xl font-bold font-clash italic uppercase tracking-tighter">Protocol {item.id}</h3>
                <p className="text-white/40 text-lg font-satoshi leading-tight">Standardized synchronization across distributed neural networks.</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
