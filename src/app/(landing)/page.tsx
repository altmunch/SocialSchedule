'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import components
const HeroSection = dynamic(() => import('./components/HeroSection'));
const FeaturesSection = dynamic(() => import('./components/FeaturesSection'));
const ViralBlitzCycle = dynamic(() => import('./components/ViralBlitzCycle'));
const TestimonialsSection = dynamic(() => import('./components/TestimonialsSection'));
const FinalCTASection = dynamic(() => import('./components/FinalCTASection'));
const Footer = dynamic(() => import('./components/Footer'));

// Color palette for the application
export const colors = {
  blitzBlue: '#0066FF',
  surgePurple: '#7F00FF',
  thunderYellow: '#FFD700',
  loopTeal: '#00FFCC',
  stormGray: '#1A1A1A',
  lightningWhite: '#F0F0F0',
  pulseRed: '#FF355E',
  gradientBlitz: 'linear-gradient(90deg, #0066FF 0%, #7F00FF 100%)',
  gradientCycle: 'linear-gradient(90deg, #00FFCC 0%, #0066FF 100%)',
  gradientFull: 'linear-gradient(90deg, #0066FF 0%, #7F00FF 50%, #00FFCC 100%)',
};

export default function Home() {
  const handleCTAClick = () => {
    // Navigate directly to the dashboard
    window.location.href = '/dashboard';
  };

  return (
    <div className="min-h-screen bg-black text-[#F0F0F0] overflow-x-hidden">
      <main>
        <HeroSection 
          onCTAClick={handleCTAClick}
        />
        <FeaturesSection />
        <ViralBlitzCycle />
        <TestimonialsSection />
        <FinalCTASection />
      </main>
      <Footer />
    </div>
  );
}
