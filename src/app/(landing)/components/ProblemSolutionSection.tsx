'use client';

import { motion } from 'framer-motion';
import { XCircle, CheckCircle } from 'lucide-react';

export default function ProblemSolutionSection() {
  return (
    <section className="bg-white py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-[#333333] mb-4">Stop Creating Content That Only Gets Views</h2>
          <p className="text-xl text-[#444444] max-w-3xl mx-auto">Our platform is specifically built for <span className="font-semibold">sellers</span>, not just creators.</p>
        </div>
        
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Problem Side */}
          <div className="bg-white p-8 rounded-xl border border-red-100 shadow-md">
            <div className="flex items-center mb-6">
              <XCircle className="h-8 w-8 text-red-500 mr-3" />
              <h3 className="text-xl md:text-2xl font-bold text-[#333333]">Generic Creator Tools</h3>
            </div>
            
            <ul className="space-y-4">
              {[
                'Focused on views and engagement, not actual sales',
                'Generic content templates not optimized for product selling',
                'Limited e-commerce integration and sales tracking',
                'One-size-fits-all approach to content scheduling',
                'No competitor research tools specific to your product niche',
              ].map((item, index) => (
                <li key={index} className="flex items-start">
                  <XCircle className="h-5 w-5 text-red-500 mr-3 flex-shrink-0 mt-0.5" />
                  <p className="text-[#444444]">{item}</p>
                </li>
              ))}
            </ul>
          </div>

          {/* Solution Side */}
          <div className="bg-white p-8 rounded-xl border border-green-100 shadow-md">
            <div className="flex items-center mb-6">
              <CheckCircle className="h-8 w-8 text-[#28A745] mr-3" />
              <h3 className="text-xl md:text-2xl font-bold text-[#333333]">SocialSchedule for Sellers</h3>
            </div>
            
            <ul className="space-y-4">
              {[
                'Content optimized specifically to drive product sales',
                'AI learns your unique brand voice and product selling points',
                'Direct integration with your e-commerce platform for sales tracking',
                'Precise "Blitz" scheduling based on when your audience buys most',
                'Advanced "Scan" feature to analyze top-performing competitor content in your niche',
              ].map((item, index) => (
                <li key={index} className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-[#28A745] mr-3 flex-shrink-0 mt-0.5" />
                  <p className="text-[#444444]">{item}</p>
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
