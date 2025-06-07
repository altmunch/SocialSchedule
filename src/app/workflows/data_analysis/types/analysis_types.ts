import { Database, Tables } from '@/types/supabase';
import { z } from 'zod';

// Alias for Supabase video table row (Kept from original)
export type Video = Tables<'videos'>;

// --- Base Schemas for common parameters ---
// Using z.string().datetime() for TimeRange as per original file's pattern
export const TimeRangeSchema = z.object({
  start: z.string().datetime({ message: 'Invalid ISO date string for start' }),
  end: z.string().datetime({ message: 'Invalid ISO date string for end' }),
}).refine(data => new Date(data.start) <= new Date(data.end), {
  message: 'Start date must be before or equal to end date',
  path: ['start'],
});
export type TimeRange = z.infer<typeof TimeRangeSchema>;

export const PlatformSchema = z.enum(['TikTok', 'Instagram', 'YouTube', 'Facebook', 'Twitter', 'LinkedIn']); // New, more specific
export type Platform = z.infer<typeof PlatformSchema>;

export const BaseAnalysisRequestSchema = z.object({
  userId: z.string().uuid(),
  platform: PlatformSchema,
  timeRange: TimeRangeSchema,
  correlationId: z.string().optional(), // For tracing requests
});
export type BaseAnalysisRequest = z.infer<typeof BaseAnalysisRequestSchema>;

// Generic structure for analysis results (New)
export interface AnalysisResult<TData> {
  success: boolean;
  data?: TData; // Data is optional if success is false
  error?: {
    message: string;
    code?: string;
    details?: any;
  };
  metadata: {
    generatedAt: Date;
    source: string; // e.g., 'HistoricalPerformanceEngine'
    cacheStatus?: 'hit' | 'miss';
    warnings?: string[];
    correlationId?: string; // For tracing requests
  };
}

// --- Report Workflow Specific Types (New) ---
export const ReportMetricsSchema = z.object({
  views: z.number().int().nonnegative().optional(),
  likes: z.number().int().nonnegative().optional(),
  comments: z.number().int().nonnegative().optional(),
  shares: z.number().int().nonnegative().optional(),
  engagementRate: z.number().nonnegative().optional(),
  // E-commerce specific
  roi: z.number().optional(), // Can be float
  conversionRate: z.number().nonnegative().optional(),
});
export type ReportMetrics = z.infer<typeof ReportMetricsSchema>;

export const PostPerformanceSchema = z.object({
  postId: z.string(),
  publishedAt: z.string().datetime(), // Changed to string().datetime()
  metrics: ReportMetricsSchema,
  contentPreview: z.string().optional(),
});
export type PostPerformance = z.infer<typeof PostPerformanceSchema>;

export const ViewGrowthSchema = z.object({
  period: z.string(), // e.g., 'daily', 'weekly'
  currentViews: z.number().int().nonnegative(),
  previousViews: z.number().int().nonnegative(),
  growthPercentage: z.number(), // Can be float
});
export type ViewGrowth = z.infer<typeof ViewGrowthSchema>;

export interface ReportsAnalysisData { // New interface
  historicalViewGrowth: ViewGrowth[];
  pastPostsPerformance: PostPerformance[];
  ecommerceMetrics?: ReportMetrics;
}

// --- Autoposting Workflow Specific Types (New) ---
export const AudienceReachSchema = z.object({
  timeSlot: z.string(), // e.g., "09:00-10:00"
  estimatedReach: z.number().int().nonnegative(),
  confidenceScore: z.number().min(0).max(1).optional(),
});
export type AudienceReach = z.infer<typeof AudienceReachSchema>;

export interface AutopostingAnalysisData { // New interface
  optimalPostingTimes: AudienceReach[];
  nicheAudienceInsights: Record<string, any>; // Placeholder
}

// --- Video Optimization Workflow Specific Types (New) ---
export const TrendingHashtagSchema = z.object({
  tag: z.string(),
  rank: z.number().int().positive().optional(),
  estimatedReach: z.number().int().nonnegative().optional(),
});
export type TrendingHashtag = z.infer<typeof TrendingHashtagSchema>;

export const AudioViralitySchema = z.object({
  audioId: z.string(),
  title: z.string().optional(),
  viralityScore: z.number().min(0).max(1),
  suitabilityScore: z.number().min(0).max(1),
  trendingRank: z.number().int().positive().optional(),
});
export type AudioVirality = z.infer<typeof AudioViralitySchema>;

export interface VideoOptimizationAnalysisData { // New interface
  topPerformingVideoCaptions: string[];
  trendingHashtags: TrendingHashtag[];
  audioViralityAnalysis: AudioVirality[];
}

