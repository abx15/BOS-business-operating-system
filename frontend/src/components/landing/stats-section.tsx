"use client";

import { motion } from "framer-motion";

export function StatsSection() {
  const stats = [
    { label: "Neural Throughput", value: "1.2 TB/s", color: "#ff6361" },
    { label: "Global Presence", value: "142 Nodes", color: "#ff8531" },
    { label: "Service Uptime", value: "99.999%", color: "#ffa600" },
    { label: "Operational Speed", value: "240x", color: "#ffd380" },
  ];

  return (
    <section className="py-40 border-y border-white/5 bg-white/[0.01]">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-20">
          {stats.map((stat, i) => (
            <div key={i} className="space-y-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-6xl md:text-8xl font-bold font-clash leading-none tracking-tighter"
                style={{ color: stat.color }}
              >
                {stat.value}
              </motion.div>
              <div className="text-white/20 font-bold uppercase tracking-[0.4em] text-xs">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
