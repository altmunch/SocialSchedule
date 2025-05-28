'use client';

import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle } from 'lucide-react';

interface FinalCTASectionProps {
  onGetStarted: () => void;
}

export default function FinalCTASection({ onGetStarted }: FinalCTASectionProps) {
  const benefits = [
    "Start seeing results in as little as 10 days",
    "AI-optimized posting schedule for maximum sales",
    "10-day results guarantee - no risk to try",
    "Complete platform access with all features"
  ];

  return (
    <section className="py-16 md:py-24 bg-neutral-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          <motion.h2 
            className="text-3xl md:text-4xl font-bold mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            Ready to Transform Your Content Into Revenue?
          </motion.h2>
          
          <motion.p 
            className="text-xl text-neutral-400 mb-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Join over 10,000 creators who are already generating real income from their short-form content
          </motion.p>
          
          <motion.div 
            className="grid md:grid-cols-2 gap-4 max-w-2xl mx-auto mb-10"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center text-left">
                <CheckCircle className="h-5 w-5 text-indigo-400 mr-3 flex-shrink-0" />
                <span className="text-neutral-300">{benefit}</span>
              </div>
            ))}
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="inline-block"
          >
            <button
              onClick={onGetStarted}
              className="bg-neutral-800 hover:bg-neutral-700 text-white px-12 py-6 rounded-md text-xl font-bold border border-neutral-700 flex items-center"
            >
              Get Started Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </button>
          </motion.div>
          
          <motion.p 
            className="mt-6 text-sm text-neutral-500"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            No credit card required to start. 10-day results guarantee.
          </motion.p>
        </div>
      </div>
    </section>
  );
}
