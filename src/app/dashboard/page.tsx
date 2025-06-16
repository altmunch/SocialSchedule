'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import GlassCard from '@/components/ui/GlassCard';
import { AnimatedButton } from '@/components/ui/AnimatedButton';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Search, 
  Zap, 
  BarChart3, 
  RefreshCw, 
  ArrowRight, 
  Sparkles, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  DollarSign, 
  Target, 
  Rocket,
  Activity, 
  Eye, 
  Heart, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Upload, 
  Bot, 
  Gauge, 
  LineChart,
  Play,
  Settings,
  Bell,
  ChevronRight,
  MoreHorizontal,
  ShoppingBag,
  Video,
  MessageSquare,
  Share2,
  Filter,
  PlusCircle,
  ArrowUpRight,
  Star,
  Globe,
  Briefcase
} from 'lucide-react';
import { ReportsAnalysisService } from '@/app/workflows/reports/ReportsAnalysisService';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { ChartWrapper } from '@/components/ui/chart-wrapper';
import { LineChart as LineChartComponent, BarChart as BarChartComponent } from '@/components/dashboard/charts';
import UsageTracker from '@/components/dashboard/UsageTracker';
import { useUsageLimits } from '@/hooks/useUsageLimits';
import { useFeatureUsage } from '@/hooks/useFeatureUsage';
import { LoginPromptPopup } from '@/components/dashboard/LoginPromptPopup';
import { SubscriptionPromptPopup } from '@/components/dashboard/SubscriptionPromptPopup';

