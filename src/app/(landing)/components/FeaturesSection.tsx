'use client';

import { motion } from 'framer-motion';
import { Calendar, Zap, BarChart, Clock, MessageSquare, Users, Bell, Sparkles, Rocket, BarChart2, Clock3, MessageCircle, ShoppingBag, ShoppingCart } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const features = [
  {
    icon: <Calendar className="w-6 h-6" />,
    title: 'Product Launch Scheduler',
    description: 'Coordinate your product drops and flash sales with precision timing for maximum impact.',
    color: 'from-[#0066FF] to-[#7F00FF]',
    highlight: 'Increase launch sales by 40%'
  },
  {
    icon: <ShoppingBag className="w-6 h-6" />,
    title: 'Shoppable Posts',
    description: 'Tag products directly in your posts and stories to drive traffic to your store.',
    color: 'from-[#7F00FF] to-[#00FFCC]',
    highlight: '3x higher conversion rate'
  },
  {
    icon: <BarChart2 className="w-6 h-6" />,
    title: 'Sales Analytics',
    description: 'Track ROI per post and see exactly which content drives the most revenue.',
    color: 'from-[#00FFCC] to-[#0066FF]',
    highlight: 'Data-driven decisions'
  },
  {
    icon: <Zap className="w-6 h-6" />,
    title: 'Flash Sale Automation',
    description: 'Automate time-sensitive promotions with countdown timers and limited-stock alerts.',
    color: 'from-[#0066FF] to-[#7F00FF]',
    highlight: 'Boost urgency & sales'
  },
  {
    icon: <MessageCircle className="w-6 h-6" />,
    title: 'Customer Engagement',
    description: 'Automate responses to common questions and direct messages about your products.',
    color: 'from-[#7F00FF] to-[#00FFCC]',
    highlight: '24/7 customer support'
  },
  {
    icon: <ShoppingCart className="w-6 h-6" />,
    title: 'E-commerce Integrations',
    description: 'Connect with Shopify, WooCommerce, and more to sync inventory and product details.',
    color: 'from-[#00FFCC] to-[#0066FF]',
    highlight: 'Seamless setup'
  }
];

export default function FeaturesSection() {
  return (
    <section id="features" className="relative py-20 md:py-32 overflow-hidden bg-black text-[#F0F0F0]">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-black" />
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-[0.02]" />
      </div>
      <div className="relative z-10">
      
      <div className="max-w-7xl mx-auto px-4">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-block px-4 py-1.5 rounded-full bg-[#0066FF]/10 border border-[#0066FF]/20 text-[#0066FF] text-sm font-medium mb-4">
            Features
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-[#F0F0F0] mb-6">
            Built for <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0066FF] via-[#7F00FF] to-[#00FFCC]">E-commerce Sellers</span>
          </h2>
          <p className="text-[#B0B0B0] max-w-2xl mx-auto text-lg">
            Everything you need to turn social media into your #1 sales channel.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group h-full"
            >
              <div className={`h-full bg-gradient-to-br ${feature.color} p-0.5 rounded-2xl overflow-hidden`}>
                <div className="h-full bg-[#1F1F1F] rounded-[15px] p-6 transition-all duration-300 group-hover:bg-[#2A2A2A]">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-[#F0F0F0] mb-2">{feature.title}</h3>
                  <p className="text-[#B0B0B0] mb-3">{feature.description}</p>
                  {feature.highlight && (
                    <span className="inline-block text-xs font-medium px-2.5 py-1 rounded-full bg-[#1A1A1A] text-[#00CC66]">
                      {feature.highlight}
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div 
          className="mt-20 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <div className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-[#0066FF]/10 to-[#7F00FF]/10 border border-[#0066FF]/20 text-[#0066FF] text-sm font-medium mb-4">
            <Rocket className="w-4 h-4" />
            <span>Everything you need to sell more online</span>
          </div>
          <p className="text-[#B0B0B0] max-w-2xl mx-auto">
            Join 1,200+ e-commerce brands increasing their sales through social media.
          </p>
        </motion.div>
      </div>
      </div>
    </section>
  );
}
