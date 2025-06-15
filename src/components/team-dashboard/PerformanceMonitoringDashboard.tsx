'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  PieChart, 
  Activity, 
  Users, 
  Zap, 
  Clock,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Download,
  Calendar,
  Filter,
  Eye,
  Heart,
  Share2,
  DollarSign,
  Target,
  Gauge,
  Link as LinkIcon,
  Info
} from 'lucide-react';
import { useTeamMode } from '@/providers/TeamModeProvider';
import { CircularScore } from '@/components/ui/circular-score';
import Link from 'next/link';
import { MiniTrendChart } from '@/components/ui/mini-trend-chart';

interface PerformanceMetric {
  id: string;
  name: string;
  value: number;
  change: number;
  changeDirection: 'up' | 'down' | 'neutral';
  unit: string;
  target?: number;
  status: 'good' | 'warning' | 'critical';
  category?: 'key' | 'niche' | 'ab_test' | 'predictive' | 'other';
  detailsLink?: string;
  icon?: React.ElementType;
  trendData?: Array<{ name: string; value: number }>;
}

interface ClientPerformanceData {
  clientId: string;
  clientName: string;
  engagement: number;
  reach: number;
  conversions: number;
  revenue: number;
  trendsData: {
    date: string;
    engagement: number;
    reach: number;
    revenue: number;
  }[];
}

interface SystemHealth {
  apiLatency: number;
  uptime: number;
  processingQueue: number;
  activeWorkflows: number;
  errorRate: number;
}

