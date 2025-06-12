'use client';

import React, { useState } from 'react';
import { useTeamMode } from '@/providers/TeamModeProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TeamAnalyticsOverview } from '@/components/team-dashboard/TeamAnalyticsOverview';
import { PerformanceMonitoringDashboard } from '@/components/team-dashboard/PerformanceMonitoringDashboard';
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  Activity,
  BarChart3,
  PieChart,
  LineChart,
  Target,
  Award,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Minus
} from 'lucide-react';

export default function TeamAnalyticsPage() {
  const { clients } = useTeamMode();
  const [timeRange, setTimeRange] = useState('30d');
  const [selectedIndustry, setSelectedIndustry] = useState('all');

  // Calculate key metrics
  const totalClients = clients.length;
  const activeClients = clients.filter(c => c.status === 'active').length;
  const totalRevenue = clients.reduce((sum, c) => sum + c.revenue, 0);
  const avgEngagement = clients.reduce((sum, c) => sum + c.avgEngagement, 0) / totalClients;

  // Top performing clients
  const topPerformers = [...clients]
    .sort((a, b) => b.avgEngagement - a.avgEngagement)
    .slice(0, 10);

  // Industry breakdown
  const industryData = clients.reduce((acc, client) => {
    acc[client.industry] = (acc[client.industry] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Platform distribution (using mock platforms for now)
  const platformData = {
    'TikTok': Math.floor(totalClients * 0.4),
    'Instagram': Math.floor(totalClients * 0.3),
    'YouTube': Math.floor(totalClients * 0.2),
    'Twitter': Math.floor(totalClients * 0.1)
  };

  const MetricCard = ({ 
    title, 
    value, 
    change, 
    trend, 
    icon: Icon 
  }: { 
    title: string; 
    value: string; 
    change: string; 
    trend: 'up' | 'down' | 'neutral'; 
    icon: any;
  }) => {
    const trendIcon = trend === 'up' ? ArrowUpRight : trend === 'down' ? ArrowDownRight : Minus;
    const trendColor = trend === 'up' ? 'text-mint' : trend === 'down' ? 'text-coral' : 'text-muted-foreground';
    
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              <div className="flex items-center space-x-2">
                <p className="text-2xl font-bold">{value}</p>
                <div className={`flex items-center space-x-1 ${trendColor}`}>
                  {React.createElement(trendIcon, { className: 'h-4 w-4' })}
                  <span className="text-sm font-medium">{change}</span>
                </div>
              </div>
            </div>
            <div className="p-3 bg-muted rounded-full">
              <Icon className="h-6 w-6 text-muted-foreground" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (clients.length === 0) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-muted rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Analytics & Insights</h1>
          <p className="text-muted-foreground">Strategic insights and performance analytics for your client portfolio</p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Industry" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Industries</SelectItem>
              {Object.keys(industryData).map(industry => (
                <SelectItem key={industry} value={industry}>{industry}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Clients"
          value={totalClients.toLocaleString()}
          change="+12.5%"
          trend="up"
          icon={Users}
        />
        <MetricCard
          title="Active Clients"
          value={activeClients.toLocaleString()}
          change="+8.3%"
          trend="up"
          icon={Activity}
        />
        <MetricCard
          title="Total Revenue"
          value={`$${(totalRevenue / 1000000).toFixed(1)}M`}
          change="+15.7%"
          trend="up"
          icon={DollarSign}
        />
        <MetricCard
          title="Avg Engagement"
          value={`${avgEngagement.toFixed(1)}%`}
          change="-2.1%"
          trend="down"
          icon={TrendingUp}
        />
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <TeamAnalyticsOverview />
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <PerformanceMonitoringDashboard />
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          {/* AI-Powered Insights */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-5 w-5 text-mint" />
                  <span>Optimization Opportunities</span>
                </CardTitle>
                <CardDescription>AI-identified areas for improvement</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-3 p-3 bg-mint/10 rounded-lg border border-mint/20">
                  <AlertTriangle className="h-5 w-5 text-mint mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Posting Time Optimization</p>
                    <p className="text-xs text-muted-foreground">
                      67% of clients could improve engagement by 23% with better timing
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-3 bg-lavender/10 rounded-lg border border-lavender/20">
                  <Award className="h-5 w-5 text-lavender mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Content Strategy Gaps</p>
                    <p className="text-xs text-muted-foreground">
                      Technology sector clients missing video content opportunities
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-3 bg-coral/10 rounded-lg border border-coral/20">
                  <BarChart3 className="h-5 w-5 text-coral mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Platform Expansion</p>
                    <p className="text-xs text-muted-foreground">
                      45 clients ready for TikTok expansion based on demographics
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-mint" />
                  <span>Market Trends</span>
                </CardTitle>
                <CardDescription>Industry insights and predictions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Trending Content Types</h4>
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-xs">Behind-the-scenes</span>
                      <span className="text-xs font-medium text-mint">+34%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs">Product tutorials</span>
                      <span className="text-xs font-medium text-mint">+28%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs">User-generated content</span>
                      <span className="text-xs font-medium text-mint">+22%</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Platform Growth</h4>
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-xs">TikTok Shop</span>
                      <span className="text-xs font-medium text-mint">+67%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs">Instagram Reels</span>
                      <span className="text-xs font-medium text-mint">+45%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs">YouTube Shorts</span>
                      <span className="text-xs font-medium text-mint">+38%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Performers Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Clients</CardTitle>
              <CardDescription>Learn from your highest-performing client strategies</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topPerformers.slice(0, 5).map((client, index) => (
                  <div key={client.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center justify-center w-8 h-8 bg-mint text-background rounded-full text-sm font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{client.name}</p>
                        <p className="text-xs text-muted-foreground">{client.industry}</p>
                      </div>
                    </div>
                                         <div className="text-right">
                       <p className="text-sm font-medium text-mint">{client.avgEngagement.toFixed(1)}%</p>
                       <p className="text-xs text-muted-foreground">engagement</p>
                     </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          {/* Custom Reports */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-mint/20 rounded-full">
                    <PieChart className="h-6 w-6 text-mint" />
                  </div>
                  <div>
                    <h3 className="font-medium">Portfolio Summary</h3>
                    <p className="text-sm text-muted-foreground">Complete client overview</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-lavender/20 rounded-full">
                    <LineChart className="h-6 w-6 text-lavender" />
                  </div>
                  <div>
                    <h3 className="font-medium">Performance Trends</h3>
                    <p className="text-sm text-muted-foreground">Historical analysis</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-coral/20 rounded-full">
                    <BarChart3 className="h-6 w-6 text-coral" />
                  </div>
                  <div>
                    <h3 className="font-medium">Industry Benchmarks</h3>
                    <p className="text-sm text-muted-foreground">Competitive analysis</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Scheduled Reports */}
          <Card>
            <CardHeader>
              <CardTitle>Scheduled Reports</CardTitle>
              <CardDescription>Automated report delivery schedule</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium text-sm">Weekly Portfolio Summary</p>
                    <p className="text-xs text-muted-foreground">Every Monday at 9:00 AM</p>
                  </div>
                  <div className="text-xs bg-mint/20 text-mint px-2 py-1 rounded">Active</div>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium text-sm">Monthly Performance Report</p>
                    <p className="text-xs text-muted-foreground">First Monday of each month</p>
                  </div>
                  <div className="text-xs bg-mint/20 text-mint px-2 py-1 rounded">Active</div>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium text-sm">Quarterly Business Review</p>
                    <p className="text-xs text-muted-foreground">End of quarter summary</p>
                  </div>
                  <div className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded">Paused</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 