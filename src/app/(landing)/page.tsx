'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

import NavigationBar from './components/NavigationBar';
import HeroSection from './components/HeroSection';
import SocialProofBar from './components/SocialProofBar';
import ProblemSolutionSection from './components/ProblemSolutionSection';
import FeaturesSection from './components/FeaturesSection';
import ViralBlitzCycle from './components/ViralBlitzCycle';
import ResultsSection from './components/ResultsSection';
import TestimonialsSection from './components/TestimonialsSection';
import GuaranteeSection from './components/GuaranteeSection';
import PricingSection from './components/PricingSection';
import FAQSection from './components/FAQSection';
import Footer from './components/Footer';

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
    <div className="min-h-screen bg-white overflow-x-hidden">
      <NavigationBar />
      <main>
        <HeroSection onGetStarted={handleGetStarted} onDemo={handleDemo} />
        <SocialProofBar />
        <ProblemSolutionSection />
        <FeaturesSection />
        <ViralBlitzCycle />
        <ResultsSection />
        <TestimonialsSection />
        <GuaranteeSection onGetStarted={handleGetStarted} />
        <PricingSection onGetStarted={handleGetStarted} />
        <FAQSection />
      </main>
      <Footer />
    </div>
  );
}
