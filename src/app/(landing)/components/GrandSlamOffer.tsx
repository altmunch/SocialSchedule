'use client';

import { motion } from 'framer-motion';
import { Zap, Clock, CheckCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const bonuses = [
  {
    title: 'AI Content Generator PRO',
    value: '$297',
    description: 'Generate 100 high-quality, engaging posts in minutes with our advanced AI.',
    features: [
      'Customized for your niche',
      'Trend-aware content',
      'Unlimited generations',
      '1-year updates'
    ]
  },
  {
    title: 'Viral Hashtag Engine',
    value: '$197',
    description: 'Automatically find and use trending hashtags to boost your reach by up to 40%.',
    features: [
      'Real-time trend analysis',
      'Niche-specific hashtags',
      'Auto-rotation',
      'Performance tracking'
    ]
  },
  {
    title: 'Engagement Booster',
    value: '$147',
    description: 'Automatically engage with potential followers to grow your audience faster.',
    features: [
      'Smart targeting',
      'Auto-comments & likes',
      'Custom engagement rules',
      'Daily reports'
    ]
  },
  {
    title: '1-on-1 Strategy Session',
    value: '$497',
    description: '60-minute call with our growth experts to create a personalized strategy.',
    features: [
      'Content strategy',
      'Audience growth plan',
      'Monetization advice',
      'Q&A session'
    ]
  }
];

export default function GrandSlamOffer() {
  return (
    <section className="py-20 bg-gradient-to-br from-stormGray to-stormGray/80 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('/grid-pattern.svg')] opacity-5"></div>
        <div className="absolute top-1/3 -right-20 w-64 h-64 rounded-full bg-thunderYellow/10 filter blur-3xl"></div>
        <div className="absolute bottom-1/3 -left-20 w-64 h-64 rounded-full bg-blitzBlue/10 filter blur-3xl"></div>
      </div>
      
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <motion.div 
            className="inline-flex items-center px-4 py-1.5 rounded-full bg-thunderYellow/20 border border-thunderYellow/30 text-thunderYellow text-sm font-medium mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Zap className="w-4 h-4 mr-2" />
            <span>LIMITED TIME BONUS</span>
          </motion.div>
          
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Join the <span className="text-thunderYellow">Viral Blitz</span> and Get These
            <span className="text-blitzBlue"> Free Bonuses</span> (Worth $1,138)
          </h2>
          
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            When you join today, you'll get instant access to these premium bonuses absolutely free.
            But hurry - this offer disappears when the timer hits zero!
          </p>
          
          <motion.div 
            className="mt-8 inline-flex items-center px-6 py-3 bg-gradient-to-r from-blitzBlue/20 to-surgePurple/20 backdrop-blur-sm rounded-lg border border-gray-700"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Clock className="w-5 h-5 text-thunderYellow mr-2" />
            <span className="text-lg font-medium">Offer expires in: </span>
            <span className="ml-2 text-2xl font-bold text-thunderYellow">23:59:59</span>
          </motion.div>
        </div>

        {/* Bonus Grid */}
        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto mb-16">
          {bonuses.map((bonus, index) => (
            <motion.div 
              key={index}
              className="bg-stormGray/30 backdrop-blur-sm rounded-xl border border-gray-700/50 overflow-hidden hover:border-blitzBlue/50 transition-all duration-300 group"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold">{bonus.title}</h3>
                  <div className="px-3 py-1 bg-blitzBlue/10 text-blitzBlue text-sm font-medium rounded-full">
                    ${bonus.value} FREE
                  </div>
                </div>
                
                <p className="text-gray-300 mb-4">{bonus.description}</p>
                
                <ul className="space-y-2 mb-6">
                  {bonus.features.map((feature, i) => (
                    <li key={i} className="flex items-center text-gray-300">
                      <CheckCircle className="w-4 h-4 text-loopTeal mr-2" />
                      {feature}
                    </li>
                  ))}
                </ul>
                
                <div className="text-sm text-gray-400">
                  <span className="line-through">${bonus.value}</span>
                  <span className="ml-2 text-thunderYellow font-bold">FREE with your order today!</span>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-blitzBlue/10 to-surgePurple/10 p-4 text-center border-t border-gray-700/50">
                <div className="text-xs text-gray-400 mb-1">Included with your order</div>
                <div className="text-blitzBlue font-medium flex items-center justify-center">
                  <span>Add to my order</span>
                  <CheckCircle className="w-4 h-4 ml-2" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        
        {/* CTA Section */}
        <motion.div 
          className="bg-gradient-to-r from-blitzBlue/10 via-surgePurple/10 to-loopTeal/10 p-8 rounded-2xl border border-blitzBlue/30 relative overflow-hidden max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {/* Decorative elements */}
          <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-blitzBlue/5 filter blur-3xl"></div>
          <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-surgePurple/5 filter blur-3xl"></div>
          
          <div className="relative z-10 text-center">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">Ready to Activate Your Viral Blitz Cycle?</h3>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Join now and get all these bonuses plus our 30-day money-back guarantee. 
              Your success is our priority.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-blitzBlue to-surgePurple hover:opacity-90 transition-all transform hover:scale-105 group"
              >
                Start My Free Trial Now
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
              
              <Button 
                variant="outline" 
                size="lg" 
                className="border-gray-600 text-lightningWhite hover:bg-gray-800/50"
              >
                Watch Demo
              </Button>
            </div>
            
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-2 text-sm text-gray-400">
              <div className="flex items-center">
                <div className="flex -space-x-2 mr-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="w-6 h-6 rounded-full bg-gradient-to-r from-blitzBlue to-surgePurple border-2 border-stormGray"></div>
                  ))}
                </div>
                <span>12,834+ creators already joined</span>
              </div>
              <div className="hidden sm:block w-px h-4 bg-gray-700 mx-4"></div>
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-1 text-thunderYellow" />
                <span>Limited time offer</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
