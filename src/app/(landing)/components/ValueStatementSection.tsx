"use client";

import { motion } from "framer-motion";

export default function ValueStatementSection() {
  return (
    <section className="relative py-16 md:py-24 bg-black text-white overflow-hidden">
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-black via-black to-[#0A0A0A]" />
      <div className="max-w-4xl mx-auto px-6 sm:px-12 lg:px-16 relative z-10 text-center">
        <motion.h2
          className="text-3xl md:text-5xl font-bold mb-6 text-[#5afcc0]"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          An AI tool that doesn’t just automate shorts,<br />it makes them <span className="text-white">SELL</span>.
        </motion.h2>
      </div>
    </section>
  );
}
