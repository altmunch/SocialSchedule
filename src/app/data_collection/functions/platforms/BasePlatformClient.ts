// difficult: Base class for platform-specific clients
import { PostMetrics, Platform } from '../types';

export abstract class BasePlatformClient {
  protected accessToken: string;
  protected platform: Platform;
  protected rateLimitQueue: Array<() => Promise<any>> = [];
  protected isProcessingQueue = false;
  protected readonly RATE_LIMIT = 5; // 5 requests per second
  protected lastRequestTime = 0;

  constructor(accessToken: string, platform: Platform) {
    this.accessToken = accessToken;
    this.platform = platform;
  }

  protected async throttleRequest<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.rateLimitQueue.push(async () => {
        try {
          const now = Date.now();
          const timeSinceLastRequest = now - this.lastRequestTime;
          const minDelay = 1000 / this.RATE_LIMIT;
          
          if (timeSinceLastRequest < minDelay) {
            await new Promise(resolve => setTimeout(resolve, minDelay - timeSinceLastRequest));
          }
          
          this.lastRequestTime = Date.now();
          const result = await fn();
          resolve(result);
        } catch (error) {
          reject(error);
        } finally {
          this.processQueue();
        }
      });
      
      if (!this.isProcessingQueue) {
        this.processQueue();
      }
    });
  }

  private async processQueue() {
    if (this.rateLimitQueue.length === 0) {
      this.isProcessingQueue = false;
      return;
    }

    this.isProcessingQueue = true;
    const nextRequest = this.rateLimitQueue.shift();
    if (nextRequest) {
      await nextRequest();
    }
  }

  // Abstract methods that must be implemented by platform-specific clients
  abstract getPostMetrics(postId: string): Promise<PostMetrics>;
  abstract getUserPosts(userId: string, lookbackDays?: number): Promise<PostMetrics[]>;
  abstract getCompetitorPosts(username: string, lookbackDays?: number): Promise<PostMetrics[]>;
  
  // Common method to calculate engagement rate
  protected calculateEngagementRate(metrics: {
    likes: number;
    comments: number;
    shares: number;
    views?: number;
    followerCount: number;
  }): number {
    const { likes, comments, shares, views, followerCount } = metrics;
    const totalEngagement = likes + (comments * 2) + (shares * 3);
    
    if (views && views > 0) {
      return (totalEngagement / views) * 100; // Engagement rate based on views
    }
    
    return (totalEngagement / followerCount) * 100; // Engagement rate based on followers
  }
}
