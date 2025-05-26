// difficult: Service for analyzing post metrics and extracting insights
import { PostMetrics } from '../types';
import { findPeaks } from 'simple-peaks-finder';

interface TimeSlotEngagement {
  hour: number;
  day: number;
  engagement: number;
  count: number;
}

export class PostAnalyzer {
  constructor(private posts: PostMetrics[]) {}

  /**
   * Calculate average engagement rate across all posts
   */
  calculateAverageEngagement(): number {
    if (this.posts.length === 0) return 0;
    
    const totalEngagement = this.posts.reduce(
      (sum, post) => sum + post.engagementRate, 0
    );
    
    return totalEngagement / this.posts.length;
  }

  /**
   * Find peak engagement times
   */
  findPeakTimes(): Array<{ hour: number; engagementScore: number }> {
    if (this.posts.length === 0) return [];

    // Group engagement by hour and day
    const timeSlots: Record<string, TimeSlotEngagement> = {};
    
    this.posts.forEach(post => {
      const date = new Date(post.timestamp);
      const hour = date.getHours();
      const day = date.getDay();
      const key = `${day}-${hour}`;
      
      if (!timeSlots[key]) {
        timeSlots[key] = { hour, day, engagement: 0, count: 0 };
      }
      
      timeSlots[key].engagement += post.engagementRate;
      timeSlots[key].count++;
    });

    // Calculate average engagement per time slot
    const hourlyAverages = Object.values(timeSlots).map(slot => ({
      hour: slot.hour,
      engagementScore: slot.engagement / slot.count
    }));

    // Sort by engagement score
    return hourlyAverages
      .sort((a, b) => b.engagementScore - a.engagementScore)
      .slice(0, 5); // Return top 5 peak times
  }

  /**
   * Find top performing posts
   */
  findTopPerformingPosts(limit: number = 5): PostMetrics[] {
    return [...this.posts]
      .sort((a, b) => b.engagementRate - a.engagementRate)
      .slice(0, limit);
  }

  /**
   * Analyze hashtag performance
   */
  analyzeHashtags(): Array<{ hashtag: string; avgEngagement: number; count: number }> {
    const hashtagStats: Record<string, { totalEngagement: number; count: number }> = {};
    
    this.posts.forEach(post => {
      post.hashtags?.forEach(hashtag => {
        if (!hashtagStats[hashtag]) {
          hashtagStats[hashtag] = { totalEngagement: 0, count: 0 };
        }
        hashtagStats[hashtag].totalEngagement += post.engagementRate;
        hashtagStats[hashtag].count++;
      });
    });

    return Object.entries(hashtagStats)
      .map(([hashtag, { totalEngagement, count }]) => ({
        hashtag,
        avgEngagement: totalEngagement / count,
        count
      }))
      .sort((a, b) => b.avgEngagement - a.avgEngagement);
  }

  /**
   * Detect anomalies in post performance
   */
  detectAnomalies(threshold: number = 1.5): PostMetrics[] {
    if (this.posts.length < 3) return [];
    
    const engagementRates = this.posts.map(p => p.engagementRate);
    const sorted = [...engagementRates].sort((a, b) => a - b);
    
    // Calculate Q1, Q3, and IQR
    const q1 = this.calculatePercentile(sorted, 25);
    const q3 = this.calculatePercentile(sorted, 75);
    const iqr = q3 - q1;
    const lowerBound = q1 - threshold * iqr;
    const upperBound = q3 + threshold * iqr;
    
    // Find posts with engagement rates outside the bounds
    return this.posts.filter(
      post => post.engagementRate < lowerBound || post.engagementRate > upperBound
    );
  }

  private calculatePercentile(arr: number[], percentile: number): number {
    const index = (percentile / 100) * (arr.length - 1);
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    
    if (lower === upper) return arr[lower];
    
    // Linear interpolation
    return arr[lower] + (arr[upper] - arr[lower]) * (index - lower);
  }
}
