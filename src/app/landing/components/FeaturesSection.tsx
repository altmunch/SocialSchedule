'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

// Sub-components for better maintainability
import FeatureItem from './FeatureItem';

interface FeatureSectionProps {
  onGetStarted?: () => void;
}

export default function FeaturesSection({ onGetStarted }: FeatureSectionProps) {
  // Feature data
  const features = [
    {
      number: 1,
      title: 'Accelerate',
      subtitle: 'Content Optimization Engine',
      description: 'Our AI optimizes captions, hashtags, and timing so each post turns viewers into buyers.',
      highlights: [
        'Constant optimization engines that work 24/7',
        'Real-time learning from audience reactions',
        'Optimize using tactics from high-performing competitors',
        'Conveys value through strategic captions'
      ],
      valueIndicator: 'Captures & Audits'
    },
    {
      number: 2,
      title: 'Blitz',
      subtitle: 'Precise Automated Posting',
      description: 'AI fires content at the exact minute your customers pull out their wallets.',
      highlights: [
        'Precise, automated posting schedules',
        'Content optimization for maximum engagement',
        'Sophisticated algorithm to target audience in your niche'
      ],
      valueIndicator: 'Sell At The Right Time'
    },
    {
      number: 3,
      title: 'Cycle',
      subtitle: 'Viral Cycle of Improvements',
      description: 'Every post teaches our AI to craft an even better seller—no analytics spreadsheets required.',
      highlights: [
        'Constantly improve from analytics',
        'Generate top-performing content ideas',
        'Simplifies complex analytics into actionable insights'
      ],
      valueIndicator: 'Simplifies Analytics'
    }
  ];

  return (
    <section className="relative py-24 md:py-32 bg-black text-white overflow-hidden" id="features">
      {/* Background elements */}
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-black via-black to-[#0A0A0A]" />
      
      <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-16 relative z-10">
        {/* Section header */}
        <motion.div 
          className="text-center mb-24"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="relative overflow-hidden h-[60px] md:h-[72px] mb-5">
            <motion.h2 
              className="text-4xl md:text-5xl font-bold text-[#8D5AFF] absolute w-full"
              initial={{ x: -100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -100, opacity: 0 }}
              transition={{ duration: 0.6 }}
            >
              The Viral Blitz Cycle
            </motion.h2>
            <motion.h2 
              className="text-4xl md:text-5xl font-bold text-[#8D5AFF] absolute w-full"
              initial={{ x: 0, opacity: 1 }}
              animate={{ x: 100, opacity: 0 }}
              transition={{ duration: 0.6 }}
            >
              How It Works
            </motion.h2>
          </div>
          <p className="text-xl text-white max-w-2xl mx-auto">
            Transform your content creation process with our AI-powered automation system
          </p>
        </motion.div>
        
        {/* Feature items */}
        <div className="space-y-32">
          {features.map((feature, index) => (
            <FeatureItem 
              key={feature.title}
              feature={feature}
              isReversed={index % 2 !== 0}
              index={index}
            />
          ))}
        </div>

        {/* CTA Button */}
        <motion.div 
          className="mt-24 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <motion.button 
            onClick={onGetStarted}
            className="bg-gradient-to-r from-[#8b5cf6] to-[#a855f7] hover:from-[#8b5cf6]/90 hover:to-[#a855f7]/90 text-white px-8 py-4 rounded-lg font-bold text-lg shadow-lg shadow-purple-500/30 transition-all duration-300"
            whileHover={{ scale: 1.03, boxShadow: '0 10px 25px -5px rgba(168, 85, 247, 0.4)' }}
            whileTap={{ scale: 0.98 }}
          >
            Start Selling Smarter with AI
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}