export default function DashboardPage() {
  const { user } = useAuth();
  const [greeting, setGreeting] = useState('Hello');
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [animationStage, setAnimationStage] = useState(0);
  const [realtimeData, setRealtimeData] = useState({
    // TODO: These values should be fetched dynamically from a real-time data source.
    revenue: 0,
    revenueGrowth: 0,
    orders: 0,
    ordersGrowth: 0,
    conversion: 0,
    conversionGrowth: 0,
    visitors: 0,
    visitorsGrowth: 0
  });

  const subscriptionTier = (user as any)?.user_metadata?.subscription_tier || 'lite';
  const { hasFeatureAccess, tier } = useUsageLimits(subscriptionTier);
  
  const {
    checkFeatureAccess,
    recordFeatureUsage,
    showLoginPrompt,
    showSubscriptionPrompt,
    currentFeature,
    closeLoginPrompt,
    closeSubscriptionPrompt,
    isAuthenticated
  } = useFeatureUsage();

  // Staggered animation entrance
  useEffect(() => {
    const stages = [0, 1, 2, 3, 4];
    stages.forEach((stage, index) => {
      setTimeout(() => setAnimationStage(stage), index * 150);
    });
  }, []);

  // Get time-based greeting
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

  // Real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
      setRealtimeData(prev => ({
        revenue: prev.revenue + Math.floor(Math.random() * 100) - 50,
        revenueGrowth: Math.max(0, prev.revenueGrowth + (Math.random() - 0.5) * 0.5),
        orders: prev.orders + Math.floor(Math.random() * 5) - 2,
        ordersGrowth: Math.max(0, prev.ordersGrowth + (Math.random() - 0.5) * 0.3),
        conversion: Math.max(0, prev.conversion + (Math.random() - 0.5) * 0.1),
        conversionGrowth: Math.max(0, prev.conversionGrowth + (Math.random() - 0.5) * 0.2),
        visitors: prev.visitors + Math.floor(Math.random() * 20) - 10,
        visitorsGrowth: Math.max(0, prev.visitorsGrowth + (Math.random() - 0.5) * 0.4)
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Load analytics data
  useEffect(() => {
    async function fetchAnalytics() {
      if (!user) return;
      setLoading(true);
      try {
        const supabase = createClientComponentClient();
        const reportsService = new ReportsAnalysisService(supabase);
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth(), 1);
        const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        const result = await reportsService.getReport({
          userId: user.id,
          platform: 'TikTok',
          timeRange: { start: start.toISOString(), end: end.toISOString() },
          correlationId: `dashboard-home-${user.id}`,
        });
        if (result.success) {
          setAnalytics(result.data);
        }
      } catch (err: any) {
        console.error('Analytics error:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchAnalytics();
  }, [user]);

  const handleFeatureClick = (featureName: string, href: string) => {
    if (checkFeatureAccess(featureName)) {
      recordFeatureUsage(featureName);
      window.location.href = href;
    }
  };

  // Main metrics with e-commerce focus
  const mainMetrics = [
    {
      id: 'revenue',
      title: 'Revenue',
      value: `$${realtimeData.revenue.toLocaleString()}`,
      change: `+${realtimeData.revenueGrowth.toFixed(1)}%`,
      trend: 'up',
      icon: DollarSign,
      description: 'Total sales this month',
      color: 'green',
    },
    {
      id: 'orders',
      title: 'Orders',
      value: realtimeData.orders.toLocaleString(),
      change: `+${realtimeData.ordersGrowth.toFixed(1)}%`,
      trend: 'up',
      icon: ShoppingBag,
      description: 'New orders today',
      color: 'blue',
    },
    {
      id: 'conversion',
      title: 'Conversion Rate',
      value: `${realtimeData.conversion.toFixed(2)}%`,
      change: `+${realtimeData.conversionGrowth.toFixed(1)}%`,
      trend: 'up',
      icon: Target,
      description: 'Visitor to customer rate',
      color: 'green',
    },
    {
      id: 'visitors',
      title: 'Visitors',
      value: realtimeData.visitors.toLocaleString(),
      change: `+${realtimeData.visitorsGrowth.toFixed(1)}%`,
      trend: 'up',
      icon: Users,
      description: 'Unique visitors today',
      color: 'purple',
    },
  ];

  // Quick actions optimized for e-commerce
  const quickActions = [
    {
      name: 'upload-video',
      title: 'Upload New Product Video',
      description: 'Kickstart your content creation with a new video.',
      icon: Upload,
      href: '/dashboard/content-creation?action=upload',
    },
    {
      name: 'optimize-listing',
      title: 'Optimize Listing for SEO',
      description: 'Enhance your product visibility with AI-driven SEO.',
      icon: Sparkles,
      href: '/dashboard/product-optimization?action=seo',
    },
    {
      name: 'generate-ideas',
      title: 'Generate AI Content Ideas',
      description: 'Get fresh, viral content concepts instantly.',
      icon: Bot,
      href: '/dashboard/content-creation?action=ideas',
    },
    {
      name: 'schedule-posts',
      title: 'Schedule Social Posts',
      description: 'Plan and automate your social media presence.',
      icon: Calendar,
      href: '/dashboard/scheduler',
    },
  ];

  // Mock data for recent activity (replace with real data from services)
  const recentActivity = [
    {
      id: '1',
      icon: DollarSign,
      title: 'New Sale Generated',
      timestamp: '2 minutes ago',
      description: 'Product X sold for $59.99',
    },
    {
      id: '2',
      icon: Sparkles,
      title: 'Listing Optimized',
      timestamp: '1 hour ago',
      description: 'AI improved SEO for "Summer Dress."',
    },
    {
      id: '3',
      icon: Bell,
      title: 'New System Alert',
      timestamp: 'Yesterday',
      description: 'High engagement on product Y. Consider boosting.',
    },
    {
      id: '4',
      icon: Upload,
      title: 'Video Processed',
      timestamp: '3 days ago',
      description: '"Fall Collection" video ready for review.',
    },
  ];

  // Mock data for performance trends chart
  const salesData = [
    { name: 'Jan', sales: 4000, revenue: 2400 },
    { name: 'Feb', sales: 3000, revenue: 1398 },
    { name: 'Mar', sales: 2000, revenue: 9800 },
    { name: 'Apr', sales: 2780, revenue: 3908 },
    { name: 'May', sales: 1890, revenue: 4800 },
    { name: 'Jun', sales: 2390, revenue: 3800 },
    { name: 'Jul', sales: 3490, revenue: 4300 },
  ];

  const engagementData = [
    { name: 'Mon', views: 2400, likes: 1200 },
    { name: 'Tue', views: 1398, likes: 800 },
    { name: 'Wed', views: 9800, likes: 5000 },
    { name: 'Thu', views: 3908, likes: 2000 },
    { name: 'Fri', views: 4800, likes: 2500 },
    { name: 'Sat', views: 3800, likes: 1800 },
    { name: 'Sun', views: 4300, likes: 2100 },
  ];

  return (
    <div className="min-h-screen p-8">
      {!isAuthenticated && <LoginPromptPopup isOpen={showLoginPrompt} onClose={closeLoginPrompt} featureName={currentFeature} />}
      {!hasFeatureAccess(currentFeature) && isAuthenticated && <SubscriptionPromptPopup isOpen={showSubscriptionPrompt} onClose={closeSubscriptionPrompt} featureName={currentFeature} currentTier={tier} />}

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-foreground transition-all duration-500"
            style={{ opacity: animationStage >= 0 ? 1 : 0, transform: `translateY(${animationStage >= 0 ? 0 : 20}px)` }}>
          {greeting}, {user?.user_metadata.full_name || user?.email || 'User'}!
        </h2>
        <p className="text-muted-foreground text-sm">{currentTime.toLocaleString()}</p>
      </div>

      {/* Key Metrics Section */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {mainMetrics.map((metric, index) => (
          <GlassCard
            key={metric.id}
            className={`relative overflow-hidden transition-all duration-300 transform rounded-xl ${
              hoveredCard === metric.id ? 'scale-[1.02]' : 'scale-100'
            }`}
            onMouseEnter={() => setHoveredCard(metric.id)}
            onMouseLeave={() => setHoveredCard(null)}
            style={{ opacity: animationStage >= 1 ? 1 : 0, transform: `translateY(${animationStage >= 1 ? 0 : 20}px)`, transitionDelay: `${index * 0.1}s` }}
          >
            <div className="p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground flex items-center space-x-1">
                  <metric.icon className="w-4 h-4 text-muted-foreground" />
                  <span>{metric.title}</span>
                </p>
                <Badge variant="outline" className={`py-1 px-2 text-xs font-semibold ${metric.trend === 'up' ? 'text-green-500 bg-green-500/10' : 'text-red-500 bg-red-500/10'}`}>
                  {metric.change}
                  {metric.trend === 'up' ? <TrendingUp className="ml-1 h-3 w-3" /> : <TrendingDown className="ml-1 h-3 w-3" />}
                </Badge>
              </div>
              <p className="text-3xl font-bold mt-2 flex items-baseline">
                {metric.value}
              </p>
            </div>
            <div className="p-5 pt-0">
              <p className="text-xs text-muted-foreground">{metric.description}</p>
            </div>
          </GlassCard>
        ))}
      </section>

      {/* Quick Actions Section */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {quickActions.map((action, index) => (
          <GlassCard
            key={action.name}
            className="relative overflow-hidden group cursor-pointer p-6"
            onClick={() => handleFeatureClick(action.name, action.href)}
            style={{ opacity: animationStage >= 2 ? 1 : 0, transform: `translateY(${animationStage >= 2 ? 0 : 20}px)`, transitionDelay: `${index * 0.15}s` }}
          >
            <action.icon size={36} className="text-accent-amethyst-purple mb-4 group-hover:rotate-6 group-hover:scale-110 transition-transform duration-300" />
            <h3 className="text-xl font-semibold text-foreground mb-2 group-hover:text-accent-cerulean-blue transition-colors">
              {action.title}
            </h3>
            <p className="text-muted-foreground text-sm mb-4">{action.description}</p>
            <AnimatedButton className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">Start</AnimatedButton>
          </GlassCard>
        ))}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Performance Trends */}
        <GlassCard
          className="h-[400px]"
          style={{ opacity: animationStage >= 3 ? 1 : 0, transform: `translateY(${animationStage >= 3 ? 0 : 20}px)`, transitionDelay: '0.4s' }}
        >
          <div className="p-6">
            <h3 className="text-xl font-semibold text-foreground mb-4">Sales Performance</h3>
            <LineChartComponent data={salesData} dataKey="sales" lineColor="#8A2BE2" />
          </div>
        </GlassCard>
        <GlassCard
          className="h-[400px]"
          style={{ opacity: animationStage >= 3 ? 1 : 0, transform: `translateY(${animationStage >= 3 ? 0 : 20}px)`, transitionDelay: '0.5s' }}
        >
          <div className="p-6">
            <h3 className="text-xl font-semibold text-foreground mb-4">Engagement Over Time</h3>
            <BarChartComponent data={engagementData} dataKey="views" barColor="#4A90E2" />
          </div>
        </GlassCard>
      </div>

      {/* Recent Activity */}
      <GlassCard
        className="mb-8"
        style={{ opacity: animationStage >= 4 ? 1 : 0, transform: `translateY(${animationStage >= 4 ? 0 : 20}px)`, transitionDelay: '0.6s' }}
      >
        <div className="p-6">
          <h3 className="text-xl font-semibold text-foreground mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3">
                <activity.icon size={20} className="text-muted-foreground mt-1" />
                <div>
                  <p className="font-medium text-foreground">{activity.title}</p>
                  <p className="text-sm text-muted-foreground">{activity.description}</p>
                  <p className="text-xs text-muted-foreground">{activity.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </GlassCard>

      {/* Usage Tracker */}
      <GlassCard
        style={{ opacity: animationStage >= 4 ? 1 : 0, transform: `translateY(${animationStage >= 4 ? 0 : 20}px)`, transitionDelay: '0.7s' }}
      >
        <div className="p-6">
          <UsageTracker />
        </div>
      </GlassCard>

      {/* Insert ActionableInsights and WorkflowTaskList GlassCard widgets after Recent Activity and UsageTracker sections */}
      <GlassCard
        className="mt-8"
        style={{ opacity: animationStage >= 4 ? 1 : 0, transform: `translateY(${animationStage >= 4 ? 0 : 20}px)`, transitionDelay: '0.8s' }}
      >
        <div className="p-6">
          {/* ActionableInsights content */}
        </div>
      </GlassCard>

      <GlassCard
        className="mt-8"
        style={{ opacity: animationStage >= 4 ? 1 : 0, transform: `translateY(${animationStage >= 4 ? 0 : 20}px)`, transitionDelay: '0.9s' }}
      >
        <div className="p-6">
          {/* WorkflowTaskList content */}
        </div>
      </GlassCard>
    </div>
  );
}
