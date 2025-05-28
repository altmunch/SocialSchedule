'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, PlayCircle, CheckCircle, Star as StarIcon, Search, Zap } from 'lucide-react';

interface HeroSectionProps {
  onCTAClick: () => void;
}

export default function HeroSection({ onCTAClick }: HeroSectionProps) {
  return (
    <section className="relative py-16 md:py-24 overflow-hidden bg-black text-[#F0F0F0]">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-black" />
        {/* Animated gradient orbs */}
        <div className="absolute top-1/4 -left-20 w-[30rem] h-[30rem] rounded-full bg-gradient-to-r from-[#0066FF]/20 to-[#7F00FF]/20 filter blur-[100px] opacity-70 animate-float" />
        <div className="absolute bottom-1/4 -right-20 w-[30rem] h-[30rem] rounded-full bg-gradient-to-r from-[#00FFCC]/20 to-[#0066FF]/20 filter blur-[100px] opacity-70 animate-float animation-delay-2000" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#000000_70%)]" />
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-[0.02]" />
      </div>
      <div className="container mx-auto px-4 relative z-10">

        <div className="max-w-5xl mx-auto text-center px-4">
          {/* Trust Badge */}
          <motion.div 
            className="inline-flex items-center px-4 py-1.5 rounded-full bg-[#0066FF]/10 border border-[#0066FF]/20 text-[#0066FF] text-sm font-medium mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <StarIcon key={i} className="w-4 h-4 text-[#FFD700] fill-current" />
              ))}
              <span className="ml-2 text-[#F0F0F0]">4.9/5 from 1,203 creators</span>
            </div>
          </motion.div>

          {/* Main Headline */}
          <motion.h1 
            className="text-4xl md:text-6xl font-bold mb-6 leading-tight text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="relative inline-block">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#0066FF] via-[#7F00FF] to-[#00FFCC] bg-[length:200%] animate-gradient">
                Increase Sales by 30%
              </span>
            </span>
            <br />
            <span className="text-white">with AI-Powered Social Media Scheduling</span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p 
            className="text-xl text-gray-300 mb-10 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            Boost conversions by 30% with AI-optimized posting times. Ride trends ahead of competitors and see 30% more views in 10 days—guaranteed.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div 
            className="flex flex-col sm:flex-row justify-center items-center gap-6 mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <div className="relative group">
              <Button 
                onClick={onCTAClick}
                className="relative z-10 bg-gradient-to-r from-[#0066FF] to-[#7F00FF] hover:from-[#7F00FF] hover:to-[#0066FF] text-white text-lg font-semibold py-6 px-10 rounded-xl transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg hover:shadow-[#7F00FF]/40"
                size="lg"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Try It Risk-Free
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </Button>
              <div className="absolute -inset-1 bg-gradient-to-r from-[#0066FF] to-[#00FFCC] rounded-xl opacity-75 group-hover:opacity-100 blur transition-all duration-300 -z-10"></div>
            </div>
            
            <Button 
              variant="ghost"
              className="text-[#B0B0B0] hover:text-white text-base font-medium transition-colors group"
            >
              <span className="flex items-center gap-2 group-hover:underline">
                <PlayCircle className="w-5 h-5" />
                Watch Product Demo
              </span>
            </Button>
          </motion.div>

          {/* Trust Badge */}
          <motion.div 
            className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm text-[#B0B0B0] mt-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="flex items-center bg-[#2A2A2A] px-3 py-1.5 rounded-full">
              <CheckCircle className="w-4 h-4 text-[#00CC66] mr-1.5" />
              <span>30-Day Money Back Guarantee</span>
            </div>
            
            <div className="hidden sm:block h-4 w-px bg-[#333333]" />
            
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <StarIcon key={i} className="w-3.5 h-3.5 text-[#FFD700] fill-current" />
              ))}
              <span className="ml-1.5">4.9/5 from 1,203 sellers</span>
            </div>
          </motion.div>

          {/* Social Proof */}
          <motion.div 
            className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-400 mt-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <div className="flex items-center">
              <div className="flex -space-x-2 mr-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-r from-[#0066FF] to-[#7F00FF] border-2 border-[#1A1A1A]"></div>
                ))}
              </div>
              <span>Trusted by 12,834+ creators</span>
            </div>
            <div className="hidden md:block w-px h-6 bg-gray-700"></div>
            <div className="flex items-center">
              <div className="flex text-[#FFD700] mr-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <StarIcon key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <span>4.9/5 from 1,203 reviews</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// Simple star icon component
function Star({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
    </svg>
  );
}