export function PerformanceMonitoringDashboard() {
  const { clients, totalClientCount } = useTeamMode();
  const [timeRange, setTimeRange] = useState('7d');
  const [selectedMetric, setSelectedMetric] = useState('engagement');
  const [refreshInterval, setRefreshInterval] = useState(30);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [selectedOverviewCategory, setSelectedOverviewCategory] = useState<'all' | 'key' | 'niche' | 'ab_test' | 'predictive' | 'other'>('all');

  // Mock performance data
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([
    {
      id: 'total_engagement',
      name: 'Total Engagement',
      value: 8.7,
      change: 12.3,
      changeDirection: 'up',
      unit: '%',
      target: 10,
      status: 'good',
      category: 'key',
      icon: TrendingUp,
      trendData: [
        { name: 'W1', value: 7.5 },
        { name: 'W2', value: 7.8 },
        { name: 'W3', value: 8.1 },
        { name: 'W4', value: 8.5 },
        { name: 'W5', value: 8.3 },
        { name: 'W6', value: 8.7 },
      ]
    },
    {
      id: 'avg_reach',
      name: 'Average Reach',
      value: 245600,
      change: -3.2,
      changeDirection: 'down',
      unit: '',
      target: 300000,
      status: 'warning',
      category: 'key',
      icon: Users,
      trendData: [
        { name: 'M1', value: 220000 },
        { name: 'M2', value: 235000 },
        { name: 'M3', value: 250000 },
        { name: 'M4', value: 240000 },
        { name: 'M5', value: 260000 },
        { name: 'M6', value: 245600 },
      ]
    },
    {
      id: 'conversion_rate',
      name: 'Conversion Rate',
      value: 3.4,
      change: 8.7,
      changeDirection: 'up',
      unit: '%',
      target: 5,
      status: 'good',
      category: 'key',
      icon: Zap
    },
    {
      id: 'total_revenue',
      name: 'Total Revenue',
      value: 1250000,
      change: 15.2,
      changeDirection: 'up',
      unit: '$',
      target: 1500000,
      status: 'good',
      category: 'key',
      icon: DollarSign,
      trendData: [
        { name: 'Q1', value: 950000 },
        { name: 'Q2', value: 1100000 },
        { name: 'Q3', value: 1050000 },
        { name: 'Q4', value: 1250000 },
      ]
    },
    {
      id: 'niche_fashion_conversion',
      name: 'Fashion Niche Conversion',
      value: 4.1,
      change: 5.0,
      changeDirection: 'up',
      unit: '%',
      target: 4.5,
      status: 'good',
      category: 'niche',
      icon: Info,
      detailsLink: '/dashboard/analytics/niche/fashion',
      trendData: [
        { name: 'Jan', value: 3.5 },
        { name: 'Feb', value: 3.8 },
        { name: 'Mar', value: 3.9 },
        { name: 'Apr', value: 4.2 },
        { name: 'May', value: 4.0 },
        { name: 'Jun', value: 4.1 },
      ]
    },
    {
      id: 'ab_test_cta_button',
      name: 'A/B Test: New CTA Button',
      value: 15.0,
      change: 2.5,
      changeDirection: 'up',
      unit: '% uplift',
      status: 'good',
      category: 'ab_test',
      icon: BarChart3,
      detailsLink: '/dashboard/ab-tests/cta-button-test'
    },
    {
      id: 'predictive_churn_risk',
      name: 'Predicted Churn Risk',
      value: 7.8,
      change: -1.2,
      changeDirection: 'down',
      unit: '%',
      status: 'warning',
      category: 'predictive',
      icon: AlertTriangle,
      detailsLink: '/dashboard/analytics/predictive/churn'
    }
  ]);

  const [systemHealth, setSystemHealth] = useState<SystemHealth>({
    apiLatency: 127,
    uptime: 99.97,
    processingQueue: 23,
    activeWorkflows: 156,
    errorRate: 0.03
  });

  const [topPerformers, setTopPerformers] = useState<ClientPerformanceData[]>([
    {
      clientId: 'client-1',
      clientName: 'TechStart Pro',
      engagement: 12.5,
      reach: 450000,
      conversions: 234,
      revenue: 45000,
      trendsData: []
    },
    {
      clientId: 'client-2',
      clientName: 'Fashion Forward',
      engagement: 11.8,
      reach: 380000,
      conversions: 189,
      revenue: 38000,
      trendsData: []
    },
    {
      clientId: 'client-3',
      clientName: 'Fitness Hub',
      engagement: 10.9,
      reach: 520000,
      conversions: 345,
      revenue: 52000,
      trendsData: []
    }
  ]);

  const [platformMetrics, setPlatformMetrics] = useState([
    { platform: 'Instagram', clients: 890, engagement: 9.2, status: 'good' },
    { platform: 'TikTok', clients: 675, engagement: 11.5, status: 'good' },
    { platform: 'Twitter', clients: 543, engagement: 6.8, status: 'warning' },
    { platform: 'LinkedIn', clients: 432, engagement: 5.4, status: 'warning' },
    { platform: 'Facebook', clients: 321, engagement: 4.1, status: 'critical' }
  ]);

  // Auto-refresh effect
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(new Date());
      // In a real app, this would fetch fresh data
    }, refreshInterval * 1000);

    return () => clearInterval(interval);
  }, [refreshInterval]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-mint bg-mint/10 border-mint/20';
      case 'warning': return 'text-warning bg-warning/10 border-warning/20';
      case 'critical': return 'text-coral bg-coral/10 border-coral/20';
      default: return 'text-muted-foreground bg-muted/10 border-muted/20';
    }
  };

  const getTrendIcon = (direction: string) => {
    switch (direction) {
      case 'up': return <TrendingUp className="h-4 w-4 text-mint" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-coral" />;
      default: return <Activity className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const formatValue = (value: number, unit: string) => {
    if (unit === '$') {
      return `$${(value / 1000).toFixed(0)}k`;
    }
    if (value > 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    }
    if (value > 1000) {
      return `${(value / 1000).toFixed(0)}k`;
    }
    return value.toString();
  };

  const overviewCategories = [
    { value: 'all', label: 'All' },
    { value: 'key', label: 'Key Metrics' },
    { value: 'niche', label: 'Niche Performance' },
    { value: 'ab_test', label: 'A/B Tests' },
    { value: 'predictive', label: 'Predictions' },
  ];

  const filteredMetrics = metrics.filter(metric => 
    selectedOverviewCategory === 'all' || metric.category === selectedOverviewCategory
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-creative">Performance Monitoring</h2>
          <p className="text-muted-foreground">
            Real-time insights across {totalClientCount.toLocaleString()} clients
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1d">Last 24h</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics Overview Filter and Title */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">Performance Overview</h3>
        <Tabs value={selectedOverviewCategory} onValueChange={(value) => setSelectedOverviewCategory(value as any)} className="w-auto">
          <TabsList>
            {overviewCategories.map(cat => (
              <TabsTrigger key={cat.value} value={cat.value}>{cat.label}</TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* Key Metrics Overview Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredMetrics.map((metric) => {
          const MetricIcon = metric.icon || Activity;
          return (
            <Card key={metric.id} className="border-border">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div className={`p-1 rounded ${getStatusColor(metric.status)}`}>
                      <MetricIcon className="h-3 w-3" />
                    </div>
                    <span className="text-sm font-medium">{metric.name}</span>
                  </div>
                  {getTrendIcon(metric.changeDirection)}
                </div>
                
                <div className="space-y-2">
                  <div className="text-2xl font-bold">
                    {formatValue(metric.value, metric.unit)}
                    {metric.unit === '%' && metric.name !== 'Predicted Churn Risk' && '%'}
                    {metric.unit === '% uplift' && '% uplift'}
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className={`flex items-center space-x-1 ${
                      metric.changeDirection === 'up' ? 'text-mint' : 
                      metric.changeDirection === 'down' ? 'text-coral' : 'text-muted-foreground'
                    }`}>
                      <span>{metric.change > 0 ? '+' : ''}{metric.change}{metric.unit === '%' || metric.unit === '% uplift' ? '%' : ''}</span>
                    </span>
                    
                    {metric.target && (
                      <span className="text-muted-foreground">
                        Target: {formatValue(metric.target, metric.unit)}{metric.unit === '%' && '%'}
                      </span>
                    )}
                  </div>
                  
                  {metric.target && (
                    <Progress 
                      value={(metric.value / metric.target) * 100} 
                      className="h-1"
                    />
                  )}
                  {metric.trendData && metric.trendData.length > 0 && (
                    <MiniTrendChart 
                      data={metric.trendData} 
                      color={metric.changeDirection === 'up' ? 'hsl(var(--chart-positive))' : metric.changeDirection === 'down' ? 'hsl(var(--chart-negative))' : 'hsl(var(--muted-foreground))'} 
                    />
                  )}
                  {metric.detailsLink && (
                    <div className="mt-3 text-right">
                      <Link href={metric.detailsLink} passHref legacyBehavior>
                        <Button variant="outline" size="xs" className="text-xs">
                          <LinkIcon className="h-3 w-3 mr-1" />
                          View Details
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Tabs defaultValue="performance" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="performance">Client Performance</TabsTrigger>
          <TabsTrigger value="platforms">Platform Analytics</TabsTrigger>
          <TabsTrigger value="workflows">Workflow Health</TabsTrigger>
          <TabsTrigger value="system">System Status</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Performers */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-5 w-5" />
                  <span>Top Performers</span>
                </CardTitle>
                <CardDescription>Highest performing clients this {timeRange}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topPerformers.map((client, index) => (
                    <div key={client.clientId} className="flex items-center space-x-3 p-3 rounded-lg bg-muted/30">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
                        {index + 1}
                      </div>
                      
                      <div className="flex-1">
                        <h4 className="font-medium">{client.clientName}</h4>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span>{client.engagement}% engagement</span>
                          <span>{formatValue(client.reach, '')} reach</span>
                          <span>{formatValue(client.revenue, '$')} revenue</span>
                        </div>
                      </div>
                      
                      <CircularScore 
                        score={client.engagement} 
                        size="sm" 
                        className="text-mint"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Performance Distribution */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5" />
                  <span>Performance Distribution</span>
                </CardTitle>
                <CardDescription>Client performance breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">High Performers (8%+)</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-muted rounded-full h-2">
                        <div className="bg-mint h-2 rounded-full" style={{ width: '35%' }}></div>
                      </div>
                      <span className="text-sm text-muted-foreground">432</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Average Performers (5-8%)</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-muted rounded-full h-2">
                        <div className="bg-lavender h-2 rounded-full" style={{ width: '45%' }}></div>
                      </div>
                      <span className="text-sm text-muted-foreground">567</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Needs Attention (&lt;5%)</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-muted rounded-full h-2">
                        <div className="bg-coral h-2 rounded-full" style={{ width: '20%' }}></div>
                      </div>
                      <span className="text-sm text-muted-foreground">234</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 rounded-lg bg-info/10 border border-info/20">
                  <div className="flex items-start space-x-2">
                    <Gauge className="h-4 w-4 text-info mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-info">Performance Insights</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        35% of clients are exceeding engagement targets. Consider scaling successful strategies.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="platforms" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {platformMetrics.map((platform) => (
              <Card key={platform.platform} className="border-border">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium">{platform.platform}</h3>
                    <Badge className={getStatusColor(platform.status)}>
                      {platform.status}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Active Clients</span>
                      <span className="font-medium">{platform.clients}</span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Avg Engagement</span>
                      <span className="font-medium">{platform.engagement}%</span>
                    </div>
                    
                    <Progress 
                      value={platform.engagement * 8} 
                      className="h-1 mt-2"
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="workflows" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-border">
              <CardContent className="p-4 text-center">
                <Zap className="h-8 w-8 mx-auto mb-2 text-mint" />
                <div className="text-2xl font-bold">156</div>
                <div className="text-sm text-muted-foreground">Active Workflows</div>
              </CardContent>
            </Card>
            
            <Card className="border-border">
              <CardContent className="p-4 text-center">
                <Clock className="h-8 w-8 mx-auto mb-2 text-lavender" />
                <div className="text-2xl font-bold">23</div>
                <div className="text-sm text-muted-foreground">In Queue</div>
              </CardContent>
            </Card>
            
            <Card className="border-border">
              <CardContent className="p-4 text-center">
                <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-mint" />
                <div className="text-2xl font-bold">1,245</div>
                <div className="text-sm text-muted-foreground">Completed Today</div>
              </CardContent>
            </Card>
            
            <Card className="border-border">
              <CardContent className="p-4 text-center">
                <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-coral" />
                <div className="text-2xl font-bold">3</div>
                <div className="text-sm text-muted-foreground">Failed</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-border">
              <CardHeader>
                <CardTitle>System Health</CardTitle>
                <CardDescription>Current system performance metrics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">API Latency</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm">{systemHealth.apiLatency}ms</span>
                    <div className={`w-2 h-2 rounded-full ${
                      systemHealth.apiLatency < 200 ? 'bg-mint' : 
                      systemHealth.apiLatency < 500 ? 'bg-warning' : 'bg-coral'
                    }`}></div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Uptime</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm">{systemHealth.uptime}%</span>
                    <div className="w-2 h-2 rounded-full bg-mint"></div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Error Rate</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm">{systemHealth.errorRate}%</span>
                    <div className="w-2 h-2 rounded-full bg-mint"></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader>
                <CardTitle>Data Refresh</CardTitle>
                <CardDescription>Automatic data updates and synchronization</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Last Update</span>
                  <span className="text-sm text-muted-foreground">
                    {lastUpdate.toLocaleTimeString()}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Refresh Interval</span>
                  <Select value={refreshInterval.toString()} onValueChange={(value) => setRefreshInterval(parseInt(value))}>
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15s</SelectItem>
                      <SelectItem value="30">30s</SelectItem>
                      <SelectItem value="60">1m</SelectItem>
                      <SelectItem value="300">5m</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="pt-2">
                  <Progress value={75} className="h-1" />
                  <p className="text-xs text-muted-foreground mt-1">
                    Next refresh in {refreshInterval - 8} seconds
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 