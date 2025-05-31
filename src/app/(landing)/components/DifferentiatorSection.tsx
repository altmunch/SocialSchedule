"use client";

import { motion } from "framer-motion";

export default function DifferentiatorSection() {
  return (
    <section className="relative py-16 md:py-24 bg-black text-white overflow-hidden">
      <div className="max-w-4xl mx-auto px-6 sm:px-12 lg:px-16 relative z-10 text-center">
        <motion.h3
          className="text-2xl md:text-4xl font-bold mb-6 text-[#5afcc0]"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          An end-to-end solution covering the complete content lifecycle
        </motion.h3>
        <motion.p
          className="text-xl text-neutral-400 mb-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          Research → content ideas + hook → automating posting → sales<br/>
          <span className="text-[#5afcc0] font-bold">$3500 value for $279 annually (&lt; less than 10%)</span>
        </motion.p>
      </div>
    </section>
  );
}
