'use client';

import { useState, useEffect } from 'react';
import HeroSection from './components/HeroSection';
import FeaturesSection from './components/FeaturesSection';
import ViralBlitzCycle from './components/ViralBlitzCycle';
import TestimonialsSection from './components/TestimonialsSection';
import FinalCTASection from './components/FinalCTASection';
import Footer from './components/Footer';

// Define color palette for the Viral Blitz theme
// Color palette for the application
export const colors = {
  blitzBlue: '#0066FF',
  surgePurple: '#7F00FF',
  thunderYellow: '#FFD700',
  loopTeal: '#00FFCC',
  stormGray: '#1A1A1A',
  lightningWhite: '#F0F0F0',
  pulseRed: '#FF355E',
  // Gradients
  gradientBlitz: 'linear-gradient(90deg, #0066FF 0%, #7F00FF 100%)',
  gradientCycle: 'linear-gradient(90deg, #00FFCC 0%, #0066FF 100%)',
  gradientFull: 'linear-gradient(90deg, #0066FF 0%, #7F00FF 50%, #00FFCC 100%)',
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
    <div className="min-h-screen bg-black text-[#F0F0F0] overflow-x-hidden">
      <main>
        <HeroSection 
          onCTAClick={handleCTAClick}
          timeRemaining={timeRemaining}
          remainingSpots={remainingSpots}
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
