'use client';

import { motion } from 'framer-motion';
import { Check, Zap, Shield, Clock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function CTAWithGuarantee({ onCTAClick, remainingSpots }: { onCTAClick: () => void; remainingSpots: number }) {
  return (
    <section className="py-20 bg-stormGray/10 relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('/grid-pattern.svg')] opacity-5"></div>
        <div className="absolute top-1/4 -left-20 w-96 h-96 rounded-full bg-blitzBlue/10 filter blur-3xl"></div>
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 rounded-full bg-surgePurple/10 filter blur-3xl"></div>
      </div>
      
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div 
            className="inline-flex items-center px-4 py-1.5 rounded-full bg-blitzBlue/20 border border-blitzBlue/30 text-blitzBlue text-sm font-medium mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Zap className="w-4 h-4 mr-2" />
            <span>LIMITED TIME OFFER</span>
          </motion.div>
          
          <motion.h2 
            className="text-3xl md:text-4xl font-bold mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Start Your <span className="text-blitzBlue">7-Day Free Trial</span> Today
          </motion.h2>
          
          <motion.p 
            className="text-xl text-gray-300 mb-10 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Join thousands of creators who are growing their audience with our AI-powered platform.
            No credit card required to start.
          </motion.p>
          
          {/* Pricing Card */}
          <motion.div 
            className="bg-stormGray/30 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-8 max-w-2xl mx-auto mb-12 relative overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 px-4 py-1 bg-blitzBlue/20 text-blitzBlue text-sm font-medium rounded-bl-lg">
              MOST POPULAR
            </div>
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
              <div>
                <h3 className="text-2xl font-bold">Pro Plan</h3>
                <p className="text-gray-400">Perfect for serious creators</p>
              </div>
              
              <div className="mt-4 md:mt-0">
                <div className="flex items-end">
                  <span className="text-4xl font-bold">$29</span>
                  <span className="text-gray-400 ml-1">/month</span>
                </div>
                <p className="text-sm text-gray-400">Billed annually ($348/year)</p>
              </div>
            </div>
            
            <div className="mb-8">
              <ul className="space-y-3">
                {[
                  'Schedule unlimited posts',
                  'AI-powered optimization',
                  'Advanced analytics',
                  'Team collaboration',
                  'Priority support',
                  'All premium features'
                ].map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <Check className="w-5 h-5 text-loopTeal mr-2 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <Button 
              size="lg" 
              className="w-full bg-gradient-to-r from-blitzBlue to-surgePurple hover:opacity-90 transition-all transform hover:scale-[1.02] group"
            >
              Start 7-Day Free Trial
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
            
            <p className="mt-3 text-sm text-gray-400">
              No credit card required. Cancel anytime.
            </p>
          </motion.div>
          
          {/* Guarantee Badge */}
          <motion.div 
            className="inline-flex flex-col items-center p-6 bg-stormGray/30 backdrop-blur-sm rounded-xl border border-gray-700/50 max-w-md mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blitzBlue to-surgePurple flex items-center justify-center mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            
            <h4 className="text-xl font-bold mb-2">30-Day Money-Back Guarantee</h4>
            <p className="text-gray-300 text-center mb-4">
              We're so confident you'll love our platform that we offer a full 30-day money-back guarantee. 
              No questions asked.
            </p>
            
            <div className="flex items-center text-sm text-gray-400">
              <Clock className="w-4 h-4 mr-2 text-thunderYellow" />
              <span>Offer ends soon</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
