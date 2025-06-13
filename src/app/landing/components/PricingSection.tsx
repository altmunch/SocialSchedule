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
      name: 'Starter',
      subtitle: 'Perfect for testing the waters',
      description: 'Ideal for solo creators ready to transform their content into sales',
      annualPrice: 240, // $20 * 12
      monthlyPrice: 20,
      features: [
        'AI-powered Viral Blitz Cycle (15 optimized posts/month)',
        'Smart content idea generation (15 uses/month)',
        'Automated posting to 3 platforms',
        'Basic performance analytics',
        'Email support'
      ],
      highlighted: false,
      isFree: false,
      stripeLinkEnv: 'NEXT_PUBLIC_STRIPE_LITE_LINK',
      valueProps: ['Test our AI optimization', 'See results in 14 days', 'Perfect for beginners']
    },
    {
      name: 'Professional',
      subtitle: 'Most popular for serious sellers',
      description: 'Everything you need to scale your content and maximize sales',
      annualPrice: 840, // $70 * 12
      monthlyPrice: 70,
      features: [
        'Unlimited AI-optimized content creation',
        'Advanced Viral Blitz Cycle with competitor analysis',
        'Multi-platform posting (unlimited accounts)',
        'E-commerce integration (Shopify, WooCommerce, etc.)',
        'Advanced sales analytics & ROI tracking',
        'Priority support & onboarding'
      ],
      highlighted: true,
      stripeLinkEnv: 'NEXT_PUBLIC_STRIPE_PRO_LINK',
      valueProps: ['3x more sales on average', 'Complete automation', 'Full e-commerce integration']
    },
    {
      name: 'Enterprise',
      subtitle: 'Built for teams and agencies',
      description: 'Advanced features for teams managing multiple brands and clients',
      annualPrice: 6000, // $500 * 12
      monthlyPrice: 500,
      features: [
        'Everything in Professional',
        'Team collaboration dashboard',
        'Unlimited brand accounts & client management',
        'Custom Brand Voice AI training',
        'White-label reporting',
        'Dedicated account manager & priority support'
      ],
      highlighted: false,
      stripeLinkEnv: 'NEXT_PUBLIC_STRIPE_TEAM_LINK',
      valueProps: ['Scale across teams', 'Manage multiple brands', 'White-label solution']
    }
  ];

  const getButtonLink = (plan: any) => {
    if (plan.isFree) {
      return "/dashboard";
    }
    
    // Use specific environment variables for each plan and billing cycle
    if (plan.name === 'Professional') {
      if (isAnnual) {
        return process.env.NEXT_PUBLIC_STRIPE_PRO_YEARLY_LINK || "/dashboard";
      } else {
        return process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_LINK || "/dashboard";
      }
    }
    
    if (plan.name === 'Enterprise') {
      if (isAnnual) {
        return process.env.NEXT_PUBLIC_STRIPE_TEAM_YEARLY_LINK || "/dashboard";
      } else {
        return process.env.NEXT_PUBLIC_STRIPE_TEAM_MONTHLY_LINK || "/dashboard";
      }
    }
    
    return "/dashboard";
  };

  const handlePlanClick = (plan: any) => {
    if (plan.isFree) {
      window.location.href = "/dashboard";
      return;
    }
    
    const stripeLink = getButtonLink(plan);
    
    // For team plans, we need to handle post-payment redirect to team dashboard
    if (plan.name === 'Enterprise' && stripeLink.includes('stripe')) {
      // Store the intended redirect in localStorage for post-payment handling - only on client side
      if (typeof window !== 'undefined') {
        localStorage.setItem('post_payment_redirect', '/team-dashboard');
      }
    }
    
    if (stripeLink.includes('stripe')) {
      window.open(stripeLink, '_blank');
    } else {
      window.location.href = stripeLink;
    }
  };

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
            Choose Your Growth Plan
          </motion.span>
          
          <motion.h2 
            className="text-3xl md:text-4xl font-bold text-white mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Transform Content Into <span className="text-[#8D5AFF]">Consistent Revenue</span>
          </motion.h2>
          
          <motion.p 
            className="text-xl text-white/80 max-w-3xl mx-auto mb-10"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Join thousands of creators who've increased their sales by 3x with AI-powered content optimization. Start your 14-day risk-free trial today.
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
                className={`relative rounded-2xl overflow-hidden backdrop-blur-sm ${plan.highlighted ? 'border-2 border-[#8D5AFF]/50 bg-gradient-to-br from-black to-[#1A1A1A] scale-105' : 'border border-white/10 bg-black/40'}`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 + (index * 0.1) }}
              >
                {plan.highlighted && (
                  <div className="bg-gradient-to-r from-[#8D5AFF] to-[#5afcc0] text-white text-center py-3 font-semibold text-sm tracking-wider">
                    ⭐ MOST POPULAR - BEST VALUE
                  </div>
                )}
                
                <div className="p-8 relative">
                  {/* Glow effect */}
                  {plan.highlighted && (
                    <div className="absolute -top-20 -right-20 w-64 h-64 bg-[#8D5AFF]/20 rounded-full filter blur-3xl -z-10" />
                  )}
                  
                  <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                  <p className="text-[#5afcc0] font-medium mb-2">{plan.subtitle}</p>
                  <p className="text-white/70 text-sm mb-6 min-h-[40px]">{plan.description}</p>
                  
                  <div className="flex items-baseline mb-6">
                    <span className="text-4xl font-bold text-white">
                      {plan.isFree ? 'Free' : `$${isAnnual ? plan.annualPrice : plan.monthlyPrice}`}
                    </span>
                    {!plan.isFree && (
                      <span className="text-white/60 ml-2">
                        {isAnnual ? '/year' : '/month'}
                      </span>
                    )}
                  </div>

                  {/* Value propositions */}
                  <div className="mb-6">
                    {plan.valueProps.map((prop, idx) => (
                      <div key={idx} className="flex items-center mb-2">
                        <div className="w-2 h-2 bg-[#5afcc0] rounded-full mr-2"></div>
                        <span className="text-[#5afcc0] text-sm font-medium">{prop}</span>
                      </div>
                    ))}
                  </div>
                  
                  {/* Bonus section - only show for paid plans */}
                  {!plan.isFree && (
                    <div className="bg-[#5afcc0]/10 rounded-lg p-4 mb-6 border border-[#5afcc0]/20">
                      <div className="flex items-start">
                        <Sparkles className="h-5 w-5 text-[#5afcc0] mr-2 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-[#5afcc0] font-medium">🎁 Limited Time Bonuses</p>
                          <p className="text-sm text-white/70">Hook Generator + Template Library included ($899 value)</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => handlePlanClick(plan)}
                    className={`w-full group relative py-4 px-6 rounded-lg font-bold text-lg transition-all duration-300 overflow-hidden mb-8 ${plan.highlighted 
                      ? 'bg-gradient-to-r from-[#8D5AFF] to-[#5afcc0] hover:shadow-lg hover:shadow-[#8D5AFF]/20 text-white' 
                      : 'bg-[#8D5AFF] hover:bg-[#8D5AFF]/90 text-white'}`}
                  >
                    <span className="relative z-10">
                      {plan.highlighted ? '🚀 Start Scaling Now' : plan.name === 'Enterprise' ? '💼 Contact Sales' : '✨ Start Free Trial'}
                    </span>
                    <ChevronRight className="ml-2 h-5 w-5 inline transition-transform group-hover:translate-x-1" />
                  </button>
                  
                  {/* 14-day guarantee */}
                  <div className="flex items-center justify-center text-sm text-white/60 mb-6">
                    <Shield className="h-4 w-4 mr-2 text-[#5afcc0]" />
                    <span>14-day money-back guarantee</span>
                  </div>
                  
                  {/* Features */}
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-white border-b border-white/10 pb-2 mb-3">
                      WHAT'S INCLUDED
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
