'use client';

import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { StatsSection } from './components/StatsSection';
import { TrustBadges } from './components/TrustBadges';
import { FeaturesSection } from './components/FeaturesSection';
import { TestimonialsSection } from './components/TestimonialsSection';
import { PricingSection } from './components/PricingSection';
import { CountdownSection } from './components/CountdownSection';
import { ExitIntentPopup } from '@/components/custom/ExitIntentPopup';
import { FloatingCTA } from '@/components/custom/FloatingCTA';
import { CreatorAvatar } from './types';

// Generate random number between min and max
const randomInRange = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

// Mock data for creator avatars
const creatorAvatars: CreatorAvatar[] = [
  { id: '1', name: 'Alex' },
  { id: '2', name: 'Taylor' },
  { id: '3', name: 'Jordan' },
  { id: '4', name: 'Casey' },
  { id: '5', name: 'Riley' },
  { id: '6', name: 'Quinn' },
];

export default function LandingPage() {
  const [stats] = useState({
    postsScheduled: randomInRange(12000, 15000),
    totalViews: parseFloat(`${randomInRange(2, 4)}.${randomInRange(1, 9)}`),
    alphaSpots: randomInRange(5, 20),
    totalUsers: randomInRange(10000, 15000),
  });

  const handleCTAClick = () => {
    const element = document.getElementById('pricing');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-graphite to-graphite-dark">
      {/* Exit Intent Popup */}
      <ExitIntentPopup />
      
      {/* Floating CTA */}
      <FloatingCTA onClick={handleCTAClick} />
      
      {/* Navbar */}
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <HeroSection 
          stats={{ totalUsers: stats.totalUsers }} 
          creatorAvatars={creatorAvatars} 
          onCTAClick={handleCTAClick} 
        />
        
        {/* Stats Section */}
        <StatsSection />
        
        {/* Trust Badges */}
        <TrustBadges />
        
        {/* Features Section */}
        <FeaturesSection />
        
        {/* Testimonials Section */}
        <TestimonialsSection />
        
        {/* Pricing Section */}
        <PricingSection />
        
        {/* Countdown Section */}
        <CountdownSection onCTAClick={handleCTAClick} />
      </main>
      
      {/* Footer would go here */}
    </div>
  );
}
