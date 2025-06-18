'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { SettingsProvider } from '@/providers/SettingsProvider';
import Sidebar from '@/components/tailwind-dashboard-ui/Sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Enhanced breadcrumb generation
  const generateBreadcrumb = () => {
    if (!pathname) return null;
    
    const segments = pathname.split('/').filter(Boolean).slice(1); // remove 'dashboard'
    if (segments.length === 0) return null;

    const breadcrumbMap: Record<string, string> = {
      'accelerate': 'Algorithm Optimization',
      'blitz': 'Autoposting',
      'cycle': 'Reports',
      'ideator': 'Template Generator',
      'competitor-tactics': 'Competitor Tactics',
      'connect': 'Connect Accounts',
      'subscription': 'Subscription',
      'settings': 'Settings',
    };

    return (
      <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
        <ol className="inline-flex items-center space-x-2">
          <li>
            <span className="font-medium text-foreground">Dashboard</span>
          </li>
          {segments.map((segment, idx) => (
            <li key={idx} className="flex items-center space-x-2">
              <span className="text-muted-foreground">/</span>
              <span className={`${idx === segments.length - 1 ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                {breadcrumbMap[segment] || segment.charAt(0).toUpperCase() + segment.slice(1)}
              </span>
            </li>
          ))}
        </ol>
      </nav>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-background to-muted/20">
        <div className="space-y-4 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <div className="text-sm text-muted-foreground">Loading your dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <SettingsProvider>
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-background via-muted/5 to-accent/5 text-foreground">
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-h-0 lg:ml-64">
          <div className="dashboard-header bg-black/20 backdrop-blur-xl border-b border-white/10 p-4 flex justify-end items-center fixed top-0 left-0 right-0 z-20 lg:ml-64">
            {generateBreadcrumb()}
          </div>
          <Sidebar />
          
          {/* Content Container with Enhanced Responsive Grid */}
          <main className="flex-1 relative">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-gradient-to-br from-background/95 via-background/98 to-muted/10 backdrop-blur-sm"></div>
            
            {/* Scrollable Content Area */}
            <div className="relative h-full overflow-y-auto scrollbar-hide">
              <div className="min-h-full">
                {/* Container with Material UI Grid System */}
                <div className="container-fluid px-4 sm:px-6 lg:px-8 py-6 pt-20">
                  <div className="max-w-none">
                    {children}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Scroll Indicator */}
            <div className="absolute top-0 right-0 w-1 h-full bg-gradient-to-b from-transparent via-border/20 to-transparent pointer-events-none"></div>
          </main>
        </div>
      </div>
    </SettingsProvider>
  );
}
