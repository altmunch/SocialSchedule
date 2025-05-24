// DIFFICULT: Handles complex platform API interactions with rate limiting and error handling

import { Post, TimeSlot } from '../types';

type PlatformAPIResponse = {
  success: boolean;
  scheduledTime?: Date;
  platformPostId?: string;
  error?: string;
};

export class PlatformAPIService {
  private platformClients: Map<string, any> = new Map();
  private rateLimiters: Map<string, { limit: number; remaining: number; resetAt: Date }> = new Map();

  constructor() {
    this.initializePlatformClients();
  }

  private initializePlatformClients(): void {
    // Initialize platform-specific API clients
    // This is a simplified version - in a real app, you'd have proper SDK initialization here
    const platforms = ['instagram', 'tiktok', 'facebook', 'linkedin'];
    
    platforms.forEach(platform => {
      this.platformClients.set(platform, {
        // Mock client implementation
        schedulePost: async (post: Post, time: Date): Promise<PlatformAPIResponse> => {
          // In a real implementation, this would call the actual platform API
          console.log(`Scheduling post on ${platform} for ${time}`);
          
          // Simulate API call delay
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Simulate success 90% of the time
          if (Math.random() < 0.9) {
            return {
              success: true,
              scheduledTime: time,
              platformPostId: `post_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
            };
          } else {
            return {
              success: false,
              error: 'Failed to schedule post: API error'
            };
          }
        }
      });
      
      // Initialize rate limiters
      this.rateLimiters.set(platform, {
        limit: 200, // Default rate limit
        remaining: 200,
        resetAt: this.getNextHour()
      });
    });
  }

  async schedulePost(post: Post, timeSlot: TimeSlot): Promise<PlatformAPIResponse> {
    const platform = post.platform;
    const client = this.platformClients.get(platform);
    
    if (!client) {
      throw new Error(`Unsupported platform: ${platform}`);
    }
    
    // Check rate limits
    if (!this.checkRateLimit(platform)) {
      return {
        success: false,
        error: 'Rate limit exceeded. Please try again later.'
      };
    }
    
    try {
      // Call the platform-specific implementation
      const result = await client.schedulePost(post, timeSlot.start);
      
      // Update rate limit info
      if (result.success) {
        this.updateRateLimit(platform, 1);
      }
      
      return result;
    } catch (error) {
      console.error(`Error scheduling post on ${platform}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error scheduling post'
      };
    }
  }

  /**
   * Cancel a scheduled post on the platform
   */
  async cancelScheduledPost(platform: string, platformPostId: string): Promise<{ success: boolean; error?: string }> {
    const client = this.platformClients.get(platform);
    
    if (!client) {
      throw new Error(`Unsupported platform: ${platform}`);
    }
    
    try {
      // In a real implementation, this would call the platform's API to cancel the post
      console.log(`Cancelling post ${platformPostId} on ${platform}`);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Simulate success 90% of the time
      if (Math.random() < 0.9) {
        return { success: true };
      } else {
        return { 
          success: false, 
          error: 'Failed to cancel post: API error' 
        };
      }
    } catch (error) {
      console.error(`Error cancelling post ${platformPostId} on ${platform}:`, error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error cancelling post' 
      };
    }
  }

  private async checkRateLimit(platform: string): Promise<void> {
    const limiter = this.rateLimiters.get(platform);
    
    if (!limiter) {
      throw new Error(`No rate limiter found for platform: ${platform}`);
    }
    
    // Reset rate limit if we've reached the reset time
    if (new Date() >= limiter.resetAt) {
      limiter.remaining = limiter.limit;
      limiter.resetAt = this.getNextHour();
    }
    
    // If we've hit the rate limit, wait until reset
    if (limiter.remaining <= 0) {
      const now = new Date();
      const waitTime = limiter.resetAt.getTime() - now.getTime();
      
      if (waitTime > 0) {
        console.log(`Rate limit reached. Waiting ${waitTime}ms until reset...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        
        // Reset after waiting
        limiter.remaining = limiter.limit;
        limiter.resetAt = this.getNextHour();
      }
    }
  }

  private updateRateLimit(platform: string, used: number): void {
    const limiter = this.rateLimiters.get(platform);
    
    if (limiter) {
      limiter.remaining = Math.max(0, limiter.remaining - used);
    }
  }

  private getNextHour(): Date {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours() + 1, 0, 0, 0);
  }
}
