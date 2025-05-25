'use client';

import { motion } from 'framer-motion';
import { Zap, Search, BarChart2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

const steps = [
  {
    icon: <Search className="w-6 h-6 text-blitzBlue" />,
    title: 'SCAN',
    description: 'Our AI scans 1000s of posts to find the perfect trends for your niche, 48 hours before they peak.',
    color: 'blitzBlue'
  },
  {
    icon: <Zap className="w-6 h-6 text-surgePurple" />,
    title: 'ACCELERATE',
    description: 'We optimize your content with AI to ride the wave of emerging trends at the perfect moment.',
    color: 'surgePurple'
  },
  {
    icon: <BarChart2 className="w-6 h-6 text-thunderYellow" />,
    title: 'BLITZ',
    description: 'Your content gets maximum visibility by hitting the algorithm at peak engagement times.',
    color: 'thunderYellow'
  },
  {
    icon: <RefreshCw className="w-6 h-6 text-loopTeal" />,
    title: 'CYCLE',
    description: 'The system learns and improves with every post, creating a perpetual growth cycle.',
    color: 'loopTeal'
  }
];

export default function ViralBlitzCycle() {
  return (
    <section className="py-20 bg-stormGray/30 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-blitzBlue/10 filter blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full bg-surgePurple/10 filter blur-3xl"></div>
      </div>
      
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            The <span className="text-blitzBlue">4-Step Viral Blitz Cycle</span> That Works While You Sleep
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Our AI system runs on autopilot to ensure your content gets maximum visibility with minimal effort.
          </p>
        </div>

        {/* Timeline */}
        <div className="relative max-w-4xl mx-auto">
          {/* Vertical line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-blitzBlue via-surgePurple to-loopTeal -ml-px"></div>
          
          {/* Steps */}
          <div className="space-y-20">
            {steps.map((step, index) => (
              <motion.div 
                key={step.title}
                className={`relative flex flex-col ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} items-center`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                {/* Content */}
                <div className={`md:w-1/2 ${index % 2 === 0 ? 'md:pr-12' : 'md:pl-12'} mb-8 md:mb-0`}>
                  <div className={`inline-flex items-center justify-center w-14 h-14 rounded-full bg-${step.color}/10 mb-4`}>
                    {step.icon}
                  </div>
                  <h3 className="text-2xl font-bold mb-3">{step.title}</h3>
                  <p className="text-gray-300">{step.description}</p>
                </div>
                
                {/* Step number */}
                <div className={`absolute left-1/2 -ml-5 w-10 h-10 flex items-center justify-center rounded-full font-bold text-white bg-${step.color} border-4 border-stormGray`}>
                  {index + 1}
                </div>
                
                {/* Empty div for spacing */}
                <div className="md:w-1/2"></div>
              </motion.div>
            ))}
          </div>
        </div>
        
        <motion.div 
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Button 
            size="lg" 
            className="bg-gradient-to-r from-blitzBlue to-surgePurple hover:opacity-90 transition-all transform hover:scale-105"
          >
            Start My Free Trial
          </Button>
          <p className="mt-4 text-gray-400 text-sm">No credit card required. 7-day free trial.</p>
        </motion.div>
      </div>
    </section>
  );
}
