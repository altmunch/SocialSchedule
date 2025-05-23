'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Zap, Sparkles, Rocket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

const features = [
  'Unlimited scheduled posts',
  'AI-powered content suggestions',
  'Analytics dashboard',
  'Multi-platform support',
  'Team collaboration',
  'Priority support',
  'Custom branding',
  'API access'
];

const plans = [
  {
    name: 'Starter',
    price: {
      monthly: 19,
      yearly: 15
    },
    description: 'Perfect for individuals getting started',
    features: [0, 1, 2, 3],
    featured: false,
    cta: 'Get Started',
    popular: false
  },
  {
    name: 'Professional',
    price: {
      monthly: 49,
      yearly: 39
    },
    description: 'For growing businesses and professionals',
    features: [0, 1, 2, 3, 4, 5],
    featured: true,
    cta: 'Start Free Trial',
    popular: true
  },
  {
    name: 'Business',
    price: {
      monthly: 99,
      yearly: 79
    },
    description: 'For teams and agencies',
    features: [0, 1, 2, 3, 4, 5, 6, 7],
    featured: false,
    cta: 'Contact Sales',
    popular: false
  }
];

export function PricingSection() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [isYearly, setIsYearly] = useState(false);
  
  const toggleBillingCycle = () => {
    setIsYearly(!isYearly);
    setBillingCycle(isYearly ? 'monthly' : 'yearly');
  };

  return (
    <section id="pricing" className="py-16 md:py-24 px-4 bg-gradient-to-b from-background to-muted/20">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Simple, Transparent Pricing</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Choose the perfect plan for your needs. Start with a 14-day free trial, no credit card required.
          </p>
          
          <div className="flex items-center justify-center gap-4 mt-8">
            <span className={`font-medium ${!isYearly ? 'text-foreground' : 'text-muted-foreground'}`}>
              Monthly
            </span>
            <Switch 
              id="billing-cycle" 
              checked={isYearly}
              onCheckedChange={toggleBillingCycle}
              className="data-[state=checked]:bg-mint"
            />
            <div className="flex items-center gap-2">
              <span className={`font-medium ${isYearly ? 'text-foreground' : 'text-muted-foreground'}`}>
                Yearly
              </span>
              <span className="px-2 py-1 text-xs font-medium rounded-full bg-mint/10 text-mint">
                Save 20%
              </span>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 * index, duration: 0.5 }}
              className={`relative ${plan.featured ? 'z-10' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-misty to-mint text-white text-xs font-medium px-4 py-1 rounded-full">
                  Most Popular
                </div>
              )}
              <div className={`h-full rounded-xl border overflow-hidden ${
                plan.featured 
                  ? 'border-mint/50 bg-gradient-to-b from-mint/5 to-transparent shadow-lg' 
                  : 'border-border/50 bg-background/50 backdrop-blur-sm'
              }`}>
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
                    {plan.name === 'Professional' && <Zap className="w-4 h-4 text-yellow-400 fill-yellow-400" />}
                    {plan.name === 'Business' && <Rocket className="w-4 h-4 text-purple-400" />}
                  </div>
                  <p className="text-muted-foreground text-sm mb-6">{plan.description}</p>
                  
                  <div className="mb-8">
                    <span className="text-4xl font-bold text-foreground">
                      ${billingCycle === 'monthly' ? plan.price.monthly : plan.price.yearly}
                    </span>
                    <span className="text-muted-foreground">
                      /{billingCycle === 'monthly' ? 'month' : 'year'}
                    </span>
                    {billingCycle === 'yearly' && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Billed annually (${plan.price.monthly * 12 - plan.price.yearly * 12} saved)
                      </p>
                    )}
                  </div>

                  <Button 
                    className={`w-full mb-6 ${
                      plan.featured 
                        ? 'bg-gradient-to-r from-misty to-mint text-graphite hover:opacity-90' 
                        : 'bg-foreground text-background hover:bg-foreground/90'
                    }`}
                  >
                    {plan.cta}
                  </Button>

                  <div className="space-y-3">
                    {features.map((feature, i) => (
                      <div key={i} className={`flex items-center gap-3 ${
                        plan.features.includes(i) ? 'opacity-100' : 'opacity-40'
                      }`}>
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                          plan.features.includes(i) 
                            ? 'bg-mint/10 text-mint' 
                            : 'bg-muted-foreground/10 text-muted-foreground/30'
                        }`}>
                          <Check className="w-3 h-3" />
                        </div>
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div 
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <div className="inline-flex flex-col sm:flex-row items-center gap-4 p-6 bg-muted/50 rounded-xl border border-border/50 max-w-2xl mx-auto">
            <div className="p-3 rounded-full bg-mint/10 text-mint">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-medium text-foreground">Need a custom plan?</h4>
              <p className="text-muted-foreground text-sm">Contact our sales team for enterprise solutions and custom pricing.</p>
            </div>
            <Button variant="outline" className="whitespace-nowrap">
              Contact Sales
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
