'use client';

import { motion } from 'framer-motion';

export default function ResultsSection() {
  const stats = [
    { value: '$3.2M+', label: 'Sales Generated' },
    { value: '58%', label: 'Avg. Conversion Increase' },
    { value: '72h', label: 'To First Sale-Generating Post' },
    { value: '12K+', label: 'Active Sellers' }
  ];

  return (
    <section className="py-16 md:py-24 bg-white border-y border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.h2 
            className="text-3xl md:text-4xl font-bold text-[#333333] mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Real Sales Results for E-Commerce Sellers
          </motion.h2>
          
          <motion.p 
            className="text-xl text-[#444444] max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Our platform is driving actual product sales, not just views and likes
          </motion.p>
        </div>

        <motion.div 
          className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {stats.map((stat, index) => (
            <div key={index} className="bg-white p-8 rounded-xl border border-gray-200 shadow-md hover:shadow-lg transition-shadow">
              <div className="text-4xl md:text-5xl font-bold text-[#007BFF] mb-2">{stat.value}</div>
              <div className="text-[#444444] font-medium">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        <motion.div 
          className="mt-16 text-center max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <p className="text-lg text-[#444444]">
            <span className="font-semibold text-[#333333]">These aren't just vanity metrics.</span> Our platform focuses exclusively on revenue-generating actions and sales conversion.
          </p>
          <p className="text-lg text-[#444444] mt-2">
            Why settle for likes when you could be generating actual income?
          </p>
        </motion.div>
      </div>
    </section>
  );
}
