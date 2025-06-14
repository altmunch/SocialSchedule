'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  Linkedin, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Eye, 
  MessageCircle, 
  Share, 
  Building2,
  Briefcase,
  Target,
  Award
} from 'lucide-react';

interface LinkedInMetrics {
  engagementRate: number;
  engagementGrowth: number;
  profileViews: number;
  profileViewsGrowth: number;
  connections: number;
  connectionGrowth: number;
  thoughtLeadershipScore: number;
  industryPosition: number;
  contentPerformance: {
    bestPerformingType: string;
    averageEngagement: number;
    optimalPostingDay: string;
  };
  professionalInsights: {
    title: string;
    description: string;
    impact: 'high' | 'medium' | 'low';
  }[];
}

interface LinkedInAnalyticsCardProps {
  metrics: LinkedInMetrics;
  isLoading?: boolean;
  onViewDetails?: () => void;
}

export function LinkedInAnalyticsCard({ 
  metrics, 
  isLoading = false, 
  onViewDetails 
}: LinkedInAnalyticsCardProps) {
  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getGrowthIcon = (growth: number) => {
    return growth >= 0 ? (
      <TrendingUp className="h-4 w-4 text-green-500" />
    ) : (
      <TrendingDown className="h-4 w-4 text-red-500" />
    );
  };

  const getGrowthColor = (growth: number) => {
    return growth >= 0 ? 'text-green-500' : 'text-red-500';
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium flex items-center">
            <Linkedin className="h-4 w-4 mr-2 text-blue-600" />
            LinkedIn Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="h-16 bg-gray-200 rounded"></div>
              <div className="h-16 bg-gray-200 rounded"></div>
            </div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium flex items-center">
          <Linkedin className="h-4 w-4 mr-2 text-blue-600" />
          LinkedIn Analytics
        </CardTitle>
        <Button variant="outline" size="sm" onClick={onViewDetails}>
          View Details
        </Button>
      </CardHeader>
      <CardContent>
        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground flex items-center">
                <Eye className="h-3 w-3 mr-1" />
                Profile Views
              </span>
              <div className="flex items-center space-x-1">
                {getGrowthIcon(metrics.profileViewsGrowth)}
                <span className={`text-xs ${getGrowthColor(metrics.profileViewsGrowth)}`}>
                  {metrics.profileViewsGrowth > 0 ? '+' : ''}{metrics.profileViewsGrowth.toFixed(1)}%
                </span>
              </div>
            </div>
            <div className="text-2xl font-bold">{formatNumber(metrics.profileViews)}</div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground flex items-center">
                <Users className="h-3 w-3 mr-1" />
                Connections
              </span>
              <div className="flex items-center space-x-1">
                {getGrowthIcon(metrics.connectionGrowth)}
                <span className={`text-xs ${getGrowthColor(metrics.connectionGrowth)}`}>
                  {metrics.connectionGrowth > 0 ? '+' : ''}{metrics.connectionGrowth.toFixed(1)}%
                </span>
              </div>
            </div>
            <div className="text-2xl font-bold">{formatNumber(metrics.connections)}</div>
          </div>
        </div>

        {/* Engagement Metrics */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground flex items-center">
              <MessageCircle className="h-3 w-3 mr-1" />
              Engagement Rate
            </span>
            <div className="flex items-center space-x-1">
              {getGrowthIcon(metrics.engagementGrowth)}
              <span className={`text-xs ${getGrowthColor(metrics.engagementGrowth)}`}>
                {metrics.engagementGrowth > 0 ? '+' : ''}{metrics.engagementGrowth.toFixed(1)}%
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="text-xl font-semibold">{metrics.engagementRate.toFixed(1)}%</div>
            <Progress value={metrics.engagementRate * 10} className="flex-1" />
          </div>
        </div>

        {/* Professional Metrics */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="space-y-2">
            <span className="text-sm text-muted-foreground flex items-center">
              <Award className="h-3 w-3 mr-1" />
              Thought Leadership
            </span>
            <div className="flex items-center space-x-2">
              <div className="text-lg font-semibold">{metrics.thoughtLeadershipScore}/100</div>
              <Progress value={metrics.thoughtLeadershipScore} className="flex-1" />
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-sm text-muted-foreground flex items-center">
              <Target className="h-3 w-3 mr-1" />
              Industry Position
            </span>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                Top {100 - metrics.industryPosition}%
              </Badge>
            </div>
          </div>
        </div>

        {/* Content Performance */}
        <div className="space-y-3 mb-6">
          <h4 className="text-sm font-medium flex items-center">
            <Briefcase className="h-3 w-3 mr-1" />
            Content Performance
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Best Content Type:</span>
              <span className="font-medium">{metrics.contentPerformance.bestPerformingType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Avg. Engagement:</span>
              <span className="font-medium">{metrics.contentPerformance.averageEngagement}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Optimal Day:</span>
              <span className="font-medium">{metrics.contentPerformance.optimalPostingDay}</span>
            </div>
          </div>
        </div>

        {/* Professional Insights */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium flex items-center">
            <Building2 className="h-3 w-3 mr-1" />
            Professional Insights
          </h4>
          <div className="space-y-2">
            {metrics.professionalInsights.map((insight, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-start justify-between mb-1">
                  <h5 className="text-sm font-medium">{insight.title}</h5>
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${getImpactColor(insight.impact)}`}
                  >
                    {insight.impact}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{insight.description}</p>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 