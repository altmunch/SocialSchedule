'use client';

import { motion } from 'framer-motion';
import { Check, Zap, Target, TrendingUp, Clock } from 'lucide-react';

// Sub-components for better maintainability
import FeatureItem from './FeatureItem';

interface FeatureSectionProps {
  onGetStarted?: () => void;
}

export default function FeaturesSection({ onGetStarted }: FeatureSectionProps) {
  // Feature data
  const features = [
    {
      icon: Zap,
      title: "Revenue-Focused AI",
      description: "Our AI doesn't just create content—it creates content that converts. Every post is optimized for maximum sales potential, not just engagement.",
      gradient: "from-[#8D5AFF] to-[#5afcc0]"
    },
    {
      icon: Target,
      title: "Smart Audience Targeting",
      description: "Reach the right customers at the right time. Our AI analyzes buying patterns to target users most likely to purchase your products.",
      gradient: "from-[#5afcc0] to-blue-500"
    },
    {
      icon: TrendingUp,
      title: "Performance Analytics",
      description: "Track what matters: sales, conversions, and ROI. Get detailed insights into which content drives the most revenue for your business.",
      gradient: "from-blue-500 to-purple-500"
    },
    {
      icon: Clock,
      title: "Automated Sales Funnel",
      description: "From awareness to purchase, our AI creates a complete content funnel that guides customers through your sales process automatically.",
      gradient: "from-purple-500 to-[#8D5AFF]"
    }
  ];

  return (
    <section className="relative py-24 md:py-32 bg-black text-white overflow-hidden" id="features">
      {/* Background elements */}
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-black via-black to-[#0A0A0A]" />
      
      <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-16 relative z-10">
        {/* Section header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-6xl font-bold mb-6 text-white">
            Features That <span className="text-[#5afcc0]">Generate Revenue</span>
          </h2>
          <p className="text-xl text-white/80 max-w-3xl mx-auto">
            Every feature is designed with one goal: turning your social media presence into a profitable business.
          </p>
        </motion.div>
        
        {/* Feature items */}
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              className="bg-gradient-to-br from-neutral-900/50 to-neutral-800/50 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:border-white/20 transition-all duration-300"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
              <div className="flex items-start space-x-4">
                <div className={`p-3 rounded-xl bg-gradient-to-r ${feature.gradient} bg-opacity-20 flex-shrink-0`}>
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                  <p className="text-white/80 leading-relaxed">{feature.description}</p>
                </div>
              </div>
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
            className="bg-gradient-to-r from-[#8b5cf6] to-[#a855f7] hover:from-[#8b5cf6]/90 hover:to-[#a855f7]/90 text-white px-8 py-4 rounded-lg font-bold text-lg shadow-lg shadow-purple-500/30 transition-all duration-300"
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
