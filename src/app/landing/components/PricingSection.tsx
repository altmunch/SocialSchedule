'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, ChevronRight, Shield, Sparkles } from 'lucide-react';

interface PricingSectionProps {
  onGetStarted: () => void;
}

export default function PricingSection({ onGetStarted }: PricingSectionProps) {
  const [isAnnual, setIsAnnual] = useState(true);
  
  // Calculate monthly prices (25% more than annual price divided by 12)
  const calculateMonthly = (annualPrice: number) => {
    return Math.round(annualPrice / 12 * 1.25);
  };

  const plans = [
    {
      name: 'Pro',
      subtitle: 'Entry-level for premium, niche service',
      annualPrice: 600,
      monthlyPrice: calculateMonthly(600),
      features: [
        'AI optimizes content for conversions',
        'Schedule posts for maximum sales',
        'Content Optimizing Engine ("Accelerate")',
        'Precise Automated Posting ("Blitz")',
        'Viral Cycle of Improvements ("Cycle")',
        'Comprehensive Field Research ("Scan")',
        'Manage up to 3 social accounts',
        'Hook & Template Generator Bonus',
      ],
      highlighted: false,
    },
    {
      name: 'Team',
      subtitle: 'For teams or heavy users, added features',
      annualPrice: 900,
      annualPriceRange: '900–1,200',
      monthlyPrice: calculateMonthly(900),
      monthlyPriceRange: '95–125',
      features: [
        'Everything in Pro, plus:',
        'Advanced AI content customization',
        'Team collaboration features',
        'Priority posting during peak hours',
        'Custom Brand Voice AI',
        'Manage up to 10 social accounts',
        'Content performance analytics dashboard',
        'Priority customer support',
      ],
      highlighted: true,
    },
    {
      name: 'Enterprise',
      subtitle: 'For custom integrations or high-volume needs',
      annualPrice: 1500,
      monthlyPrice: calculateMonthly(1500),
      features: [
        'Everything in Team, plus:',
        'Custom API integrations',
        'Dedicated account manager',
        'Advanced analytics and reporting',
        'Direct e-commerce platform integration',
        'Unlimited social accounts',
        'White-glove onboarding',
        'Custom AI model training',
      ],
      highlighted: false,
    }
  ];

  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-storm-darker to-storm-darkest" id="pricing">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.span 
            className="inline-block text-sm font-semibold text-[#5afcc0] uppercase tracking-wider mb-3"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            Simple, Transparent Pricing
          </motion.span>
          
          <motion.h2 
            className="text-3xl md:text-4xl font-bold text-white mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Scale Your Content and <span className="text-[#8D5AFF]">Maximize Sales</span>
          </motion.h2>
          
          <motion.p 
            className="text-xl text-white/80 max-w-3xl mx-auto mb-10"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Select the plan that best fits your needs. All plans include our core AI-powered features.
          </motion.p>
          
          {/* Billing toggle */}
          <motion.div 
            className="inline-flex items-center bg-black/30 p-1 rounded-full border border-white/10 mb-12 backdrop-blur-sm"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <button
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${isAnnual ? 'bg-[#8D5AFF] text-white shadow-lg' : 'text-white/60 hover:text-white'}`}
              onClick={() => setIsAnnual(true)}
            >
              Annual
              <span className="ml-1 text-xs bg-[#5afcc0] text-black px-2 py-0.5 rounded-full">
                Save 20%
              </span>
            </button>
            <button
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${!isAnnual ? 'bg-[#8D5AFF] text-white shadow-lg' : 'text-white/60 hover:text-white'}`}
              onClick={() => setIsAnnual(false)}
            >
              Monthly
            </button>
          </motion.div>

          {/* Pricing cards */}
          <div className="grid md:grid-cols-3 gap-6 xl:gap-10">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.name}
                className={`relative rounded-2xl overflow-hidden backdrop-blur-sm ${plan.highlighted ? 'border-2 border-[#8D5AFF]/50 bg-gradient-to-br from-black to-[#1A1A1A]' : 'border border-white/10 bg-black/40'}`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 + (index * 0.1) }}
              >
                {plan.highlighted && (
                  <div className="bg-gradient-to-r from-[#8D5AFF] to-[#5afcc0] text-white text-center py-3 font-semibold text-sm tracking-wider">
                    MOST POPULAR
                  </div>
                )}
                
                <div className="p-8 relative">
                  {/* Glow effect */}
                  {plan.highlighted && (
                    <div className="absolute -top-20 -right-20 w-64 h-64 bg-[#8D5AFF]/20 rounded-full filter blur-3xl -z-10" />
                  )}
                  
                  <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                  <p className="text-white/60 mb-6 min-h-[40px]">{plan.subtitle}</p>
                  
                  <div className="flex items-baseline mb-6">
                    <span className="text-4xl font-bold text-white">
                      ${isAnnual 
                        ? (plan.annualPriceRange || plan.annualPrice) 
                        : (plan.monthlyPriceRange || plan.monthlyPrice)}
                    </span>
                    <span className="text-white/60 ml-2">
                      {isAnnual ? '/year' : '/month'}
                    </span>
                  </div>
                  
                  {/* Bonus section */}
                  <div className="bg-[#5afcc0]/10 rounded-lg p-4 mb-6 border border-[#5afcc0]/20">
                    <div className="flex items-start">
                      <Sparkles className="h-5 w-5 text-[#5afcc0] mr-2 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-[#5afcc0] font-medium">Limited Time Bonuses</p>
                        <p className="text-sm text-white/70">Template Generator & Hook Creator included ($899 value)</p>
                      </div>
                    </div>
                  </div>

                  <motion.button
                    onClick={onGetStarted}
                    className={`w-full group relative py-3 px-6 rounded-lg font-semibold text-white transition-all duration-300 overflow-hidden mb-8 ${plan.highlighted 
                      ? 'bg-gradient-to-r from-[#8D5AFF] to-[#5afcc0] hover:shadow-lg hover:shadow-[#8D5AFF]/20' 
                      : 'bg-white/10 hover:bg-white/15 border border-white/10'}`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="relative z-10">Get Started</span>
                    <ChevronRight className="ml-2 h-5 w-5 inline transition-transform group-hover:translate-x-1" />
                  </motion.button>
                  
                  {/* 10-day guarantee */}
                  <div className="flex items-center justify-center text-sm text-white/60 mb-6">
                    <Shield className="h-4 w-4 mr-2 text-[#5afcc0]" />
                    <span>10-day results guarantee</span>
                  </div>
                  
                  {/* Features */}
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-white border-b border-white/10 pb-2 mb-3">
                      FEATURES
                    </p>
                    {plan.features.map((feature, idx) => (
                      <motion.div 
                        key={idx} 
                        className="flex items-start"
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.3, delay: 0.1 + (idx * 0.05) }}
                      >
                        <div className="w-5 h-5 rounded-full bg-[#5afcc0]/10 flex items-center justify-center flex-shrink-0 mr-3 mt-0.5">
                          <Check className="h-3 w-3 text-[#5afcc0]" />
                        </div>
                        <span className="text-white/80 text-sm">{feature}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
                
                {/* Bottom glow for highlighted plan */}
                {plan.highlighted && (
                  <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-[#5afcc0]/10 rounded-full filter blur-3xl -z-10" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
