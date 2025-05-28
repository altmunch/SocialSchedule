'use client';

import { motion } from 'framer-motion';
import { Zap, Search, BarChart2, RefreshCw, PlayCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const steps = [
  {
    icon: <Search className="w-8 h-8 text-blitzBlue" />,
    title: 'SCAN',
    subtitle: 'AI Trend Analysis',
    description: 'Our AI analyzes millions of data points to identify emerging trends and patterns in your niche before they peak.',
    proof: 'Users see 48h head start on trending content',
    color: 'blitzBlue'
  },
  {
    icon: <Zap className="w-8 h-8 text-surgePurple" />,
    title: 'OPTIMIZE',
    subtitle: 'Content Enhancement',
    description: 'Automatically enhances your posts with optimal hashtags, captions, and posting times based on real-time data.',
    demo: 'See how we transformed a basic post into a viral hit',
    color: 'surgePurple',
    videoDemo: '/demos/optimization-demo.mp4' // Placeholder for demo video
  },
  {
    icon: <BarChart2 className="w-8 h-8 text-thunderYellow" />,
    title: 'SCHEDULE',
    subtitle: 'Perfect Timing',
    description: 'Posts your content at the exact moment your audience is most engaged, increasing reach by an average of 2.7x.',
    counter: '12,834 posts optimized today',
    color: 'thunderYellow'
  },
  {
    icon: <RefreshCw className="w-8 h-8 text-loopTeal" />,
    title: 'ANALYZE & IMPROVE',
    subtitle: 'Continuous Learning',
    description: 'Our AI learns from every post, constantly refining its algorithms to improve your results over time.',
    proof: 'Users see an average 27% increase in engagement after 30 days',
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
          <div className="inline-block px-4 py-1.5 rounded-full bg-[#0066FF]/10 border border-[#0066FF]/20 text-[#0066FF] text-sm font-medium mb-4">
            How It Works
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            The <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0066FF] via-[#7F00FF] to-[#00FFCC]">Viral Growth</span> System
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Our proven 4-step system helps you grow your audience and engagement on autopilot
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
                
                  
                  {step.demo && (
                    <div className="mt-4">
                      <div className="relative aspect-video bg-gray-800/50 rounded-lg overflow-hidden border border-gray-700/50">
                        {/* Placeholder for video demo */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
                            <PlayCircle className="w-8 h-8 text-white" />
                          </div>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                          <p className="text-sm font-medium text-white">{step.demo}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {step.counter && (
                    <div className="mt-4 p-3 bg-gradient-to-r from-yellow-500/10 to-amber-500/10 rounded-lg">
                      <p className="text-sm font-medium text-yellow-400">Live: {step.counter}</p>
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
      
      {/* Demo CTA Section */}
      <div className="mt-24 max-w-6xl mx-auto px-4">
        <div className="bg-gradient-to-r from-[#0066FF]/10 to-[#7F00FF]/10 rounded-2xl p-8 md:p-12 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-5"></div>
          <div className="relative z-10">
            <div className="text-center max-w-3xl mx-auto">
              <h3 className="text-2xl md:text-3xl font-bold mb-4">See It In Action</h3>
              <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
                Watch how our AI transforms your social media strategy in just 2 minutes
              </p>
              <div className="relative aspect-video bg-black/30 rounded-xl overflow-hidden border border-gray-700/50 mb-8">
                {/* Video placeholder */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center mx-auto mb-4">
                      <PlayCircle className="w-10 h-10 text-white" />
                    </div>
                    <p className="text-gray-300">Watch Demo</p>
                  </div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Button className="bg-gradient-to-r from-[#0066FF] to-[#7F00FF] hover:from-[#7F00FF] hover:to-[#0066FF] text-white font-semibold py-3 px-8 rounded-lg transition-all transform hover:-translate-y-0.5">
                  Start Free Trial
                </Button>
                <Button variant="outline" className="bg-transparent border-gray-600 text-white hover:bg-gray-800/50 hover:border-gray-500 font-medium py-3 px-8 rounded-lg transition-all">
                  See Pricing
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
