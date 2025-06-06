import { Video } from '@/app/analysis/types/analysis_types'; // Assuming Video type is defined here

// Platform type - ensure this aligns with platform definitions used elsewhere (e.g., in SchedulerCore)
export enum Platform {
  TIKTOK = 'tiktok',
  INSTAGRAM = 'instagram',
  YOUTUBE = 'youtube',
  FACEBOOK = 'facebook',
  LINKEDIN = 'linkedin',
  TWITTER = 'twitter'
} // Add other platforms as needed

// 1. Optimal Content Generation
export interface OptimizedHashtag {
  tag: string;
  score: number; // Relevance/popularity score
}

export interface OptimizedCaption {
  text: string;
  platform: Platform;
  engagementScore?: number; // Predicted engagement
  tone?: 'formal' | 'casual' | 'humorous' | 'informative';
}

export interface ProductLinkPlacement {
  productId: string;
  timestamp?: number; // Optional: specific time in video for a visual cue
  callToAction: string;
  linkUrl: string;
}

export interface AudioOptimizationSuggestion {
  type: 'trending_sound' | 'volume_adjustment' | 'quality_enhancement';
  suggestion: string;
  details?: any; // e.g., specific sound ID, decibel change, etc.
}

export interface OptimizedContentResult {
  videoId: string;
  optimizedHashtags?: OptimizedHashtag[];
  generatedCaptions?: OptimizedCaption[];
  productLinkPlacements?: ProductLinkPlacement[];
  audioSuggestions?: AudioOptimizationSuggestion[];
}

// 2. Optimal Posting Schedule
export interface EngagementPrediction {
  timestamp: string; // ISO string for the start of the time slot
  predictedEngagementScore: number; // 0-1 score
  platform: Platform;
}

export interface ScheduledPost {
  videoId: string;
  platform: Platform;
  publishAt: string; // ISO string for scheduled publish time
  contentDetails: Partial<OptimizedContentResult>; // Include relevant optimized content
}

export interface OptimalPostingSchedule {
  userId: string;
  schedule: ScheduledPost[];
  generatedAt: string;
}

// 3. Filtered Content & Hook Generation
export interface ContentQualityScore {
  videoId: string;
  overallScore: number; // 0-1 score
  aspectScores: {
    visualClarity?: number;
    audioQuality?: number;
    framing?: number;
    stability?: number;
    // other relevant aspects
  };
  improvementSuggestions?: string[];
}

export interface GeneratedHook {
  videoId: string;
  hookText: string;
  startTime?: number; // in seconds, if applicable to a video segment
  endTime?: number; // in seconds
  predictedEffectivenessScore?: number; // 0-1
}

// 4. Simple to Understand Report
export interface ReportSection {
  title: string;
  summary: string;
  visualizations?: Array<{ type: 'chart' | 'table' | 'metric_card'; data: any; options?: any }>;
  keyInsights: string[];
  recommendations?: string[];
}

export interface DeliverablesReport {
  userId: string;
  reportDate: string;
  overallSummary: string;
  sections: ReportSection[]; // e.g., Content Performance, Schedule Effectiveness, Audience Engagement
}
