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
    <section className="py-16 md:py-24 bg-white" id="pricing">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.span 
            className="inline-block text-sm font-semibold text-[#FF7F50] uppercase tracking-wider mb-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Value & Pricing
          </motion.span>
          
          <motion.h2 
            className="text-3xl md:text-4xl font-bold text-[#333333] mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Exceptional Value for E-Commerce Sellers
          </motion.h2>
          
          <motion.p 
            className="text-xl text-[#444444] max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            $3300+ value for less than 10% of the cost. All features included. No hidden fees.
          </motion.p>
        </div>

        <motion.div
          className="bg-white border-2 border-[#007BFF] rounded-xl overflow-hidden max-w-xl mx-auto shadow-xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {/* Popular badge */}
          <div className="bg-[#007BFF] text-white text-center py-2 font-semibold">
            RECOMMENDED FOR SELLERS
          </div>
          
          <div className="p-8 md:p-10">
            <div className="flex items-baseline justify-center mb-6">
              <h3 className="text-4xl md:text-5xl font-bold text-[#333333]">$297</h3>
              <span className="text-[#666666] ml-2">/month</span>
            </div>
            
            <p className="text-center text-[#666666] mb-6">
              <span className="line-through">$497</span> <span className="text-[#28A745] font-semibold">Save 40%</span>
            </p>
            
            <div className="bg-blue-50 rounded-lg p-4 text-center mb-8 border border-blue-100">
              <p className="text-[#333333]">Value of hiring a dedicated specialist: <span className="text-[#28A745] font-semibold">$3,300/mo</span></p>
              <p className="text-[#666666] text-sm">You save over $3,000 per month</p>
            </div>
            
            <motion.button
              onClick={onGetStarted}
              className="w-full bg-[#007BFF] hover:bg-[#0070E0] text-white py-4 rounded-md font-semibold text-lg shadow-md transition-all mb-8"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Start Your 14-Day Trial <ChevronRight className="ml-1 h-5 w-5 inline" />
            </motion.button>
            
            <div className="text-center text-sm text-[#666666] mb-8">
              Cancel anytime during the trial period and you won't be charged
            </div>
            
            <div className="space-y-4">
              {features.map((feature, index) => (
                <motion.div 
                  key={index} 
                  className="flex items-center"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ 
                    duration: 0.3, 
                    delay: 0.2 + (index * 0.05),
                    ease: "easeOut"
                  }}
                >
                  <Check className="h-5 w-5 text-[#28A745] mr-3 flex-shrink-0" />
                  <span className="text-[#444444]">{feature}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
