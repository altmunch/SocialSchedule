'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs: FAQItem[] = [
    {
      question: "How does SocialSchedule increase my sales?",
      answer: "SocialSchedule uses AI to optimize your content for maximum engagement and conversions. Our platform analyzes your products, target audience, and competitors to create and schedule content that drives traffic directly to your product listings. The Viral Blitz Cycle ensures your best-performing content gets amplified across platforms, resulting in more traffic and sales."
    },
    {
      question: "How long until I see results?",
      answer: "Most e-commerce sellers see initial sales increases within the first 14 days. Our comprehensive approach allows for quick implementation and fast results. That's why we offer our 14-day guarantee - if you don't see measurable sales increases in that time period, your next month is free."
    },
    {
      question: "Do I need to create my own content?",
      answer: "No! SocialSchedule generates optimized content for you based on your products and brand voice. Our AI analyzes your best-performing content and creates variations that maintain your unique selling proposition while maximizing engagement. You can review and approve all content before it goes live."
    },
    {
      question: "Which platforms does SocialSchedule support?",
      answer: "We support all major social media platforms including TikTok, Instagram, YouTube Shorts, Facebook, Pinterest, and LinkedIn. Our system specializes in short-form video optimization but works equally well with images and text content across all platforms."
    },
    {
      question: "Can I integrate my e-commerce platform?",
      answer: "Yes! SocialSchedule integrates directly with Shopify, WooCommerce, Amazon, Etsy, and most major e-commerce platforms. This allows for direct attribution tracking, product syncing, and automatic updating of inventory status in your promotional content."
    },
    {
      question: "What makes SocialSchedule different from other scheduling tools?",
      answer: "Unlike generic scheduling tools, SocialSchedule is specifically designed for e-commerce sellers with direct revenue generation in mind. Our Viral Blitz Cycle, competitive intelligence, and sales-focused content optimization are all built specifically to drive product sales, not just engagement."
    }
  ];

  const toggleQuestion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-storm-darker to-storm-darkest" id="faq">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.span 
            className="inline-block text-sm font-semibold text-blitz-yellow uppercase tracking-wider mb-3"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            Questions & Answers
          </motion.span>
          
          <motion.h2 
            className="text-3xl md:text-4xl font-bold text-lightning-DEFAULT mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Frequently Asked Questions
          </motion.h2>
          
          <motion.p 
            className="text-xl text-lightning-dim/80 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Everything you need to know about turning your content into sales
          </motion.p>
        </div>
        
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              className="border-2 border-storm-light/10 rounded-xl overflow-hidden bg-gradient-to-br from-storm-dark to-storm-darker hover:border-blitz-blue/30 transition-all duration-300 group"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.05 * index }}
              whileHover={{ 
                y: -2,
                boxShadow: '0 10px 25px -5px rgba(0, 119, 255, 0.1)'
              }}
            >
              <button
                className="flex justify-between items-center w-full p-6 text-left"
                onClick={() => toggleQuestion(index)}
              >
                <h3 className="text-lg font-semibold text-lightning-DEFAULT pr-4">
                  {faq.question}
                </h3>
                <div className={`flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blitz-blue/10 to-blitz-purple/10 flex items-center justify-center transition-all ${openIndex === index ? 'bg-blitz-blue/20' : ''} group-hover:bg-blitz-blue/20`}>
                  <ChevronDown 
                    className={`w-4 h-4 text-blitz-blue transition-transform duration-300 ${openIndex === index ? 'transform rotate-180' : ''}`} 
                  />
                </div>
              </button>
              
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-6 -mt-2 text-lightning-dim/90 border-t border-storm-light/10">
                      <div className="border-l-2 border-blitz-blue/50 pl-4">
                        {faq.answer}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
