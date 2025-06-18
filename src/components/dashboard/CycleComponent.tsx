'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { 
  TrendingUp, 
  DollarSign, 
  Users, 
  Eye, 
  BarChart3, 
  Target, 
  Calendar, 
  Clock, 
  Zap, 
  Brain, 
  Star, 
  ArrowUpRight, 
  CheckCircle2, 
  AlertTriangle,
  Lightbulb,
  TrendingDown,
  Activity,
  Award,
  Twitter,
  Instagram,
  Youtube,
  Facebook,
  Linkedin
} from 'lucide-react';

const getStatusColor = (status: string) => {
  switch (status) {
    case 'positive': return 'text-emerald-400';
    case 'neutral': return 'text-orange-400';
    case 'negative': return 'text-red-400';
    default: return 'text-gray-400';
  }
};

const PlatformChart = () => (
  <div className="w-full h-72 mt-3 flex items-center justify-center">
    <svg width="200" height="200" viewBox="0 0 200 200" style={{ transform: 'rotate(-90deg)' }}>
      {/* Background circle */}
      <circle
        cx="100"
        cy="100"
        r="80"
        fill="transparent"
        stroke="rgba(255,255,255,0.1)"
        strokeWidth="40"
      />

      {/* LinkedIn Segment */}
      <circle
        cx="100"
        cy="100"
        r="80"
        fill="transparent"
        stroke="#0a66c2"
        strokeWidth="40"
        strokeDasharray="188.5 377.0" // 50% of 2*PI*80 = 251.3, this is for 50%
        strokeDashoffset="0"
      />

      {/* YouTube Segment */}
      <circle
        cx="100"
        cy="100"
        r="80"
        fill="transparent"
        stroke="#e4405f"
        strokeWidth="40"
        strokeDasharray="94.2 377.0"
        strokeDashoffset="-125.6"
      />

      {/* Instagram Segment */}
      <circle
        cx="100"
        cy="100"
        r="80"
        fill="transparent"
        stroke="#ff0000"
        strokeWidth="40"
        strokeDasharray="62.8 377.0"
        strokeDashoffset="-219.8"
      />

      {/* TikTok Segment */}
      <circle
        cx="100"
        cy="100"
        r="80"
        fill="transparent"
        stroke="#1877f2"
        strokeWidth="40"
        strokeDasharray="94.4 377.0"
        strokeDashoffset="-282.6"
      />
      
      {/* Center text */}
      <text x="100" y="95" textAnchor="middle" fontSize="14" fill="white" fontWeight="600">
        Platform
      </text>
      <text x="100" y="110" textAnchor="middle" fontSize="12" fill="#9ca3af">
        Performance
      </text>
    </svg>
  </div>
);

