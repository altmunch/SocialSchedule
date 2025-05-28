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
      title: 'Content Optimizing Engine ("Accelerate")',
      description: 'AI optimizes audio, captions, hashtags, and formatting for every platform and product to outperform competitors.'
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
    <section className="py-16 md:py-24 bg-gradient-to-b from-storm-dark to-storm-darker" id="features">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.span 
            className="inline-block text-sm font-semibold text-blitz-yellow uppercase tracking-wider mb-3"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            Key Differentiators
          </motion.span>
          
          <motion.h2 
            className="text-3xl md:text-4xl font-bold text-lightning-DEFAULT mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Purpose-Built Features for E-commerce Sellers
          </motion.h2>
          
          <motion.p 
            className="text-xl text-lightning-dim/80 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Our platform is specifically designed for sellers who want to convert more viewers into buyers,
            not just accumulate likes and comments.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div 
              key={feature.title}
              className="group p-6 rounded-xl border border-storm-light/10 bg-storm-light/5 backdrop-blur-sm hover:border-blitz-blue/50 transition-all duration-300 shadow-lg hover:shadow-blitz-blue/10"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 * index }}
              whileHover={{ y: -8, boxShadow: '0 10px 25px -5px rgba(0, 119, 255, 0.1)' }}
            >
              <div className="w-12 h-12 bg-gradient-to-br from-blitz-blue/10 to-blitz-purple/10 rounded-lg flex items-center justify-center mb-4 group-hover:shadow-lg group-hover:shadow-blitz-blue/20 transition-all">
                <feature.icon className="h-6 w-6 text-blitz-blue" />
              </div>
              <h3 className="text-xl font-bold text-lightning-DEFAULT mb-3 group-hover:text-blitz-blue transition-colors">
                {feature.title}
              </h3>
              <p className="text-lightning-dim/80 group-hover:text-lightning-dim transition-colors">
                {feature.description}
              </p>
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
          <motion.button 
            onClick={onGetStarted}
            className="bg-gradient-to-r from-blitz-blue to-blitz-purple hover:from-blitz-blue/90 hover:to-blitz-purple/90 text-lightning-DEFAULT px-8 py-3.5 rounded-md font-semibold text-lg shadow-lg shadow-blitz-blue/20 transition-all duration-300"
            whileHover={{ scale: 1.03, boxShadow: '0 10px 25px -5px rgba(0, 119, 255, 0.3)' }}
            whileTap={{ scale: 0.98 }}
          >
            Start Selling Smarter with AI
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}
