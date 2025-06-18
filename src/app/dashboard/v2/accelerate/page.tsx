'use client';

import { LazyDashboardComponents, LazyWrapper } from '@/components/optimized/LazyComponents';

export default function AcceleratePage() {
  const { AccelerateComponent } = LazyDashboardComponents;
  
  return (
    <LazyWrapper loadingText="Loading Algorithm Optimization Tool...">
      <AccelerateComponent />
    </LazyWrapper>
  );
} 