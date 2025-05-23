import { Platform } from "@/types/platform";

export interface EngagementMetrics {
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  reach: number;
  impressions: number;
  engagementRate: number;
}

export class EngagementPredictor {
  private static platformAverages: Record<Platform, EngagementMetrics> = {
    'instagram': {
      likes: 500,
      comments: 25,
      shares: 50,
      saves: 75,
      reach: 1200,
      impressions: 1800,
      engagementRate: 0.04
    },
    'twitter': {
      likes: 100,
      comments: 5,
      shares: 15,
      saves: 10,
      reach: 800,
      impressions: 1200,
      engagementRate: 0.02
    },
    'tiktok': {
      likes: 1000,
      comments: 50,
      shares: 200,
      saves: 150,
      reach: 5000,
      impressions: 10000,
      engagementRate: 0.08
    },
    'facebook': {
      likes: 200,
      comments: 10,
      shares: 30,
      saves: 20,
      reach: 1000,
      impressions: 1500,
      engagementRate: 0.03
    },
    'linkedin': {
      likes: 150,
      comments: 8,
      shares: 20,
      saves: 25,
      reach: 900,
      impressions: 1300,
      engagementRate: 0.025
    }
  };

  /**
   * Predict engagement metrics for a post
   */
  static predictEngagement(
    platform: Platform,
    content: string,
    historicalData: any[]
  ): EngagementMetrics {
    const platformAvg = this.platformAverages[platform];
    const contentScore = this.analyzeContent(content);
    const historicalEngagement = this.analyzeHistoricalData(historicalData);
    
    // Simple weighted average - in a real app, you'd use ML models
    return {
      likes: Math.round(platformAvg.likes * contentScore * historicalEngagement),
      comments: Math.round(platformAvg.comments * contentScore * historicalEngagement * 0.8),
      shares: Math.round(platformAvg.shares * contentScore * historicalEngagement * 0.9),
      saves: Math.round(platformAvg.saves * contentScore * historicalEngagement * 0.7),
      reach: Math.round(platformAvg.reach * contentScore * historicalEngagement * 1.1),
      impressions: Math.round(platformAvg.impressions * contentScore * historicalEngagement * 1.1),
      engagementRate: platformAvg.engagementRate * contentScore * historicalEngagement
    };
  }

  /**
   * Calculate a content quality score (0.5 to 1.5)
   */
  private static analyzeContent(content: string): number {
    // Simple analysis - in a real app, use NLP
    let score = 1.0;
    const length = content.length;
    const wordCount = content.split(/\s+/).length;
    const hasEmojis = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu.test(content);
    const hasHashtags = /#\w+/.test(content);
    const hasMentions = /@\w+/.test(content);
    
    // Length score (optimal 150-300 chars)
    if (length > 50 && length < 500) {
      score *= 1.1;
    } else if (length >= 500) {
      score *= 0.9;
    }
    
    // Word count score (optimal 20-50 words)
    if (wordCount >= 15 && wordCount <= 60) {
      score *= 1.1;
    } else if (wordCount > 60) {
      score *= 0.9;
    }
    
    // Engagement elements
    if (hasEmojis) score *= 1.05;
    if (hasHashtags) score *= 1.05;
    if (hasMentions) score *= 1.03;
    
    return Math.min(Math.max(score, 0.5), 1.5);
  }

  /**
   * Calculate historical engagement multiplier (0.8 to 1.2)
   */
  private static analyzeHistoricalData(historicalData: any[]): number {
    if (historicalData.length === 0) return 1.0;
    
    const totalEngagement = historicalData.reduce((sum, post) => {
      return sum + (post.engagementRate || 0);
    }, 0);
    
    const avgEngagement = totalEngagement / historicalData.length;
    
    // Normalize to 0.8-1.2 range based on historical performance
    return Math.min(Math.max(0.8, avgEngagement * 10), 1.2);
  }
}
