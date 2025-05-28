'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

export default function SocialProofBar() {
  // Logos for trusted brands (e-commerce platforms)
  const brands = [
    'Shopify', 
    'WooCommerce', 
    'BigCommerce', 
    'Etsy', 
    'Amazon'
  ];
  
  // Key stats focused on seller results
  const stats = [
    { value: '$3.2M+', label: 'Sales Generated' },
    { value: '12K+', label: 'Active Sellers' },
    { value: '58%', label: 'Average Conversion Increase' }
  ];
  
  return (
    <section className="bg-white border-y border-gray-100 py-10 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="flex flex-col md:flex-row items-center justify-between gap-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Trusted by e-commerce sellers */}
          <div className="w-full md:w-auto">
            <p className="text-[#444444] text-sm font-medium mb-4 text-center md:text-left">TRUSTED BY TOP E-COMMERCE SELLERS ON</p>
            <div className="flex flex-wrap justify-center md:justify-start gap-6 items-center">
              {brands.map((brand, index) => (
                <div key={index} className="h-8 flex items-center">
                  <div className="bg-gray-100 text-[#333333] font-medium px-4 py-1 rounded-md">{brand}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center px-4">
                <div className="text-2xl font-bold text-[#007BFF]">{stat.value}</div>
                <div className="text-sm font-medium text-[#444444]">{stat.label}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
