"use client";

import { motion } from "framer-motion";
import { Gift, Sparkles, UserCheck } from "lucide-react";

export default function BonusesSection() {
  const bonuses = [
    {
      icon: Gift,
      title: "Hook generator",
      description: "Instantly generate scroll-stopping hooks tailored to your niche."
    },
    {
      icon: Sparkles,
      title: "Template generator",
      description: "Access high-converting content templates for any campaign."
    },
    {
      icon: UserCheck,
      title: "Personalized AI model + content template generator",
      description: "Learns your brand voice for truly unique content."
    }
  ];
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
          Bonuses
        </motion.h3>
        <div className="grid md:grid-cols-3 gap-8">
          {bonuses.map((bonus, i) => (
            <motion.div
              key={bonus.title}
              className="bg-[#18181b] rounded-xl p-8 flex flex-col items-center shadow-xl"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <bonus.icon className="h-10 w-10 text-[#5afcc0] mb-4" />
              <div className="font-semibold text-lg mb-2 text-white">{bonus.title}</div>
              <div className="text-neutral-400 text-center">{bonus.description}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
