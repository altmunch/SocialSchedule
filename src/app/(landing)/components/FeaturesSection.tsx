'use client';

import { motion } from 'framer-motion';
import { ChartBar, Clock, TrendingUp, BarChart2, ShoppingCart, Zap, Search, MessageSquare } from 'lucide-react';

interface FeatureSectionProps {
  onGetStarted?: () => void;
}

export default function FeaturesSection({ onGetStarted }: FeatureSectionProps) {
  const features = [
    {
      icon: Search,
      image: '/dashboard-scan.png', // Placeholder path
      title: '1. SCAN',
      description: (
        <>
          Picking audio, captions, #’s<br />
          Platform specific formatting + technical tweaks<br />
          <span className="block mt-2 text-[#5afcc0]">Comprehensive field research…</span>
          <span className="block text-neutral-300">That will distill all the competitive tactics for use, without a second spent.<br />
          Compile all the marketing specific to your niche ($500 value)</span><br />
          <span className="block font-semibold text-white mt-2">($2500 value for $279)</span><br />
          <span className="block text-[#5afcc0]">x 10 for agencies, for $3800</span><br />
          <span className="block text-[#5afcc0]">+ custom AI model that learns your brand voice ($1500 value)</span>
        </>
      )
    },
    {
      icon: Zap,
      image: '/dashboard-accelerate.png',
      title: '2. ACCELERATE (SEO engine)',
      description: (
        <>
          Content acceleration optimizing engine…<br />
          <span className="block text-neutral-300">That will save you hours of research for every post<br />
          Perform better than your competitors ($1000 value)</span>
        </>
      )
    },
    {
      icon: Clock,
      image: '/dashboard-blitz.png',
      title: '3. BLITZ',
      description: (
        <>
          Posting at the right time → precise, automated posting…<br />
          <span className="block text-neutral-300">That will yield & push your content to the most audience, even if you have something better to do. ($600)</span><br />
          <span className="block">Freedom to live life</span>
        </>
      )
    },
    {
      icon: BarChart2,
      image: '/dashboard-cycle.png',
      title: '4. CYCLE (SEM better)',
      description: (
        <>
          Content generation<br />
          Algorithm anxiety<br />
          Analytics review<br />
          Viral cycle of improvements…<br />
          <span className="block text-neutral-300">That will consistently improve your posts without you reaching through endless analytics<br />
          That will generate the top-performing content ideas, without the stress and anxiety of underperformance ($500 value)</span>
        </>
      )
    }
  ];

  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-storm-dark to-storm-darker" id="features">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.span 
            className="inline-block text-sm font-semibold text-blitz-yellow uppercase tracking-wider mb-3"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            Key Differentiators
          </motion.span>
          
          <motion.h2 
            className="text-3xl md:text-4xl font-bold text-lightning-DEFAULT mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Purpose-Built Features for E-commerce Sellers
          </motion.h2>
          
          <motion.p 
            className="text-xl text-lightning-dim/80 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Our platform is specifically designed for sellers who want to convert more viewers into buyers,
            not just accumulate likes and comments.
          </motion.p>
        </div>

        <div className="flex flex-col gap-16">
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            className={
              `flex flex-col md:flex-row items-center gap-10 md:gap-16 bg-[#18181b] rounded-2xl p-8 md:p-12 shadow-xl border border-storm-light/10` +
              (index % 2 === 1 ? ' md:flex-row-reverse' : '')
            }
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 * index }}
          >
            {/* Dashboard Image Placeholder */}
            <div className="w-full md:w-1/2 flex justify-center">
              <div className="rounded-xl overflow-hidden bg-black/40 border border-[#5afcc0]/10 shadow-lg w-[320px] h-[200px] flex items-center justify-center">
                <img src={feature.image} alt={feature.title + ' dashboard'} className="object-cover w-full h-full opacity-80" />
              </div>
            </div>
            {/* Feature Text */}
            <div className="w-full md:w-1/2 flex flex-col items-start">
              <div className="flex items-center mb-3">
                <feature.icon className="h-8 w-8 text-[#5afcc0] mr-2" />
                <h3 className="text-2xl font-bold text-white">{feature.title}</h3>
              </div>
              <div className="text-lg text-neutral-300 leading-relaxed">
                {feature.description}
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
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <motion.button 
            onClick={onGetStarted}
            className="bg-gradient-to-r from-blitz-blue to-blitz-purple hover:from-blitz-blue/90 hover:to-blitz-purple/90 text-lightning-DEFAULT px-8 py-3.5 rounded-md font-semibold text-lg shadow-lg shadow-blitz-blue/20 transition-all duration-300"
            whileHover={{ scale: 1.03, boxShadow: '0 10px 25px -5px rgba(0, 119, 255, 0.3)' }}
            whileTap={{ scale: 0.98 }}
          >
            Start Selling Smarter with AI
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}
