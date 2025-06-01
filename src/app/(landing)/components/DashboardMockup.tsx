'use client';

import { motion } from 'framer-motion';

export default function DashboardMockup() {
  return (
    <div className="relative w-full aspect-video">
      {/* Dashboard Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
          <div className="h-6 w-32 bg-white/5 rounded-md"></div>
        </div>
        <div className="flex justify-between items-center">
          <div className="h-8 w-40 bg-white/10 rounded-md"></div>
          <div className="flex space-x-2">
            <div className="h-8 w-8 bg-white/10 rounded-md"></div>
            <div className="h-8 w-8 bg-white/10 rounded-md"></div>
            <div className="h-8 w-24 bg-purple-500/30 rounded-md"></div>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="grid grid-cols-12 gap-4">
        {/* Sidebar */}
        <div className="col-span-3">
          <div className="space-y-3">
            <div className="h-10 w-full bg-white/5 rounded-md"></div>
            <div className="h-10 w-full bg-purple-500/30 rounded-md"></div>
            <div className="h-10 w-full bg-white/5 rounded-md"></div>
            <div className="h-10 w-full bg-white/5 rounded-md"></div>
            <div className="h-10 w-full bg-white/5 rounded-md"></div>
          </div>
        </div>

        {/* Main Content */}
        <div className="col-span-9 space-y-4">
          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-3">
            <div className="h-24 bg-white/5 rounded-lg p-3">
              <div className="h-4 w-16 bg-white/10 rounded mb-2"></div>
              <div className="h-8 w-24 bg-white/20 rounded mb-2"></div>
              <div className="h-3 w-12 bg-green-500/30 rounded"></div>
            </div>
            <div className="h-24 bg-white/5 rounded-lg p-3">
              <div className="h-4 w-16 bg-white/10 rounded mb-2"></div>
              <div className="h-8 w-24 bg-white/20 rounded mb-2"></div>
              <div className="h-3 w-12 bg-blue-500/30 rounded"></div>
            </div>
            <div className="h-24 bg-white/5 rounded-lg p-3">
              <div className="h-4 w-16 bg-white/10 rounded mb-2"></div>
              <div className="h-8 w-24 bg-white/20 rounded mb-2"></div>
              <div className="h-3 w-12 bg-purple-500/30 rounded"></div>
            </div>
          </div>

          {/* Chart Area */}
          <div className="h-48 bg-white/5 rounded-lg p-4">
            <div className="h-6 w-32 bg-white/10 rounded mb-4"></div>
            <div className="flex items-end h-28 space-x-2 pt-2">
              {[40, 65, 35, 85, 55, 75, 30, 90, 60, 45, 70, 50].map((height, i) => (
                <motion.div
                  key={i}
                  className="flex-1 bg-gradient-to-t from-purple-500/20 to-purple-500/60 rounded-t"
                  initial={{ height: 0 }}
                  whileInView={{ height: `${height}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.05 * i }}
                ></motion.div>
              ))}
            </div>
          </div>

          {/* Content Items */}
          <div className="grid grid-cols-2 gap-3">
            <div className="h-32 bg-white/5 rounded-lg p-3 flex">
              <div className="w-20 h-20 bg-white/10 rounded mr-3 flex-shrink-0"></div>
              <div className="space-y-2 flex-1">
                <div className="h-4 w-full bg-white/10 rounded"></div>
                <div className="h-4 w-3/4 bg-white/10 rounded"></div>
                <div className="h-4 w-1/2 bg-white/10 rounded"></div>
              </div>
            </div>
            <div className="h-32 bg-white/5 rounded-lg p-3 flex">
              <div className="w-20 h-20 bg-white/10 rounded mr-3 flex-shrink-0"></div>
              <div className="space-y-2 flex-1">
                <div className="h-4 w-full bg-white/10 rounded"></div>
                <div className="h-4 w-3/4 bg-white/10 rounded"></div>
                <div className="h-4 w-1/2 bg-white/10 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Animated Glow Effect */}
      <motion.div 
        className="absolute -inset-0.5 rounded-lg bg-gradient-to-r from-purple-500/0 via-purple-500/30 to-purple-500/0 opacity-0 blur-xl"
        animate={{ 
          opacity: [0, 0.5, 0],
          backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
        }}
        transition={{ 
          duration: 5,
          repeat: Infinity,
          repeatType: 'loop'
        }}
      />
    </div>
  );
}
