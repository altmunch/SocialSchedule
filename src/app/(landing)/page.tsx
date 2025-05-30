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
    <div className="min-h-screen bg-black text-lightning-DEFAULT overflow-x-hidden scroll-smooth relative">
      {/* Simple Light Grey Grid Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden bg-black">
        <div className="absolute inset-0 [background-image:linear-gradient(to_right,rgba(255,255,255,0.15)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.15)_1px,transparent_1px)] [background-size:40px_40px]"></div>
      </div>
      <div className="relative z-10">
        <NavigationBar />
      <main className="bg-[#0A0A0A]">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <HeroSection onGetStarted={handleGetStarted} onDemo={handleDemo} />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <SocialProofBar />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <ProblemSolutionSection />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, delay: 0.2 }}
          id="features"
        >
          <FeaturesSection />
        </motion.div>



        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="py-16 md:py-24"
        >
          <ResultsSection />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="py-16 md:py-24"
        >
          <TestimonialsSection />
        </motion.div>



        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="py-16 md:py-24 bg-[#0A0A0A]"
          id="pricing"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-3xl md:text-4xl font-bold text-lightning-DEFAULT mb-6"
            >
              Ready to transform your social media strategy?
            </motion.h2>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-xl text-lightning-dim/80 max-w-3xl mx-auto mb-10"
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
                className="inline-flex items-center px-8 py-4 bg-[#3D7BF4] text-lightning-DEFAULT rounded-xl font-semibold text-lg shadow-xl shadow-blitz-blue/20 hover:shadow-2xl hover:shadow-blitz-blue/30 transition-all duration-300 group"
              >
                <span>View pricing plans</span>
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
              <p className="text-sm text-lightning-dim/60 mt-4">14-day free trial. No credit card required.</p>
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
