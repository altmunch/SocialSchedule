'use client';

import { motion } from 'framer-motion';
import { Zap, Search, BarChart2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

const steps = [
  {
    icon: <Search className="w-8 h-8 text-blitzBlue" />,
    title: 'SCAN',
    subtitle: '(Intel Gathering)',
    description: 'AI analyzes your past posts + spies on competitors to find hidden viral patterns.',
    proof: '@MarisaLynn grew to 500K followers after fixing drop-off points our Scan uncovered.',
    color: 'blitzBlue'
  },
  {
    icon: <Zap className="w-8 h-8 text-surgePurple" />,
    title: 'ACCELERATE',
    subtitle: '(Content Turbocharge)',
    description: 'Auto-generates hooks using 10,000+ proven templates and attaches rising sounds.',
    demo: '10-second clip showing AI turning "My skincare routine" into "Derms hate this $3 trick!"',
    color: 'surgePurple'
  },
  {
    icon: <Zap className="w-8 h-8 text-thunderYellow" />,
    title: 'BLITZ',
    subtitle: '(Algorithm Strike)',
    description: 'Posts at precise times when your audience is most addicted to scrolling.',
    counter: '12,834 posts blitzed this hour',
    color: 'thunderYellow'
  },
  {
    icon: <RefreshCw className="w-8 h-8 text-loopTeal" />,
    title: 'CYCLE',
    subtitle: '(Self-Improving Loop)',
    description: 'Learns from every post to make your next content 27% more engaging.',
    graphic: 'Arrow loop with metrics improving each rotation',
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
            The <span className="text-blitzBlue">Viral Blitz Cycle</span> Explained
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            A 4-step process that turns your content into an unstoppable growth machine
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
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-${step.color}/10 mb-4`}>
                    {step.icon}
                  </div>
                  <h3 className="text-2xl font-bold mb-1">{step.title} <span className="text-gray-400 text-lg font-medium">{step.subtitle}</span></h3>
                  <p className="text-gray-300 mb-3">{step.description}</p>
                  
                  {step.proof && (
                    <div className="mt-4 p-3 bg-gray-800/50 rounded-lg border-l-4 border-green-500">
                      <p className="text-sm text-gray-300 italic">"{step.proof}"</p>
                    </div>
                  )}
                  
                  {step.demo && (
                    <div className="mt-4 p-4 bg-gray-800/30 rounded-lg border border-dashed border-gray-700">
                      <p className="text-sm text-gray-400 mb-2">Demo:</p>
                      <p className="text-sm text-gray-300">{step.demo}</p>
                    </div>
                  )}
                  
                  {step.counter && (
                    <div className="mt-4 p-3 bg-gradient-to-r from-yellow-500/10 to-amber-500/10 rounded-lg">
                      <p className="text-sm font-medium text-yellow-400">Live: {step.counter}</p>
                    </div>
                  )}
                  
                  {step.graphic && (
                    <div className="mt-4 p-3 bg-gray-800/30 rounded-lg">
                      <div className="w-16 h-16 mx-auto bg-gradient-to-br from-teal-500 to-blue-500 rounded-full flex items-center justify-center text-white text-2xl mb-2">
                        ∞
                      </div>
                      <p className="text-xs text-center text-gray-400">{step.graphic}</p>
                    </div>
                  )}
                </div>
                
                {/* Step number */}
                <div className={`absolute left-1/2 -ml-5 w-10 h-10 flex items-center justify-center rounded-full font-bold text-white bg-${step.color} border-4 border-stormGray z-10`}>
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
