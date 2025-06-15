'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { SettingsProvider } from '@/providers/SettingsProvider';
import Header from '@/components/dashboard/Header';
import Sidebar from '@/components/dashboard/Sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // simple breadcrumb from path segments (dashboard/accelerate -> Dashboard / Accelerate)
  const segments = pathname?.split('/').filter(Boolean).slice(1); // remove 'dashboard'
  const breadcrumb = segments && segments.length > 0 ? (
    <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
      <ol className="inline-flex items-center space-x-1">
        <li>
          <span className="capitalize">Dashboard</span>
        </li>
        {segments.map((seg, idx) => (
          <li key={idx} className="flex items-center space-x-1">
            <span>/</span>
            <span className="capitalize">{seg}</span>
          </li>
        ))}
      </ol>
    </nav>
  ) : null;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <SettingsProvider>
      <div className="flex h-screen bg-gradient-to-br from-background to-muted/20 text-foreground overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col min-h-0">
          <Header breadcrumb={breadcrumb} />
          <main className="flex-1 bg-background/95 backdrop-blur-sm overflow-hidden">
            <div className="h-full overflow-y-auto scrollbar-dark">
              <div className="min-h-full">
                {children}
              </div>
            </div>
          </main>
        </div>
      </div>
    </SettingsProvider>
  );
}
