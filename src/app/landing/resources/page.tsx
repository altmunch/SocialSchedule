'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, BookOpen, HelpCircle, FileCode } from 'lucide-react';
import Link from 'next/link';

import NavigationBar from '@/app/landing/components/NavigationBar';

export default function ResourcesPage() {
  const [activeTab, setActiveTab] = useState<string>('guides');
  const [currentYear, setCurrentYear] = useState(2024); // Default fallback year
  
  useEffect(() => {
    // Set the actual year only on client side to prevent hydration mismatch
    setCurrentYear(new Date().getFullYear());
  }, []);
  
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    const element = document.getElementById(tab);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };
  
  return (
    <div className="bg-[#0A0A0A] min-h-screen text-lightning-DEFAULT pt-16">
      <NavigationBar />
      
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16 max-w-4xl mx-auto"
        >
          <motion.div 
            className="bg-[#0A0A0A] border border-white/5 rounded-xl p-12 text-center relative overflow-hidden shadow-xl"
          >
            <motion.h1 className="text-4xl font-bold text-white mb-6">
              Resources
            </motion.h1>
            <motion.p className="text-xl text-white/80 max-w-3xl mx-auto mb-10">
              Everything you need to succeed with SocialSchedule
            </motion.p>
            
            {/* Tab Navigation */}
            <div className="flex justify-center items-center space-x-4 mb-8">
              <div className="inline-flex bg-black/30 p-1 rounded-full border border-white/10 backdrop-blur-sm">
                <button
                  onClick={() => handleTabChange('guides')}
                  className={`px-6 py-2 rounded-full text-sm font-medium transition-all flex items-center ${
                    activeTab === 'guides' 
                      ? 'bg-[#8D5AFF] text-white shadow-lg' 
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  <BookOpen className="h-4 w-4 mr-2" /> Guides
                </button>
                <button
                  onClick={() => handleTabChange('faq')}
                  className={`px-6 py-2 rounded-full text-sm font-medium transition-all flex items-center ${
                    activeTab === 'faq' 
                      ? 'bg-[#8D5AFF] text-white shadow-lg' 
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  <HelpCircle className="h-4 w-4 mr-2" /> FAQ
                </button>
                <button
                  onClick={() => handleTabChange('templates')}
                  className={`px-6 py-2 rounded-full text-sm font-medium transition-all flex items-center ${
                    activeTab === 'templates' 
                      ? 'bg-[#8D5AFF] text-white shadow-lg' 
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  <FileCode className="h-4 w-4 mr-2" /> Templates
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      
        {/* Guides Section */}
        <section id="guides" className="max-w-5xl mx-auto mb-20">
          <motion.h2 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-3xl font-bold mb-8 text-[#8D5AFF] border-b border-white/10 pb-4"
          >
            Guides
          </motion.h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <motion.div
                key={`guide-${i}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-black/30 border border-white/10 rounded-lg p-6 hover:border-[#5afcc0]/30 transition-all"
              >
                <div className="w-12 h-12 bg-[#5afcc0]/10 rounded-lg flex items-center justify-center mb-4">
                  <BookOpen className="h-6 w-6 text-[#5afcc0]" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-white">Guide {i}: Getting Started</h3>
                <p className="text-white/70 mb-4 text-sm">
                  Learn how to set up your account, connect your social platforms, and start automating your content.
                </p>
                <Link href="/coming-soon" className="inline-flex items-center text-[#8D5AFF] hover:text-[#8D5AFF]/80">
                  Read more <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </motion.div>
            ))}
          </div>
        </section>
        
        {/* FAQ Section */}
        <section id="faq" className="max-w-5xl mx-auto mb-20">
          <motion.h2 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-3xl font-bold mb-8 text-[#8D5AFF] border-b border-white/10 pb-4"
          >
            Frequently Asked Questions
          </motion.h2>
          
          <div className="space-y-6">
            {[
              {
                question: "What's the 10-day guarantee?",
                answer: "We're confident in our platform's ability to deliver results. If you don't see measurable improvements in your social media performance within 10 days, contact us for a full refund."
              },
              {
                question: "How does SocialSchedule work?",
                answer: "SocialSchedule uses AI to analyze your content and audience, automatically create optimized clips, and schedule them for posting at the optimal times. Our platform handles everything from content creation to performance tracking."
              },
              {
                question: "Do I need technical skills to use SocialSchedule?",
                answer: "Not at all! SocialSchedule is designed to be user-friendly. Our interface guides you through the process, and our AI handles the technical aspects for you."
              },
              {
                question: "Can I cancel my subscription at any time?",
                answer: "Yes, you can cancel your subscription at any time. Your account will remain active until the end of your billing period."
              }
            ].map((faq, i) => (
              <motion.div 
                key={`faq-${i}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-black/30 border border-white/10 rounded-lg p-6"
              >
                <h3 className="text-lg font-semibold mb-3 text-white">{faq.question}</h3>
                <p className="text-white/70">{faq.answer}</p>
              </motion.div>
            ))}
          </div>
        </section>
        
        {/* Templates Section */}
        <section id="templates" className="max-w-5xl mx-auto mb-20">
          <motion.h2 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-3xl font-bold mb-8 text-[#8D5AFF] border-b border-white/10 pb-4"
          >
            Hooks and Templates
          </motion.h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <motion.div
                key={`template-${i}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-black/30 border border-white/10 rounded-lg p-6 hover:border-[#5afcc0]/30 hover:shadow-lg hover:shadow-[#5afcc0]/5 transition-all"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="w-10 h-10 bg-[#8D5AFF]/10 rounded-lg flex items-center justify-center">
                    <FileCode className="h-5 w-5 text-[#8D5AFF]" />
                  </div>
                  <span className="bg-[#5afcc0]/10 text-[#5afcc0] text-xs px-2 py-1 rounded">Free</span>
                </div>
                <h3 className="text-lg font-semibold mb-2 text-white">Template {i}</h3>
                <p className="text-white/70 mb-4 text-sm">
                  High-converting caption template for product showcases and demonstrations.
                </p>
                <Link href="/coming-soon" className="w-full bg-[#8D5AFF]/10 hover:bg-[#8D5AFF]/20 text-[#8D5AFF] rounded-lg py-2 px-4 text-center block text-sm font-medium transition-all">
                  Download template
                </Link>
              </motion.div>
            ))}
          </div>
        </section>
      </div>
      
      {/* Simple Footer */}
      <div className="border-t border-white/10 py-8 mt-12">
        <div className="container mx-auto px-4">
          <div className="flex justify-center">
            <p className="text-white/40 text-sm">© {currentYear} SocialSchedule. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
