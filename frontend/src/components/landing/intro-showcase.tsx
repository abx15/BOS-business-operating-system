"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import Image from "next/image";

export function IntroShowcase() {
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

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
        {/* Background Layer with Cinematic Image */}
        <div className="intro-bg absolute inset-0 transition-all duration-1000">
          <Image 
            src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072" 
            alt="Neural Network Architecture" 
            fill 
            priority
            className="object-cover opacity-20 scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black" />
        </div>
        
        {/* Text Storytelling */}
        <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
          <div className="intro-text-1 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full opacity-0">
            <h2 className="text-5xl md:text-9xl font-bold font-clash leading-none tracking-tighter italic uppercase">
              A New <span className="text-[#ff6361]">Paradigm.</span>
            </h2>
            <p className="mt-6 text-xl md:text-3xl text-white/40 font-satoshi">Rewriting the rules of enterprise scalability.</p>
          </div>

          <div className="intro-text-2 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full opacity-0">
            <h2 className="text-5xl md:text-9xl font-bold font-clash leading-none tracking-tighter italic uppercase">
              Beyond <span className="text-[#ffa600]">Boundaries.</span>
            </h2>
            <p className="mt-6 text-xl md:text-3xl text-white/40 font-satoshi">Global synchronization with zero-latency overhead.</p>
          </div>

          <div className="intro-text-3 opacity-0">
            <h2 className="text-7xl md:text-[14rem] font-bold font-clash leading-[0.7] tracking-tighter italic uppercase">
              ULTRA<br/><span className="text-white/10">FLUID.</span>
            </h2>
            <p className="mt-10 text-2xl md:text-4xl text-white/40 font-satoshi max-w-2xl mx-auto">The world's first friction-less operating system for the modern age.</p>
          </div>
        </div>

        {/* Floating Cards Reveal */}
        <div className="absolute inset-0 flex items-center justify-center gap-12 px-10 mt-40">
          {[
            { 
              id: "CORE-01", 
              title: "Neural Sync", 
              img: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=2070",
              desc: "Instantaneous state propagation across 140+ edge locations."
            },
            { 
              id: "CORE-02", 
              title: "Quantum Secure", 
              img: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070",
              desc: "Multi-layered cryptographic shields for absolute data sovereignty."
            },
            { 
              id: "CORE-03", 
              title: "Edge Engine", 
              img: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=2070",
              desc: "High-frequency processing delivering sub-ms response times."
            }
          ].map((item, i) => (
            <div 
              key={i}
              className="intro-card w-full max-w-md aspect-[3/4.5] glass rounded-[4rem] border border-white/5 overflow-hidden flex flex-col opacity-0 translate-y-40 group hover:bg-white/[0.03] transition-all duration-700"
            >
              <div className="relative h-2/3 w-full overflow-hidden">
                <Image src={item.img} alt={item.title} fill className="object-cover group-hover:scale-110 transition-transform duration-[3s] opacity-50 grayscale hover:grayscale-0 transition-all" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
              </div>
              <div className="p-12 space-y-6">
                <div className="h-1 w-16 bg-[#bc5090] mb-8" />
                <h3 className="text-4xl font-bold font-clash italic uppercase tracking-tighter leading-none">{item.title}</h3>
                <p className="text-white/30 text-xl font-satoshi leading-tight">{item.desc}</p>
                <div className="pt-4 text-[10px] font-black tracking-[0.5em] text-white/10 uppercase">{item.id} // ACTIVE</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
