'use client';

import * as React from 'react';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import Head from 'next/head';

import NavigationBar from '@/app/landing/components/NavigationBar';
import HeroSection from '@/app/landing/components/HeroSection';
import ValueStatementSection from '@/app/landing/components/ValueStatementSection';
import FeaturesSection from '@/app/landing/components/FeaturesSection';
import BonusesSection from '@/app/landing/components/BonusesSection';
import EnterpriseSection from '@/app/landing/components/EnterpriseSection';
import DifferentiatorSection from '@/app/landing/components/DifferentiatorSection';
import FinalCTASection from '@/app/landing/components/FinalCTASection';
import ProblemSolutionSection from '@/app/landing/components/ProblemSolutionSection';
import ResultsSection from '@/app/landing/components/ResultsSection';
import TestimonialsSection from '@/app/landing/components/TestimonialsSection';
import Footer from '@/app/landing/components/Footer';

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
    <>
      <Head>
        {/* Basic SEO Meta Tags */}
        <title>ClipsCommerce - AI-Powered Video & Content Automation for E-commerce & Agencies</title>
        <meta name="description" content="ClipsCommerce offers advanced AI solutions for e-commerce businesses and marketing agencies. Automate video creation, content generation, and social media posting to drive sales and scale your operations." />
        <meta name="keywords" content="e-commerce, marketing agencies, AI video creation, content automation, social media automation, video marketing, content generation, AI for e-commerce, digital marketing, sales automation" />
        <link rel="canonical" href="https://www.clipscommerce.com/" /> {/* Replace with your actual domain */}

        {/* Open Graph / Facebook Meta Tags */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.clipscommerce.com/" /> {/* Replace with your actual domain */}
        <meta property="og:title" content="ClipsCommerce - AI-Powered Video & Content Automation for E-commerce & Agencies" />
        <meta property="og:description" content="ClipsCommerce offers advanced AI solutions for e-commerce businesses and marketing agencies. Automate video creation, content generation, and social media posting to drive sales and scale your operations." />
        <meta property="og:image" content="https://www.clipscommerce.com/images/og-image.jpg" /> {/* Replace with a relevant image for social sharing */}

        {/* Twitter Card Meta Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content="https://www.clipscommerce.com/" /> {/* Replace with your actual domain */}
        <meta name="twitter:title" content="ClipsCommerce - AI-Powered Video & Content Automation for E-commerce & Agencies" />
        <meta name="twitter:description" content="ClipsCommerce offers advanced AI solutions for e-commerce businesses and marketing agencies. Automate video creation, content generation, and social media posting to drive sales and scale your operations." />
        <meta name="twitter:image" content="https://www.clipscommerce.com/images/twitter-image.jpg" /> {/* Replace with a relevant image for social sharing */}

        {/* Schema.org Structured Data */}
        <script type="application/ld+json">
          {`
            {
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "ClipsCommerce",
              "url": "https://www.clipscommerce.com/", // Replace with your actual domain
              "logo": "https://www.clipscommerce.com/images/logo.png", // Replace with your company logo
              "description": "AI-Powered Video & Content Automation for E-commerce Businesses and Marketing Agencies.",
              "contactPoint": {
                "@type": "ContactPoint",
                "telephone": "+1-555-CLIPS", // Replace with your actual contact number
                "contactType": "customer service"
              },
              "sameAs": [
                "https://www.facebook.com/clipscommerce", // Replace with your Facebook page
                "https://twitter.com/clipscommerce",    // Replace with your Twitter page
                "https://www.linkedin.com/company/clipscommerce" // Replace with your LinkedIn page
              ]
            }
          `}
        </script>
      </Head>
      <div className="min-h-screen bg-black text-white relative overflow-hidden">
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
            
            {/* New Landing Sections */}
            <ValueStatementSection />
            <FeaturesSection onGetStarted={handleGetStarted} />
            <BonusesSection />
            <EnterpriseSection />
            <DifferentiatorSection />
            <FinalCTASection onGetStarted={handleGetStarted} />
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
    </>
  );
}
