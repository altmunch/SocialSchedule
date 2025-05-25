'use client';

import { motion } from 'framer-motion';
import { BarChart2, Zap, Clock, TrendingUp, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const features = [
  {
    icon: <BarChart2 className="w-6 h-6 text-blitzBlue" />,
    title: 'Performance Analytics',
    description: 'Real-time insights into what\'s working and what\'s not with our advanced analytics dashboard.'
  },
  {
    icon: <Zap className="w-6 h-6 text-surgePurple" />,
    title: 'AI Optimization',
    description: 'Our AI continuously learns and optimizes your posting schedule for maximum engagement.'
  },
  {
    icon: <Clock className="w-6 h-6 text-thunderYellow" />,
    title: 'Smart Scheduling',
    description: 'Automatically schedule posts for optimal times based on your audience\'s activity.'
  },
  {
    icon: <TrendingUp className="w-6 h-6 text-loopTeal" />,
    title: 'Growth Tracking',
    description: 'Monitor your growth with detailed metrics and actionable insights.'
  }
];

export default function DashboardPreview() {
  return (
    <section className="py-20 bg-stormGray relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 -right-20 w-96 h-96 rounded-full bg-blitzBlue/10 filter blur-3xl"></div>
        <div className="absolute bottom-1/4 -left-20 w-96 h-96 rounded-full bg-surgePurple/10 filter blur-3xl"></div>
      </div>
      
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Your <span className="text-blitzBlue">Command Center</span> for Social Media Domination
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Everything you need to grow your audience, all in one powerful dashboard.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Features List */}
          <div className="space-y-6">
            {features.map((feature, index) => (
              <motion.div 
                key={index}
                className="bg-stormGray/30 backdrop-blur-sm p-6 rounded-xl border border-gray-700/50 hover:border-blitzBlue/50 transition-all duration-300"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    {feature.icon}
                  </div>
                  <div className="ml-4">
                    <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                    <p className="text-gray-300">{feature.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Dashboard Preview */}
          <motion.div 
            className="relative"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="relative z-10 bg-gray-900 rounded-2xl overflow-hidden border-4 border-gray-700 shadow-2xl">
              {/* Browser chrome */}
              <div className="h-10 bg-gray-800 flex items-center px-4">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <div className="ml-4 text-xs text-gray-400">dashboard.socialschedule.com</div>
              </div>
              
              {/* Dashboard content */}
              <div className="p-4 bg-gray-900 h-96 overflow-hidden">
                {/* Stats row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {[
                    { value: '12.8K', label: 'Total Followers', change: '+12%' },
                    { value: '1.2K', label: 'Engagement', change: '+27%' },
                    { value: '48', label: 'Scheduled', change: '6 new' },
                    { value: '3.2K', label: 'Impressions', change: '+18%' },
                  ].map((stat, i) => (
                    <div key={i} className="bg-gray-800/50 p-3 rounded-lg">
                      <div className="text-2xl font-bold text-blitzBlue">{stat.value}</div>
                      <div className="text-xs text-gray-400">{stat.label}</div>
                      <div className="text-xs text-green-400 mt-1">{stat.change}</div>
                    </div>
                  ))}
                </div>
                
                {/* Chart placeholder */}
                <div className="h-48 bg-gray-800/50 rounded-lg mb-4 p-4">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h4 className="font-bold">Engagement Overview</h4>
                      <p className="text-xs text-gray-400">Last 7 days</p>
                    </div>
                    <div className="text-xs px-2 py-1 rounded-full bg-blitzBlue/20 text-blitzBlue">
                      +27.3% from last week
                    </div>
                  </div>
                  <div className="h-24 flex items-end space-x-1">
                    {[20, 45, 30, 60, 50, 80, 70].map((height, i) => (
                      <div 
                        key={i}
                        className={`flex-1 rounded-t-sm ${
                          i === 5 ? 'bg-blitzBlue' : 'bg-gray-700'
                        }`}
                        style={{ height: `${height}%` }}
                      ></div>
                    ))}
                  </div>
                </div>
                
                {/* Recent activity */}
                <div>
                  <h5 className="text-sm font-medium mb-2">Recent Activity</h5>
                  <div className="space-y-2">
                    {[
                      { text: 'Your post went viral! +1,240 impressions', time: '2h ago' },
                      { text: 'New best time to post: 3:42 PM', time: '5h ago' },
                      { text: 'AI optimization complete for next post', time: '1d ago' },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center text-sm">
                        <div className="w-2 h-2 rounded-full bg-blitzBlue mr-2"></div>
                        <span className="text-gray-300">{item.text}</span>
                        <span className="ml-auto text-xs text-gray-500">{item.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Glow effect */}
            <div className="absolute -inset-4 bg-gradient-to-r from-blitzBlue/20 to-surgePurple/20 rounded-3xl filter blur-2xl -z-10"></div>
          </motion.div>
        </div>
        
        <motion.div 
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <Button 
            size="lg" 
            className="bg-gradient-to-r from-blitzBlue to-surgePurple hover:opacity-90 transition-all transform hover:scale-105 group"
          >
            See Dashboard in Action
            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
