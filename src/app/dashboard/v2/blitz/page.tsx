'use client';

import { LazyDashboardComponents, LazyWrapper } from '@/components/optimized/LazyComponents';

export default function BlitzPage() {
  const { BlitzComponent } = LazyDashboardComponents;
  
  return (
    <LazyWrapper loadingText="Loading Blitz Tool...">
      <BlitzComponent />
    </LazyWrapper>
  );
}
