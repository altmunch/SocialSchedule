import { useState } from 'react';
import { useTeamMode } from '@/providers/TeamModeProvider';
import { useRouter, usePathname } from 'next/navigation';
import { 
  Users, 
  BarChart3, 
  Settings, 
  Zap, 
  Calendar, 
  Target,
  Filter,
  ChevronLeft,
  ChevronRight,
  Activity,
  TrendingUp,
  Globe,
  FileText,
  Database
} from 'lucide-react';
import { cn } from '@/lib/utils';

const TeamSidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { currentTab, setCurrentTab, selectedClients, totalClientCount } = useTeamMode();
  const router = useRouter();
  const pathname = usePathname();

  const mainTabs = [
    {
      id: 'operations' as const,
      name: 'Client Operations',
      icon: Users,
      description: 'Manage clients, workflows, and daily operations',
      href: '/team-dashboard/operations',
      badge: selectedClients.length > 0 ? selectedClients.length : undefined
    },
    {
      id: 'analytics' as const,
      name: 'Insights & Analytics',
      icon: BarChart3,
      description: 'Strategic analytics and reporting',
      href: '/team-dashboard/analytics',
      badge: undefined
    }
  ];

  const operationsSubnav = [
    {
      name: 'Portfolio Overview',
      icon: Users,
      href: '/team-dashboard/operations',
      description: 'All client accounts'
    },
    {
      name: 'Workflow Hub',
      icon: Zap,
      href: '/team-dashboard/operations/workflows',
      description: 'Automation center'
    },
    {
      name: 'Performance Monitor',
      icon: Activity,
      href: '/team-dashboard/operations/performance',
      description: 'Real-time metrics'
    },
    {
      name: 'Bulk Operations',
      icon: Database,
      href: '/team-dashboard/operations/bulk',
      description: 'Mass actions'
    }
  ];

  const analyticsSubnav = [
    {
      name: 'Performance Dashboard',
      icon: TrendingUp,
      href: '/team-dashboard/analytics',
      description: 'Key metrics overview'
    },
    {
      name: 'Competitor Intelligence',
      icon: Globe,
      href: '/team-dashboard/analytics/competitors',
      description: 'Market analysis'
    },
    {
      name: 'Content Strategy',
      icon: Target,
      href: '/team-dashboard/analytics/content',
      description: 'Strategy insights'
    },
    {
      name: 'Custom Reports',
      icon: FileText,
      href: '/team-dashboard/analytics/reports',
      description: 'Build reports'
    }
  ];

  const quickActions = [
    {
      name: 'Run Accelerate',
      icon: Zap,
      action: () => console.log('Running Accelerate for all clients'),
      color: 'text-mint'
    },
    {
      name: 'Schedule Posts',
      icon: Calendar,
      action: () => console.log('Opening bulk scheduler'),
      color: 'text-lavender'
    },
    {
      name: 'Generate Reports',
      icon: FileText,
      action: () => router.push('/team-dashboard/analytics/reports'),
      color: 'text-coral'
    }
  ];

  const handleTabChange = (tab: 'operations' | 'analytics') => {
    setCurrentTab(tab);
    const tabConfig = mainTabs.find(t => t.id === tab);
    if (tabConfig) {
      router.push(tabConfig.href);
    }
  };

  const isActiveRoute = (href: string) => {
    return pathname === href || pathname?.startsWith(href + '/');
  };

  return (
    <div className={cn(
      "bg-card border-r border-border flex flex-col transition-all duration-300",
      isCollapsed ? "w-16" : "w-80"
    )}>
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        {!isCollapsed && (
          <div>
            <h2 className="text-lg font-semibold text-foreground">Team Dashboard</h2>
            <p className="text-sm text-muted-foreground">
              {totalClientCount.toLocaleString()} clients
            </p>
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 hover:bg-muted rounded-lg transition-colors"
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Main Navigation Tabs */}
      <nav className="p-4 space-y-2" role="navigation" aria-label="Main navigation">
        {!isCollapsed && (
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
            Main Navigation
          </h3>
        )}
        
        {mainTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={cn(
              "w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200",
              "hover:bg-muted/50",
              currentTab === tab.id 
                ? "bg-mint/10 text-mint border border-mint/20" 
                : "text-muted-foreground hover:text-foreground"
            )}
            title={isCollapsed ? tab.name : undefined}
            aria-current={currentTab === tab.id ? 'page' : undefined}
          >
            <tab.icon className="h-5 w-5 flex-shrink-0" />
            {!isCollapsed && (
              <div className="flex-1 text-left">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{tab.name}</span>
                  {tab.badge && (
                    <span className="bg-mint text-background text-xs px-2 py-1 rounded-full">
                      {tab.badge}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">{tab.description}</p>
              </div>
            )}
          </button>
        ))}
      </nav>

      {/* Sub-navigation based on current tab */}
      {!isCollapsed && (
        <div className="px-4 pb-4 space-y-2">
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
            {currentTab === 'operations' ? 'Operations' : 'Analytics'}
          </h3>
          
          {(currentTab === 'operations' ? operationsSubnav : analyticsSubnav).map((item) => (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              className={cn(
                "w-full flex items-center gap-3 p-2 rounded-lg transition-colors text-sm",
                "hover:bg-muted/30",
                isActiveRoute(item.href)
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon className="h-4 w-4 flex-shrink-0" />
              <div className="flex-1 text-left">
                <span className="font-medium">{item.name}</span>
                <p className="text-xs text-muted-foreground">{item.description}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Quick Actions */}
      {!isCollapsed && (
        <div className="px-4 pb-4 space-y-2">
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
            Quick Actions
          </h3>
          
          {quickActions.map((action) => (
            <button
              key={action.name}
              onClick={action.action}
              className="w-full flex items-center gap-3 p-2 rounded-lg transition-colors text-sm hover:bg-muted/30 text-muted-foreground hover:text-foreground"
            >
              <action.icon className={cn("h-4 w-4 flex-shrink-0", action.color)} />
              <span className="font-medium">{action.name}</span>
            </button>
          ))}
        </div>
      )}

      {/* Settings */}
      <div className="mt-auto p-4 border-t border-border">
        <button
          onClick={() => router.push('/team-dashboard/settings')}
          className={cn(
            "w-full flex items-center gap-3 p-3 rounded-lg transition-colors",
            "hover:bg-muted/50 text-muted-foreground hover:text-foreground"
          )}
          title={isCollapsed ? "Team Settings" : undefined}
        >
          <Settings className="h-5 w-5 flex-shrink-0" />
          {!isCollapsed && <span className="font-medium">Team Settings</span>}
        </button>
      </div>
    </div>
  );
};

export default TeamSidebar; 