'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { Star } from 'lucide-react';

export default function TestimonialsSection() {
  const testimonials = [
    {
      quote: "SocialSchedule helped me turn my Shopify store's social content into a consistent sales machine. The AI-optimized posts generate 73% more conversions than our manual efforts.",
      author: "Emily Parker",
      role: "Fashion Brand Owner",
      avatar: "/avatars/emily.jpg", // You would add actual avatar images
      platform: "Instagram",
      highlight: "73% increase in conversions"
    },
    {
      quote: "The Blitz feature automatically posts when our customers are most likely to buy. Our product sales directly from social media have increased by 215% in just two months.",
      author: "Alex Chen",
      role: "E-commerce Entrepreneur",
      avatar: "/avatars/alex.jpg",
      platform: "TikTok Shop",
      highlight: "215% increase in sales"
    },
    {
      quote: "The competitor Scan feature saves me hours of research. I can see exactly what's working for top sellers in my niche and adapt those strategies for my own products.",
      author: "Marcus Johnson",
      role: "Supplement Store Owner",
      avatar: "/avatars/marcus.jpg",
      platform: "YouTube Shorts",
      highlight: "10 hours saved per week"
    }
  ];

  return (
    <section className="py-16 md:py-24 bg-white" id="testimonials">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.h2 
            className="text-3xl md:text-4xl font-bold text-[#333333] mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Success Stories From E-Commerce Sellers
          </motion.h2>
          
          <motion.p 
            className="text-xl text-[#444444] max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Join thousands of e-commerce sellers who have transformed their social media 
            content into a consistent sales engine
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div 
              key={index}
              className="bg-white p-8 rounded-xl border border-gray-200 shadow-md hover:shadow-lg transition-shadow"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 * (index + 1) }}
            >
              {/* Stars */}
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-500 fill-current" />
                ))}
              </div>
              
              {/* Quote */}
              <p className="text-[#444444] mb-6 italic">"{testimonial.quote}"</p>
              
              {/* Author */}
              <div className="flex items-center mt-4">
                <div className="w-12 h-12 rounded-full bg-blue-50 mr-4 relative overflow-hidden border border-gray-200">
                  {/* In a real implementation, you would use actual avatar images */}
                  <div className="absolute inset-0 flex items-center justify-center text-[#007BFF] font-bold">
                    {testimonial.author.charAt(0)}
                  </div>
                </div>
                <div>
                  <p className="font-semibold text-[#333333]">{testimonial.author}</p>
                  <p className="text-[#666666]">{testimonial.role}</p>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center text-[#007BFF] font-medium mb-2">
                  <span className="bg-blue-50 px-2 py-1 rounded text-sm">{testimonial.highlight}</span>
                </div>
                <p className="text-sm text-[#666666]">Platform: {testimonial.platform}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div 
          className="mt-12 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <p className="text-lg text-[#444444]">
            <span className="font-semibold text-[#333333]">These are just a few examples.</span> We have thousands of success stories from sellers just like you.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
