// difficult: Service for analyzing post metrics and extracting insights
import { PostMetrics } from '../types';
import { formatInTimeZone, toZonedTime } from 'date-fns-tz';
import { format, parseISO } from 'date-fns';

// Type definitions for time slot analysis
interface TimeSlotEngagement {
  hour: number;
  day: number;
  dayOfWeek: string;
  timeLabel: string;
  engagement: number;
  count: number;
  timezone: string;
}

interface TimeSlotSummary {
  hour: number;
  day: number;
  dayOfWeek: string;
  timeLabel: string;
  engagementScore: number;
  timezone: string;
}

// Platform-specific engagement weights
const ENGAGEMENT_WEIGHTS = {
  tiktok: {
    views: 0.2,
    likes: 0.3,
    comments: 0.3,
    shares: 0.4,
    watchTime: 0.5
  },
  instagram: {
    views: 0.4,
    likes: 0.4,
    comments: 0.5,
    shares: 0.3,
    watchTime: 0.4
  },
  youtube: {
    views: 0.3,
    likes: 0.3,
    comments: 0.4,
    shares: 0.2,
    watchTime: 0.6
  }
} as const;

// Base engagement rate calculation
const BASE_ENGAGEMENT_RATE = 0.05; // 5% baseline



export class PostAnalyzer {
  private platformWeights: Record<string, any>;
  private averageMetrics: {
    views: number;
    likes: number;
    comments: number;
    shares: number;
    watchTime?: number;
  };

  constructor(private posts: PostMetrics[]) {
    this.platformWeights = this.calculatePlatformWeights();
    this.averageMetrics = this.calculateAverageMetrics();
  }

  private calculatePlatformWeights() {
    const platformCounts: Record<string, number> = {};
    
    // Count posts per platform
    this.posts.forEach(post => {
      platformCounts[post.platform] = (platformCounts[post.platform] || 0) + 1;
    });

    // Calculate platform-specific weights
    const totalPosts = this.posts.length;
    return Object.entries(platformCounts).reduce((acc, [platform, count]) => {
      acc[platform] = count / totalPosts;
      return acc;
    }, {} as Record<string, number>);
  }

  private calculateAverageMetrics() {
    interface MetricsSums {
      views: number;
      likes: number;
      comments: number;
      shares: number;
      watchTime: number;
    }

    const sums: MetricsSums = {
      views: 0,
      likes: 0,
      comments: 0,
      shares: 0,
      watchTime: 0
    };

    const counts: MetricsSums = {
      views: 0,
      likes: 0,
      comments: 0,
      shares: 0,
      watchTime: 0
    };

    this.posts.forEach(post => {
      sums.views += post.views;
      sums.likes += post.likes;
      sums.comments += post.comments;
      sums.shares += post.shares;
      
      counts.views++;
      counts.likes++;
      counts.comments++;
      counts.shares++;
      
      if (post.metadata?.watchTime && typeof post.metadata.watchTime === 'number') {
        sums.watchTime += post.metadata.watchTime;
        counts.watchTime++;
      }
    });

    return {
      views: sums.views / (counts.views || 1),
      likes: sums.likes / (counts.likes || 1),
      comments: sums.comments / (counts.comments || 1),
      shares: sums.shares / (counts.shares || 1),
      watchTime: counts.watchTime > 0 ? sums.watchTime / counts.watchTime : undefined
    };
  }

  /**
   * Calculate weighted engagement score for a post
   */
  calculateWeightedEngagement(post: PostMetrics): number {
    const platform = post.platform;
    const weights = ENGAGEMENT_WEIGHTS[platform as keyof typeof ENGAGEMENT_WEIGHTS] || 
                   ENGAGEMENT_WEIGHTS.instagram; // Default to Instagram weights

    // Calculate normalized metrics (relative to average)
    const normalizedMetrics = {
      views: post.views / (this.averageMetrics.views || 1),
      likes: post.likes / (this.averageMetrics.likes || 1),
      comments: post.comments / (this.averageMetrics.comments || 1),
      shares: post.shares / (this.averageMetrics.shares || 1),
      watchTime: post.metadata?.watchTime 
        ? (post.metadata.watchTime as number) / (this.averageMetrics.watchTime || 1) 
        : 1
    };

    // Calculate weighted engagement score
    let score = BASE_ENGAGEMENT_RATE;
    
    // Add weighted metrics
    score += normalizedMetrics.views * weights.views * 0.1;
    score += normalizedMetrics.likes * weights.likes * 0.2;
    score += normalizedMetrics.comments * weights.comments * 0.3;
    score += normalizedMetrics.shares * weights.shares * 0.4;
    
    // Add watch time if available (more important for video platforms)
    if (post.metadata?.watchTime) {
      score += normalizedMetrics.watchTime * weights.watchTime * 0.5;
    }

    // Apply platform weight
    const platformWeight = this.platformWeights[platform] || 1;
    score *= platformWeight;

    // Cap the score at 100%
    return Math.min(score, 1) * 100;
  }


  /**
   * Calculate average engagement rate across all posts using the new weighted formula
   */
  calculateAverageEngagement(): number {
    if (this.posts.length === 0) return 0;
    
    const totalEngagement = this.posts.reduce(
      (sum, post) => sum + this.calculateWeightedEngagement(post), 0
    );
    
    return totalEngagement / this.posts.length;
  }

