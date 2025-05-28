'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, ChevronDown, BarChart3, Users, Building2, Calculator, ArrowRight, ChevronRight } from 'lucide-react';
import Link from 'next/link';

import { getPricingTiers } from "@/lib/supabase/queries/pricing";

interface PricingTier {
  id: string;
  name: string;
  price: number;
  yearlyPrice?: number;
  description: string;
  features: string[];
  isPopular?: boolean;
  ctaText: string;
  stripePriceId?: string;
}

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

interface PlatformOption {
  id: string;
  label: string;
  icon: React.ReactNode;
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
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState<string>('tiktok');
  const [followers, setFollowers] = useState<number>(0);
  const [posts, setPosts] = useState<number>(0);
  const [platform, setPlatform] = useState<string>('tiktok');
  const [loading, setLoading] = useState(false);

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const handleFollowersChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFollowers(parseInt(e.target.value) || 0);
  };

  const handlePostsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPosts(parseInt(e.target.value) || 0);
  };

  // Predefined pricing tiers
  const pricingTiers: PricingTier[] = [
    {
      id: 'starter',
      name: 'Starter',
      price: 29,
      yearlyPrice: 24.99 * 12,
      description: 'For solopreneurs starting out',
      features: [
        '$29 billed monthly',
        '500 credits (~7 videos per month)',
        'AI clipping with Virality Score',
        '3 different templates for TikTok',
        'Export to YouTube Shorts, TikTok, IG Reels, or download',
        '1 brand template',
        'Filter & enhance removal',
        'Remove Watermark'
      ],
      ctaText: 'Start now'
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 299,
      yearlyPrice: 249 * 12, // $14.50/mo billed annually
      description: 'For professionals , marketers, & teams',
      features: [
        '$299 billed monthly',
        '1000 credits (~33 videos per month)',
        'Team collaboration with 3 seats',
        '15 min exports',
        'Captions with different text formats',
        'Everything in the free plan, plus:',
        'Export to directly to all social platforms',
        'Speed up or slow down exports to 0.5-2x',
        'Branded credit watermark',
        'Custom URL endpoint',
        'Custom fonts',
        'Custom watermarks'
      ],
      isPopular: true,
      ctaText: 'Upgrade now'
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 2499,
      yearlyPrice: 2000 * 12, // $249/mo billed annually
      description: 'For organizations requiring tailored solutions, API, and more',
      features: [
        'Custom pricing and packs',
        'Everything in the Pro plan, plus:',
        'Custom integrations via API',
        'Priority processing queue',
        'Detailed business reports',
        'Branded experience customization',
        'API & automation',
        'SLA & custom integrations',
        'Priority support with a dedicated Success Expert'
      ],
      ctaText: 'Contact us'
    }
  ];

  const features: Feature[] = [
    {
      name: 'AI clipping',
      tiers: { 'Free': true, 'Pro': true, 'Business': true },
      description: 'Automated content clip generation'
    },
    {
      name: 'Processing speed',
      tiers: { 'Free': false, 'Pro': true, 'Business': true },
      description: 'Faster processing times for content'
    },
    {
      name: 'Video import sources',
      tiers: { 'Free': false, 'Pro': true, 'Business': true },
      description: 'Import from multiple platforms'
    },
    {
      name: 'Dedicated account manager',
      tiers: { 'Free': false, 'Pro': false, 'Business': true },
      description: 'Personal support for your account'
    },
    {
      name: 'API Access',
      tiers: { 'Free': false, 'Pro': false, 'Business': true },
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

  const platformOptions: PlatformOption[] = [
    {
      id: 'tiktok',
      label: 'TikTok',
      icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-5.201 1.743l-.002-.001.002.001a2.895 2.895 0 0 1 3.183-4.51v-3.5a6.329 6.329 0 0 0-5.394 10.692 6.33 6.33 0 0 0 10.857-4.424V8.687a8.182 8.182 0 0 0 4.773 1.526V6.79a4.831 4.831 0 0 1-1.003-.104z"/></svg>
    },
    {
      id: 'instagram',
      label: 'Instagram',
      icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg>
    },
    {
      id: 'youtube',
      label: 'YouTube',
      icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
    }
  ];

  // Calculate the estimated growth based on inputs
  const calculateGrowth = () => {
    // Example calculation - would be replaced with actual business logic
    const baseGrowth = followers * 0.05 + posts * 10;
    const platformMultiplier = platform === 'tiktok' ? 1.2 : platform === 'instagram' ? 1.0 : 1.1;
    return Math.round(baseGrowth * platformMultiplier);
  };

  const estimatedGrowth = calculateGrowth();

  // Recommended plan based on inputs
  const getRecommendedPlan = () => {
    if (followers > 10000 || posts > 30) return 'business';
    if (followers > 1000 || posts > 10) return 'pro';
    return 'free';
  };

  const recommendedPlan = getRecommendedPlan();

  return (
    <div className="bg-[#0A0A0A] min-h-screen text-lightning-DEFAULT">
      <div className="container mx-auto px-4 py-20">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-bold bg-[#3D7BF4] bg-clip-text text-transparent mb-6"
          >
            Choose a plan
          </motion.h1>
          
          {/* Billing toggle */}
          <div className="flex justify-center items-center space-x-4 mb-8">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex bg-storm-light/10 backdrop-blur-sm p-1 rounded-full"
            >
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${billingCycle === 'monthly' 
                  ? 'bg-[#3D7BF4] text-lightning-DEFAULT shadow-lg' 
                  : 'text-lightning-dim/70 hover:text-lightning-dim/90'}`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${billingCycle === 'yearly' 
                  ? 'bg-[#3D7BF4] text-lightning-DEFAULT shadow-lg' 
                  : 'text-lightning-dim/70 hover:text-lightning-dim/90'}`}
              >
                Yearly
              </button>
            </motion.div>
          </div>
          
          {billingCycle === 'yearly' && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-blitz-green text-sm font-medium mb-8"
            >
              Save up to 25% with annual billing
            </motion.div>
          )}
        </div>

        {/* Pricing cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto mb-24"
        >
          {pricingTiers.map((tier: PricingTier, index: number) => {
            return (
              <motion.div
                key={tier.id}
                variants={cardVariants}
                whileHover={{ y: -8 }}
                className={`relative rounded-2xl overflow-hidden backdrop-blur-sm border ${tier.isPopular 
                  ? 'border-blitz-blue/50 bg-gradient-to-br from-storm-dark to-storm-darker shadow-xl shadow-blitz-blue/20' 
                  : 'border-storm-light/10 bg-storm-light/5'}`}
              >
                {tier.isPopular && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#3D7BF4] text-lightning-DEFAULT px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </div>
                )}
                
                <div className="p-8">
                  <h3 className="text-2xl font-bold text-lightning-DEFAULT mb-2">{tier.name}</h3>
                  <p className="text-lightning-dim/70 mb-6">{tier.description}</p>
                  
                  <div className="flex items-baseline mb-6">
                    <span className="text-4xl font-bold bg-[#3D7BF4] bg-clip-text text-transparent">
                      ${billingCycle === 'monthly' ? tier.price : Math.round(tier.yearlyPrice! / 12)}
                    </span>
                    <span className="text-lightning-dim/60 ml-2">/month</span>
                  </div>
                  
                  {billingCycle === 'yearly' && tier.price > 0 && (
                    <div className="mb-6 text-sm text-lightning-dim/70">
                      <span>{tier.features[0]}</span>
                    </div>
                  )}
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full py-3 px-6 rounded-xl font-medium transition-all mb-8 ${tier.id === 'business' 
                      ? 'border border-blitz-blue/50 text-lightning-DEFAULT hover:bg-blitz-blue/10' 
                      : 'bg-[#3D7BF4] text-lightning-DEFAULT hover:shadow-lg hover:shadow-blitz-blue/20'}`}
                  >
                    {tier.ctaText}
                  </motion.button>
                  
                  <div className="space-y-3">
                    {tier.features.filter((_, i) => billingCycle === 'monthly' || i > 0).map((feature, i) => (
                      <div key={i} className="flex items-start">
                        <div className="w-5 h-5 rounded-full bg-blitz-blue/10 flex items-center justify-center mt-0.5 mr-3 flex-shrink-0">
                          <Check className="w-3 h-3 text-blitz-blue" />
                        </div>
                        <span className="text-sm text-lightning-dim/80">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Calculator */}
        <div className="mt-28 mb-32 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-storm-light/5 backdrop-blur-sm border border-storm-light/10 rounded-2xl p-8 md:p-10"
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold bg-[#3D7BF4] bg-clip-text text-transparent mb-4">
                Create & Grow Faster Calculator
              </h2>
              <p className="text-lightning-dim/70 max-w-2xl mx-auto">
                Our calculator is designed to help creators figure out what it costs them to create videos, and grow sustainably faster.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div>
                <label className="block text-lightning-dim/90 mb-2 font-medium">How many creators do you need?</label>
                <div className="flex">
                  <input 
                    type="number" 
                    value={followers} 
                    onChange={handleFollowersChange}
                    className="w-full px-4 py-3 bg-storm-darker border border-storm-light/10 rounded-l-lg focus:outline-none focus:border-blitz-blue/50 text-lightning-DEFAULT"
                  />
                  <div className="bg-storm-dark border border-l-0 border-storm-light/10 rounded-r-lg px-4 flex items-center text-lightning-dim/60">
                    creators
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-lightning-dim/90 mb-2 font-medium">Average videos of your clips</label>
                <div className="flex">
                  <input 
                    type="number" 
                    value={posts} 
                    onChange={handlePostsChange}
                    className="w-full px-4 py-3 bg-storm-darker border border-storm-light/10 rounded-l-lg focus:outline-none focus:border-blitz-blue/50 text-lightning-DEFAULT"
                  />
                  <div className="bg-storm-dark border border-l-0 border-storm-light/10 rounded-r-lg px-4 flex items-center text-lightning-dim/60">
                    weekly
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mb-8">
              <label className="block text-lightning-dim/90 mb-2 font-medium">What category?</label>
              <div className="grid grid-cols-3 gap-2">
                {platformOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setPlatform(option.id)}
                    className={`flex items-center justify-center space-x-2 p-3 rounded-lg border transition-all ${platform === option.id 
                      ? 'border-blitz-blue/50 bg-blitz-blue/5 text-lightning-DEFAULT' 
                      : 'border-storm-light/10 bg-storm-light/5 text-lightning-dim/70 hover:text-lightning-dim/90 hover:border-storm-light/20'}`}
                  >
                    <span className="text-blitz-blue">{option.icon}</span>
                    <span>{option.label}</span>
                  </button>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-storm-darker rounded-xl p-6 text-center">
                <h4 className="text-lightning-dim/70 mb-1 text-sm">Will you post on</h4>
                <div className="text-xl font-bold text-lightning-DEFAULT">{platformOptions.find(p => p.id === platform)?.label}</div>
              </div>
              
              <div className="bg-storm-darker rounded-xl p-6 text-center">
                <h4 className="text-lightning-dim/70 mb-1 text-sm">We recommend</h4>
                <div className="text-xl font-bold text-lightning-DEFAULT">
                  {pricingTiers.find(p => p.id === recommendedPlan)?.name} Plan
                </div>
              </div>
              
              <div className="bg-storm-darker rounded-xl p-6 text-center">
                <h4 className="text-lightning-dim/70 mb-1 text-sm">Est. growth per month</h4>
                <div className="text-xl font-bold text-blitz-green">+{estimatedGrowth}</div>
              </div>
            </div>
            
            <div className="text-center">
              <Link 
                href={`#${recommendedPlan}`} 
                className="inline-flex items-center px-8 py-3 bg-[#3D7BF4] text-lightning-DEFAULT rounded-xl font-medium hover:shadow-lg hover:shadow-blitz-blue/20 transition-all"
              >
                <span>Select {pricingTiers.find(p => p.id === recommendedPlan)?.name} Plan</span>
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Comparison table */}
        <div className="mb-32 max-w-6xl mx-auto">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl font-bold text-center mb-12 bg-[#3D7BF4] bg-clip-text text-transparent"
          >
            Compare all plans
          </motion.h2>
          
          <div className="bg-storm-light/5 backdrop-blur-sm rounded-xl border border-storm-light/10 overflow-hidden">
            <div className="grid grid-cols-4 gap-0">
              <div className="p-6 border-b border-storm-light/10">
                <h3 className="font-bold text-lightning-DEFAULT">From</h3>
              </div>
              {pricingTiers.map((tier: PricingTier) => (
                <div key={tier.id} className="p-6 text-center border-b border-storm-light/10">
                  <h3 className="font-bold text-lightning-DEFAULT">{tier.name}</h3>
                  <p className="text-lightning-dim/70">${tier.price}/mo</p>
                </div>
              ))}
            </div>
            
            {features.map((feature, index) => (
              <div key={index} className="grid grid-cols-4 gap-0 hover:bg-storm-light/5 transition-colors">
                <div className="p-6 border-b border-storm-light/10 flex items-center">
                  <div>
                    <h4 className="font-medium text-lightning-DEFAULT">{feature.name}</h4>
                    <p className="text-sm text-lightning-dim/70">{feature.description}</p>
                  </div>
                </div>
                {pricingTiers.map((tier: PricingTier) => (
                  <div key={`${tier.id}-${index}`} className="p-6 flex items-center justify-center border-b border-storm-light/10">
                    {feature.tiers[tier.name as keyof typeof feature.tiers] ? (
                      <Check className="w-5 h-5 text-blitz-green" />
                    ) : (
                      <X className="w-5 h-5 text-storm-light/30" />
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mb-32 max-w-3xl mx-auto">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl font-bold text-center mb-12 bg-[#3D7BF4] bg-clip-text text-transparent"
          >
            Frequently Asked Questions
          </motion.h2>
          
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-storm-light/5 backdrop-blur-sm rounded-xl border border-storm-light/10 overflow-hidden">
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full p-6 text-left flex justify-between items-center focus:outline-none"
                >
                  <span className="text-lg font-medium text-lightning-DEFAULT">{faq.question}</span>
                  <ChevronDown 
                    className={`w-5 h-5 text-blitz-blue transition-transform duration-200 ${activeFaq === index ? 'transform rotate-180' : ''}`}
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
                      <div className="px-6 pb-6 pt-0 text-lightning-dim/80">
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
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block px-10 py-8 bg-gradient-to-r from-blitz-blue/10 to-blitz-purple/10 rounded-2xl border border-storm-light/10 backdrop-blur-sm"
          >
            <h3 className="text-2xl font-bold text-lightning-DEFAULT mb-4">Ready to boost your social media presence?</h3>
            <p className="text-lightning-dim/80 mb-8 max-w-2xl mx-auto">Join thousands of creators and businesses growing their audience with our platform.</p>
            <motion.button 
              className="bg-[#3D7BF4] text-lightning-DEFAULT font-medium px-8 py-4 rounded-xl shadow-lg shadow-blitz-blue/20 transition-all duration-300 hover:shadow-xl hover:shadow-blitz-blue/30"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="flex items-center">
                Start Your 14-Day Free Trial
                <ChevronRight className="ml-2 h-5 w-5" />
              </span>
            </motion.button>
            <p className="text-sm text-lightning-dim/60 mt-4">No credit card required. Cancel anytime.</p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