// --- AI Improvement Workflow Specific Types (New) ---
export const AIContentInsightSchema = z.object({
  postId: z.string(),
  contentType: z.string(),
  keyThemes: z.array(z.string()),
  sentiment: z.enum(['positive', 'negative', 'neutral', 'mixed']),
  engagementDrivers: z.array(z.string()),
});
export type AIContentInsight = z.infer<typeof AIContentInsightSchema>;

export interface AIImprovementAnalysisData { // New interface
  topPerformingContentInsights: AIContentInsight[];
  workflowImprovementSuggestions: Record<string, string[]>;
}


// --- Existing Types from original analysis_types.ts (Integrated and reviewed) ---

// Competitor Analysis Types (Kept and integrated)
export interface ContentAnalysis {
  commonTopics: string[];
  popularHashtags: string[];
  postingFrequency: number; // posts per week or similar metric
  bestPerformingFormats: string[]; // e.g., short-form, long-form, specific content types
  sentimentDistribution: Record<string, number>; // e.g., { positive: 0.6, neutral: 0.3, negative: 0.1 }
}

export interface EngagementMetrics { // This is generic, could be used by ReportMetricsSchema too
  averageLikes: number;
  averageComments: number;
  averageShares: number;
  averageViews: number;
  averageEngagementRate: number; // (likes + comments + shares) / views or followers
  followerGrowthRate?: number; // if available
}

// Zod schema for the subset of Video fields used in HistoricalAnalysisService (Kept)
export const HistoricalVideoSchema = z.object({
  id: z.string().uuid(),
  published_at: z.string().datetime(),
  like_count: z.number().int().nonnegative().nullable().transform(val => val ?? 0),
  comment_count: z.number().int().nonnegative().nullable().transform(val => val ?? 0),
  view_count: z.number().int().nonnegative().nullable().transform(val => val ?? 0),
  share_count: z.number().int().nonnegative().nullable().transform(val => val ?? 0),
  tags: z.array(z.string()).nullable().transform(val => val ?? []),
});
export type HistoricalVideo = z.infer<typeof HistoricalVideoSchema>;

// TopPerformingContent (Kept, but uses HistoricalVideo now for broader use)
export interface TopPerformingContent {
  videos: HistoricalVideo[]; // Changed from original Video[] to HistoricalVideo[]
  keySuccessFactors: string[];
}

export interface Recommendation { // Kept
  type: 'content' | 'strategy' | 'engagement' | 'optimization' | 'timing'; // Added more types
  description: string;
  actionableSteps?: string[];
  priority: 'high' | 'medium' | 'low';
}

// Competitor Analysis Service Schemas (Kept)
export const CompetitorIdSchema = z.string().uuid({ message: 'Invalid Competitor ID format' });
export const NicheSchema = z.string().min(1, { message: 'Niche cannot be empty' });

export const CompetitorApiDataSchema = z.object({ // Kept
  username: z.string(),
  platform: PlatformSchema, // Using the new, more specific PlatformSchema
});

export const CompetitorVideoSchema = z.object({ // Kept
  id: z.string().uuid(),
  published_at: z.string().datetime(),
  caption: z.string().nullable().transform(val => val ?? ''),
  tags: z.array(z.string()).nullable().transform(val => val ?? []),
  like_count: z.number().int().nonnegative().nullable().transform(val => val ?? 0),
  comment_count: z.number().int().nonnegative().nullable().transform(val => val ?? 0),
  share_count: z.number().int().nonnegative().nullable().transform(val => val ?? 0),
  view_count: z.number().int().nonnegative().nullable().transform(val => val ?? 0),
  duration: z.number().int().positive().nullable().optional(), // Duration in seconds
});
export type CompetitorVideo = z.infer<typeof CompetitorVideoSchema>;

// Specific TopPerformingContent for CompetitorAnalysis context (Kept)
export interface CompetitorContextTopPerformingContent {
  videos: CompetitorVideo[];
  keySuccessFactors: string[];
}

export interface CompetitorAnalysis { // Kept
  competitorId: string;
  competitorName: string;
  niche: string;
  contentAnalysis: ContentAnalysis;
  engagementMetrics: EngagementMetrics;
  topPerformingContent: CompetitorContextTopPerformingContent;
  recommendations: Recommendation[];
  lastAnalyzed: string; // ISO date string
}

// Historical Analysis Types (Kept and integrated)
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

export interface ContentPerformance { // Kept
  topPerformingVideos: HistoricalVideo[];
  bottomPerformingVideos: HistoricalVideo[];
  contentTypePerformance: Record<string, EngagementMetrics>; // e.g., performance by video length, topic
}

export interface AudienceGrowth { // Kept
  followerCountTrend?: EngagementTrendPoint[]; // if available
  // other audience metrics
}

export interface Benchmark { // Kept
  metricName: string;
  currentValue: number;
  averageValue: number;
  percentile?: number; // e.g., 75th percentile
}

export interface PerformanceTrends { // Kept
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
