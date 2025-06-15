'use client';

import { useEffect, useState } from 'react';
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
  Lock,
  Play,
  Pause,
  RefreshCw,
  Upload,
  Download,
  Mail,
  Calendar,
  Settings,
  Eye,
  Heart,
  MessageSquare,
  Share2,
  DollarSign,
  Sparkles,
  Rocket,
  Globe,
  Filter,
  Search,
  Plus,
  Layers,
  Cpu,
  Database,
  Network,
  Workflow,
  Bot,
  Gauge,
  LineChart,
  PieChart,
  BarChart,
  Briefcase,
  Star,
  Award,
  Flame,
  Zap as Lightning,
  FileVideo,
  MousePointer2,
  Maximize2,
  Minimize2
} from 'lucide-react';

export default function TeamDashboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { totalClientCount, setCurrentTab } = useTeamMode();
  const [activeWorkflows, setActiveWorkflows] = useState(0);
  const [completionProgress, setCompletionProgress] = useState(0);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [expandedMetric, setExpandedMetric] = useState<string | null>(null);
  const [realTimeMetrics, setRealTimeMetrics] = useState({
    processingRate: 847,
    queueSize: 12450,
    successRate: 98.7,
    avgResponseTime: 1.2
  });
  const [chartData, setChartData] = useState<{
    performance: Array<{date: string; value: number; success: number; errors: number}>;
    clientGrowth: Array<{date: string; new: number; active: number; churned: number}>;
    revenueData: Array<{date: string; revenue: number; profit: number; costs: number}>;
    automationEfficiency: Array<{date: string; automated: number; manual: number; savings: number}>;
  }>({
    performance: [],
    clientGrowth: [],
    revenueData: [],
    automationEfficiency: []
  });
  const [selectedChart, setSelectedChart] = useState('performance');
  const [chartTimeRange, setChartTimeRange] = useState('7d');
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [animationStage, setAnimationStage] = useState(0);
  
  // Mock subscription tier - in production, get this from user data
  const subscriptionTier = 'team'; // Changed to team for demo
  const { hasFeatureAccess, tier } = useUsageLimits(subscriptionTier);

  // Check team dashboard access
  const hasTeamAccess = hasFeatureAccess('teamDashboard');

  // Enhanced mouse tracking for interactive effects
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Staggered animation entrance
  useEffect(() => {
    const stages = [0, 1, 2, 3, 4, 5];
    stages.forEach((stage, index) => {
      setTimeout(() => setAnimationStage(stage), index * 300);
    });
  }, []);

  // Generate dynamic chart data
  useEffect(() => {
    const generateChartData = () => {
      const days = chartTimeRange === '7d' ? 7 : chartTimeRange === '30d' ? 30 : 90;
      const performance = [];
      const clientGrowth = [];
      const revenueData = [];
      const automationEfficiency = [];

      for (let i = days; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        
        performance.push({
          date: date.toISOString().split('T')[0],
          value: Math.floor(Math.random() * 1000) + 500,
          success: Math.floor(Math.random() * 100) + 90,
          errors: Math.floor(Math.random() * 50) + 10
        });

        clientGrowth.push({
          date: date.toISOString().split('T')[0],
          new: Math.floor(Math.random() * 50) + 10,
          active: Math.floor(Math.random() * 200) + 100,
          churned: Math.floor(Math.random() * 10) + 2
        });

        revenueData.push({
          date: date.toISOString().split('T')[0],
          revenue: Math.floor(Math.random() * 50000) + 25000,
          profit: Math.floor(Math.random() * 20000) + 10000,
          costs: Math.floor(Math.random() * 15000) + 8000
        });

        automationEfficiency.push({
          date: date.toISOString().split('T')[0],
          automated: Math.floor(Math.random() * 100) + 85,
          manual: Math.floor(Math.random() * 15) + 5,
          savings: Math.floor(Math.random() * 10000) + 5000
        });
      }

      setChartData({
        performance,
        clientGrowth,
        revenueData,
        automationEfficiency
      });
    };

    generateChartData();
    const interval = setInterval(generateChartData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, [chartTimeRange]);

  // Enhanced real-time updates with more sophisticated animations
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveWorkflows(prev => Math.max(0, prev + Math.floor(Math.random() * 10) - 5));
      setCompletionProgress(prev => Math.min(100, prev + Math.random() * 2));
      setRealTimeMetrics(prev => ({
        processingRate: Math.max(500, prev.processingRate + Math.floor(Math.random() * 100) - 50),
        queueSize: Math.max(0, prev.queueSize + Math.floor(Math.random() * 200) - 100),
        successRate: Math.min(100, Math.max(95, prev.successRate + (Math.random() - 0.5) * 0.5)),
        avgResponseTime: Math.max(0.5, prev.avgResponseTime + (Math.random() - 0.5) * 0.2)
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // If no team access, show upgrade prompt
  if (!hasTeamAccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Enhanced animated background */}
        <div className="absolute inset-0">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-500/40 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-500/40 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[32rem] h-[32rem] bg-pink-500/20 rounded-full blur-3xl animate-pulse delay-2000"></div>
        </div>
        
        <Card className="max-w-md w-full bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-2xl border-white/30 shadow-2xl relative z-10 hover:scale-105 transition-transform duration-500">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-4 rounded-full bg-gradient-to-r from-purple-500/30 to-pink-500/30 border border-purple-400/50 backdrop-blur-sm">
                <Lock className="h-8 w-8 text-purple-300" />
              </div>
            </div>
            <CardTitle className="text-xl text-white">Team Dashboard Access Required</CardTitle>
            <CardDescription className="text-gray-300">
              The Team Dashboard is available for Team plan subscribers only
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-white/10 rounded-lg p-4 border border-white/20 backdrop-blur-sm">
              <h4 className="font-semibold text-white mb-2">Current Plan: {tier?.name}</h4>
              <p className="text-sm text-gray-300 mb-3">
                Upgrade to Team plan to unlock:
              </p>
              <ul className="text-sm text-gray-200 space-y-1">
                <li className="flex items-center">
                  <Shield className="h-4 w-4 text-purple-400 mr-2" />
                  Advanced team management
                </li>
                <li className="flex items-center">
                  <BarChart3 className="h-4 w-4 text-purple-400 mr-2" />
                  Advanced analytics & reporting
                </li>
                <li className="flex items-center">
                  <Users className="h-4 w-4 text-purple-400 mr-2" />
                  Multi-account management
                </li>
              </ul>
            </div>
            
            <div className="flex flex-col space-y-2">
              <Button
                onClick={() => router.push('/dashboard/subscription')}
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold hover:opacity-90 transition-all transform hover:scale-105 shadow-2xl"
              >
                Upgrade to Team Plan
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push('/dashboard')}
                className="border-white/30 text-gray-300 hover:bg-white/20 backdrop-blur-sm"
              >
                Back to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Enhanced dashboard stats for 1000x scale
  const dashboardStats = {
    totalClients: totalClientCount,
    activeWorkflows: 2847,
    completedToday: 15420,
    avgEngagement: 8.7,
    revenueThisMonth: 12847650,
    clientsNeedingAttention: 234,
    videosProcessed: 45680,
    reportsGenerated: 1247,
    emailsSent: 8934,
    scheduledPosts: 23456,
    aiProcessingPower: 94.2,
    systemUptime: 99.97,
    dataProcessed: 847.3, // GB
    automationEfficiency: 96.8
  };

  const enhancedWorkflowModules = [
    {
      id: 'content-automation',
      title: 'Content Automation',
      description: 'AI-powered video processing with intelligent descriptions and hashtag generation',
      icon: Bot,
      status: 'active',
      progress: 78,
      stats: {
        videosQueued: 12450,
        processing: 847,
        completed: 8934,
        scheduled: 15670,
        aiAccuracy: 97.3,
        avgProcessingTime: '2.1s'
      },
      color: 'from-emerald-500 to-teal-500',
      bgGradient: 'from-emerald-500/20 via-teal-500/10 to-transparent',
      borderGradient: 'from-emerald-500/50 to-teal-500/50'
    },
    {
      id: 'content-ideation',
      title: 'Content Ideation',
      description: 'Personalized content strategies and automated report generation',
      icon: Sparkles,
      status: 'active',
      progress: 92,
      stats: {
        reportsGenerated: 3420,
        emailsSent: 2890,
        clientsProcessed: 4567,
        engagementBoost: '+23.4%',
        ideaAccuracy: 94.7
      },
      color: 'from-purple-500 to-pink-500',
      bgGradient: 'from-purple-500/20 via-pink-500/10 to-transparent',
      borderGradient: 'from-purple-500/50 to-pink-500/50'
    },
    {
      id: 'performance-tracking',
      title: 'Performance Intelligence',
      description: 'Advanced analytics with predictive insights and optimization recommendations',
      icon: TrendingUp,
      status: 'running',
      progress: 65,
      stats: {
        clientsAnalyzed: 8934,
        improvementsGenerated: 2340,
        performanceReports: 1247,
        predictiveAccuracy: '91.2%',
        optimizationGains: '+18.7%'
      },
      color: 'from-orange-500 to-red-500',
      bgGradient: 'from-orange-500/20 via-red-500/10 to-transparent',
      borderGradient: 'from-orange-500/50 to-red-500/50'
    }
  ];

  const systemMetrics = [
    {
      id: 'ai-processing',
      title: 'AI Processing Power',
      value: dashboardStats.aiProcessingPower,
      unit: '%',
      icon: Cpu,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/20',
      trend: '+2.3%',
      description: 'Current AI utilization'
    },
    {
      id: 'system-uptime',
      title: 'System Uptime',
      value: dashboardStats.systemUptime,
      unit: '%',
      icon: Activity,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20',
      trend: '99.97%',
      description: 'System availability'
    },
    {
      id: 'data-processed',
      title: 'Data Processed',
      value: dashboardStats.dataProcessed,
      unit: 'GB',
      icon: Database,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/20',
      trend: '+12.4GB',
      description: 'Today\'s data volume'
    },
    {
      id: 'automation-efficiency',
      title: 'Automation Efficiency',
      value: dashboardStats.automationEfficiency,
      unit: '%',
      icon: Workflow,
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/20',
      trend: '+3.2%',
      description: 'Process optimization'
    }
  ];

  const quickActions = [
    {
      title: 'Bulk Video Upload',
      description: 'Upload thousands of videos for AI processing',
      icon: Upload,
      action: () => router.push('/team-dashboard/operations/bulk-upload'),
      color: 'from-emerald-500 to-teal-500',
      bgColor: 'bg-emerald-500/20'
    },
    {
      title: 'Client Management',
      description: 'Manage client accounts and preferences',
      icon: Users,
      action: () => router.push('/team-dashboard/clients'),
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-500/20'
    },
    {
      title: 'Analytics Dashboard',
      description: 'View comprehensive performance analytics',
      icon: BarChart3,
      action: () => router.push('/team-dashboard/analytics'),
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-500/20'
    },
    {
      title: 'Workflow Builder',
      description: 'Create custom automation workflows',
      icon: Settings,
      action: () => router.push('/team-dashboard/workflows'),
      color: 'from-orange-500 to-red-500',
      bgColor: 'bg-orange-500/20'
    }
  ];

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(0)}k`;
    return num.toString();
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'running': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'paused': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'error': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white relative overflow-hidden">
      {/* Enhanced Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[32rem] h-[32rem] bg-emerald-500/20 rounded-full blur-3xl animate-pulse delay-2000"></div>
        <div className="absolute top-20 right-20 w-64 h-64 bg-pink-500/20 rounded-full blur-2xl animate-pulse delay-3000"></div>
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-cyan-500/20 rounded-full blur-2xl animate-pulse delay-4000"></div>
      </div>

      {/* Enhanced Glassmorphism Grid Pattern */}
      <div className="absolute inset-0 bg-[var(--grid-background-svg)] opacity-40"></div>

      <div className="relative z-10">
        {/* Enhanced Hero Header */}
        <div className="relative px-6 py-12">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="p-3 rounded-2xl bg-gradient-to-r from-purple-500/30 to-pink-500/30 border border-purple-400/50 backdrop-blur-2xl shadow-2xl hover:scale-110 transition-transform duration-500">
                    <Rocket className="h-8 w-8 text-purple-300" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
                      Team Dashboard
                    </h1>
                    <p className="text-gray-300 text-lg">
                      AI-Powered Content Automation at Scale
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
                    <span className="text-emerald-400 text-sm font-medium">
                      {formatNumber(totalClientCount)} Active Clients
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Activity className="h-4 w-4 text-blue-400" />
                    <span className="text-blue-400 text-sm font-medium">
                      {realTimeMetrics.processingRate}/min Processing
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="hidden lg:flex items-center space-x-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-white/30 text-white hover:bg-white/20 backdrop-blur-sm transition-all duration-300 hover:scale-105"
                  onClick={() => router.push('/team-dashboard/settings')}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:opacity-90 transition-all duration-300 hover:scale-105 shadow-2xl"
                  onClick={() => router.push('/team-dashboard/analytics')}
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  View Analytics
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Key Metrics */}
        <div className="px-6 mb-12">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  title: 'Active Workflows',
                  value: formatNumber(dashboardStats.activeWorkflows),
                  icon: Workflow,
                  color: 'text-purple-400',
                  bgColor: 'bg-purple-500/20',
                  trend: 'Real-time'
                },
                {
                  title: 'Reports Generated',
                  value: formatNumber(dashboardStats.reportsGenerated),
                  icon: BarChart3,
                  color: 'text-blue-400',
                  bgColor: 'bg-blue-500/20',
                  trend: 'This week'
                },
                {
                  title: 'Revenue This Month',
                  value: `$${formatNumber(dashboardStats.revenueThisMonth)}`,
                  icon: DollarSign,
                  color: 'text-orange-400',
                  bgColor: 'bg-orange-500/20',
                  trend: '+18.7% MoM'
                },
                {
                  title: 'Clients Processed',
                  value: formatNumber(totalClientCount),
                  icon: Users,
                  color: 'text-emerald-400',
                  bgColor: 'bg-emerald-500/20',
                  trend: '+12.3% growth'
                }
              ].map((metric, index) => {
                const IconComponent = metric.icon;
                return (
                  <Card 
                    key={index} 
                    className="bg-gradient-to-br from-white/15 via-white/10 to-white/5 backdrop-blur-2xl border-white/30 hover:border-white/50 transition-all duration-500 group cursor-pointer shadow-2xl"
                    onMouseEnter={() => setHoveredCard(`metric-${index}`)}
                    onMouseLeave={() => setHoveredCard(null)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="space-y-2">
                          <p className="text-gray-300 text-sm font-medium">{metric.title}</p>
                          <p className="text-3xl font-bold text-white group-hover:scale-110 transition-transform duration-300">
                            {metric.value}
                          </p>
                          <div className="flex items-center space-x-1">
                            <div className={`w-2 h-2 rounded-full ${metric.bgColor.replace('/20', '')} animate-pulse`}></div>
                            <span className={`${metric.color} text-sm`}>{metric.trend}</span>
                          </div>
                        </div>
                        <div className={`p-3 rounded-xl ${metric.bgColor} group-hover:scale-110 transition-all duration-300 backdrop-blur-sm`}>
                          <IconComponent className={`h-8 w-8 ${metric.color}`} />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>

        {/* Enhanced Workflow Modules */}
        <div className="px-6 mb-12">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-2xl font-bold text-white mb-8 text-center">Workflow Automation Hub</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {enhancedWorkflowModules.map((module) => {
                const IconComponent = module.icon;
                const isHovered = hoveredCard === module.id;
                
                return (
                  <Card 
                    key={module.id}
                    className="bg-gradient-to-br from-white/15 via-white/10 to-white/5 backdrop-blur-2xl border-white/30 hover:border-white/50 transition-all duration-700 group cursor-pointer shadow-2xl hover:scale-105"
                    onMouseEnter={() => setHoveredCard(module.id)}
                    onMouseLeave={() => setHoveredCard(null)}
                  >
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`p-3 rounded-xl bg-gradient-to-r ${module.color} shadow-2xl group-hover:scale-110 transition-transform duration-500`}>
                            <IconComponent className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <CardTitle className="text-white text-lg">{module.title}</CardTitle>
                            <Badge className={`${getStatusColor(module.status)} text-xs mt-1`}>
                              {module.status}
                            </Badge>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-white hover:bg-white/20 transition-all duration-300"
                          onClick={() => setExpandedMetric(expandedMetric === module.id ? null : module.id)}
                        >
                          {expandedMetric === module.id ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                        </Button>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <p className="text-gray-300 text-sm leading-relaxed">
                        {module.description}
                      </p>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-400">Progress</span>
                          <span className="text-white font-medium">{module.progress}%</span>
                        </div>
                        <Progress 
                          value={module.progress} 
                          className="h-2 bg-white/20"
                        />
                      </div>
                      
                      {expandedMetric === module.id && (
                        <div className="mt-4 p-4 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 animate-in slide-in-from-top duration-300">
                          <h4 className="text-white font-medium mb-3">Detailed Stats</h4>
                          <div className="grid grid-cols-2 gap-3 text-xs">
                            {Object.entries(module.stats).map(([key, value]) => (
                              <div key={key} className="flex justify-between">
                                <span className="text-gray-400 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                                <span className="text-white font-medium">{value}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div className="flex space-x-2 pt-2">
                        <Button
                          size="sm"
                          className={`flex-1 bg-gradient-to-r ${module.color} text-white hover:opacity-90 transition-all duration-300 hover:scale-105`}
                        >
                          <Play className="h-4 w-4 mr-2" />
                          Manage
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-white/30 text-white hover:bg-white/20 transition-all duration-300"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>

        {/* Enhanced System Metrics */}
        <div className="px-6 mb-12">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-2xl font-bold text-white mb-8 text-center">System Performance</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {systemMetrics.map((metric) => {
                const IconComponent = metric.icon;
                const isExpanded = expandedMetric === metric.id;
                
                return (
                  <Card 
                    key={metric.id}
                    className="bg-gradient-to-br from-white/15 via-white/10 to-white/5 backdrop-blur-2xl border-white/30 hover:border-white/50 transition-all duration-500 group cursor-pointer shadow-2xl"
                    onClick={() => setExpandedMetric(isExpanded ? null : metric.id)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className={`p-3 rounded-xl ${metric.bgColor} group-hover:scale-110 transition-transform duration-300 backdrop-blur-sm`}>
                          <IconComponent className={`h-6 w-6 ${metric.color}`} />
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-white group-hover:scale-110 transition-transform duration-300">
                            {metric.value}{metric.unit}
                          </div>
                          <div className={`text-sm ${metric.color}`}>
                            {metric.trend}
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-white font-medium mb-1">{metric.title}</h3>
                        <p className="text-gray-400 text-sm">{metric.description}</p>
                      </div>
                      
                      {isExpanded && (
                        <div className="mt-4 p-3 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 animate-in slide-in-from-top duration-300">
                          <div className="text-xs text-gray-300">
                            <div className="flex justify-between mb-1">
                              <span>Last Hour:</span>
                              <span className="text-white">{(metric.value * 0.98).toFixed(1)}{metric.unit}</span>
                            </div>
                            <div className="flex justify-between mb-1">
                              <span>Peak Today:</span>
                              <span className="text-white">{(metric.value * 1.05).toFixed(1)}{metric.unit}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Average:</span>
                              <span className="text-white">{(metric.value * 0.95).toFixed(1)}{metric.unit}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>

        {/* Enhanced Quick Actions */}
        <div className="px-6 pb-12">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-2xl font-bold text-white mb-8 text-center">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {quickActions.map((action, index) => {
                const IconComponent = action.icon;
                return (
                  <Card 
                    key={index}
                    className="bg-gradient-to-br from-white/15 via-white/10 to-white/5 backdrop-blur-2xl border-white/30 hover:border-white/50 transition-all duration-500 group cursor-pointer shadow-2xl hover:scale-105"
                    onClick={action.action}
                  >
                    <CardContent className="p-6 text-center">
                      <div className="space-y-4">
                        <div className="relative">
                          <div className={`absolute inset-0 bg-gradient-to-r ${action.color} rounded-xl blur-xl opacity-0 group-hover:opacity-60 transition-opacity duration-500`}></div>
                          <div className={`relative p-4 rounded-xl bg-gradient-to-r ${action.color} group-hover:scale-110 transition-transform duration-500 shadow-2xl`}>
                            <IconComponent className="h-8 w-8 text-white mx-auto" />
                          </div>
                        </div>
                        <div>
                          <h3 className="text-white font-bold text-lg mb-2 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-300 group-hover:bg-clip-text transition-all duration-300">
                            {action.title}
                          </h3>
                          <p className="text-gray-400 text-sm">
                            {action.description}
                          </p>
                        </div>
                        <Button
                          className={`w-full bg-gradient-to-r ${action.color} text-white hover:opacity-90 transition-all duration-300 hover:scale-105 shadow-xl`}
                        >
                          Get Started
                          <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>

        {/* Floating Action Button */}
        <div className="fixed bottom-8 right-8 z-50">
          <Button
            size="lg"
            className="rounded-full w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-2xl hover:scale-110 transition-all duration-300 animate-pulse"
            onClick={() => router.push('/team-dashboard/operations/bulk-upload')}
          >
            <Plus className="h-8 w-8" />
          </Button>
        </div>
      </div>
    </div>
  );
} 