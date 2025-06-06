'use client';

import { useState, useEffect } from 'react';

import { motion, stagger, useAnimate } from 'framer-motion';
import Image from 'next/image';
import { ArrowRight, Check, Star } from 'lucide-react';

interface HeroSectionProps {
  onGetStarted: () => void;
  onDemo: () => void;
}

export default function HeroSection({ onGetStarted, onDemo }: HeroSectionProps) {
  return (
    <section className="relative bg-black pt-44 pb-28 md:pt-52 md:pb-36 overflow-hidden">
      {/* Background grid lines */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div 
          className="absolute inset-0" 
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(255,255,255,0.04) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255,255,255,0.04) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
            backgroundPosition: 'center top 30%'
          }} 
        />
      </div>
      
      {/* Background elements */}
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-black via-black to-[#0A0A0A]" />
      <div className="absolute bottom-20 -right-20 w-[32rem] h-[32rem] bg-blitz-purple/25 rounded-full filter blur-[180px]" />
      
      <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-16 relative z-10">
        <div className="text-center max-w-5xl mx-auto">
          {/* Main headline with supporting text */}
          <motion.div 
            className="relative mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="text-[#5afcc0] text-sm uppercase tracking-normal mb-6 font-medium">
              The only AI tool that sells your clips for you
            </div>
            <div className="relative pb-6 mb-4">
              <div className="whitespace-nowrap text-5xl sm:text-6xl font-medium text-white leading-tight tracking-tight">
                Stop Editing. Start Selling.
              </div>
              <div className="absolute bottom-0 left-1/2 w-48 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent transform -translate-x-1/2" />
            </div>
            <div className="relative">
              <p className="text-xl text-[#E5E7EB] max-w-3xl mx-auto font-light tracking-wide mb-2">
                Automate clip uploads for <span className="font-bold text-white">more sales</span>, <span className="font-bold text-white">less effort</span>
              </p>
              <div className="absolute -bottom-2 left-1/2 w-32 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent transform -translate-x-1/2" />
            </div>
          </motion.div>

          {/* CTA buttons with decorative border */}
          <motion.div 
            className="flex flex-col sm:flex-row justify-center gap-6 mb-16 relative"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="absolute -inset-4 border-l border-t border-white/10 rounded-tl-lg" />
            <motion.button
              onClick={onGetStarted}
              className="bg-[#8D5AFF] hover:bg-[#8D5AFF]/90 text-white px-10 py-5 rounded-lg font-bold text-lg shadow-xl shadow-[#8D5AFF]/30 transform transition-all"
              whileHover={{ scale: 1.02, boxShadow: '0 10px 25px -5px rgba(141, 90, 255, 0.5)' }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="flex items-center justify-center">
                Start Selling Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </span>
            </motion.button>
            <motion.button
              onClick={onDemo}
              className="border border-storm-light/25 bg-storm-light/5 hover:bg-storm-light/15 text-[#E5E7EB] hover:text-white px-10 py-5 rounded-lg font-bold text-lg transition-all duration-300 backdrop-blur-sm"
              whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
              whileTap={{ scale: 0.98 }}
            >
              See Live Demo
            </motion.button>
          </motion.div>

          {/* Key differentiators bullets */}
          <motion.div 
            className="flex flex-col md:flex-row justify-center gap-8 md:gap-14 text-left max-w-3xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            {[
              'AI optimizes content for conversions',
              'Schedule posts for maximum sales',
              'Outperform competitor content'
            ].map((benefit, index) => (
              <motion.div 
                key={index} 
                className="flex items-start"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 + (index * 0.15) }}
              >
                <div className="flex-shrink-0 mt-1">
                  <div className="rounded-full p-1 bg-[#28A745]/15">
                    <Check className="h-5 w-5 text-[#28A745]" />
                  </div>
                </div>
                <p className="ml-3 text-[#E5E7EB] font-medium">{benefit}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Hero image or screenshot */}
        <motion.div 
          className="mt-20 max-w-5xl mx-auto rounded-xl shadow-2xl overflow-hidden border border-storm-light/20"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <div className="relative h-[400px] md:h-[550px] bg-gradient-to-b from-[#0F172A] to-[#1E293B] border border-storm-light/20 rounded-xl overflow-hidden">
            {/* This would be replaced with your actual app screenshot */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-[#E5E7EB] text-2xl font-semibold mb-4">AI-Powered Content Optimization Dashboard</div>
                <div className="text-[#94A3B8] text-base max-w-lg mx-auto">Your dashboard preview would appear here, showcasing the powerful AI features of SocialSchedule</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
