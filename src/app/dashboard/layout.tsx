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

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/sign-in');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

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

  return (
    <SettingsProvider>
      <div className="flex h-screen bg-background text-foreground">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header breadcrumb={breadcrumb} />
          <main className="flex-1 overflow-y-auto p-6">
            {children}
          </main>
        </div>
      </div>
    </SettingsProvider>
  );
}
