'use client';

import { LazyDashboardComponents, LazyWrapper } from '@/components/optimized/LazyComponents';

export default function ProfilePage() {
  const { ProfileComponent } = LazyDashboardComponents;
  
  return (
    <LazyWrapper loadingText="Loading Profile...">
      <ProfileComponent />
    </LazyWrapper>
  );
}
