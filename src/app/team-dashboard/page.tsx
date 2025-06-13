'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { useTeamMode } from '@/providers/TeamModeProvider';
import { useUsageLimits } from '@/hooks/useUsageLimits';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  BarChart3, 
  Zap, 
  TrendingUp, 
  Activity, 
  ArrowRight,
  Clock,
  Target,
  CheckCircle2,
  AlertTriangle,
  Shield,
  Lock
} from 'lucide-react';

export default function TeamDashboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { totalClientCount, setCurrentTab } = useTeamMode();
  
  // Mock subscription tier - in production, get this from user data
  const subscriptionTier = 'free'; // This should come from actual user subscription
  const { hasFeatureAccess, tier } = useUsageLimits(subscriptionTier);

  // Check team dashboard access
  const hasTeamAccess = hasFeatureAccess('teamDashboard');

  // If no team access, show upgrade prompt
  if (!hasTeamAccess) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
        <Card className="max-w-md w-full bg-gradient-to-br from-neutral-900 to-neutral-800 border-neutral-700">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-4 rounded-full bg-gradient-to-r from-[#8D5AFF]/20 to-[#5afcc0]/20 border border-[#8D5AFF]/30">
                <Lock className="h-8 w-8 text-[#8D5AFF]" />
              </div>
            </div>
            <CardTitle className="text-xl text-white">Team Dashboard Access Required</CardTitle>
            <CardDescription className="text-neutral-400">
              The Team Dashboard is available for Team plan subscribers only
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-neutral-800/50 rounded-lg p-4">
              <h4 className="font-semibold text-white mb-2">Current Plan: {tier?.name}</h4>
              <p className="text-sm text-neutral-400 mb-3">
                Upgrade to Team plan to unlock:
              </p>
              <ul className="text-sm text-neutral-300 space-y-1">
                <li className="flex items-center">
                  <Shield className="h-4 w-4 text-[#5afcc0] mr-2" />
                  Advanced team management
                </li>
                <li className="flex items-center">
                  <BarChart3 className="h-4 w-4 text-[#5afcc0] mr-2" />
                  Advanced analytics & reporting
                </li>
                <li className="flex items-center">
                  <Users className="h-4 w-4 text-[#5afcc0] mr-2" />
                  Multi-account management
                </li>
              </ul>
            </div>
            
            <div className="flex flex-col space-y-2">
              <Button
                onClick={() => router.push('/dashboard/subscription')}
                className="bg-gradient-to-r from-[#8D5AFF] to-[#5afcc0] text-white font-bold hover:opacity-90 transition-all"
              >
                Upgrade to Team Plan
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push('/dashboard')}
                className="border-neutral-600 text-neutral-300 hover:bg-neutral-800"
              >
                Back to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Redirect to operations by default
  useEffect(() => {
    router.push('/team-dashboard/operations');
  }, [router]);

  // Mock dashboard overview data
  const overviewStats = {
    totalClients: totalClientCount,
    activeWorkflows: 156,
    completedToday: 1247,
    avgEngagement: 8.7,
    revenueThisMonth: 2847650,
    clientsNeedingAttention: 23
  };

  const recentActivity = [
    {
      id: 1,
      type: 'workflow_completed',
      message: 'Accelerate workflow completed for 247 clients',
      timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
      status: 'success'
    },
    {
      id: 2,
      type: 'bulk_operation',
      message: 'Bulk post scheduling initiated for Fashion & Beauty clients',
      timestamp: new Date(Date.now() - 1000 * 60 * 45), // 45 minutes ago
      status: 'running'
    },
    {
      id: 3,
      type: 'alert',
      message: '3 clients experiencing API connection issues',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      status: 'warning'
    }
  ];

  const quickActions = [
    {
      title: 'Client Operations',
      description: 'Manage clients and run workflows',
      icon: Users,
      href: '/team-dashboard/operations',
      color: 'bg-mint/10 text-mint border-mint/20',
      stats: `${overviewStats.totalClients.toLocaleString()} clients`
    },
    {
      title: 'Analytics & Insights',
      description: 'View performance and generate reports',
      icon: BarChart3,
      href: '/team-dashboard/analytics',
      color: 'bg-lavender/10 text-lavender border-lavender/20',
      stats: `${overviewStats.avgEngagement}% avg engagement`
    },
    {
      title: 'Workflow Automation',
      description: 'Set up and monitor automated workflows',
      icon: Zap,
      href: '/team-dashboard/operations/workflows',
      color: 'bg-coral/10 text-coral border-coral/20',
      stats: `${overviewStats.activeWorkflows} active`
    }
  ];

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d ago`;
    }
  };

  const getActivityIcon = (type: string, status: string) => {
    switch (type) {
      case 'workflow_completed':
        return status === 'success' ? CheckCircle2 : AlertTriangle;
      case 'bulk_operation':
        return Activity;
      case 'alert':
        return AlertTriangle;
      default:
        return Activity;
    }
  };

  const getActivityColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-mint';
      case 'warning': return 'text-warning';
      case 'error': return 'text-coral';
      case 'running': return 'text-info';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-creative">
          Welcome to Team Mode
        </h1>
        <p className="text-muted-foreground">
          Manage {overviewStats.totalClients.toLocaleString()} clients with powerful automation and insights
        </p>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-mint" />
              <span className="text-sm font-medium">Total Clients</span>
            </div>
            <div className="mt-2">
              <div className="text-2xl font-bold">{overviewStats.totalClients.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">
                {overviewStats.clientsNeedingAttention} need attention
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Zap className="h-4 w-4 text-lavender" />
              <span className="text-sm font-medium">Active Workflows</span>
            </div>
            <div className="mt-2">
              <div className="text-2xl font-bold">{overviewStats.activeWorkflows}</div>
              <div className="text-xs text-muted-foreground">
                {overviewStats.completedToday.toLocaleString()} completed today
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-coral" />
              <span className="text-sm font-medium">Avg Engagement</span>
            </div>
            <div className="mt-2">
              <div className="text-2xl font-bold">{overviewStats.avgEngagement}%</div>
              <div className="text-xs text-mint flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                +12.3% this month
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Target className="h-4 w-4 text-info" />
              <span className="text-sm font-medium">Revenue</span>
            </div>
            <div className="mt-2">
              <div className="text-2xl font-bold">
                ${(overviewStats.revenueThisMonth / 1000000).toFixed(1)}M
              </div>
              <div className="text-xs text-mint flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                +15.9% this month
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-creative">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickActions.map((action) => {
            const IconComponent = action.icon;
            return (
              <Card 
                key={action.title} 
                className="border-border hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => router.push(action.href)}
              >
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className={`p-2 rounded-lg ${action.color}`}>
                      <IconComponent className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{action.title}</h3>
                      <p className="text-sm text-muted-foreground">{action.description}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {action.stats}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>Recent Activity</span>
            </CardTitle>
            <CardDescription>Latest updates from your team dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => {
                const IconComponent = getActivityIcon(activity.type, activity.status);
                return (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className={`p-1 rounded ${getActivityColor(activity.status)}`}>
                      <IconComponent className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm">{activity.message}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatTimeAgo(activity.timestamp)}
                      </p>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${getActivityColor(activity.status)}`}
                    >
                      {activity.status}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>System Status</span>
            </CardTitle>
            <CardDescription>Current system health and performance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>API Response Time</span>
                <span className="text-mint">127ms</span>
              </div>
              <Progress value={85} className="h-1" />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>System Uptime</span>
                <span className="text-mint">99.97%</span>
              </div>
              <Progress value={99.97} className="h-1" />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Active Connections</span>
                <span className="text-info">1,234</span>
              </div>
              <Progress value={75} className="h-1" />
            </div>

            <div className="pt-2 border-t border-border">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Last updated</span>
                <span className="text-xs text-muted-foreground">
                  {formatTimeAgo(new Date(Date.now() - 1000 * 30))}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 