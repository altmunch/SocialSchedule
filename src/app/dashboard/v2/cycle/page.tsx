'use client';

import { LazyDashboardComponents, LazyWrapper } from '@/components/optimized/LazyComponents';

export default function CyclePage() {
  const { CycleComponent } = LazyDashboardComponents;
  
  return (
    <LazyWrapper loadingText="Loading Cycle Tool...">
      <CycleComponent />
    </LazyWrapper>
  );
}
