'use client';

import { motion } from 'framer-motion';
import { ChartBar, Clock, TrendingUp, BarChart2, ShoppingCart, Zap, Search, MessageSquare } from 'lucide-react';

interface FeatureSectionProps {
  onGetStarted?: () => void;
}

export default function FeaturesSection({ onGetStarted }: FeatureSectionProps) {
  const features = [
    {
      icon: ChartBar,
      title: "Content Accelerator Optimizing Engine",
      description: "AI optimizes audio, captions, hashtags, and formatting for every platform and product to outperform competitors."
    },
    {
      icon: Clock,
      title: 'Precise Automated Posting ("Blitz")',
      description: 'AI finds your best posting times for maximum reach and sales—even when you are busy.'
    },
    {
      icon: BarChart2,
      title: 'Viral Cycle of Improvements ("Cycle")',
      description: 'AI learns from each post to boost results automatically with continuous upgrades.'
    },
    {
      icon: Search,
      title: 'Comprehensive Field Research ("Scan")',
      description: 'Instantly access the latest marketing strategies in your niche with zero manual research.'
    },
    {
      icon: MessageSquare,
      title: 'Retention-Boosting Templates & Hashtags',
      description: 'Data-driven hashtags and templates tailored to your products that boost retention by 50%.'
    },
    {
      icon: Zap,
      title: 'Custom Brand Voice AI',
      description: 'AI learns and replicates your unique voice and style to build loyalty and stand out from generic content.'
    },
  ];

  return (
    <section className="py-16 md:py-24 bg-white" id="features">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.span 
            className="inline-block text-sm font-semibold text-[#FF7F50] uppercase tracking-wider mb-3"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            Key Differentiators
          </motion.span>
          
          <motion.h2 
            className="text-3xl md:text-4xl font-bold text-[#333333] mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Purpose-Built Features for E-commerce Sellers
          </motion.h2>
          
          <motion.p 
            className="text-xl text-[#444444] max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Our platform is specifically designed for sellers who want to convert more viewers into buyers,
            not just accumulate likes and comments.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div 
              key={feature.title}
              className="bg-white p-6 rounded-xl border border-gray-200 hover:border-[#007BFF] transition-all shadow-sm hover:shadow-md"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 * index }}
              whileHover={{ y: -5 }}
            >
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-4">
                <feature.icon className="h-6 w-6 text-[#007BFF]" />
              </div>
              <h3 className="text-xl font-bold text-[#333333] mb-2">{feature.title}</h3>
              <p className="text-[#444444]">{feature.description}</p>
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
          <button 
            onClick={onGetStarted}
            className="bg-[#007BFF] hover:bg-[#0070E0] text-white px-8 py-3 rounded-md font-semibold text-lg shadow-md transition-all"
          >
            Start Selling Smarter with AI
          </button>
        </motion.div>
      </div>
    </section>
  );
}
