'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import Link from 'next/link';
import { Crown, Activity, DollarSign, Eye, Users, Target, Zap, Calendar, BarChart3, Brain, Lightbulb, Plus, ArrowRight, CheckCircle2, Clock, Copy, Save, Share, Video, TrendingUp, Star, Settings } from 'lucide-react';
import { LineChart, BarChart } from '@/components/dashboard/charts';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export default function DashboardPage() {
  const { user } = useAuth();
  const [animationStage, setAnimationStage] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  
  // State for metric visibility customization
  const [metricVisibility, setMetricVisibility] = useState({
    revenue: true,
    views: true,
    engagement: true,
    conversion: true,
  });

  // State for quick action visibility customization
  const [quickActionVisibility, setQuickActionVisibility] = useState({
    optimize: true,
    schedule: true,
    analyze: true,
    ideate: true,
  });

  // Staggered animation entrance
  useEffect(() => {
    const stages = [0, 1, 2, 3, 4, 5];
    stages.forEach((stage, index) => {
      setTimeout(() => setAnimationStage(stage), index * 200);
    });
  }, []);

  // Mock data - in real app, fetch from API
  const metrics = [
    {
      id: 'revenue',
      title: 'Revenue',
      value: '$12,847',
      change: '+18.2%',
      trend: 'up',
      icon: DollarSign,
      colorClass: 'metric-revenue', // Green - most important
      bgColor: 'from-emerald-500/20 to-emerald-600/20',
      iconColor: 'text-emerald-400',
      badgeColor: 'bg-emerald-500/10 text-emerald-400'
    },
    {
      id: 'engagement',
      title: 'Engagement',
      value: '6.8%',
      change: '+5.3%',
      trend: 'up',
      icon: Users,
      colorClass: 'metric-secondary', // Purple - secondary importance
      bgColor: 'from-violet-500/20 to-violet-600/20',
      iconColor: 'text-violet-400',
      badgeColor: 'bg-violet-500/10 text-violet-400'
    },
    {
      id: 'views',
      title: 'Total Views',
      value: '847K',
      change: '+24.1%',
      trend: 'up',
      icon: Eye,
      colorClass: 'metric-info', // Blue - informational
      bgColor: 'from-blue-500/20 to-blue-600/20',
      iconColor: 'text-blue-400',
      badgeColor: 'bg-blue-500/10 text-blue-400'
    },
    {
      id: 'conversion',
      title: 'Conversion',
      value: '3.2%',
      change: '+12.7%',
      trend: 'up',
      icon: Target,
      colorClass: 'metric-neutral', // Neutral - standard metric
      bgColor: 'from-slate-500/20 to-slate-600/20',
      iconColor: 'text-slate-400',
      badgeColor: 'bg-slate-500/10 text-slate-400'
    },
  ];

  const quickActions = [
    {
      id: 'optimize',
      title: 'Optimize Videos',
      description: 'AI-powered video optimization',
      icon: Zap,
      colorClass: 'action-primary', // Brand indigo - primary action
      bgColor: 'from-indigo-500/20 to-indigo-600/20',
      iconColor: 'text-indigo-400',
      href: '/dashboard/accelerate',
      status: 'Ready',
      statusColor: 'bg-indigo-500/10 text-indigo-400'
    },
    {
      id: 'schedule',
      title: 'Schedule Posts',
      description: 'Automate your posting schedule',
      icon: Calendar,
      colorClass: 'action-secondary', // Neutral with green accent
      bgColor: 'from-slate-500/20 to-slate-600/20',
      iconColor: 'text-slate-400',
      href: '/dashboard/blitz',
      status: 'Active',
      statusColor: 'bg-emerald-500/10 text-emerald-400'
    },
    {
      id: 'analyze',
      title: 'View Analytics',
      description: 'Track performance metrics',
      icon: BarChart3,
      colorClass: 'action-secondary', // Neutral with blue accent
      bgColor: 'from-slate-500/20 to-slate-600/20',
      iconColor: 'text-slate-400',
      href: '/dashboard/cycle',
      status: 'Updated',
      statusColor: 'bg-blue-500/10 text-blue-400'
    },
    {
      id: 'ideate',
      title: 'Generate Ideas',
      description: 'AI content strategist',
      icon: Brain,
      colorClass: 'action-secondary', // Neutral with purple accent
      bgColor: 'from-slate-500/20 to-slate-600/20',
      iconColor: 'text-slate-400',
      href: '/dashboard/ideator',
      status: 'New',
      statusColor: 'bg-violet-500/10 text-violet-400'
    },
  ];

  const recentActivity = [
    {
      id: '1',
      type: 'optimization',
      title: 'Video optimization completed',
      description: '15 videos optimized with 89% avg score',
      time: '2 minutes ago',
      icon: Zap,
      bgColor: 'bg-emerald-500/10',
      iconColor: 'text-emerald-400',
    },
    {
      id: '2',
      type: 'posting',
      title: 'Posts scheduled successfully',
      description: '8 posts scheduled for this week',
      time: '1 hour ago',
      icon: Calendar,
      bgColor: 'bg-blue-500/10',
      iconColor: 'text-blue-400',
    },
    {
      id: '3',
      type: 'analytics',
      title: 'Weekly report generated',
      description: 'Revenue up 23% from last week',
      time: '3 hours ago',
      icon: TrendingUp,
      bgColor: 'bg-emerald-500/10',
      iconColor: 'text-emerald-400',
    },
    {
      id: '4',
      type: 'content',
      title: 'New content ideas generated',
      description: '12 viral content strategies created',
      time: '5 hours ago',
      icon: Lightbulb,
      bgColor: 'bg-violet-500/10',
      iconColor: 'text-violet-400',
    },
  ];

  const upcomingTasks = [
    {
      id: '1',
      title: 'Review competitor analysis',
      deadline: 'Today, 2:00 PM',
      priority: 'high',
      completed: false,
    },
    {
      id: '2',
      title: 'Optimize new product videos',
      deadline: 'Tomorrow, 10:00 AM',
      priority: 'medium',
      completed: false,
    },
    {
      id: '3',
      title: 'Update posting schedule',
      deadline: 'Dec 20, 4:00 PM',
      priority: 'low',
      completed: true,
    },
  ];

  // Mock data for charts
  const salesData = [
    { name: 'Mon', sales: 400 },
    { name: 'Tue', sales: 300 },
    { name: 'Wed', sales: 500 },
    { name: 'Thu', sales: 700 },
    { name: 'Fri', sales: 600 },
  ];

  const engagementData = [
    { name: 'Jan', engagement: 65 },
    { name: 'Feb', engagement: 59 },
    { name: 'Mar', engagement: 80 },
    { name: 'Apr', engagement: 81 },
    { name: 'May', engagement: 56 },
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'medium':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'low':
        return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  return (
    <div className="min-h-screen py-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Welcome Header - Simplified gradient */}
        <div className={`mb-8 opacity-0 transition-opacity duration-800 ${animationStage >= 0 ? 'opacity-100' : ''}`}>
          <div className="flex justify-between items-center mb-2">
            <h1 className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-slate-100 to-indigo-200 bg-clip-text text-transparent">
              Welcome back, {user?.user_metadata?.full_name || 'User'}! 👋
            </h1>
            <Dialog open={showSettings} onOpenChange={setShowSettings}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
                  <Settings className="h-6 w-6" />
                </Button>
              </DialogTrigger>
              <DialogContent className="compact-card p-6">
                <DialogHeader>
                  <DialogTitle className="text-white text-2xl font-bold mb-2">Dashboard Settings</DialogTitle>
                  <DialogDescription className="text-slate-400">Customize what you see on your dashboard.</DialogDescription>
                </DialogHeader>
                <div className="space-y-6 mt-6">
                  {/* Metric Visibility */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Key Metrics</h3>
                    <div className="space-y-3">
                      {metrics.map(metric => (
                        <div key={metric.id} className="flex items-center justify-between">
                          <label htmlFor={`metric-${metric.id}`} className="text-slate-300 cursor-pointer">{metric.title}</label>
                          <Switch
                            id={`metric-${metric.id}`}
                            checked={metricVisibility[metric.id as keyof typeof metricVisibility]}
                            onCheckedChange={(checked) => setMetricVisibility(prev => ({ ...prev, [metric.id]: checked }))}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Quick Action Visibility */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Quick Actions</h3>
                    <div className="space-y-3">
                      {quickActions.map(action => (
                        <div key={action.id} className="flex items-center justify-between">
                          <label htmlFor={`action-${action.id}`} className="text-slate-300 cursor-pointer">{action.title}</label>
                          <Switch
                            id={`action-${action.id}`}
                            checked={quickActionVisibility[action.id as keyof typeof quickActionVisibility]}
                            onCheckedChange={(checked) => setQuickActionVisibility(prev => ({ ...prev, [action.id]: checked }))}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <p className="text-lg sm:text-xl text-slate-400 mb-6">
            Here's what's happening with your content today
          </p>
          
          {/* Quick Stats Bar - Refined colors */}
          <div className="flex flex-wrap items-center gap-4">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-gradient-to-r from-indigo-500 to-indigo-600 text-white">
              <Crown className="h-4 w-4 mr-2" />
              {user?.user_metadata?.subscription_tier || 'Free'} Plan
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Activity className="h-4 w-4 mr-2" />
              All Systems Online
            </span>
            <p className="text-sm text-slate-500">
              Last login: Today at 9:42 AM
            </p>
          </div>
        </div>

        {/* Key Metrics - Semantic color hierarchy */}
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 opacity-0 transition-opacity duration-800 ${animationStage >= 1 ? 'opacity-100' : ''}`}>
          {metrics.filter(metric => metricVisibility[metric.id as keyof typeof metricVisibility]).map((metric, index) => {
            const IconComponent = metric.icon;
            return (
              <div key={metric.id} className="compact-card relative overflow-hidden group hover:shadow-xl hover:border-indigo-400/50 transition-all duration-300">
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${metric.bgColor}`}></div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-r ${metric.bgColor}`}>
                      <IconComponent className={`h-6 w-6 ${metric.iconColor}`} />
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${metric.badgeColor}`}>
                      {metric.change}
                    </span>
                  </div>
                  <h2 className="text-3xl font-bold text-white mb-1">
                    {metric.value}
                  </h2>
                  <p className="text-sm text-slate-400">
                    {metric.title}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Actions - Refined color scheme */}
          <div className={`lg:col-span-2 opacity-0 transition-opacity duration-800 ${animationStage >= 2 ? 'opacity-100' : ''}`}>
            <h2 className="text-xl font-bold text-white mb-4">
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {quickActions.filter(action => quickActionVisibility[action.id as keyof typeof quickActionVisibility]).map((action, index) => {
                const IconComponent = action.icon;
                return (
                  <Link href={action.href} key={action.id}>
                    <div className="compact-card p-6 flex items-start gap-4 hover:shadow-lg hover:border-indigo-400/50 transition-all duration-300 group">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 bg-gradient-to-r ${action.bgColor}`}>
                        <IconComponent className={`h-6 w-6 ${action.iconColor}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="text-lg font-semibold text-white">
                            {action.title}
                          </h3>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${action.statusColor}`}>
                            {action.status}
                          </span>
                        </div>
                        <p className="text-sm text-slate-400 mb-3">
                          {action.description}
                        </p>
                        <button className="inline-flex items-center text-sm font-medium text-indigo-400 group-hover:text-indigo-300 transition-colors">
                          Get Started
                          <ArrowRight className="ml-1 h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                        </button>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Upcoming Tasks - Refined priority colors */}
          <div className={`opacity-0 transition-opacity duration-800 ${animationStage >= 3 ? 'opacity-100' : ''}`}>
            <div className="compact-card">
              <div className="flex items-center justify-between p-4 border-b border-slate-700/50">
                <h2 className="text-lg font-semibold text-white">Upcoming Tasks</h2>
                <button className="text-slate-400 hover:text-white transition-colors">
                  <Plus className="h-5 w-5" />
                </button>
              </div>
              <ul className="divide-y divide-slate-700/50">
                {upcomingTasks.map((task, index) => (
                  <li key={task.id} className="p-4 flex items-center gap-3 group">
                    <div className={`p-2 rounded-lg ${task.completed ? 'bg-emerald-500/20 text-emerald-400' : 'bg-indigo-500/20 text-indigo-400'}`}>
                      {task.completed ? <CheckCircle2 className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                    </div>
                    <div className="flex-1">
                      <p className={`font-medium ${task.completed ? 'text-slate-500 line-through' : 'text-white'}`}>
                        {task.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-slate-500">{task.deadline}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Recent Activity - Neutralized with semantic accents */}
          <div className={`lg:col-span-2 opacity-0 transition-opacity duration-800 ${animationStage >= 4 ? 'opacity-100' : ''}`}>
            <div className="compact-card">
              <div className="flex items-center justify-between p-4 border-b border-slate-700/50">
                <h2 className="text-lg font-semibold text-white">Recent Activity</h2>
                <button className="text-indigo-400 hover:text-indigo-300 text-sm font-medium">
                  View All
                </button>
              </div>
              <ul className="divide-y divide-slate-700/50">
                {recentActivity.map((activity, index) => {
                  const IconComponent = activity.icon;
                  return (
                    <li key={activity.id} className="p-4 flex items-start gap-3 group">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${activity.bgColor}`}>
                        <IconComponent className={`h-5 w-5 ${activity.iconColor}`} />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-white mb-1">
                          {activity.title}
                        </p>
                        <p className="text-sm text-slate-400 mb-1">
                          {activity.description}
                        </p>
                        <span className="text-xs text-slate-500">
                          {activity.time}
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          {/* Performance Summary with Charts */}
          <div className={`opacity-0 transition-opacity duration-800 ${animationStage >= 5 ? 'opacity-100' : ''}`}>
            <div className="compact-card p-6">
              <h2 className="text-lg font-semibold text-white mb-5">
                Performance Overview
              </h2>
              <div className="space-y-6">
                {/* Sales Chart */}
                <div>
                  <h3 className="text-sm text-slate-400 mb-2">Weekly Sales Trend</h3>
                  <div className="h-32">
                    <LineChart data={salesData} />
                  </div>
                </div>

                {/* Engagement Chart */}
                <div>
                  <h3 className="text-sm text-slate-400 mb-2">Monthly Engagement Rate</h3>
                  <div className="h-32">
                    <BarChart data={engagementData} />
                  </div>
                </div>

                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-center">
                  <Star className="h-8 w-8 text-emerald-400 mx-auto mb-2" />
                  <p className="text-base font-semibold text-white mb-1">
                    Great Progress!
                  </p>
                  <p className="text-sm text-slate-400">
                    You're performing 23% better than last week
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
