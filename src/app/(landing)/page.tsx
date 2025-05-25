'use client';

import { useState, useEffect } from 'react';
import HeroSection from './components/HeroSection';
import ViralBlitzCycle from './components/ViralBlitzCycle';
import SocialProof from './components/SocialProof';
import DashboardPreview from './components/DashboardPreview';
import GrandSlamOffer from './components/GrandSlamOffer';
import CTAWithGuarantee from './components/CTAWithGuarantee';
import Footer from './components/Footer';

// Define color palette for the Viral Blitz theme
export const colors = {
  blitzBlue: '#3B82F6',
  surgePurple: '#8B5CF6',
  thunderYellow: '#F59E0B',
  loopTeal: '#14B8A6',
  stormGray: '#1F2937',
  lightningWhite: '#F9FAFB',
  pulseRed: '#FF355E',
};

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState({
    hours: 23,
    minutes: 59,
    seconds: 59,
  });
  
  const remainingSpots = 27; // This would come from your backend in a real app

  // Countdown timer effect
  useEffect(() => {
    setMounted(true);
    
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        const newSeconds = prev.seconds - 1;
        const newMinutes = newSeconds < 0 ? prev.minutes - 1 : prev.minutes;
        const newHours = newMinutes < 0 ? prev.hours - 1 : prev.hours;
        
        if (newHours < 0) {
          clearInterval(timer);
          return { hours: 0, minutes: 0, seconds: 0 };
        }
        
        return {
          hours: newHours,
          minutes: newMinutes < 0 ? 59 : newMinutes,
          seconds: newSeconds < 0 ? 59 : newSeconds,
        };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleCTAClick = () => {
    // Handle CTA click - this would typically redirect to signup or open a modal
    window.location.href = '/sign-up';
  };

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stormGray">
        <div className="animate-pulse text-blitzBlue">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stormGray text-lightningWhite">
      <main>
        <HeroSection 
          onCTAClick={handleCTAClick}
          timeRemaining={timeRemaining}
          remainingSpots={remainingSpots}
        />
        <ViralBlitzCycle />
        <SocialProof />
        <DashboardPreview />
        <GrandSlamOffer />
        <CTAWithGuarantee 
          onCTAClick={handleCTAClick} 
          remainingSpots={remainingSpots}
        />
      </main>
      {/* Footer */}
      <Footer />
    </div>
  );
}
