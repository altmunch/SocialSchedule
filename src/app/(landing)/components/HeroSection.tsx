'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { ArrowRight, Check, Star } from 'lucide-react';

interface HeroSectionProps {
  onGetStarted: () => void;
  onDemo: () => void;
}

export default function HeroSection({ onGetStarted, onDemo }: HeroSectionProps) {
  return (
    <section className="bg-white pt-32 pb-20 md:pt-36 md:pb-28 relative overflow-hidden">
      {/* Background pattern - subtle grid */}
      <div className="absolute inset-0 z-0 opacity-5">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('/patterns/grid.svg')]" />
      </div>
      
      {/* Subtle accent glow */}
      <div className="absolute top-32 left-1/4 w-64 h-64 bg-[#007BFF] rounded-full filter blur-[120px] opacity-5" />
      <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-[#FF7F50] rounded-full filter blur-[150px] opacity-5" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          {/* Trust badge */}
          <motion.div 
            className="inline-flex items-center bg-white px-4 py-1.5 rounded-full mb-6 border border-gray-200 shadow-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 text-yellow-500 fill-current" />
              ))}
              <span className="ml-2 text-sm font-medium text-[#444444]">Trusted by 10,000+ sellers</span>
            </div>
          </motion.div>

          {/* Main headline */}
          <motion.h1 
            className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#333333] mb-6 leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Turn Every Short Into{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#007BFF] to-[#1E90FF]">
              a Sale
            </span>
          </motion.h1>

          {/* Subheading */}
          <motion.p 
            className="text-xl text-[#444444] mb-8 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Automate, optimize, and grow your business with shorts that do the selling for you. 
            Outperform generic creator tools—get features built for <span className="font-bold text-[#333333]">conversions, not just views</span>.
          </motion.p>

          {/* CTA buttons */}
          <motion.div 
            className="flex flex-col sm:flex-row justify-center gap-4 mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <motion.button
              onClick={onGetStarted}
              className="bg-[#007BFF] hover:bg-[#0070E0] text-white px-8 py-4 rounded-md font-semibold text-lg shadow-md transform transition-all"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="flex items-center justify-center">
                Start Selling Smarter with AI
                <ArrowRight className="ml-2 h-5 w-5" />
              </span>
            </motion.button>
            <motion.button
              onClick={onDemo}
              className="border border-[#007BFF] text-[#007BFF] hover:bg-blue-50 px-8 py-4 rounded-md font-semibold text-lg"
              whileHover={{ backgroundColor: '#F0F7FF' }}
              whileTap={{ scale: 0.98 }}
            >
              See Live Demo
            </motion.button>
          </motion.div>

          {/* Key differentiators bullets */}
          <motion.div 
            className="flex flex-col md:flex-row justify-center gap-6 md:gap-10 text-left max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            {[
              'AI optimizes content for conversions',
              'Schedule posts for maximum sales',
              'Outperform competitor content'
            ].map((benefit, index) => (
              <div key={index} className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <Check className="h-5 w-5 text-[#28A745]" />
                </div>
                <p className="ml-3 text-[#444444] font-medium">{benefit}</p>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Hero image or screenshot */}
        <motion.div 
          className="mt-12 max-w-5xl mx-auto rounded-lg shadow-xl overflow-hidden"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <div className="relative h-[400px] md:h-[500px] bg-white border border-gray-200 rounded-lg">
            {/* This would be replaced with your actual app screenshot */}
            <div className="absolute inset-0 flex items-center justify-center text-[#444444] text-lg font-medium">
              AI-Powered Content Optimization Dashboard
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
