// DIFFICULT: Complex analytics processing with performance optimization

import { Post, ScheduledPost } from '../types';

interface PostPerformanceMetrics {
  engagementRate: number;
  reach: number;
  impressions: number;
  clicks: number;
  shares: number;
  saves: number;
  timestamp: Date;
}

export class AnalyticsService {
  private performanceData: Map<string, PostPerformanceMetrics[]>;
  private trends: Map<string, {
    hour: number;
    dayOfWeek: number;
    avgEngagement: number;
  }[]>;

  constructor() {
    this.performanceData = new Map();
    this.trends = new Map();
  }

  async trackPostPerformance(postId: string, metrics: Omit<PostPerformanceMetrics, 'timestamp'>): Promise<void> {
    const timestampedMetrics = {
      ...metrics,
      timestamp: new Date()
    };

    if (!this.performanceData.has(postId)) {
      this.performanceData.set(postId, []);
    }

    this.performanceData.get(postId)?.push(timestampedMetrics);
    
    // Update trends in the background
    this.updateTrends(postId, timestampedMetrics);
  }

  private async updateTrends(postId: string, metrics: PostPerformanceMetrics): Promise<void> {
    const post = await this.getPostById(postId);
    if (!post) return;

    const platform = post.platform;
    const hour = metrics.timestamp.getHours();
    const dayOfWeek = metrics.timestamp.getDay();
    
    if (!this.trends.has(platform)) {
      this.trends.set(platform, []);
    }

    const platformTrends = this.trends.get(platform)!;
    const existingTrend = platformTrends.find(
      t => t.hour === hour && t.dayOfWeek === dayOfWeek
    );

    if (existingTrend) {
      // Update existing trend with moving average
      existingTrend.avgEngagement = 
        (existingTrend.avgEngagement + metrics.engagementRate) / 2;
    } else {
      platformTrends.push({
        hour,
        dayOfWeek,
        avgEngagement: metrics.engagementRate
      });
    }
  }

  async getOptimalPostingTimes(platform: string): Promise<{hour: number, score: number}[]> {
    const platformTrends = this.trends.get(platform) || [];
    
    // Group by hour and calculate average engagement
    const hourScores = new Map<number, {sum: number, count: number}>();
    
    platformTrends.forEach(trend => {
      if (!hourScores.has(trend.hour)) {
        hourScores.set(trend.hour, { sum: 0, count: 0 });
      }
      const hourData = hourScores.get(trend.hour)!;
      hourData.sum += trend.avgEngagement;
      hourData.count++;
    });

    // Calculate average and normalize scores (0-1)
    const scores = Array.from(hourScores.entries())
      .map(([hour, data]) => ({
        hour,
        score: data.sum / data.count
      }));

    // Normalize scores to 0-1 range
    const maxScore = Math.max(...scores.map(s => s.score)) || 1;
    return scores.map(s => ({
      hour: s.hour,
      score: s.score / maxScore
    })).sort((a, b) => b.score - a.score);
  }

  async getPostPerformance(postId: string): Promise<PostPerformanceMetrics[]> {
    return this.performanceData.get(postId) || [];
  }

  async getPlatformPerformance(platform: string): Promise<{
    avgEngagement: number;
    bestPerformingHour: number;
    bestPerformingDay: number;
  }> {
    const platformTrends = this.trends.get(platform) || [];
    
    if (platformTrends.length === 0) {
      return {
        avgEngagement: 0,
        bestPerformingHour: -1,
        bestPerformingDay: -1
      };
    }

    const totalEngagement = platformTrends.reduce((sum, trend) => sum + trend.avgEngagement, 0);
    const avgEngagement = totalEngagement / platformTrends.length;

    // Find best performing hour and day
    const bestTrend = platformTrends.reduce((best, current) => 
      current.avgEngagement > best.avgEngagement ? current : best
    );

    return {
      avgEngagement,
      bestPerformingHour: bestTrend.hour,
      bestPerformingDay: bestTrend.dayOfWeek
    };
  }

  private async getPostById(postId: string): Promise<Post | null> {
    // In a real implementation, this would fetch from your database
    // This is a placeholder implementation
    return null;
  }
}
