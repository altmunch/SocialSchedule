// difficult: Service for analyzing post metrics and extracting insights
import { Platform, PostMetrics } from '../types';
import { formatInTimeZone, toZonedTime, getTimezoneOffset } from 'date-fns-tz';
import { format, isValid, differenceInMilliseconds, addMinutes } from 'date-fns';

// Cache configuration interface
interface CacheConfig {
  enabled: boolean;
  ttl: number; // in milliseconds
  maxSize: number;
  cleanupInterval: number; // in milliseconds
}

// Cache entry interface
interface CacheEntry<T> {
  value: T;
  timestamp: number;
  expiresAt: number;
  accessCount: number;
}

// Helper function to parse and validate dates
const parseDate = (date: string | Date, timezone?: string): Date => {
  const parsedDate = typeof date === 'string' ? new Date(date) : new Date(date);
  
  if (!isValid(parsedDate)) {
    throw new Error(`Invalid date: ${date}`);
  }
  
  // If timezone is provided, adjust the date to that timezone
  if (timezone) {
    const offset = getTimezoneOffset(timezone, parsedDate);
    return new Date(parsedDate.getTime() + (parsedDate.getTimezoneOffset() * 60000) + offset);
  }
  
  return parsedDate;
};

// Validate IANA timezone format
const isValidTimezone = (timezone: string): boolean => {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: timezone });
    return true;
  } catch (e) {
    return false;
  }
};

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

interface HashtagStats {
  hashtag: string;
  avgEngagement: number;
  count: number;
}

interface EngagementStats {
  totalEngagement: number;
  count: number;
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
  
  // Cache implementation
  private cache: Map<string, CacheEntry<any>> = new Map();
  private cacheHits: number = 0;
  private cacheMisses: number = 0;
  private lastCleanup: number = Date.now();
  private cacheConfig: CacheConfig = {
    enabled: true,
    ttl: 5 * 60 * 1000, // 5 minutes default TTL
    maxSize: 1000,
    cleanupInterval: 5 * 60 * 1000 // 5 minutes
  };

