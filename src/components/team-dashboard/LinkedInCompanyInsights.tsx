'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  Building2, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Briefcase, 
  Target,
  BarChart3,
  PieChart,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

interface CompanyMetrics {
  companyName: string;
  followerCount: number;
  followerGrowth: number;
  pageViews: number;
  pageViewsGrowth: number;
  employeeEngagement: number;
  industryRanking: number;
  competitorComparison: {
    name: string;
    followers: number;
    engagementRate: number;
    growthRate: number;
  }[];
  demographicBreakdown: {
    seniority: Record<string, number>;
    industry: Record<string, number>;
    companySize: Record<string, number>;
    geography: Record<string, number>;
  };
  contentPerformance: {
    topPerformingPosts: Array<{
      title: string;
      engagement: number;
      reach: number;
      date: string;
    }>;
    bestContentTypes: string[];
  };
}

interface LinkedInCompanyInsightsProps {
  metrics: CompanyMetrics;
  isLoading?: boolean;
  onViewDetails?: () => void;
}

export function LinkedInCompanyInsights({ 
  metrics, 
  isLoading = false, 
  onViewDetails 
}: LinkedInCompanyInsightsProps) {
  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getGrowthIcon = (growth: number) => {
    return growth >= 0 ? (
      <ArrowUpRight className="h-4 w-4 text-green-500" />
    ) : (
      <ArrowDownRight className="h-4 w-4 text-red-500" />
    );
  };

  const getGrowthColor = (growth: number) => {
    return growth >= 0 ? 'text-green-500' : 'text-red-500';
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium flex items-center">
            <Building2 className="h-4 w-4 mr-2 text-blue-600" />
            Company Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="h-20 bg-gray-200 rounded"></div>
              <div className="h-20 bg-gray-200 rounded"></div>
              <div className="h-20 bg-gray-200 rounded"></div>
            </div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium flex items-center">
          <Building2 className="h-4 w-4 mr-2 text-blue-600" />
          {metrics.companyName} - Company Insights
        </CardTitle>
        <Button variant="outline" size="sm" onClick={onViewDetails}>
          View Full Report
        </Button>
      </CardHeader>
      <CardContent>
        {/* Key Company Metrics */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground flex items-center">
                <Users className="h-3 w-3 mr-1" />
                Followers
              </span>
              <div className="flex items-center space-x-1">
                {getGrowthIcon(metrics.followerGrowth)}
                <span className={`text-xs ${getGrowthColor(metrics.followerGrowth)}`}>
                  {metrics.followerGrowth > 0 ? '+' : ''}{metrics.followerGrowth.toFixed(1)}%
                </span>
              </div>
            </div>
            <div className="text-2xl font-bold">{formatNumber(metrics.followerCount)}</div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground flex items-center">
                <BarChart3 className="h-3 w-3 mr-1" />
                Page Views
              </span>
              <div className="flex items-center space-x-1">
                {getGrowthIcon(metrics.pageViewsGrowth)}
                <span className={`text-xs ${getGrowthColor(metrics.pageViewsGrowth)}`}>
                  {metrics.pageViewsGrowth > 0 ? '+' : ''}{metrics.pageViewsGrowth.toFixed(1)}%
                </span>
              </div>
            </div>
            <div className="text-2xl font-bold">{formatNumber(metrics.pageViews)}</div>
          </div>

          <div className="space-y-2">
            <span className="text-sm text-muted-foreground flex items-center">
              <Target className="h-3 w-3 mr-1" />
              Industry Rank
            </span>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                #{metrics.industryRanking}
              </Badge>
            </div>
          </div>
        </div>

        {/* Employee Engagement */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground flex items-center">
              <Briefcase className="h-3 w-3 mr-1" />
              Employee Engagement Rate
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="text-xl font-semibold">{metrics.employeeEngagement.toFixed(1)}%</div>
            <Progress value={metrics.employeeEngagement * 10} className="flex-1" />
          </div>
        </div>

        {/* Competitor Comparison */}
        <div className="space-y-3 mb-6">
          <h4 className="text-sm font-medium flex items-center">
            <Target className="h-3 w-3 mr-1" />
            Competitor Analysis
          </h4>
          <div className="space-y-2">
            {metrics.competitorComparison.map((competitor, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">{competitor.name}</span>
                  <Badge variant="outline" size="sm">
                    {formatNumber(competitor.followers)} followers
                  </Badge>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">
                    {competitor.engagementRate.toFixed(1)}% eng.
                  </span>
                  <div className="flex items-center">
                    {getGrowthIcon(competitor.growthRate)}
                    <span className={`text-xs ${getGrowthColor(competitor.growthRate)}`}>
                      {competitor.growthRate > 0 ? '+' : ''}{competitor.growthRate.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Demographic Breakdown */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="space-y-3">
            <h4 className="text-sm font-medium flex items-center">
              <PieChart className="h-3 w-3 mr-1" />
              Seniority Levels
            </h4>
            <div className="space-y-2">
              {Object.entries(metrics.demographicBreakdown.seniority).map(([level, percentage]) => (
                <div key={level} className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{level}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-16 h-2 bg-gray-200 rounded">
                      <div 
                        className="h-full bg-blue-500 rounded" 
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium">{percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-medium flex items-center">
              <Building2 className="h-3 w-3 mr-1" />
              Company Size
            </h4>
            <div className="space-y-2">
              {Object.entries(metrics.demographicBreakdown.companySize).map(([size, percentage]) => (
                <div key={size} className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{size}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-16 h-2 bg-gray-200 rounded">
                      <div 
                        className="h-full bg-green-500 rounded" 
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium">{percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Performing Content */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium flex items-center">
            <TrendingUp className="h-3 w-3 mr-1" />
            Top Performing Posts
          </h4>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {metrics.contentPerformance.topPerformingPosts.map((post, index) => (
              <div key={index} className="p-2 bg-gray-50 rounded-lg">
                <div className="flex items-start justify-between mb-1">
                  <h5 className="text-sm font-medium truncate flex-1 mr-2">{post.title}</h5>
                  <span className="text-xs text-muted-foreground">{post.date}</span>
                </div>
                <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                  <span>{post.engagement} engagements</span>
                  <span>{formatNumber(post.reach)} reach</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 