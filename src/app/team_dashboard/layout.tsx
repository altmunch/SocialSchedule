'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { SettingsProvider } from '@/providers/SettingsProvider';
import { TeamModeProvider } from '@/providers/TeamModeProvider';
import TeamHeader from '@/components/team-dashboard/TeamHeader';
import TeamSidebar from '@/components/team-dashboard/TeamSidebar';
import { TeamModeErrorBoundary } from '@/components/team-dashboard/TeamModeErrorBoundary';
import { Card } from '@/components/ui/card';
import { Shield, Users, BarChart3 } from 'lucide-react';
import { usageLimitsService } from '@/lib/usage-limits';

export default function TeamDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [hasTeamAccess, setHasTeamAccess] = useState(false);
  const [isCheckingAccess, setIsCheckingAccess] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/sign-in');
      return;
    }

    if (user) {
      // Check if user has Team Mode access (Team/Enterprise subscription)
      checkTeamAccess(user).then(hasAccess => {
        setHasTeamAccess(hasAccess);
        setIsCheckingAccess(false);
        
        if (!hasAccess) {
          // Redirect to upgrade page or show access denied
          router.push('/dashboard/subscription?upgrade=team');
        }
      });
    }
  }, [user, loading, router]);

  // Mock function - in real app, check against user's subscription tier
  const checkTeamAccess = async (user: any): Promise<boolean> => {
    const tier = user?.user_metadata?.subscription_tier || 'free';
    return usageLimitsService.hasFeatureAccess(tier, 'teamDashboard');
  };

  if (loading || isCheckingAccess) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-mint mx-auto"></div>
          <p className="text-muted-foreground">Checking Team Mode access...</p>
        </div>
      </div>
    );
  }

  if (!user || !hasTeamAccess) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <Card className="max-w-md p-8 text-center space-y-4">
          <Shield className="h-16 w-16 text-coral mx-auto" />
          <h2 className="text-2xl font-bold text-foreground">Team Mode Access Required</h2>
          <p className="text-muted-foreground">
            Team Mode requires a Team or Enterprise subscription. 
            Upgrade your plan to manage multiple client accounts.
          </p>
          <div className="flex flex-col gap-2 pt-4">
            <button 
              onClick={() => router.push('/dashboard/subscription?upgrade=team')}
              className="bg-mint text-background px-6 py-2 rounded-lg hover:bg-mint/90 transition-colors"
            >
              Upgrade to Team
            </button>
            <button 
              onClick={() => router.push('/dashboard')}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Return to Personal Dashboard
            </button>
          </div>
        </Card>
      </div>
    );
  }

  // Generate breadcrumb from pathname
  const segments = pathname?.split('/').filter(Boolean).slice(1); // remove 'team-dashboard'
  const breadcrumb = segments && segments.length > 0 ? (
    <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
      <ol className="inline-flex items-center space-x-1">
        <li className="flex items-center">
          <Users className="h-4 w-4 mr-1" />
          <span>Team Dashboard</span>
        </li>
        {segments.map((seg, idx) => (
          <li key={idx} className="flex items-center space-x-1">
            <span>/</span>
            <span className="capitalize">{seg.replace('-', ' ')}</span>
          </li>
        ))}
      </ol>
    </nav>
  ) : (
    <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
      <ol className="inline-flex items-center space-x-1">
        <li className="flex items-center">
          <Users className="h-4 w-4 mr-1" />
          <span>Team Dashboard</span>
        </li>
      </ol>
    </nav>
  );

  return (
    <TeamModeErrorBoundary>
      <TeamModeProvider>
        <SettingsProvider>
          <div className="flex h-screen bg-gradient-to-br from-background to-charcoal-100 text-foreground">
            <TeamSidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
              <TeamHeader breadcrumb={breadcrumb} />
              <main className="flex-1 overflow-hidden bg-card/30 backdrop-blur-sm">
                <div className="h-full">
                  {children}
                </div>
              </main>
            </div>
          </div>
        </SettingsProvider>
      </TeamModeProvider>
    </TeamModeErrorBoundary>
  );
} 