  /**
   * Convert a date to the specified timezone
   * @param date Input date (string or Date object)
   * @param timezone Target timezone (e.g., 'Asia/Singapore')
   * @returns Object with converted date components
   */
  private convertToTimezone(date: string | Date, timezone: string = Intl.DateTimeFormat().resolvedOptions().timeZone) {
    try {
      // Parse the date if it's a string
      const dateObj = typeof date === 'string' ? parseISO(date) : new Date(date);
      
      // Convert to the target timezone
      const zonedDate = toZonedTime(dateObj, timezone);
      
      // Format the date components
      const dayOfWeek = format(zonedDate, 'EEEE'); // Full day name (e.g., 'Monday')
      const hour = zonedDate.getHours();
      const day = zonedDate.getDay(); // 0-6 (Sunday-Saturday)
      const timeLabel = format(zonedDate, 'h:mma'); // e.g., '2:30PM'
      
      return { 
        zonedDate, 
        dayOfWeek, 
        hour, 
        day, 
        timeLabel,
        timezone
      };
    } catch (error) {
      console.error('Error converting date to timezone:', date, timezone, error);
      // Fallback to local timezone if conversion fails
      const fallbackDate = typeof date === 'string' ? new Date(date) : date;
      const dayOfWeek = format(fallbackDate, 'EEEE');
      const hour = fallbackDate.getHours();
      const day = fallbackDate.getDay();
      const timeLabel = format(fallbackDate, 'h:mma');
      
      return {
        zonedDate: fallbackDate,
        dayOfWeek,
        hour,
        day,
        timeLabel,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      };
    }
  }

  /**
   * Find peak engagement times using the weighted engagement score
   * @param timezone Optional timezone (defaults to user's local timezone)
   * @returns Array of peak time slots with engagement data
   */
  findPeakTimes(timezone?: string): TimeSlotSummary[] {
    if (this.posts.length === 0) return [];

    // Use provided timezone or detect user's timezone
    const detectedTimezone = timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
    const timeSlots: Record<string, TimeSlotEngagement> = {};
    
    // Process each post's timestamp in the target timezone
    this.posts.forEach(post => {
      try {
        const { hour, day, dayOfWeek, timeLabel } = this.convertToTimezone(post.timestamp, detectedTimezone);
        const key = `${day}-${hour}`;
        
        if (!timeSlots[key]) {
          timeSlots[key] = {
            hour,
            day,
            dayOfWeek,
            timeLabel: `${dayOfWeek} ${timeLabel}`,
            engagement: 0,
            count: 0,
            timezone: detectedTimezone
          };
        }
        
        timeSlots[key].engagement += this.calculateWeightedEngagement(post);
        timeSlots[key].count++;
      } catch (error) {
        console.error('Error processing post timestamp:', post.timestamp, error);
      }
    });

    // Convert to array, calculate averages, and sort by engagement score
    return Object.values(timeSlots)
      .map(slot => ({
        hour: slot.hour,
        day: slot.day,
        dayOfWeek: slot.dayOfWeek,
        timeLabel: slot.timeLabel,
        engagementScore: slot.engagement / slot.count,
        timezone: slot.timezone
      }))
      .sort((a, b) => b.engagementScore - a.engagementScore)
      .slice(0, 5); // Return top 5 peak times
  }
  }

  /**
   * Find top performing posts using the weighted engagement score
   * @param limit Maximum number of posts to return (default: 5)
   * @returns Array of top performing posts
   */
  findTopPerformingPosts(limit = 5): PostMetrics[] {
    return [...this.posts]
      .sort((a, b) => this.calculateWeightedEngagement(b) - this.calculateWeightedEngagement(a))
      .slice(0, limit);
  }

  /**
   * Analyze hashtag performance across all posts
   * @returns Array of hashtags with their average engagement and count
   */
  analyzeHashtags(): Array<{ hashtag: string; avgEngagement: number; count: number }> {
    const hashtagStats: Record<string, { totalEngagement: number; count: number }> = {};
    
    this.posts.forEach(post => {
      post.hashtags?.forEach((hashtag: string) => {
        if (!hashtagStats[hashtag]) {
          hashtagStats[hashtag] = { totalEngagement: 0, count: 0 };
        }
        hashtagStats[hashtag].totalEngagement += this.calculateWeightedEngagement(post);
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
   * Detect anomalies in post performance using IQR method
   * @param threshold IQR multiplier for anomaly detection (default: 1.5)
   * @returns Array of posts that are statistical anomalies
   */
  detectAnomalies(threshold = 1.5): PostMetrics[] {
    if (this.posts.length < 3) return [];
    
    const engagementRates = this.posts.map(p => this.calculateWeightedEngagement(p));
    const sorted = [...engagementRates].sort((a, b) => a - b);
    
    // Calculate Q1, Q3, and IQR
    const q1 = this.calculatePercentile(sorted, 25);
    const q3 = this.calculatePercentile(sorted, 75);
    const iqr = q3 - q1;
    const lowerBound = q1 - threshold * iqr;
    const upperBound = q3 + threshold * iqr;
    
    // Find posts with engagement rates outside the bounds
    return this.posts.filter(
      post => this.calculateWeightedEngagement(post) < lowerBound || 
              this.calculateWeightedEngagement(post) > upperBound
    );
  }

  /**
   * Calculate percentile value from a sorted array
   * @param arr Sorted array of numbers
   * @param percentile Percentile to calculate (0-100)
   * @returns The value at the given percentile
   */
  private calculatePercentile(arr: number[], percentile: number): number {
    if (arr.length === 0) return 0;
    if (percentile <= 0) return arr[0];
    if (percentile >= 100) return arr[arr.length - 1];
    
    const index = (percentile / 100) * (arr.length - 1);
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    
    if (lower === upper) return arr[lower];
    
    // Linear interpolation
    return arr[lower] + (arr[upper] - arr[lower]) * (index - lower);
  }
}
