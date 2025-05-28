'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Search, BarChart3, RefreshCw, TargetIcon, LineChart } from 'lucide-react';

export default function ViralBlitzCycle() {
  const steps = [
    {
      icon: Search,
      title: "Scan",
      description: "AI analyzes your niche, products, and competitors to identify winning strategies."
    },
    {
      icon: TargetIcon,
      title: 'Blitz',
      description: 'Precision-scheduled content posts when your audience is most likely to buy.'
    },
    {
      icon: LineChart,
      title: 'Cycle',
      description: 'Continuous AI optimization learns from performance data to improve future content.'
    },
    {
      icon: BarChart3,
      title: 'Accelerate',
      description: 'Scale successful strategies across platforms to maximize your sales revenue.'
    }
  ];

  return (
    <section id="how-it-works" className="py-16 md:py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.span 
            className="inline-block text-sm font-semibold text-[#007BFF] uppercase tracking-wider mb-3"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            How It Works
          </motion.span>
          
          <motion.h2 
            className="text-3xl md:text-4xl font-bold text-[#333333] mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            The 4-Step Sales Amplification System
          </motion.h2>
          
          <motion.p 
            className="text-xl text-[#444444] max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Our proprietary system that turns your short-form content into a consistent sales engine
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-4">
          {steps.map((step, index) => (
            <motion.div 
              key={step.title}
              className="bg-white p-6 rounded-xl border border-gray-200 shadow-md relative"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 * index }}
              whileHover={{ y: -5 }}
            >
              {/* Step number */}
              <div className="absolute -top-4 -left-4 w-8 h-8 bg-[#FF7F50] rounded-full flex items-center justify-center text-white font-bold text-sm">
                {index + 1}
              </div>
              
              {/* Connect with arrow if not last item */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute -right-4 top-1/2 transform -translate-y-1/2 z-10">
                  <ArrowRight className="w-6 h-6 text-[#007BFF]" />
                </div>
              )}
              
              <div className="mb-4 w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <step.icon className="h-6 w-6 text-[#007BFF]" />
              </div>
              
              <h3 className="text-xl font-bold text-[#333333] mb-2">{step.title}</h3>
              <p className="text-[#444444]">{step.description}</p>
            </motion.div>
          ))}
        </div>
        
        <motion.div 
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <p className="text-neutral-400 text-lg max-w-2xl mx-auto">
            <span className="font-semibold text-white">The secret to consistent revenue</span> is not creating more content—it's optimizing what you create for actual sales conversion.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
