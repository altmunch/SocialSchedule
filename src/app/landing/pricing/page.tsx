'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, ChevronDown, BarChart3, Users, Building2, Calculator, ArrowRight, ChevronRight, Shield, Sparkles } from 'lucide-react';
import Link from 'next/link';
import NavigationBar from '@/app/landing/components/NavigationBar';

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
  hidden: { y: 30, opacity: 0 },
  visible: { y: 0, opacity: 1 }
};

const teamCardVariants = {
  hidden: { y: 30, opacity: 0 },
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

  // Using fixed prices as specified
  
  // Predefined pricing tiers with specified pricing structure
  const pricingTiers: PricingTier[] = [
    {
      id: 'free',
      name: 'Free Plan',
      price: 0,
      yearlyPrice: 0,
      description: 'Get started with basic features',
      features: [
        'Idea Generator (3 uses)',
        '10 autoposts/month'
      ],
      ctaText: 'Get Started'
    },
    {
      id: 'pro',
      name: 'Pro Plan',
      price: 70, // Monthly price
      yearlyPrice: 840, // Annual price ($70 * 12)
      description: '$70/month',
      features: [
        'Viral Blitz Cycle Framework',
        'Idea Generator Framework (unlimited)',
        'Unlimited posts',
        '1 set of accounts',
        'E-commerce integration'
      ],
      ctaText: 'Get Started',
      stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRO_LINK
    },
    {
      id: 'team',
      name: 'Team Plan',
      price: 500, // Monthly price
      yearlyPrice: 6000, // Annual price ($500 * 12)
      description: '$500/month',
      features: [
        'Everything in Pro',
        'Manage unlimited accounts',
        'Brand Voice AI (for consistency)',
        'Team collaboration mode',
        'Advanced analytics & reporting'
      ],
      isPopular: true,
      ctaText: 'Choose Team',
      stripePriceId: process.env.NEXT_PUBLIC_STRIPE_TEAM_LINK
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
      question: "What's the 10-day guarantee?",
      answer: "We're confident in our platform's ability to deliver results. If you don't see measurable improvements in your social media performance within 10 days, contact us for a full refund."
    },
    {
      question: "What's the difference between the pricing tiers?",
      answer: "Pro ($70/month or $600/year) is for individuals managing up to 3 accounts. Team ($100/month or $900/year) adds collaboration features and supports up to 10 accounts. Enterprise ($160/month or $1,500+/year) offers unlimited accounts, custom integrations, and dedicated support."
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
    if (followers > 10000 || posts > 30) return 'team';
    if (followers > 1000 || posts > 10) return 'pro';
    return 'free';
  };

  const recommendedPlan = getRecommendedPlan();

  return (
    <div className="bg-[#0A0A0A] min-h-screen text-lightning-DEFAULT pt-16">
      <NavigationBar />
      <div className="container mx-auto px-4 py-12">
        {/* CTA section */}
        <div className="mb-4 max-w-4xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#0A0A0A] border border-white/5 rounded-2xl p-12 text-center relative overflow-hidden shadow-xl"
          >
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl font-bold text-white mb-6"
            >
              Choose Your Plan
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl text-white/80 max-w-3xl mx-auto mb-10"
            >
              Simple choices, powerful results.
            </motion.p>
            
            {/* Billing toggle */}
            <div className="flex justify-center items-center space-x-4 mb-8">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-flex bg-black/30 p-1 rounded-full border border-white/10 backdrop-blur-sm"
              >
                <button
                  onClick={() => setBillingCycle('monthly')}
                  className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${billingCycle === 'monthly' 
                    ? 'bg-[#8D5AFF] text-white shadow-lg' 
                    : 'text-white/60 hover:text-white'}`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setBillingCycle('yearly')}
                  className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${billingCycle === 'yearly' 
                    ? 'bg-[#8D5AFF] text-white shadow-lg' 
                    : 'text-white/60 hover:text-white'}`}
                >
                  Yearly
                  <span className="ml-1 text-xs bg-[#5afcc0] text-black px-2 py-0.5 rounded-full">
                    Save 20%
                  </span>
                </button>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Pricing cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto mb-12 relative"
        >
          {pricingTiers.map((tier: PricingTier, index: number) => {
            // Handle Team tier pricing display
            const priceDisplay = () => {
              if (tier.id === 'team' && billingCycle === 'yearly') {
                return '$6000';
              }
              return `$${billingCycle === 'yearly' ? tier.yearlyPrice : tier.price}`;
            };
            
            // Calculate transforms to position Team tier higher
            const cardPositionStyle = tier.isPopular ? { marginTop: '-40px' } : {};
            
            return (
              <motion.div
                key={tier.id}
                variants={cardVariants}
                whileHover={{ y: -8 }}
                style={cardPositionStyle}
                className={`relative rounded-xl overflow-hidden backdrop-blur-sm ${tier.isPopular 
                  ? 'border-2 border-[#8D5AFF]/50 bg-gradient-to-br from-black to-[#1A1A1A] z-10'
                  : 'border border-white/10 bg-black/40'}`}
              >
                {tier.isPopular && (
                  <div className="bg-gradient-to-r from-[#8D5AFF] to-[#5afcc0] text-white text-center py-2 font-semibold text-sm">
                    MOST POPULAR
                  </div>
                )}
                
                <div className="p-6 relative flex flex-col h-full" style={{ minHeight: tier.isPopular ? '640px' : '600px' }}>
                  {/* Glow effect for popular plan */}
                  {tier.isPopular && (
                    <div className="absolute -top-20 -right-20 w-64 h-64 bg-[#8D5AFF]/20 rounded-full filter blur-3xl -z-10" />
                  )}
                  
                  <h3 className="text-xl font-bold text-white mb-1">{tier.name}</h3>
                  <p className="text-white/60 mb-4 text-sm h-[40px]">{tier.description}</p>
                  
                  <div className="flex items-baseline mb-4">
                    <span className="text-4xl font-bold text-white">
                      {priceDisplay()}
                    </span>
                    <span className="text-white/60 ml-2">
                      {billingCycle === 'yearly' ? '/year' : '/month'}
                    </span>
                  </div>
                  
                  {/* Display annual savings if yearly billing is selected */}
                  {billingCycle === 'yearly' && (
                    <div className="text-[#5afcc0] text-sm mb-4">Save 20% with annual billing</div>
                  )}
                  
                  {/* Bonus section */}
                  <div className="bg-[#5afcc0]/10 rounded-lg p-4 mb-6 border border-[#5afcc0]/20">
                    <div className="flex items-start">
                      <ChevronRight className="h-5 w-5 text-[#5afcc0] mr-2 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-white/80">
                        <span className="text-[#5afcc0] font-medium">Purchase now</span> and get exclusive bonuses worth up to $899
                      </p>
                    </div>
                  </div>
                  
                  {/* 10-day guarantee instead of free trial */}
                  <div className="flex items-center justify-center text-sm text-white/60 mb-6">
                    <Shield className="h-4 w-4 mr-2 text-[#5afcc0]" />
                    <span>10-day results guarantee</span>
                  </div>
                  
                  <div className="mt-auto pt-6">
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => {
                        if (tier.id === 'free') {
                          window.location.href = '/dashboard';
                        } else {
                          let stripeLink = '';
                          
                          if (tier.id === 'pro') {
                            if (billingCycle === 'yearly') {
                              stripeLink = process.env.NEXT_PUBLIC_STRIPE_PRO_YEARLY_LINK || '';
                            } else {
                              stripeLink = process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_LINK || '';
                            }
                          } else if (tier.id === 'team') {
                            if (billingCycle === 'yearly') {
                              stripeLink = process.env.NEXT_PUBLIC_STRIPE_TEAM_YEARLY_LINK || '';
                            } else {
                              stripeLink = process.env.NEXT_PUBLIC_STRIPE_TEAM_MONTHLY_LINK || '';
                            }
                            
                            // For team plans, store redirect to team dashboard
                            localStorage.setItem('post_payment_redirect', '/team-dashboard');
                          }
                          
                          if (stripeLink) {
                            window.open(stripeLink, '_blank');
                          } else {
                            window.location.href = '/dashboard';
                          }
                        }
                      }}
                      className={`w-full py-3 rounded-xl font-medium transition-all cursor-pointer ${tier.isPopular
                        ? 'bg-gradient-to-r from-[#8D5AFF] to-[#5afcc0] text-white hover:shadow-lg hover:shadow-[#8D5AFF]/20'
                        : 'bg-white/10 backdrop-blur-sm text-white hover:bg-white/20'}`}
                    >
                      {tier.ctaText}
                    </motion.button>
                  </div>
                  
                  <div className="space-y-2 flex-grow mt-4">
                    <p className="text-xs font-medium text-white/60 uppercase tracking-wider mb-2">
                      FEATURES
                    </p>
                    {tier.features.map((feature, i) => (
                      <div key={i} className="flex items-start">
                        <div className="w-4 h-4 rounded-full bg-[#5afcc0]/10 flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">
                          <Check className="h-2.5 w-2.5 text-[#5afcc0]" />
                        </div>
                        <span className="text-xs text-white/80">{feature}</span>
                      </div>
                    ))}
                  </div>
                  
                  {/* Bottom glow for highlighted plan */}
                  {tier.isPopular && (
                    <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-[#5afcc0]/10 rounded-full filter blur-3xl -z-10" />
                  )}
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Calculator */}
        <div className="mt-28 mb-32 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-4">Calculate Your <span className="text-[#8D5AFF]">Investment Return</span></h2>
            <p className="text-white/70 max-w-2xl mx-auto">
              See how our AI-powered platform delivers measurable ROI based on your social media accounts and content strategy.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-black/40 backdrop-blur-sm rounded-2xl border border-white/10 p-8"
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="bg-[#8D5AFF]/10 rounded-full p-3">
                <Calculator className="w-6 h-6 text-[#8D5AFF]" />
              </div>
              <h3 className="text-xl font-semibold text-white">ROI Calculator</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div>
                <label className="block text-white/70 mb-2 font-medium">How many creators do you need?</label>
                <div className="flex">
                  <input 
                    type="number" 
                    value={followers} 
                    onChange={handleFollowersChange}
                    className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-l-lg focus:outline-none focus:border-blitz-blue/50 text-lightning-DEFAULT"
                  />
                  <div className="bg-black/20 border border-l-0 border-white/10 rounded-r-lg px-4 flex items-center text-white/70">
                    creators
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-white/70 mb-2 font-medium">Average videos of your clips</label>
                <div className="flex">
                  <input 
                    type="number" 
                    value={posts} 
                    onChange={handlePostsChange}
                    className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-l-lg focus:outline-none focus:border-blitz-blue/50 text-lightning-DEFAULT"
                  />
                  <div className="bg-black/20 border border-l-0 border-white/10 rounded-r-lg px-4 flex items-center text-white/70">
                    weekly
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mb-8">
              <label className="block text-white/70 mb-2 font-medium">What category?</label>
              <div className="grid grid-cols-3 gap-2">
                {platformOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setPlatform(option.id)}
                    className={`flex items-center justify-center space-x-2 p-3 rounded-lg border transition-all ${platform === option.id 
                      ? 'border-blitz-blue/50 bg-blitz-blue/5 text-lightning-DEFAULT' 
                      : 'border-white/10 bg-black/20 text-white/70 hover:text-white/90 hover:border-white/20'}`}
                  >
                    <span className="text-blitz-blue">{option.icon}</span>
                    <span>{option.label}</span>
                  </button>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-black/30 rounded-xl p-6 text-center">
                <h4 className="text-white/70 mb-1 text-sm">Will you post on</h4>
                <div className="text-xl font-bold text-lightning-DEFAULT">{platformOptions.find(p => p.id === platform)?.label}</div>
              </div>
              
              <div className="bg-black/30 rounded-xl p-6 text-center">
                <h4 className="text-white/70 mb-1 text-sm">We recommend</h4>
                <div className="text-xl font-bold text-lightning-DEFAULT">
                  {pricingTiers.find(p => p.id === recommendedPlan)?.name} Plan
                </div>
              </div>
              
              <div className="bg-black/30 rounded-xl p-6 text-center">
                <h4 className="text-white/70 mb-1 text-sm">Est. growth per month</h4>
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
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold text-center mb-12 bg-[#3D7BF4] bg-clip-text text-transparent"
          >
            Compare all plans
          </motion.h2>
          
          <div className="bg-black/40 backdrop-blur-sm rounded-2xl border border-white/10 p-8">
            <div className="flex items-center gap-4 mb-8">
              <div className="bg-[#8D5AFF]/10 rounded-full p-3">
                <Calculator className="w-6 h-6 text-[#8D5AFF]" />
              </div>
              <h3 className="text-xl font-semibold text-white">ROI Calculator</h3>
            </div>
            <div className="grid grid-cols-4 gap-0">
              <div className="p-6 border-b border-white/10">
                <h3 className="font-bold text-lightning-DEFAULT">From</h3>
              </div>
              {pricingTiers.map((tier: PricingTier) => (
                <div key={tier.id} className="p-6 text-center border-b border-white/10">
                  <h3 className="font-bold text-lightning-DEFAULT">{tier.name}</h3>
                  <p className="text-white/70">${tier.price}/mo</p>
                </div>
              ))}
            </div>
            
            {features.map((feature, index) => (
              <div key={index} className="grid grid-cols-4 gap-0 hover:bg-black/20 transition-colors">
                <div className="p-6 border-b border-white/10 flex items-center">
                  <div>
                    <h4 className="font-medium text-lightning-DEFAULT">{feature.name}</h4>
                    <p className="text-sm text-white/70">{feature.description}</p>
                  </div>
                </div>
                {pricingTiers.map((tier: PricingTier) => (
                  <div key={`${tier.id}-${index}`} className="p-6 flex items-center justify-center border-b border-white/10">
                    {feature.tiers[tier.name as keyof typeof feature.tiers] ? (
                      <Check className="w-5 h-5 text-blitz-green" />
                    ) : (
                      <X className="w-5 h-5 text-white/30" />
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
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold text-center mb-12 bg-[#3D7BF4] bg-clip-text text-transparent"
          >
            Frequently Asked Questions
          </motion.h2>
          
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-black/40 border border-white/10 rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="flex justify-between items-center w-full text-left p-6"
                >
                  <span className="font-medium text-lg text-white">{faq.question}</span>
                  <ChevronDown className={`w-5 h-5 text-[#5afcc0] transition-transform ${activeFaq === index ? 'transform rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {activeFaq === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="px-6 pb-6 pt-0 text-white/80"
                    >
                      {faq.answer}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
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
