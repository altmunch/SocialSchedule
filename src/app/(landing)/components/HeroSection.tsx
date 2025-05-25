'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, PlayCircle, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { CreatorAvatar } from '../types';

interface HeroSectionProps {
  stats: {
    totalUsers: number;
    postsScheduled?: number;
    totalViews?: number;
    alphaSpots?: number;
  };
  creatorAvatars?: CreatorAvatar[];
  onCTAClick?: () => void;
}

export function HeroSection({ stats, creatorAvatars = [], onCTAClick }: HeroSectionProps) {
  // Use state to ensure the number is only rendered on the client side
  const [isClient, setIsClient] = useState(false);
  const [displayNumber, setDisplayNumber] = useState('12,000');
  
  useEffect(() => {
    setIsClient(true);
    // Update with the actual number on client side
    setDisplayNumber(stats.totalUsers.toLocaleString());
  }, [stats.totalUsers]);
  return (
    <section className="relative pt-32 pb-20 px-4 overflow-hidden bg-gradient-to-b from-graphite to-graphite-dark">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-grid-misty/5 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,hsl(var(--background)))]"></div>
      </div>

      <div className="relative max-w-7xl mx-auto">
        <div className="text-center">
          <Badge className="mb-6 bg-misty/10 text-misty border border-misty/20 hover:bg-misty/20 px-4 py-1.5 text-sm font-medium">
            🚀 Join {displayNumber}+ creators growing with us
          </Badge>
          
          <motion.h1 
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="block">Schedule Smarter,</span>
            <span className="bg-gradient-to-r from-misty to-mint bg-clip-text text-transparent">
              Dominate Social Media
            </span>
          </motion.h1>
          
          <motion.p 
            className="mt-6 max-w-2xl mx-auto text-xl text-muted-foreground"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            AI-powered social media scheduling that helps you grow your audience, save time, and boost engagement—on autopilot.
          </motion.p>
          
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <Button 
              onClick={onCTAClick}
              className="relative group bg-gradient-to-r from-misty to-mint text-graphite font-bold py-6 px-8 text-lg shadow-lg hover:shadow-misty/30 transition-all duration-300 transform hover:-translate-y-1"
            >
              <span className="relative z-10 flex items-center gap-2">
                Get Started Free <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
              <span className="absolute inset-0 rounded-lg bg-gradient-to-r from-misty to-mint opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-md"></span>
            </Button>
            
            <Button 
              variant="outline" 
              className="bg-graphite/50 border-graphite-light/30 text-foreground hover:bg-graphite-light/20 hover:border-misty/30 transition-all"
            >
              <PlayCircle className="w-5 h-5 mr-2" /> Watch Demo
            </Button>
          </motion.div>
          
          <SocialProof creatorAvatars={creatorAvatars} />
        </div>
      </div>
    </section>
  );
}

interface SocialProofProps {
  creatorAvatars?: CreatorAvatar[];
}

function SocialProof({ creatorAvatars = [] }: SocialProofProps) {
  return (
    <motion.div 
      className="mt-12"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <div className="flex flex-wrap justify-center items-center gap-6 mb-6">
        <div className="flex -space-x-2">
          {creatorAvatars.slice(0, 6).map((creator, i) => (
            <div 
              key={creator.id}
              className="w-10 h-10 rounded-full bg-graphite-light border-2 border-graphite flex items-center justify-center text-white font-medium text-sm"
              style={{ zIndex: 6 - i }}
            >
              {creator.name[0]}
            </div>
          ))}
        </div>
        <div className="text-sm text-muted-foreground">
          Trusted by 10,000+ creators worldwide
        </div>
      </div>
      <div className="flex items-center justify-center gap-2">
        <div className="flex">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star key={star} className="w-5 h-5 text-yellow-400 fill-current" />
          ))}
        </div>
        <span className="text-sm text-muted-foreground">4.9/5 from 2,314+ reviews</span>
      </div>
    </motion.div>
  );
}
