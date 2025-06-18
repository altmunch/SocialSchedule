'use client';

import { LazyDashboardComponents, LazyWrapper } from '@/components/optimized/LazyComponents';

export default function SubscriptionPage() {
  const { SubscriptionComponent } = LazyDashboardComponents;
  
  return (
    <LazyWrapper loadingText="Loading Subscription...">
      <SubscriptionComponent />
    </LazyWrapper>
  );
}
