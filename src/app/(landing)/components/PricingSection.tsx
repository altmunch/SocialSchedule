'use client';

import { motion } from 'framer-motion';
import { Check, ChevronRight } from 'lucide-react';

interface PricingSectionProps {
  onGetStarted: () => void;
}

export default function PricingSection({ onGetStarted }: PricingSectionProps) {
  const features = [
    'Content Accelerator Optimizing Engine',
    'Precise Automated Posting ("Blitz")',
    'Viral Cycle of Improvements ("Cycle")',
    'Comprehensive Field Research ("Scan")',
    'Retention-Boosting Hashtag & Template Generator',
    'Custom Brand Voice AI',
    'Direct e-commerce platform integration',
    'Priority seller support',
  ];

  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-storm-darker to-storm-darkest" id="pricing">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.span 
            className="inline-block text-sm font-semibold text-blitz-yellow uppercase tracking-wider mb-3"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            Value & Pricing
          </motion.span>
          
          <motion.h2 
            className="text-3xl md:text-4xl font-bold text-lightning-DEFAULT mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Exceptional Value for E-Commerce Sellers
          </motion.h2>
          
          <motion.p 
            className="text-xl text-lightning-dim/80 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            $3300+ value for less than 10% of the cost. All features included. No hidden fees.
          </motion.p>
        </div>

        <div className="relative">
          {/* Decorative background elements */}
          <div className="absolute inset-0 -z-10 opacity-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#3b82f6,transparent_70%)]" />
          </div>

          <motion.div
            className="relative border-2 border-blitz-blue/50 bg-gradient-to-br from-storm-dark to-storm-darker rounded-2xl overflow-hidden max-w-2xl mx-auto shadow-2xl backdrop-blur-sm"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {/* Popular badge */}
            <div className="bg-gradient-to-r from-blitz-blue to-blitz-purple text-lightning-DEFAULT text-center py-3 font-semibold text-sm tracking-wider">
              RECOMMENDED FOR E-COMMERCE SELLERS
            </div>
            
            <div className="p-8 md:p-10 relative">
              {/* Glow effect */}
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-blitz-blue/20 rounded-full filter blur-3xl -z-10" />
              
              <div className="flex flex-col items-center mb-8">
                <div className="flex items-baseline">
                  <h3 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blitz-blue to-blitz-purple bg-clip-text text-transparent">
                    $297
                  </h3>
                  <span className="text-lightning-dim/60 ml-2 text-lg">/month</span>
                </div>
                
                <p className="text-center text-lightning-dim/60 mt-2">
                  <span className="line-through">$497</span> <span className="text-blitz-green font-semibold">Save 40%</span>
                </p>
              </div>
              
              <div className="bg-gradient-to-r from-blitz-blue/5 to-blitz-purple/5 rounded-xl p-5 text-center mb-8 border border-storm-light/10 backdrop-blur-sm">
                <p className="text-lightning-dim/90">
                  Value of hiring a dedicated specialist: 
                  <span className="text-blitz-green font-semibold"> $3,300/mo</span>
                </p>
                <p className="text-lightning-dim/60 text-sm mt-1">You save over $3,000 per month</p>
              </div>
              
              <motion.button
                onClick={onGetStarted}
                className="w-full group relative bg-gradient-to-r from-blitz-blue to-blitz-purple hover:from-blitz-blue/90 hover:to-blitz-purple/90 text-lightning-DEFAULT py-4 px-6 rounded-xl font-semibold text-lg shadow-xl shadow-blitz-blue/20 transition-all duration-300 overflow-hidden mb-8"
                whileHover={{ 
                  scale: 1.02,
                  boxShadow: '0 10px 25px -5px rgba(0, 119, 255, 0.3)'
                }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="relative z-10">Start Your 14-Day Trial</span>
                <ChevronRight className="ml-2 h-5 w-5 inline transition-transform group-hover:translate-x-1" />
                <div className="absolute inset-0 bg-gradient-to-r from-blitz-blue/0 via-white/10 to-blitz-purple/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </motion.button>
              
              <div className="text-center text-sm text-lightning-dim/60 mb-8">
                Cancel anytime during the trial period and you won't be charged
              </div>
              
              <div className="space-y-4">
                {features.map((feature, index) => (
                  <motion.div 
                    key={index} 
                    className="flex items-center p-3 rounded-lg border border-storm-light/5 bg-storm-light/5 hover:border-blitz-blue/20 transition-all duration-200 group"
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ 
                      duration: 0.3, 
                      delay: 0.2 + (index * 0.05),
                      ease: "easeOut"
                    }}
                    whileHover={{ x: 5 }}
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blitz-blue/10 to-blitz-purple/10 flex items-center justify-center flex-shrink-0 mr-3 group-hover:shadow-lg group-hover:shadow-blitz-blue/20 transition-all">
                      <Check className="h-4 w-4 text-blitz-blue" />
                    </div>
                    <span className="text-lightning-dim/90">{feature}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Bottom glow */}
            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-blitz-purple/20 rounded-full filter blur-3xl -z-10" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
