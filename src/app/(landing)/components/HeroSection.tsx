'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, Zap, Clock, BarChart2, RefreshCw, Search, PlayCircle } from 'lucide-react';

interface HeroSectionProps {
  onCTAClick: () => void;
  timeRemaining: {
    hours: number;
    minutes: number;
    seconds: number;
  };
  remainingSpots: number;
}

export default function HeroSection({ onCTAClick, timeRemaining, remainingSpots }: HeroSectionProps) {
  return (
    <section className="relative py-20 overflow-hidden bg-stormGray text-lightningWhite">
      <div className="container mx-auto px-4">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-stormGray to-black/80"></div>
          <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-5"></div>
          
          {/* Animated gradient orbs */}
          <div className="absolute top-1/4 -left-20 w-96 h-96 rounded-full bg-gradient-to-r from-blitzBlue/30 to-surgePurple/30 filter blur-3xl opacity-70 animate-float"></div>
          <div className="absolute bottom-1/4 -right-20 w-96 h-96 rounded-full bg-gradient-to-r from-loopTeal/30 to-blitzBlue/30 filter blur-3xl opacity-70 animate-float animation-delay-2000"></div>
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          {/* Badge */}
          <motion.div 
            className="inline-flex items-center px-4 py-1.5 rounded-full bg-blitzBlue/20 border border-blitzBlue/30 text-blitzBlue text-sm font-medium mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Zap className="w-4 h-4 mr-2" />
            <span>Only {remainingSpots} alpha spots left!</span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1 
            className="text-4xl md:text-6xl font-bold mb-6 leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Activate Your <span className="text-blitzBlue">Viral Blitz Cycle</span>—
            <span className="text-surgePurple">AI Posts</span> for You While You Sleep
          </motion.h1>

          {/* Subheadline */}
          <motion.p 
            className="text-xl text-gray-300 mb-10 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Our 4-step system scans, optimizes, and auto-posts your content to ride trends 48h before competitors. 
            Get <span className="font-semibold text-loopTeal">30% more views in 10 days</span>—guaranteed.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div 
            className="flex flex-col sm:flex-row justify-center gap-4 mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-blitzBlue to-surgePurple hover:opacity-90 transition-all transform hover:scale-105"
              onClick={onCTAClick}
            >
              Start My Free Trial
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="border-gray-600 text-lightningWhite hover:bg-gray-800/50"
            >
              <PlayCircle className="w-5 h-5 mr-2" />
              Watch Demo
            </Button>
          </motion.div>

          {/* Countdown Timer */}
          <motion.div 
            className="mb-12 p-4 bg-stormGray/50 backdrop-blur-sm rounded-lg border border-gray-700 inline-flex items-center space-x-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="text-center">
              <div className="text-3xl font-bold text-thunderYellow">
                {String(timeRemaining.hours).padStart(2, '0')}h
              </div>
              <div className="text-xs text-gray-400">Hours</div>
            </div>
            <div className="text-2xl text-gray-500">:</div>
            <div className="text-center">
              <div className="text-3xl font-bold text-thunderYellow">
                {String(timeRemaining.minutes).padStart(2, '0')}m
              </div>
              <div className="text-xs text-gray-400">Minutes</div>
            </div>
            <div className="text-2xl text-gray-500">:</div>
            <div className="text-center">
              <div className="text-3xl font-bold text-thunderYellow">
                {String(timeRemaining.seconds).padStart(2, '0')}s
              </div>
              <div className="text-xs text-gray-400">Seconds</div>
            </div>
            <div className="ml-4 pl-4 border-l border-gray-700">
              <div className="text-sm text-gray-300">Until bonuses expire</div>
            </div>
          </motion.div>

          {/* Social Proof */}
          <motion.div 
            className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-400"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <div className="flex items-center">
              <div className="flex -space-x-2 mr-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-r from-blitzBlue to-surgePurple border-2 border-stormGray"></div>
                ))}
              </div>
              <span>Trusted by 12,834+ creators</span>
            </div>
            <div className="hidden md:block w-px h-6 bg-gray-700"></div>
            <div className="flex items-center">
              <div className="flex text-thunderYellow mr-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <span>4.9/5 from 1,203 reviews</span>
            </div>
          </motion.div>
        </div>

        {/* Hero Visual - Animated Blitz Cycle */}
        <motion.div 
          className="mt-20 relative"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <div className="relative max-w-4xl mx-auto">
            {/* Phone mockup with dashboard */}
            <div className="relative z-10 mx-auto w-full max-w-xs md:max-w-md rounded-3xl overflow-hidden border-4 border-gray-700 shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-blitzBlue/10 to-surgePurple/10"></div>
              <div className="relative z-10 p-1 bg-stormGray">
                <div className="h-8 flex items-center justify-center bg-gray-800 rounded-t-lg">
                  <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <div className="bg-gray-900 h-96 rounded-b-lg overflow-hidden">
                  {/* Dashboard preview content */}
                  <div className="p-4">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-lg font-bold">Viral Blitz Dashboard</h3>
                      <div className="text-xs px-2 py-1 rounded-full bg-blitzBlue/20 text-blitzBlue">
                        Live
                      </div>
                    </div>
                    
                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="bg-gray-800/50 p-3 rounded-lg">
                        <div className="text-xs text-gray-400 mb-1">Next Post</div>
                        <div className="font-bold">2:14 PM</div>
                      </div>
                      <div className="bg-gray-800/50 p-3 rounded-lg">
                        <div className="text-xs text-gray-400 mb-1">Engagement</div>
                        <div className="font-bold text-loopTeal">+27%</div>
                      </div>
                    </div>
                    
                    {/* Cycle visualization */}
                    <div className="relative h-40 mb-6">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-32 h-32 rounded-full border-4 border-dashed border-gray-700 animate-spin-slow"></div>
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-24 h-24 rounded-full border-4 border-dashed border-blitzBlue/50 animate-spin-slow [animation-direction:reverse]"></div>
                      </div>
                      
                      {/* Cycle steps */}
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-gradient-to-br from-blitzBlue to-surgePurple flex items-center justify-center">
                        <Zap className="w-6 h-6 text-white" />
                      </div>
                      
                      {[/* eslint-disable @typescript-eslint/no-unused-vars */
                        { icon: <Search className="w-4 h-4" />, text: 'SCAN', angle: 0 },
                        { icon: <Zap className="w-4 h-4" />, text: 'ACCELERATE', angle: 90 },
                        { icon: <BarChart2 className="w-4 h-4" />, text: 'BLITZ', angle: 180 },
                        { icon: <RefreshCw className="w-4 h-4" />, text: 'CYCLE', angle: 270 },
                      ].map((step, i) => (
                        <div 
                          key={i}
                          className="absolute w-8 h-8 rounded-full bg-stormGray border border-gray-700 flex items-center justify-center"
                          style={{
                            top: `calc(50% + ${Math.sin(step.angle * Math.PI / 180) * 60}px)`,
                            left: `calc(50% + ${Math.cos(step.angle * Math.PI / 180) * 60}px)`,
                            transform: 'translate(-50%, -50%)',
                          }}
                        >
                          <span className="text-xs font-bold">{step.text[0]}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Glow effect */}
            <div className="absolute -inset-4 bg-gradient-to-r from-blitzBlue/20 to-surgePurple/20 rounded-3xl filter blur-2xl -z-10"></div>
          </div>
          
          {/* Floating elements */}
          <div className="absolute top-1/4 -left-10 w-24 h-24 bg-blitzBlue/10 rounded-full filter blur-xl animate-float"></div>
          <div className="absolute bottom-1/4 -right-10 w-24 h-24 bg-surgePurple/10 rounded-full filter blur-xl animate-float animation-delay-2000"></div>
        </motion.div>
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
