'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { useUsageLimits } from '@/hooks/useUsageLimits';
import LandingPage from './landing/page';

export default function Home() {
  const { user } = useAuth();
  const router = useRouter();
  // Mock tier until fetched from user metadata; default to 'free'
  const tier: 'free' | 'lite' | 'pro' | 'team' = (user as any)?.subscriptionTier || 'free';
  const { tier: currentTier } = useUsageLimits(tier);

  useEffect(() => {
    if (currentTier === 'team') {
      router.push('/team-dashboard');
    }
  }, [currentTier, router]);

  return <LandingPage />;
} 