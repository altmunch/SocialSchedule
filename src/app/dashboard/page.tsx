'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Search, Zap, BarChart3, RefreshCw, ArrowRight, Sparkles, TrendingUp, TrendingDown, Users, DollarSign, Target, Rocket, Activity, Eye, Heart, Calendar, Clock, CheckCircle2, AlertTriangle, Upload, Bot, Gauge, LineChart } from 'lucide-react';
import { LineChart as LineChartComponent, BarChart as BarChartComponent } from '@/components/dashboard/charts';
import { ReportsAnalysisService } from '@/app/workflows/reports/ReportsAnalysisService';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { ChartWrapper } from '@/components/ui/chart-wrapper';
import { Progress } from '@/components/ui/progress';
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
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [realTimeMetrics, setRealTimeMetrics] = useState({
    activeUsers: 1247,
    processingRate: 847,
    successRate: 98.7,
    queueSize: 234
  });
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [animationStage, setAnimationStage] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [currentTheme, setCurrentTheme] = useState('aurora');
  const [layoutMode, setLayoutMode] = useState('adaptive');
  const [timeOfDay, setTimeOfDay] = useState('day');
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [fontSize, setFontSize] = useState('normal');
  const [performanceMode, setPerformanceMode] = useState('balanced');
  
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
    const stages = [0, 1, 2, 3, 4];
    stages.forEach((stage, index) => {
      setTimeout(() => setAnimationStage(stage), index * 200);
    });
  }, []);

  // Dynamic theme and time-based adaptation
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 12) {
      setTimeOfDay('morning');
      setCurrentTheme('sunrise');
    } else if (hour >= 12 && hour < 18) {
      setTimeOfDay('day');
      setCurrentTheme('daylight');
    } else if (hour >= 18 && hour < 22) {
      setTimeOfDay('evening');
      setCurrentTheme('sunset');
    } else {
      setTimeOfDay('night');
      setCurrentTheme('aurora');
    }
  }, []);

  // Adaptive layout based on screen size and user behavior
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setLayoutMode('mobile');
      } else if (width < 1024) {
        setLayoutMode('tablet');
      } else {
        setLayoutMode('desktop');
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Accessibility and performance preferences
  useEffect(() => {
    // Check for reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };
    
    mediaQuery.addEventListener('change', handleChange);
    
    // Check for high contrast preference
    const contrastQuery = window.matchMedia('(prefers-contrast: high)');
    setHighContrast(contrastQuery.matches);
    
    const handleContrastChange = (e: MediaQueryListEvent) => {
      setHighContrast(e.matches);
    };
    
    contrastQuery.addEventListener('change', handleContrastChange);
    
    // Performance mode based on device capabilities
    const connection = (navigator as any).connection;
    if (connection) {
      if (connection.effectiveType === '4g' && !connection.saveData) {
        setPerformanceMode('high');
      } else if (connection.effectiveType === '3g' || connection.saveData) {
        setPerformanceMode('low');
      }
    }
    
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
      contrastQuery.removeEventListener('change', handleContrastChange);
    };
  }, []);

  // Real-time updates with enhanced animations
  useEffect(() => {
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    const metricsInterval = setInterval(() => {
      setRealTimeMetrics(prev => ({
        activeUsers: Math.max(1000, prev.activeUsers + Math.floor(Math.random() * 20) - 10),
        processingRate: Math.max(500, prev.processingRate + Math.floor(Math.random() * 100) - 50),
        successRate: Math.min(100, Math.max(95, prev.successRate + (Math.random() - 0.5) * 0.5)),
        queueSize: Math.max(0, prev.queueSize + Math.floor(Math.random() * 50) - 25)
      }));
    }, 3000);

    return () => {
      clearInterval(timeInterval);
      clearInterval(metricsInterval);
    };
  }, []);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

  useEffect(() => {
    async function fetchAnalytics() {
      if (!user) return;
      setLoading(true);
      setError(null);
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
        } else {
          setError(result.error?.message || 'Failed to load analytics');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load analytics');
      } finally {
        setLoading(false);
      }
    }
    fetchAnalytics();
  }, [user]);

  // Show login prompt for non-authenticated users on page load
  useEffect(() => {
    if (!isAuthenticated) {
      const timer = setTimeout(() => {
        checkFeatureAccess('dashboard');
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, checkFeatureAccess]);

  const handleFeatureClick = (featureName: string, href: string) => {
    if (checkFeatureAccess(featureName)) {
      recordFeatureUsage(featureName);
      window.location.href = href;
    }
  };

  // Dynamic theme configurations
  const themeConfigs = {
    aurora: {
      name: 'Aurora',
      background: 'from-slate-900 via-purple-900 to-slate-900',
      primary: 'from-purple-500 to-pink-500',
      secondary: 'from-blue-500 to-cyan-500',
      accent: 'from-emerald-500 to-teal-500',
      particles: ['bg-purple-500/40', 'bg-blue-500/40', 'bg-pink-500/20', 'bg-cyan-500/30']
    },
    sunrise: {
      name: 'Sunrise',
      background: 'from-orange-900 via-red-900 to-yellow-900',
      primary: 'from-orange-500 to-red-500',
      secondary: 'from-yellow-500 to-orange-500',
      accent: 'from-pink-500 to-rose-500',
      particles: ['bg-orange-500/40', 'bg-red-500/40', 'bg-yellow-500/20', 'bg-pink-500/30']
    },
    daylight: {
      name: 'Daylight',
      background: 'from-blue-900 via-sky-900 to-cyan-900',
      primary: 'from-blue-500 to-sky-500',
      secondary: 'from-cyan-500 to-teal-500',
      accent: 'from-indigo-500 to-blue-500',
      particles: ['bg-blue-500/40', 'bg-sky-500/40', 'bg-cyan-500/20', 'bg-teal-500/30']
    },
    sunset: {
      name: 'Sunset',
      background: 'from-purple-900 via-pink-900 to-orange-900',
      primary: 'from-purple-500 to-pink-500',
      secondary: 'from-pink-500 to-orange-500',
      accent: 'from-violet-500 to-purple-500',
      particles: ['bg-purple-500/40', 'bg-pink-500/40', 'bg-orange-500/20', 'bg-violet-500/30']
    }
  };

  const currentThemeConfig = themeConfigs[currentTheme as keyof typeof themeConfigs];

  // Adaptive layout configurations
  const getLayoutClasses = () => {
    switch (layoutMode) {
      case 'mobile':
        return {
          container: 'p-4 space-y-6',
          grid: 'grid-cols-1',
          cardGrid: 'grid-cols-1',
          metricsGrid: 'grid-cols-2',
          spacing: 'gap-4'
        };
      case 'tablet':
        return {
          container: 'p-5 space-y-7',
          grid: 'grid-cols-1 lg:grid-cols-2',
          cardGrid: 'grid-cols-1 md:grid-cols-2',
          metricsGrid: 'grid-cols-2 md:grid-cols-4',
          spacing: 'gap-5'
        };
      default:
        return {
          container: 'p-6 space-y-8',
          grid: 'grid-cols-1 lg:grid-cols-2',
          cardGrid: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
          metricsGrid: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
          spacing: 'gap-6'
        };
    }
  };

  const layoutClasses = getLayoutClasses();

  // Accessibility and performance optimizations
  const getAccessibilityClasses = () => {
    let classes = '';
    
    if (highContrast) {
      classes += ' high-contrast';
    }
    
    if (fontSize === 'large') {
      classes += ' text-lg';
    } else if (fontSize === 'small') {
      classes += ' text-sm';
    }
    
    if (prefersReducedMotion) {
      classes += ' motion-reduce';
    }
    
    return classes;
  };

  const getPerformanceClasses = () => {
    switch (performanceMode) {
      case 'low':
        return 'performance-low';
      case 'high':
        return 'performance-high';
      default:
        return 'performance-balanced';
    }
  };

  const shouldShowAnimations = !prefersReducedMotion && performanceMode !== 'low';
  const shouldShowParticles = performanceMode === 'high' && !prefersReducedMotion;

  // Enhanced workflow cards with advanced micro-interactions
  const workflowCards = [
    {
      id: 'sell-better',
      title: 'Sell Better',
      subtitle: 'AI-Powered Sales Optimization',
      description: 'Transform your content into high-converting sales machines with advanced AI optimization and real-time performance tracking',
      icon: Rocket,
      href: '/dashboard/accelerate',
      feature: 'accelerate',
      gradient: 'from-emerald-400 via-teal-500 to-cyan-600',
      bgGradient: 'from-emerald-500/30 via-teal-500/20 to-cyan-500/30',
      borderGradient: 'from-emerald-400/80 to-cyan-500/80',
      glowColor: 'shadow-emerald-500/40',
      stats: {
        improvement: '+127%',
        metric: 'Conversion Rate',
        trend: 'up',
        subMetric: 'vs last month'
      },
      features: ['AI Content Analysis', 'Performance Optimization', 'A/B Testing', 'Real-time Analytics'],
      badge: 'Most Popular'
    },
    {
      id: 'how-to-sell',
      title: 'How to Sell',
      subtitle: 'Strategic Content Planning',
      description: 'Master the art of selling with data-driven insights, competitor analysis, and proven content strategies',
      icon: Target,
      href: '/dashboard/ideation',
      feature: 'ideation',
      gradient: 'from-purple-400 via-violet-500 to-indigo-600',
      bgGradient: 'from-purple-500/30 via-violet-500/20 to-indigo-500/30',
      borderGradient: 'from-purple-400/80 to-indigo-500/80',
      glowColor: 'shadow-purple-500/40',
      stats: {
        improvement: '+89%',
        metric: 'Engagement',
        trend: 'up',
        subMetric: 'vs last month'
      },
      features: ['Market Analysis', 'Competitor Insights', 'Content Strategy', 'Trend Forecasting'],
      badge: 'Trending'
    }
  ];

  // Enhanced performance metrics with micro-interactions
  const performanceMetrics = [
    {
      id: 'sales',
      title: 'Sales Performance',
      value: '₹12.4M',
      change: '+23.5%',
      trend: 'up',
      icon: DollarSign,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/30',
      borderColor: 'border-emerald-500/50',
      glowColor: 'shadow-emerald-500/30',
      description: 'Total revenue this month'
    },
    {
      id: 'conversion',
      title: 'Conversion Rate',
      value: '8.7%',
      change: '+12.3%',
      trend: 'up',
      icon: TrendingUp,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/30',
      borderColor: 'border-blue-500/50',
      glowColor: 'shadow-blue-500/30',
      description: 'Average conversion rate'
    },
    {
      id: 'engagement',
      title: 'Engagement',
      value: '94.2%',
      change: '+8.1%',
      trend: 'up',
      icon: Heart,
      color: 'text-pink-400',
      bgColor: 'bg-pink-500/30',
      borderColor: 'border-pink-500/50',
      glowColor: 'shadow-pink-500/30',
      description: 'User engagement rate'
    },
    {
      id: 'reach',
      title: 'Reach',
      value: '2.8M',
      change: '+45.2%',
      trend: 'up',
      icon: Eye,
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/30',
      borderColor: 'border-orange-500/50',
      glowColor: 'shadow-orange-500/30',
      description: 'Total audience reach'
    }
  ];

  // Enhanced quick actions with animations
  const quickActions = [
    {
      id: 'upload',
      title: 'Upload Content',
      description: 'Add new videos for optimization',
      icon: Upload,
      color: 'from-blue-500 to-purple-600',
      href: '/dashboard/upload',
      feature: 'upload'
    },
    {
      id: 'analyze',
      title: 'Analyze Performance',
      description: 'Deep dive into your metrics',
      icon: BarChart3,
      color: 'from-green-500 to-teal-600',
      href: '/dashboard/analytics',
      feature: 'analytics'
    },
    {
      id: 'optimize',
      title: 'AI Optimization',
      description: 'Enhance your content with AI',
      icon: Sparkles,
      color: 'from-purple-500 to-pink-600',
      href: '/dashboard/optimize',
      feature: 'optimize'
    },
    {
      id: 'schedule',
      title: 'Schedule Posts',
      description: 'Plan your content calendar',
      icon: Calendar,
      color: 'from-orange-500 to-red-600',
      href: '/dashboard/schedule',
      feature: 'schedule'
    }
  ];

  return (
    <div 
      className={`min-h-screen bg-gradient-to-br ${currentThemeConfig.background} relative overflow-hidden transition-all duration-1000 ${getAccessibilityClasses()} ${getPerformanceClasses()}`}
      role="main"
      aria-label="Dashboard"
    >
              {/* Enhanced animated background with dynamic theming and performance optimization */}
        <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
          {shouldShowParticles && currentThemeConfig.particles.map((particleClass, index) => (
            <div 
              key={index}
              className={`absolute w-96 h-96 ${particleClass} rounded-full blur-3xl ${shouldShowAnimations ? 'animate-pulse' : ''} transition-all duration-1000`}
              style={{
                top: `${Math.sin((Date.now() + index * 1000) / 5000) * 20 + 10}%`,
                right: index % 2 === 0 ? `${Math.cos((Date.now() + index * 1000) / 7000) * 15 + 10}%` : 'auto',
                left: index % 2 === 1 ? `${Math.sin((Date.now() + index * 1000) / 8000) * 15 + 10}%` : 'auto',
                bottom: index > 1 ? `${Math.cos((Date.now() + index * 1000) / 6000) * 20 + 10}%` : 'auto',
                transform: shouldShowAnimations ? `translate(${mousePosition.x * (0.02 - index * 0.005)}px, ${mousePosition.y * (0.02 - index * 0.005)}px) ${index === 2 ? `rotate(${Date.now() / 10000}deg)` : ''}` : 'none',
                animationDelay: `${index * 1000}ms`,
                willChange: shouldShowAnimations ? 'transform' : 'auto'
              }}
            ></div>
          ))}
        
        {/* Enhanced grid pattern with animation */}
        <div 
          className="absolute inset-0 bg-[var(--grid-background-svg)] opacity-40 transition-opacity duration-1000"
          style={{
            animation: 'gridFloat 20s ease-in-out infinite'
          }}
        ></div>
      </div>

      <div className={`relative z-10 ${layoutClasses.container}`}>
        {/* Enhanced header with staggered animation */}
        <div 
          className={`transition-all duration-1000 ${
            animationStage >= 0 ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'
          }`}
        >
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
              <div className="space-y-2">
                <div className="flex items-center space-x-4 mb-2">
                  <h1 className={`text-4xl font-bold bg-gradient-to-r ${currentThemeConfig.primary} bg-clip-text text-transparent animate-pulse`}>
                    {greeting}, {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Creator'}! 👋
                  </h1>
                  <div className="flex items-center space-x-2">
                    <div className={`px-3 py-1 rounded-full bg-gradient-to-r ${currentThemeConfig.secondary} text-white text-xs font-medium`}>
                      {currentThemeConfig.name} Theme
                    </div>
                    <button
                      onClick={() => {
                        const themes = Object.keys(themeConfigs);
                        const currentIndex = themes.indexOf(currentTheme);
                        const nextTheme = themes[(currentIndex + 1) % themes.length];
                        setCurrentTheme(nextTheme);
                      }}
                      className={`p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-300 ${shouldShowAnimations ? 'hover:scale-110' : ''}`}
                      aria-label="Change theme"
                      title="Change theme"
                    >
                      <Sparkles className="h-4 w-4 text-white" />
                    </button>
                    
                    {/* Accessibility controls */}
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setFontSize(fontSize === 'normal' ? 'large' : fontSize === 'large' ? 'small' : 'normal')}
                        className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-300"
                        aria-label="Change font size"
                        title="Change font size"
                      >
                        <span className="text-white text-xs font-bold">Aa</span>
                      </button>
                      <button
                        onClick={() => setHighContrast(!highContrast)}
                        className={`p-2 rounded-full transition-all duration-300 ${highContrast ? 'bg-white text-black' : 'bg-white/10 hover:bg-white/20 text-white'}`}
                        aria-label="Toggle high contrast"
                        title="Toggle high contrast"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              <p className="text-gray-300 text-lg">
                Ready to accelerate your content success? Let's make today amazing.
              </p>
              <div className="flex items-center space-x-4 text-sm text-gray-400">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4" />
                  <span>{currentTime.toLocaleTimeString()}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Activity className="h-4 w-4 text-green-400" />
                  <span>System Online</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <Button
                variant="outline"
                size="sm"
                className="border-white/30 text-gray-300 hover:bg-white/20 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-lg"
                onClick={() => window.location.reload()}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <UsageTracker />
            </div>
          </div>
        </div>

        {/* Enhanced real-time metrics with micro-interactions */}
        <div 
          className={`transition-all duration-1000 delay-200 ${
            animationStage >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <div className={`grid ${layoutClasses.metricsGrid} ${layoutClasses.spacing} mb-8`}>
            {[
              { label: 'Active Users', value: realTimeMetrics.activeUsers, icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/20' },
              { label: 'Processing Rate', value: `${realTimeMetrics.processingRate}/min`, icon: Zap, color: 'text-yellow-400', bg: 'bg-yellow-500/20' },
              { label: 'Success Rate', value: `${realTimeMetrics.successRate.toFixed(1)}%`, icon: CheckCircle2, color: 'text-green-400', bg: 'bg-green-500/20' },
              { label: 'Queue Size', value: realTimeMetrics.queueSize, icon: Clock, color: 'text-purple-400', bg: 'bg-purple-500/20' }
            ].map((metric, index) => (
              <Card 
                key={metric.label}
                className={`bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-2xl border-white/30 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-105 hover:border-white/50 cursor-pointer group ${
                  hoveredCard === metric.label ? 'ring-2 ring-white/30' : ''
                }`}
                onMouseEnter={() => setHoveredCard(metric.label)}
                onMouseLeave={() => setHoveredCard(null)}
                style={{
                  animationDelay: `${index * 100}ms`,
                  animation: 'slideInUp 0.6s ease-out forwards'
                }}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400 mb-1">{metric.label}</p>
                      <p className={`text-2xl font-bold ${metric.color} transition-all duration-300 group-hover:scale-110`}>
                        {typeof metric.value === 'number' ? metric.value.toLocaleString() : metric.value}
                      </p>
                    </div>
                    <div className={`p-3 rounded-full ${metric.bg} border border-white/20 transition-all duration-300 group-hover:scale-110 group-hover:rotate-12`}>
                      <metric.icon className={`h-6 w-6 ${metric.color}`} />
                    </div>
                  </div>
                  <div className="mt-4 h-1 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${metric.bg} transition-all duration-1000 ease-out`}
                      style={{ 
                        width: `${Math.min(100, (typeof metric.value === 'string' ? parseFloat(metric.value) : metric.value) / 10)}%`,
                        animation: 'progressFill 2s ease-out forwards'
                      }}
                    ></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Enhanced workflow cards with advanced animations */}
        <div 
          className={`transition-all duration-1000 delay-400 ${
            animationStage >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <div className={`grid ${layoutClasses.grid} ${layoutClasses.spacing} mb-8`}>
            {workflowCards.map((card, index) => (
              <Card
                key={card.id}
                className={`group relative overflow-hidden bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-2xl border-white/30 shadow-2xl hover:shadow-3xl transition-all duration-700 hover:scale-[1.02] hover:border-white/50 cursor-pointer ${
                  hoveredCard === card.id ? 'ring-2 ring-white/40' : ''
                }`}
                onMouseEnter={() => setHoveredCard(card.id)}
                onMouseLeave={() => setHoveredCard(null)}
                onClick={() => handleFeatureClick(card.feature, card.href)}
                style={{
                  animationDelay: `${index * 200}ms`,
                  animation: 'slideInRight 0.8s ease-out forwards'
                }}
              >
                {/* Enhanced animated background gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${card.bgGradient} opacity-0 group-hover:opacity-100 transition-all duration-700`}></div>
                <div className={`absolute inset-0 bg-gradient-to-r ${card.borderGradient} opacity-0 group-hover:opacity-20 blur-xl transition-all duration-700`}></div>
                
                {/* Floating particles effect */}
                <div className="absolute inset-0 overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                  {[...Array(6)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-2 h-2 bg-white/30 rounded-full animate-bounce"
                      style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                        animationDelay: `${i * 0.2}s`,
                        animationDuration: `${2 + Math.random() * 2}s`
                      }}
                    ></div>
                  ))}
                </div>

                <CardHeader className="relative z-10 pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`p-4 rounded-2xl bg-gradient-to-r ${card.gradient} shadow-lg transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 ${card.glowColor}`}>
                        <card.icon className="h-8 w-8 text-white" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <CardTitle className="text-xl text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-300 group-hover:bg-clip-text transition-all duration-500">
                            {card.title}
                          </CardTitle>
                          {card.badge && (
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full bg-gradient-to-r ${card.gradient} text-white shadow-lg animate-pulse`}>
                              {card.badge}
                            </span>
                          )}
                        </div>
                        <CardDescription className="text-gray-300 group-hover:text-gray-200 transition-colors duration-300">
                          {card.subtitle}
                        </CardDescription>
                      </div>
                    </div>
                    <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-white group-hover:translate-x-2 transition-all duration-300" />
                  </div>
                </CardHeader>

                <CardContent className="relative z-10 space-y-6">
                  <p className="text-gray-300 leading-relaxed group-hover:text-gray-200 transition-colors duration-300">
                    {card.description}
                  </p>

                  {/* Enhanced stats display */}
                  <div className="flex items-center justify-between p-4 rounded-xl bg-white/10 border border-white/20 backdrop-blur-sm group-hover:bg-white/20 transition-all duration-300">
                    <div>
                      <p className="text-sm text-gray-400 mb-1">{card.stats.metric}</p>
                      <p className={`text-2xl font-bold ${card.stats.trend === 'up' ? 'text-green-400' : 'text-red-400'} transition-all duration-300 group-hover:scale-110`}>
                        {card.stats.improvement}
                      </p>
                      <p className="text-xs text-gray-500">{card.stats.subMetric}</p>
                    </div>
                    <div className={`p-3 rounded-full ${card.stats.trend === 'up' ? 'bg-green-500/20' : 'bg-red-500/20'} transition-all duration-300 group-hover:scale-110 group-hover:rotate-12`}>
                      {card.stats.trend === 'up' ? 
                        <TrendingUp className="h-6 w-6 text-green-400" /> : 
                        <TrendingDown className="h-6 w-6 text-red-400" />
                      }
                    </div>
                  </div>

                  {/* Enhanced features list */}
                  <div className="space-y-2">
                    {card.features.map((feature, featureIndex) => (
                      <div 
                        key={feature} 
                        className="flex items-center space-x-3 text-sm text-gray-300 group-hover:text-gray-200 transition-all duration-300"
                        style={{
                          animationDelay: `${featureIndex * 100}ms`,
                          animation: hoveredCard === card.id ? 'slideInLeft 0.4s ease-out forwards' : 'none'
                        }}
                      >
                        <div className="w-2 h-2 rounded-full bg-gradient-to-r from-white/60 to-white/30 group-hover:scale-150 transition-transform duration-300"></div>
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>

                <CardFooter className="relative z-10 pt-4">
                  <Button 
                    className={`w-full bg-gradient-to-r ${card.gradient} text-white font-semibold hover:opacity-90 transition-all duration-300 transform hover:scale-105 ${card.glowColor} hover:shadow-2xl`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleFeatureClick(card.feature, card.href);
                    }}
                  >
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>

        {/* Enhanced performance metrics with micro-interactions */}
        <div 
          className={`transition-all duration-1000 delay-600 ${
            animationStage >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <Card className="bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-2xl border-white/30 shadow-2xl mb-8">
            <CardHeader>
              <CardTitle className="text-xl text-white flex items-center">
                <BarChart3 className="h-6 w-6 mr-3 text-purple-400" />
                Performance Overview
              </CardTitle>
              <CardDescription className="text-gray-300">
                Real-time insights into your content performance
              </CardDescription>
            </CardHeader>
            <CardContent>
                                <div className={`grid ${layoutClasses.cardGrid} ${layoutClasses.spacing}`}>
                {performanceMetrics.map((metric, index) => (
                  <div
                    key={metric.id}
                    className={`group p-6 rounded-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/20 backdrop-blur-sm hover:bg-white/20 transition-all duration-500 hover:scale-105 cursor-pointer ${
                      hoveredCard === metric.id ? 'ring-2 ring-white/30' : ''
                    }`}
                    onMouseEnter={() => setHoveredCard(metric.id)}
                    onMouseLeave={() => setHoveredCard(null)}
                    style={{
                      animationDelay: `${index * 100}ms`,
                      animation: 'fadeInUp 0.6s ease-out forwards'
                    }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-3 rounded-full ${metric.bgColor} border border-white/20 transition-all duration-300 group-hover:scale-110 group-hover:rotate-12`}>
                        <metric.icon className={`h-6 w-6 ${metric.color}`} />
                      </div>
                      <div className={`text-right transition-all duration-300 group-hover:scale-110`}>
                        <p className={`text-2xl font-bold ${metric.color}`}>{metric.value}</p>
                        <p className={`text-sm ${metric.trend === 'up' ? 'text-green-400' : 'text-red-400'} flex items-center justify-end`}>
                          {metric.trend === 'up' ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                          {metric.change}
                        </p>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-white mb-1 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-300 group-hover:bg-clip-text transition-all duration-300">
                        {metric.title}
                      </h4>
                      <p className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors duration-300">
                        {metric.description}
                      </p>
                    </div>
                    <div className="mt-4 h-2 bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${metric.bgColor} transition-all duration-1000 ease-out`}
                        style={{ 
                          width: `${Math.min(100, parseFloat(metric.value.replace(/[^\d.]/g, '')) * 2)}%`,
                          animation: 'progressFill 2s ease-out forwards'
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced quick actions with staggered animations */}
        <div 
          className={`transition-all duration-1000 delay-800 ${
            animationStage >= 4 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <Card className="bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-2xl border-white/30 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-xl text-white flex items-center">
                <Zap className="h-6 w-6 mr-3 text-yellow-400" />
                Quick Actions
              </CardTitle>
              <CardDescription className="text-gray-300">
                Jump into your most-used features
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className={`grid ${layoutClasses.cardGrid} ${layoutClasses.spacing}`}>
                {quickActions.map((action, index) => (
                  <Button
                    key={action.id}
                    variant="outline"
                    className={`group h-auto p-6 flex flex-col items-center space-y-3 bg-gradient-to-br from-white/10 to-white/5 border-white/20 hover:bg-white/20 hover:border-white/40 transition-all duration-500 hover:scale-105 hover:shadow-xl ${
                      hoveredCard === action.id ? 'ring-2 ring-white/30' : ''
                    }`}
                    onMouseEnter={() => setHoveredCard(action.id)}
                    onMouseLeave={() => setHoveredCard(null)}
                    onClick={() => handleFeatureClick(action.feature, action.href)}
                    style={{
                      animationDelay: `${index * 150}ms`,
                      animation: 'bounceIn 0.8s ease-out forwards'
                    }}
                  >
                    <div className={`p-4 rounded-full bg-gradient-to-r ${action.color} shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:rotate-6`}>
                      <action.icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="text-center">
                      <h4 className="font-semibold text-white mb-1 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-300 group-hover:bg-clip-text transition-all duration-300">
                        {action.title}
                      </h4>
                      <p className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors duration-300">
                        {action.description}
                      </p>
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced charts section */}
        {analytics && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-2xl border-white/30 shadow-2xl hover:shadow-3xl transition-all duration-500">
              <CardHeader>
                <CardTitle className="text-lg text-white flex items-center">
                  <LineChart className="h-5 w-5 mr-2 text-blue-400" />
                  Performance Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ChartWrapper>
                  <LineChartComponent data={analytics.performanceData || []} />
                </ChartWrapper>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-2xl border-white/30 shadow-2xl hover:shadow-3xl transition-all duration-500">
              <CardHeader>
                <CardTitle className="text-lg text-white flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2 text-green-400" />
                  Engagement Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ChartWrapper>
                  <BarChartComponent data={analytics.engagementData || []} />
                </ChartWrapper>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Enhanced popups */}
      {showLoginPrompt && (
        <LoginPromptPopup
          isOpen={showLoginPrompt}
          onClose={closeLoginPrompt}
          feature={currentFeature}
        />
      )}

      {showSubscriptionPrompt && (
        <SubscriptionPromptPopup
          isOpen={showSubscriptionPrompt}
          onClose={closeSubscriptionPrompt}
          featureName={currentFeature}
        />
      )}

      {/* Enhanced CSS animations with accessibility and performance optimizations */}
      <style jsx>{`
        /* Base animations - only applied when motion is allowed */
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes bounceIn {
          0% {
            opacity: 0;
            transform: scale(0.3);
          }
          50% {
            opacity: 1;
            transform: scale(1.05);
          }
          70% {
            transform: scale(0.9);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes progressFill {
          from {
            width: 0%;
          }
        }

        @keyframes gridFloat {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        /* Accessibility optimizations */
        .motion-reduce * {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
        }

        .high-contrast {
          filter: contrast(150%);
        }

        .high-contrast .bg-gradient-to-br {
          background: #000 !important;
        }

        .high-contrast .text-gray-300,
        .high-contrast .text-gray-400 {
          color: #fff !important;
        }

        .high-contrast .border-white\/30 {
          border-color: #fff !important;
        }

        /* Performance optimizations */
        .performance-low * {
          will-change: auto !important;
          transform: none !important;
          animation: none !important;
        }

        .performance-high {
          contain: layout style paint;
        }

        .performance-balanced {
          contain: layout style;
        }

        /* Focus indicators for accessibility */
        button:focus-visible,
        [role="button"]:focus-visible {
          outline: 2px solid #fff;
          outline-offset: 2px;
        }

        /* Reduced motion preferences */
        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }

        /* High contrast preferences */
        @media (prefers-contrast: high) {
          .bg-gradient-to-br {
            background: #000 !important;
          }
          
          .text-gray-300,
          .text-gray-400 {
            color: #fff !important;
          }
          
          .border-white\/30 {
            border-color: #fff !important;
          }
        }

        /* Print styles */
        @media print {
          .absolute,
          [aria-hidden="true"] {
            display: none !important;
          }
          
          .bg-gradient-to-br {
            background: #fff !important;
            color: #000 !important;
          }
        }
      `}</style>
    </div>
  );
}
