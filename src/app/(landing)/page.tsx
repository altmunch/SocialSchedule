'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

import NavigationBar from '@/app/(landing)/components/NavigationBar';
import HeroSection from '@/app/(landing)/components/HeroSection';
import SocialProofBar from '@/app/(landing)/components/SocialProofBar';
import ProblemSolutionSection from '@/app/(landing)/components/ProblemSolutionSection';
import FeaturesSection from '@/app/(landing)/components/FeaturesSection';
import ResultsSection from '@/app/(landing)/components/ResultsSection';
import TestimonialsSection from '@/app/(landing)/components/TestimonialsSection';
import Footer from '@/app/(landing)/components/Footer';

export default function LandingPage() {
  const router = useRouter();

  const handleGetStarted = () => {
    router.push('/dashboard');
  };

  const handleDemo = () => {
    // Scroll to the features section or open a demo modal
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden scroll-smooth relative">
      {/* Enhanced Grid Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden bg-black">
        <div className="absolute inset-0 [background-image:linear-gradient(to_right,rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.1)_1px,transparent_1px)] [background-size:60px_60px]"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black to-[#0A0A0A] opacity-90"></div>
      </div>
      <div className="relative z-10 grid grid-cols-1">
        <NavigationBar />
      <main className="bg-gradient-to-b from-black to-[#0A0A0A]">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7 }}
        >
          <HeroSection onGetStarted={handleGetStarted} onDemo={handleDemo} />
        </motion.div>
        
        {/* Section Divider */}
        <div className="w-full max-w-7xl mx-auto px-6 sm:px-12 lg:px-16">
          <div className="h-px bg-gradient-to-r from-transparent via-storm-light/15 to-transparent my-12 md:my-16"></div>
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
        >
          <SocialProofBar />
        </motion.div>

        {/* Section Divider */}
        <div className="w-full max-w-7xl mx-auto px-6 sm:px-12 lg:px-16">
          <div className="h-px bg-gradient-to-r from-transparent via-storm-light/15 to-transparent my-12 md:my-16"></div>
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, delay: 0.1 }}
        >
          <ProblemSolutionSection />
        </motion.div>

        {/* Section Divider */}
        <div className="w-full max-w-7xl mx-auto px-6 sm:px-12 lg:px-16">
          <div className="h-px bg-gradient-to-r from-transparent via-storm-light/15 to-transparent my-12 md:my-16"></div>
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, delay: 0.1 }}
          id="features"
        >
          <FeaturesSection />
        </motion.div>



        {/* Section Divider */}
        <div className="w-full max-w-7xl mx-auto px-6 sm:px-12 lg:px-16">
          <div className="h-px bg-gradient-to-r from-transparent via-storm-light/15 to-transparent my-12 md:my-16"></div>
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="py-20 md:py-32"
        >
          <ResultsSection />
        </motion.div>

        {/* Section Divider */}
        <div className="w-full max-w-7xl mx-auto px-6 sm:px-12 lg:px-16">
          <div className="h-px bg-gradient-to-r from-transparent via-storm-light/15 to-transparent my-12 md:my-16"></div>
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="py-20 md:py-32"
        >
          <TestimonialsSection />
        </motion.div>



        {/* Section Divider */}
        <div className="w-full max-w-7xl mx-auto px-6 sm:px-12 lg:px-16">
          <div className="h-px bg-gradient-to-r from-transparent via-storm-light/15 to-transparent my-12 md:my-16"></div>
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="py-20 md:py-32 bg-gradient-to-b from-[#0A0A0A] to-[#0F1014]"
          style={{ boxShadow: 'inset 0 1px 0 0 rgba(255, 255, 255, 0.05)' }}
          id="pricing"
        >
          <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-16 text-center">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-4xl md:text-5xl font-bold text-white mb-8 tracking-tight leading-tight"
            >
              Ready to transform your social media strategy?
            </motion.h2>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-xl md:text-2xl text-[#E5E7EB] max-w-3xl mx-auto mb-14 leading-relaxed"
            >
              Choose a plan that fits your needs and start increasing your sales through optimized social media content.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Link 
                href="/pricing" 
                className="inline-flex items-center px-10 py-5 bg-gradient-to-r from-[#1E90FF] via-[#4169E1] to-[#9370DB] text-white rounded-xl font-bold text-lg shadow-xl shadow-[#1E90FF]/30 hover:shadow-2xl hover:shadow-[#1E90FF]/40 transition-all duration-300 group"
              >
                <span>View pricing plans</span>
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
              <p className="text-sm text-[#E5E7EB]/70 mt-6">14-day free trial. No credit card required.</p>
            </motion.div>
          </div>
        </motion.div>


      </main>
      
      <motion.footer
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
      >
        <Footer />
      </motion.footer>
      </div>
    </div>
  );
}
