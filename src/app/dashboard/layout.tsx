'use client';

import DashboardLayoutV3 from '@/app/dashboard/v3/layout';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayoutV3>{children}</DashboardLayoutV3>;
} 