'use client';

import { motion } from 'framer-motion';
import { Shield, Check } from 'lucide-react';

interface GuaranteeSectionProps {
  onGetStarted?: () => void;
}

export default function GuaranteeSection({ onGetStarted }: GuaranteeSectionProps) {
  return (
    <section className="py-16 md:py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="bg-white border border-gray-200 rounded-xl p-8 md:p-12 text-center max-w-4xl mx-auto shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Shield className="h-10 w-10 text-[#007BFF]" />
          </div>

          <h2 className="text-3xl md:text-4xl font-bold text-[#333333] mb-6">Our Sales-Generation Guarantee</h2>
          
          <p className="text-xl text-[#444444] mb-8 max-w-3xl mx-auto">
            If you don't see a measurable increase in product sales within 14 days of implementing our system, 
            we'll give you the next month completely free. No questions asked.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <div className="bg-blue-50 px-6 py-3 rounded-md border border-blue-100">
              <p className="text-[#007BFF] font-medium">14-Day Guarantee</p>
            </div>
            <div className="bg-blue-50 px-6 py-3 rounded-md border border-blue-100">
              <p className="text-[#007BFF] font-medium">No Long-Term Contracts</p>
            </div>
            <div className="bg-blue-50 px-6 py-3 rounded-md border border-blue-100">
              <p className="text-[#007BFF] font-medium">Cancel Anytime</p>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6 mb-8 max-w-3xl mx-auto">
            {[
              "No questions asked",
              "No complicated terms",
              "Simple, measurable results",
              "Risk-free trial period"
            ].map((item, index) => (
              <motion.div 
                key={index}
                className="flex items-center bg-blue-50 border border-blue-100 p-4 rounded-md"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: 0.3 + (index * 0.1) }}
              >
                <Check className="h-5 w-5 text-[#007BFF] mr-3 flex-shrink-0" />
                <span className="text-[#444444]">{item}</span>
              </motion.div>
            ))}
          </div>
          
          {onGetStarted && (
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <button
                onClick={onGetStarted}
                className="bg-[#007BFF] hover:bg-[#0070E0] text-white px-8 py-4 rounded-md font-semibold text-lg shadow-md transition-all"
              >
                Get Started Risk-Free
              </button>
              <p className="mt-4 text-sm text-[#666666]">
                No long-term contracts. Cancel anytime.
              </p>
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>
  );
}
