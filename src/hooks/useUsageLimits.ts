import { useState, useEffect, useCallback } from 'react';

export type SubscriptionTier = 'free' | 'lite' | 'pro' | 'team';

interface TierLimits {
  viralBlitz: number | 'unlimited';
  ideaGen: number | 'unlimited';
  autopost: number | 'unlimited';
  ecommerce: boolean; // true means allowed
}

const LIMITS: Record<SubscriptionTier, TierLimits> = {
  free: { viralBlitz: 1, ideaGen: 1, autopost: 1, ecommerce: false },
  lite: { viralBlitz: 15, ideaGen: 15, autopost: 15, ecommerce: false },
  pro: { viralBlitz: 'unlimited', ideaGen: 'unlimited', autopost: 'unlimited', ecommerce: true },
  team: { viralBlitz: 'unlimited', ideaGen: 'unlimited', autopost: 'unlimited', ecommerce: true },
};

// `usage` param would come from backend API; for now we keep counts local for demo
export interface UsageSummary {
  viralBlitz: number;
  ideaGen: number;
  autopost: number;
}

export function useUsageLimits(tier: SubscriptionTier, usage?: UsageSummary) {
  const [limits, setLimits] = useState<TierLimits>(LIMITS[tier]);

  useEffect(() => {
    setLimits(LIMITS[tier]);
  }, [tier]);

  const remaining = useCallback(
    (key: keyof UsageSummary): number | 'unlimited' => {
      const limit = limits[key];
      if (limit === 'unlimited') return 'unlimited';
      const used = usage ? usage[key] : 0;
      return Math.max(limit - used, 0);
    },
    [limits, usage]
  );

  const hasFeatureAccess = (key: keyof UsageSummary): boolean => {
    const rem = remaining(key);
    return rem === 'unlimited' || rem > 0;
  };

  return {
    tier,
    limits,
    remaining,
    hasFeatureAccess,
    ecommerceAllowed: limits.ecommerce,
  } as const;
} 