'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, ChevronDown } from 'lucide-react';

import { getPricingTiers } from "@/lib/supabase/queries/pricing";
import PricingCard from "@/components/pricing/PricingCard";

interface Feature {
  name: string;
  tiers: {
    [key: string]: boolean;
  };
  description: string;
}

interface FAQ {
  question: string;
  answer: string;
}

export const dynamic = 'force-dynamic';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

const cardVariants = {
  hidden: { y: 50, opacity: 0 },
  visible: { y: 0, opacity: 1 }
};

export default function PricingPage() {
  const [tiers, setTiers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const features: Feature[] = [
    {
      name: 'Content Acceleration Engine',
      tiers: { 'Pro': true, 'Team': true, 'Enterprise': true },
      description: 'Automated platform-specific formatting and optimization'
    },
    {
      name: 'Competitor Analysis',
      tiers: { 'Pro': false, 'Team': true, 'Enterprise': true },
      description: 'Comprehensive field research and competitor tactics'
    },
    {
      name: 'Custom AI Model',
      tiers: { 'Pro': false, 'Team': false, 'Enterprise': true },
      description: 'AI trained on your brand voice and content'
    },
    {
      name: 'Priority Support',
      tiers: { 'Pro': false, 'Team': true, 'Enterprise': true },
      description: '24/7 priority email and chat support'
    },
    {
      name: 'API Access',
      tiers: { 'Pro': false, 'Team': false, 'Enterprise': true },
      description: 'Full API access for custom integrations'
    }
  ];

  const faqs: FAQ[] = [
    {
      question: 'Can I change plans later?',
      answer: 'Yes, you can upgrade or downgrade your plan at any time. Your billing will be prorated accordingly.'
    },
    {
      question: 'Is there a free trial available?',
      answer: 'We offer a 14-day free trial for all plans. No credit card is required to start your trial.'
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards, PayPal, and bank transfers for annual plans.'
    },
    {
      question: 'How does the cancellation work?',
      answer: 'You can cancel your subscription at any time. Your account will remain active until the end of your billing period.'
    },
    {
      question: 'Do you offer discounts for non-profits?',
      answer: 'Yes, we offer special pricing for registered non-profit organizations. Please contact our sales team for more information.'
    }
  ];

  // Load tiers on component mount and check for success message
  useEffect(() => {
    const loadTiers = async () => {
      try {
        const data = await getPricingTiers();
        
        // Map Stripe price IDs to tiers (replace with your actual Stripe price IDs)
        const tiersWithStripeIds = data.map(tier => {
          const stripePriceId = {
            'Pro': process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID,
            'Team': process.env.NEXT_PUBLIC_STRIPE_TEAM_PRICE_ID,
            'Enterprise': process.env.NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE_ID
          }[tier.name];
          
          return {
            ...tier,
            stripePriceId
          };
        });
        
        setTiers(tiersWithStripeIds);
      } catch (error) {
        console.error('Failed to load pricing tiers:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadTiers();
    
    // Check for success message in URL
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get('success');
    
    if (success === 'true') {
      // Show success message or redirect to success page
      console.log('Payment successful!');
      // You can add a toast notification here
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="animate-pulse text-gray-400">Loading pricing information...</div>
      </div>
    );
  }
  if (tiers.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-red-500 text-center p-4">
          Error loading pricing information. Please try again later.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-b from-gray-900 to-gray-800 min-h-screen">
      <div className="container mx-auto px-4 py-20">
        <div className="text-center mb-20">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 mb-6"
          >
            Accelerate Your Social Success
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto"
          >
            Choose the plan that fits your needs and unlock powerful social media automation
          </motion.p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto"
        >
          {tiers.map((tier, index) => {
            const previousTierName = index > 0 ? tiers[index - 1].name : null;
            return (
              <motion.div
                key={tier.id}
                variants={cardVariants}
                whileHover={{ scale: 1.05 }}
                className="relative"
              >
                {index === 1 && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </div>
                )}
                <PricingCard
                  tier={tier}
                  previousTierName={previousTierName}
                />
              </motion.div>
            );
          })}
        </motion.div>

        <div className="mt-20 text-center">
          <p className="text-gray-400 mb-4">
            Need enterprise-grade solutions? Contact our sales team
          </p>
          <div className="flex justify-center gap-4">
            <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-lg transition-all duration-300 transform hover:scale-105">
              Schedule Demo
            </button>
            <button className="border border-gray-600 hover:border-gray-400 text-gray-300 hover:text-white px-8 py-3 rounded-lg transition-all">
              Compare Plans
            </button>
          </div>
        </div>

        {/* Feature Comparison Table */}
        <div className="mt-32 max-w-6xl mx-auto">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl font-bold text-center mb-12 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500"
          >
            Feature Comparison
          </motion.h2>
          
          <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl border border-gray-700 overflow-hidden">
            <div className="grid grid-cols-4 gap-0">
              <div className="p-4 border-b border-gray-700"></div>
              {tiers.map((tier) => (
                <div key={tier.id} className="p-6 text-center border-b border-gray-700">
                  <h3 className="text-xl font-bold text-white">{tier.name}</h3>
                  <p className="text-gray-400">${tier.price}/month</p>
                </div>
              ))}
            </div>
            
            {features.map((feature, index) => (
              <div key={index} className="grid grid-cols-4 gap-0 hover:bg-gray-800/30 transition-colors">
                <div className="p-4 border-b border-gray-700 flex items-center">
                  <div>
                    <h4 className="font-medium text-white">{feature.name}</h4>
                    <p className="text-sm text-gray-400">{feature.description}</p>
                  </div>
                </div>
                {tiers.map((tier) => (
                  <div key={`${tier.id}-${index}`} className="p-4 flex items-center justify-center border-b border-gray-700">
                    {feature.tiers[tier.name as keyof typeof feature.tiers] ? (
                      <Check className="w-6 h-6 text-green-400" />
                    ) : (
                      <X className="w-5 h-5 text-gray-600" />
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-32 max-w-3xl mx-auto">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl font-bold text-center mb-12 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500"
          >
            Frequently Asked Questions
          </motion.h2>
          
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-gray-800/50 backdrop-blur-lg rounded-lg border border-gray-700 overflow-hidden">
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full p-6 text-left flex justify-between items-center focus:outline-none"
                >
                  <span className="text-lg font-medium text-white">{faq.question}</span>
                  <ChevronDown 
                    className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${activeFaq === index ? 'transform rotate-180' : ''}`}
                  />
                </button>
                <AnimatePresence>
                  {activeFaq === index && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-6 pt-0 text-gray-300">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>

        {/* Final CTA */}
        <div className="mt-32 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block px-8 py-6 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-2xl border border-gray-700/50"
          >
            <h3 className="text-2xl font-bold text-white mb-4">Ready to boost your social media presence?</h3>
            <p className="text-gray-300 mb-6 max-w-2xl mx-auto">Join thousands of creators and businesses growing their audience with our platform.</p>
            <button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-medium px-8 py-3 rounded-lg transition-all duration-300 transform hover:scale-105">
              Start Your 14-Day Free Trial
            </button>
            <p className="text-sm text-gray-400 mt-4">No credit card required. Cancel anytime.</p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