export default function CycleComponent() {
  const { user } = useAuth();
  const [animationStage, setAnimationStage] = useState(0);
  const [selectedTimeframe, setSelectedTimeframe] = useState('7d');

  // Staggered animation entrance
  useEffect(() => {
    const stages = [0, 1, 2, 3];
    stages.forEach((stage, index) => {
      setTimeout(() => setAnimationStage(stage), index * 200);
    });
  }, []);

  // Mock data - in real app, fetch from API based on selectedTimeframe
  const metrics = [
    { id: 'revenue', title: 'Revenue', value: '$8,247', change: '+12.3%', trend: 'up', icon: DollarSign, color: '#059669' },
    { id: 'reach', title: 'Total Reach', value: '124K', change: '+8.7%', trend: 'up', icon: Users, color: '#7c3aed' },
    { id: 'engagement', title: 'Engagement', value: '4.8%', change: '+2.1%', trend: 'up', icon: Eye, color: '#ea580c' },
    { id: 'conversion', title: 'Conversion', value: '2.4%', change: '-0.3%', trend: 'down', icon: Target, color: '#0891b2' },
  ];

  const topPosts = [
    { id: '1', title: 'Product Launch Video', platform: 'TikTok', views: '2.1M', engagement: '8.3%', revenue: '$1,240' },
    { id: '2', title: 'Behind the Scenes', platform: 'Instagram', views: '847K', engagement: '6.7%', revenue: '$890' },
    { id: '3', title: 'Tutorial Series Pt.1', platform: 'YouTube', views: '456K', engagement: '12.1%', revenue: '$2,100' },
  ];

  const recommendations = [
    { id: '1', type: 'high', title: 'Post during peak hours', description: '6-8 PM shows 34% higher engagement', impact: '+34%', icon: Clock },
    { id: '2', type: 'medium', title: 'Use trending audio', description: 'Current trending sounds boost reach by 23%', impact: '+23%', icon: TrendingUp },
    { id: '3', type: 'high', title: 'Add call-to-action', description: 'Videos with CTA convert 45% better', impact: '+45%', icon: Target },
  ];

  const getRecommendationColor = (type: string) => {
    switch (type) {
      case 'high': return 'text-red-400';
      case 'medium': return 'text-orange-400';
      case 'low': return 'text-emerald-400';
      default: return 'text-gray-400';
    }
  };

  const platformColors: Record<string, string> = {
    'TikTok': '#ff0050',
    'Instagram': '#e4405f',
    'YouTube': '#ff0000',
    'Twitter': '#1da1f2',
  };

  return (
    <div className="single-view">
      
      {/* Compact Header */}
      <div className={`single-view-header fade-in ${animationStage >= 0 ? 'opacity-100' : 'opacity-0'}`}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-dynamic-2xl font-bold bg-gradient-to-r from-violet-400 to-emerald-400 bg-clip-text text-transparent">
              Performance Analytics
            </h1>
            <p className="text-dynamic-base text-gray-400 mt-1">Track your content performance and get AI-powered insights</p>
          </div>
          <div className="flex items-center gap-2">
            {['24h', '7d', '30d', '90d'].map((period) => (
              <button
                key={period}
                onClick={() => setSelectedTimeframe(period)}
                className={`text-dynamic-sm px-3 py-1 rounded-lg transition-colors ${
                  selectedTimeframe === period 
                    ? 'bg-violet-500/20 text-violet-400 border border-violet-500/30' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {period}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="single-view-content grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Key Metrics Row */}
        <div className={`col-span-full metrics-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 slide-up ${animationStage >= 1 ? 'opacity-100' : 'opacity-0'}`}>
          {metrics.map((metric) => {
            const IconComponent = metric.icon;
            const isPositive = metric.trend === 'up';
            return (
              <div key={metric.id} className="metric-card compact-card group relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-violet-500"></div>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${metric.color}20`, color: metric.color }}>
                      <IconComponent className="h-5 w-5" />
                    </div>
                    <div className="flex items-center gap-1">
                      {isPositive ? (
                        <TrendingUp className="h-4 w-4 text-emerald-400" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-400" />
                      )}
                      <span className={`text-dynamic-sm font-medium ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                        {metric.change}
                      </span>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-white">{metric.value}</div>
                  <div className="text-sm text-gray-400 mt-1">{metric.title}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Charts and Analytics Row */}
        <div className={`col-span-2 grid grid-cols-12 gap-4 slide-up ${animationStage >= 2 ? 'opacity-100' : 'opacity-0'}`}>
          
          {/* Revenue Trend Chart */}
          <div className="col-span-12 compact-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-dynamic-lg font-semibold text-white">Revenue Trend</h3>
              <div className="flex items-center gap-2 text-dynamic-sm text-emerald-400">
                <ArrowUpRight className="h-4 w-4" />
                <span>+12.3% vs last {selectedTimeframe}</span>
              </div>
            </div>
            <div className="h-48 bg-gray-800/30 rounded-lg border border-gray-700/50 flex items-center justify-center relative overflow-hidden">
              {/* Simplified chart representation */}
              <div className="absolute inset-0 flex items-end justify-around p-4">
                {Array.from({ length: 7 }, (_, i) => (
                  <div 
                    key={i}
                    className="bg-gradient-to-t from-emerald-500 to-emerald-400 rounded-t"
                    style={{ 
                      height: `${Math.random() * 60 + 20}%`,
                      width: '12px'
                    }}
                  />
                ))}
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-500/5 to-transparent" />
            </div>
          </div>

          {/* Top Performing Posts */}
          <div className="col-span-12 compact-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-dynamic-lg font-semibold text-white flex items-center gap-2">
                <Award className="h-5 w-5 text-yellow-400" />
                Top Performing Posts
              </h3>
              <button className="text-violet-400 hover:text-violet-300 text-sm font-medium">View All</button>
            </div>
            <ul className="space-y-4">
              {topPosts.map((post) => (
                <li key={post.id} className="flex items-center gap-4 p-3 bg-gray-800/50 border border-gray-700/50 rounded-lg">
                  <img src="/images/video-thumbnail.png" alt="Video Thumbnail" className="w-20 h-14 object-cover rounded-md flex-shrink-0" />
                  <div className="flex-1">
                    <h4 className="text-white font-medium text-dynamic-base truncate mb-1">{post.title}</h4>
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      <span className="flex items-center gap-1 capitalize"><Youtube className="h-3 w-3" /> {post.platform}</span>
                      <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> {post.views}</span>
                      <span className="flex items-center gap-1"><Activity className="h-3 w-3" /> {post.engagement}</span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-white font-bold text-lg">{post.revenue}</p>
                    <p className="text-gray-400 text-xs">Revenue</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* AI Recommendations Column */}
        <div className={`col-span-1 lg:col-span-1 slide-up ${animationStage >= 3 ? 'opacity-100' : 'opacity-0'}`}>
          <div className="compact-card p-6 h-full flex flex-col">
            <h3 className="text-dynamic-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-yellow-400" />
              AI Recommendations
            </h3>
            <ul className="space-y-4 flex-1">
              {recommendations.map((rec) => (
                <li key={rec.id} className="flex items-start gap-3 p-3 bg-gray-800/50 border border-gray-700/50 rounded-lg">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${rec.type === 'high' ? 'bg-red-500/20 text-red-400' : rec.type === 'medium' ? 'bg-orange-500/20 text-orange-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                    {rec.icon && React.createElement(rec.icon, { className: "h-4 w-4" })}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-white font-medium text-sm mb-1">{rec.title}</h4>
                    <p className="text-gray-400 text-xs mb-1">{rec.description}</p>
                    <span className={`text-xs font-semibold ${getRecommendationColor(rec.type)}`}>{rec.impact} Impact</span>
                  </div>
                </li>
              ))}
            </ul>
            <button className="btn-secondary w-full mt-6">
              <Brain className="h-4 w-4 mr-2" /> Generate More Insights
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
