'use client';

import LandingPage from './landing/page';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';

export default function Home() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) return;
    const tier = user?.user_metadata?.subscription_tier || 'free';
    if (tier === 'team') {
      router.replace('/team-dashboard');
    }
  }, [user, router]);

  return <LandingPage />;
} 