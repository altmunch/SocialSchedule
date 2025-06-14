'use client';

import { motion } from 'framer-motion';
import { BarChart3, TargetIcon, LineChart, Search } from 'lucide-react';

interface ViralBlitzCycleProps {
  onGetStarted?: () => void;
}

export default function ViralBlitzCycle({ onGetStarted }: ViralBlitzCycleProps) {
  const steps = [
    {
      icon: BarChart3,
      title: 'Accelerate',
      description: 'Scale successful strategies across platforms to maximize your sales revenue.'
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
      icon: Search,
      title: "Scan",
      description: "AI analyzes your niche, products, and competitors to identify winning strategies."
    }
  ];

  return (
    <section className="relative py-24 md:py-32 bg-black text-white overflow-hidden" id="viral-blitz-cycle">
      {/* Background elements */}
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-black via-black to-[#0A0A0A]" />
      
      <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-16 relative z-10">
        {/* Section header */}
        <motion.div 
          className="text-center mb-24"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="relative overflow-hidden h-[60px] md:h-[72px] mb-5">
            <motion.h2 
              className="text-4xl md:text-5xl font-bold text-[#8D5AFF] absolute w-full"
              initial={{ x: -100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -100, opacity: 0 }}
              transition={{ duration: 0.6 }}
            >
              The Viral Blitz Cycle
            </motion.h2>
            <motion.h2 
              className="text-4xl md:text-5xl font-bold text-[#8D5AFF] absolute w-full"
              initial={{ x: 0, opacity: 1 }}
              animate={{ x: 100, opacity: 0 }}
              transition={{ duration: 0.6 }}
            >
              How It Works
            </motion.h2>
          </div>
          <p className="text-xl text-white max-w-2xl mx-auto">
            Transform your content creation process with our AI-powered automation system
          </p>
        </motion.div>
        
        {/* Feature items */}
        <div className="space-y-32">
          {steps.map((step, index) => (
            <motion.div 
                key={step.title}
                id={step.title.toLowerCase() === 'accelerate' ? 'accelerate' : step.title.toLowerCase() === 'blitz' ? 'blitz' : step.title.toLowerCase() === 'cycle' ? 'cycle' : 'scan'}
                className="group p-6 rounded-xl border border-storm-light/10 bg-storm-light/5 backdrop-blur-sm relative overflow-hidden hover:border-blitz-blue/50 transition-all duration-300 shadow-lg"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <div className="mb-4 w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center text-white text-2xl font-bold shadow-md">
                {step.icon && <step.icon className="w-6 h-6 text-white" />}
              </div>
              <h3 className="text-3xl font-bold text-white mb-4">{step.title}</h3>
              <p className="text-white/70 text-lg leading-relaxed">{step.description}</p>
            </motion.div>
          ))}
        </div>

        {/* CTA Button */}
        <motion.div 
          className="mt-24 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <motion.button 
            onClick={onGetStarted}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-8 py-4 rounded-lg font-bold text-lg shadow-lg shadow-purple-500/30 transition-all duration-300"
            whileHover={{ scale: 1.03, boxShadow: '0 10px 25px -5px rgba(168, 85, 247, 0.4)' }}
            whileTap={{ scale: 0.98 }}
          >
            Start Selling Smarter with AI
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
} 