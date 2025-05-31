"use client";

import { motion } from "framer-motion";
import { BarChart2, TrendingUp } from "lucide-react";

export default function EnterpriseSection() {
  return (
    <section className="relative py-16 md:py-24 bg-black text-white overflow-hidden">
      <div className="max-w-5xl mx-auto px-6 sm:px-12 lg:px-16 relative z-10">
        <motion.h3
          className="text-2xl md:text-4xl font-bold mb-10 text-[#5afcc0] text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          Social Schedule & Built for Enterprises
        </motion.h3>
        <div className="grid md:grid-cols-3 gap-8 text-center">
          <motion.div className="bg-[#18181b] rounded-xl p-8 shadow-xl flex flex-col items-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <BarChart2 className="h-10 w-10 text-[#5afcc0] mb-4" />
            <div className="font-bold text-lg mb-2">150% boost in organic reach/month free if 2 of 3 no results. ($30k)</div>
          </motion.div>
          <motion.div className="bg-[#18181b] rounded-xl p-8 shadow-xl flex flex-col items-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <TrendingUp className="h-10 w-10 text-[#5afcc0] mb-4" />
            <div className="font-bold text-lg mb-2">2 – 5X revenue/month</div>
          </motion.div>
          <motion.div className="bg-[#18181b] rounded-xl p-8 shadow-xl flex flex-col items-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <BarChart2 className="h-10 w-10 text-[#5afcc0] mb-4" />
            <div className="font-bold text-lg mb-2">1000+ hours saved/year</div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
