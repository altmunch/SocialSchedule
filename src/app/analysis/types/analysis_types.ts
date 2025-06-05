import { Database, Tables } from '@/types/supabase';

// Alias for Supabase video table row
export type Video = Tables<'videos'>; 

export interface TimeRange {
  start: string; // ISO date string
  end: string;   // ISO date string
}

// Competitor Analysis Types
export interface ContentAnalysis {
  commonTopics: string[];
  popularHashtags: string[];
  postingFrequency: number; // posts per week or similar metric
  bestPerformingFormats: string[]; // e.g., short-form, long-form, specific content types
  sentimentDistribution: Record<string, number>; // e.g., { positive: 0.6, neutral: 0.3, negative: 0.1 }
}

export interface EngagementMetrics {
  averageLikes: number;
  averageComments: number;
  averageShares: number;
  averageViews: number;
  averageEngagementRate: number; // (likes + comments + shares) / views or followers
  followerGrowthRate?: number; // if available
}

export interface TopPerformingContent {
  videos: Video[];
  keySuccessFactors: string[]; // e.g., specific topics, hook types, audio trends
}

export interface Recommendation {
  type: 'content' | 'strategy' | 'engagement';
  description: string;
  actionableSteps?: string[];
  priority: 'high' | 'medium' | 'low';
}

export interface CompetitorAnalysis {
  competitorId: string;
  competitorName: string;
  niche: string;
  contentAnalysis: ContentAnalysis;
  engagementMetrics: EngagementMetrics;
  topPerformingContent: TopPerformingContent;
  recommendations: Recommendation[];
  lastAnalyzed: string; // ISO date string
}

// Historical Analysis Types
export interface EngagementTrendPoint {
  timestamp: string; // ISO date string
  value: number;
}

export interface EngagementTrends {
  likesTrend: EngagementTrendPoint[];
  commentsTrend: EngagementTrendPoint[];
  viewsTrend: EngagementTrendPoint[];
  engagementRateTrend: EngagementTrendPoint[];
}

export interface ContentPerformance {
  topPerformingVideos: Video[];
  bottomPerformingVideos: Video[];
  contentTypePerformance: Record<string, EngagementMetrics>; // e.g., performance by video length, topic
}

export interface AudienceGrowth {
  followerCountTrend?: EngagementTrendPoint[]; // if available
  // other audience metrics
}

export interface Benchmark {
  metricName: string;
  currentValue: number;
  averageValue: number;
  percentile?: number; // e.g., 75th percentile
}

export interface PerformanceTrends {
  userId: string;
  timeRange: TimeRange;
  overallSummary: string;
  engagementTrends: EngagementTrends;
  contentPerformance: ContentPerformance;
  audienceGrowth?: AudienceGrowth;
  benchmarks: Benchmark[];
  keyInsights: string[];
  actionableRecommendations: Recommendation[];
}
