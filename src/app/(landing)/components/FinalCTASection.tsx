'use client';

import { motion } from 'framer-motion';
import { Zap, Shield, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function FinalCTASection() {
  return (
    <section className="relative py-20 md:py-32 px-4 bg-black overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-black" />
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-[0.02]" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/90 to-black" />
      </div>
      <div className="relative z-10">
      
      <div className="max-w-4xl mx-auto relative text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-[#7F00FF]/10 to-[#00FFCC]/10 border border-[#7F00FF]/20 text-[#7F00FF] text-sm font-medium mb-6">
            <Zap className="w-4 h-4" />
            <span>30-Day Results Guarantee</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-[#F0F0F0] mb-6">
            See Results in 10 Days or Your Next Month is Free
          </h2>
          
          <p className="text-xl text-[#B0B0B0] max-w-3xl mx-auto mb-8">
            Join 1,203+ creators who've grown their audience by 30% on average. No credit card required to start.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Button 
              className="group relative overflow-hidden bg-gradient-to-r from-[#0066FF] to-[#7F00FF] hover:from-[#7F00FF] hover:to-[#0066FF] text-white text-lg font-semibold py-6 px-10 rounded-xl transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg hover:shadow-[#7F00FF]/20"
              size="lg"
            >
              <span className="relative z-10">Start Free Trial - No Credit Card</span>
              <span className="absolute inset-0 bg-gradient-to-r from-[#7F00FF] to-[#00FFCC] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Button>
            
            <Button 
              variant="outline"
              className="group border-2 border-[#333333] bg-[#1F1F1F] hover:bg-[#2A2A2A] text-[#F0F0F0] hover:text-white py-6 px-8 text-lg rounded-xl transition-all"
            >
              <span>Book a Demo</span>
              <svg 
                className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" 
                xmlns="http://www.w3.org/2000/svg" 
                width="24" 
                height="24" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <path d="M5 12h14"/>
                <path d="m12 5 7 7-7 7"/>
              </svg>
            </Button>
          </div>
          
          <div className="inline-flex flex-col sm:flex-row items-center gap-3 px-6 py-4 bg-[#1F1F1F] border border-[#333333] rounded-2xl max-w-2xl mx-auto">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-[#00FFCC] flex-shrink-0" />
              <span className="text-[#F0F0F0] font-medium">Our Guarantee to You</span>
            </div>
            <div className="h-px w-full sm:h-6 sm:w-px bg-[#333333]" />
            <div className="flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left">
              <div className="flex items-center gap-1">
                <CheckCircle className="w-5 h-5 text-[#7F00FF] flex-shrink-0" />
                <span className="text-[#B0B0B0] text-sm">30% more views in 10 days or your next month is free</span>
              </div>
              <span className="hidden sm:inline text-[#B0B0B0]/50">•</span>
              <div className="flex items-center gap-1">
                <CheckCircle className="w-5 h-5 text-[#7F00FF] flex-shrink-0" />
                <span className="text-[#B0B0B0] text-sm">No credit card required</span>
              </div>
            </div>
          </div>
        </motion.div>
        
        <motion.div 
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 pt-12 border-t border-[#333333]"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          {[
            { number: '30%', label: 'Average View Increase' },
            { number: '48h', label: 'Trend Prediction Lead' },
            { number: '4.9/5', label: 'User Rating' },
            { number: '10K+', label: 'Posts Optimized' },
          ].map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-[#0066FF] to-[#7F00FF] bg-clip-text text-transparent mb-2">
                {stat.number}
              </div>
              <p className="text-[#B0B0B0] text-sm">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </div>
      </div>
    </section>
  );
}