  constructor(private posts: PostMetrics[], cacheConfig?: Partial<CacheConfig>) {
    this.platformWeights = this.calculatePlatformWeights();
    this.averageMetrics = this.calculateAverageMetrics();
    
    // Initialize cache with provided config or defaults
    if (cacheConfig) {
      this.cacheConfig = { ...this.cacheConfig, ...cacheConfig };
    }
    
    // Setup periodic cache cleanup
    setInterval(() => this.cleanupCache(), this.cacheConfig.cleanupInterval);
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
    const cacheKey = `engagement_${post.id}_${post.platform}`;
    const cached = this.getFromCache<number>(cacheKey);
    if (cached !== null) return cached;
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

    // Cap the score at 100% and cache the result
    const result = Math.min(score, 1) * 100;
    this.setCache(cacheKey, result, 60 * 60 * 1000); // Cache for 1 hour
    return result;
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
   * @param targetTimezone Target IANA timezone (e.g., 'Asia/Singapore')
   * @param sourceTimezone Optional source IANA timezone if date is not in local time
   * @returns Object with converted date components
   * @throws Error if timezone is invalid
   */
  private convertToTimezone(
    date: string | Date, 
    targetTimezone: string = Intl.DateTimeFormat().resolvedOptions().timeZone,
    sourceTimezone?: string
  ) {
    // Validate target timezone
    if (!isValidTimezone(targetTimezone)) {
      throw new Error(`Invalid target timezone: ${targetTimezone}`);
    }

    try {
      // Parse the date, adjusting for source timezone if provided
      const dateObj = parseDate(date, sourceTimezone);
      
      // Convert to the target timezone
      const zonedDate = toZonedTime(dateObj, targetTimezone);
      
      // Format date components using the target timezone
      const dayOfWeek = formatInTimeZone(zonedDate, targetTimezone, 'EEEE');
      const hour = zonedDate.getHours();
      const day = zonedDate.getDay();
      const timeLabel = formatInTimeZone(zonedDate, targetTimezone, 'h:mma');
      
      return { 
        zonedDate, 
        dayOfWeek, 
        hour, 
        day, 
        timeLabel,
        timezone: targetTimezone
      };
    } catch (error) {
      console.error('Error converting date to timezone:', { 
        date, 
        targetTimezone, 
        sourceTimezone,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      throw new Error(`Failed to convert date to timezone: ${targetTimezone}. ${error instanceof Error ? error.message : ''}`);
    }
  }

  /**
   * Find peak engagement times using the weighted engagement score
   * @param targetTimezone Optional target IANA timezone (defaults to system timezone)
   * @returns Array of peak time slots with engagement data
   * @throws Error if timezone conversion fails
   */
  findPeakTimes(targetTimezone?: string): TimeSlotSummary[] {
    if (this.posts.length === 0) return [];

    // Check cache first
    const cacheKey = `peak_times_${targetTimezone || 'default'}`;
    const cached = this.getFromCache<TimeSlotSummary[]>(cacheKey);
    if (cached !== null) return cached;

    // Use provided timezone or detect user's timezone
    const detectedTimezone = targetTimezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
    const timeSlots: Record<string, TimeSlotEngagement> = {};
    
    // Process each post's timestamp in the target timezone
    this.posts.forEach(post => {
      try {
        const { hour, day, dayOfWeek, timeLabel } = this.convertToTimezone(
          post.timestamp, 
          detectedTimezone,
          post.timezone // Use post's timezone if available
        );
        
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
        console.error('Error processing post timestamp:', { 
          postId: post.id, 
          timestamp: post.timestamp,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    });

    // Convert to array, calculate averages, and sort by engagement score
    const result = Object.values(timeSlots)
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
    
    // Cache the result for 1 hour
    this.setCache(cacheKey, result, 60 * 60 * 1000);
    return result;
  }

  /**
   * Find top performing posts using the weighted engagement score
   * @param limit Maximum number of posts to return (default: 5)
   * @returns Array of top performing posts
   */
  public findTopPerformingPosts(limit: number = 5): PostMetrics[] {
    if (!this.posts || !Array.isArray(this.posts) || this.posts.length === 0) return [];
    
    const cacheKey = `top_posts_${limit}`;
    const cached = this.getFromCache<PostMetrics[]>(cacheKey);
    if (cached !== null) return cached;
    
    const result = [...this.posts]
      .sort((a: PostMetrics, b: PostMetrics) => this.calculateWeightedEngagement(b) - this.calculateWeightedEngagement(a))
      .slice(0, limit);
    
    // Cache the result for 1 hour
    this.setCache(cacheKey, result, 60 * 60 * 1000);
    return result;
  }

  /**
   * Analyze hashtag performance across all posts
   * @returns Array of hashtags with their average engagement and count
   */
  public analyzeHashtags(): HashtagStats[] {
    const cacheKey = 'hashtag_stats';
    const cached = this.getFromCache<HashtagStats[]>(cacheKey);
    if (cached !== null) return cached;
    if (!this.posts || !Array.isArray(this.posts) || this.posts.length === 0) return [];
    const hashtagStats: Record<string, EngagementStats> = {};
    
    this.posts.forEach((post: PostMetrics) => {
      // Skip if post or hashtags are not defined
      if (!post || !Array.isArray(post.hashtags)) return;
      
      post.hashtags.forEach((hashtag: string) => {
        if (!hashtag) return; // Skip empty hashtags
        
        if (!hashtagStats[hashtag]) {
          hashtagStats[hashtag] = { totalEngagement: 0, count: 0 };
        }
        
        const engagement = this.calculateWeightedEngagement(post);
        if (isFinite(engagement)) {
          hashtagStats[hashtag].totalEngagement += engagement;
          hashtagStats[hashtag].count++;
        }
      });
    });
    const result = Object.entries(hashtagStats)
      .map(([hashtag, { totalEngagement, count }]) => ({
        hashtag,
        avgEngagement: totalEngagement / count,
        count
      }))
      .sort((a: HashtagStats, b: HashtagStats) => b.avgEngagement - a.avgEngagement);
    
    // Cache the result for 1 hour
    this.setCache(cacheKey, result, 60 * 60 * 1000);
    return result;
  }

  /**
   * Detect anomalies in post performance using IQR method
   * @param thresholdValue IQR multiplier for anomaly detection (default: 1.5)
   * @returns Array of posts that are statistical anomalies
   */
  public detectAnomalies(thresholdValue: number = 1.5): PostMetrics[] {
    const cacheKey = `anomalies_${thresholdValue}`;
    const cached = this.getFromCache<PostMetrics[]>(cacheKey);
    if (cached !== null) return cached;
    if (!this.posts || !Array.isArray(this.posts) || this.posts.length < 3) return [];
    
    // Filter out invalid posts and calculate engagement
    const engagementRates = this.posts
      .filter((post: PostMetrics) => post !== undefined && post !== null)
      .map((post: PostMetrics) => ({
        post,
        engagement: this.calculateWeightedEngagement(post)
      }));

    if (engagementRates.length < 3) return [];

    // Sort by engagement
    const sortedEngagement = [...engagementRates].sort((a, b) => a.engagement - b.engagement);
    const sortedValues = sortedEngagement.map((item) => item.engagement).filter(Number.isFinite);
    
    if (sortedValues.length === 0) return [];
    
    // Calculate Q1, Q3, and IQR
    const q1 = this.calculatePercentile(sortedValues, 25);
    const q3 = this.calculatePercentile(sortedValues, 75);
    const iqr = q3 - q1;
    
    // Calculate bounds using the provided threshold
    const lowerBound = q1 - thresholdValue * iqr;
    const upperBound = q3 + thresholdValue * iqr;
    
    // Find posts with engagement rates outside the bounds
    const result = sortedEngagement
      .filter(({ engagement }) => engagement < lowerBound || engagement > upperBound)
      .map(({ post }) => post);
    
    // Cache the result for 30 minutes
    this.setCache(cacheKey, result, 30 * 60 * 1000);
    return result;
  }

  /**
   * Calculate percentile value from a sorted array
   * @param values Sorted array of numbers
   * @param percentileValue Percentile to calculate (0-100)
   * @returns The value at the given percentile
   */
  private calculatePercentile(values: number[], percentileValue: number): number {
    if (!values || values.length === 0) return 0;
    if (percentileValue <= 0) return values[0];
    if (percentileValue >= 100) return values[values.length - 1];
    const index = (percentileValue / 100) * (values.length - 1);
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    if (lower === upper) return values[lower];
    // Linear interpolation
    return values[lower] + (values[upper] - values[lower]) * (index - lower);
  }

  /**
   * Get cache statistics
   */
  public getCacheStats() {
    this.cleanupCache();
    return {
      size: this.cache.size,
      hits: this.cacheHits,
      misses: this.cacheMisses,
      hitRate: this.cacheHits / (this.cacheHits + this.cacheMisses) || 0,
      enabled: this.cacheConfig.enabled,
      lastCleanup: new Date(this.lastCleanup).toISOString()
    };
  }

  /**
   * Clear the entire cache
   */
  public clearCache(): void {
    this.cache.clear();
    this.cacheHits = 0;
    this.cacheMisses = 0;
  }

  /**
   * Clean up expired cache entries
   */
  private cleanupCache(): number {
    const now = Date.now();
    let deletedCount = 0;
    
    for (const [key, entry] of this.cache.entries()) {
      if (entry.expiresAt < now) {
        this.cache.delete(key);
        deletedCount++;
      }
    }
    
    this.lastCleanup = now;
    return deletedCount;
  }

  /**
   * Get a value from cache
   */
  private getFromCache<T>(key: string): T | null {
    if (!this.cacheConfig.enabled) return null;
    
    const entry = this.cache.get(key);
    if (!entry) {
      this.cacheMisses++;
      return null;
    }
    
    if (entry.expiresAt < Date.now()) {
      this.cache.delete(key);
      this.cacheMisses++;
      return null;
    }
    
    // Update last accessed time and increment access count
    entry.accessCount++;
    this.cacheHits++;
    return entry.value as T;
  }

  /**
   * Set a value in the cache
   */
  private setCache<T>(key: string, value: T, ttl?: number): void {
    if (!this.cacheConfig.enabled) return;
    
    // Clean up if we're approaching max size
    if (this.cache.size >= this.cacheConfig.maxSize) {
      // Remove 10% of least recently used items
      const entries = Array.from(this.cache.entries())
        .sort((a, b) => a[1].accessCount - b[1].accessCount);
      
      const toRemove = Math.ceil(this.cacheConfig.maxSize * 0.1);
      entries.slice(0, toRemove).forEach(([k]) => this.cache.delete(k));
    }
    
    const now = Date.now();
    this.cache.set(key, {
      value,
      timestamp: now,
      expiresAt: now + (ttl || this.cacheConfig.ttl),
      accessCount: 0
    });
  }
}