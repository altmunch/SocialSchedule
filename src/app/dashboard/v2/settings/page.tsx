'use client';

import { LazyDashboardComponents, LazyWrapper } from '@/components/optimized/LazyComponents';

export default function SettingsPage() {
  const { SettingsComponent } = LazyDashboardComponents;
  
  return (
    <LazyWrapper loadingText="Loading Settings...">
      <SettingsComponent />
    </LazyWrapper>
  );
}
