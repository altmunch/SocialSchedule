// difficult: Platform client abstraction and base logic for social media integrations
// src/app/3. blitz/services/PlatformClient.ts

import { Post, PlatformPostResponse, PlatformConfig } from '../types';

/**
 * Interface for platform-specific client implementations
 */
export interface PlatformClient {
  /**
   * Publish a post to the platform
   */
  publish(post: Post): Promise<PlatformPostResponse>;
  
  /**
   * Update an existing post
   */
  update?(post: Post, platformPostId: string): Promise<PlatformPostResponse>;
  
  /**
   * Delete a post
   */
  delete?(platformPostId: string): Promise<boolean>;
  
  /**
   * Get post analytics
   */
  getAnalytics?(platformPostId: string): Promise<any>;
  
  /**
   * Clean up resources
   */
  cleanup?(): Promise<void>;
}

/**
 * Base class for platform clients
 */
export abstract class BasePlatformClient implements PlatformClient {
  protected config: PlatformConfig;
  protected rateLimitRemaining: number = 60;
  protected rateLimitResetAt: Date = new Date();
  
  constructor(config: PlatformConfig) {
    this.config = config;
    this.initializeRateLimits();
  }
  
  abstract publish(post: Post): Promise<PlatformPostResponse>;
  
  async update(post: Post, platformPostId: string): Promise<PlatformPostResponse> {
    throw new Error('Update not implemented');
  }
  
  async delete(platformPostId: string): Promise<boolean> {
    throw new Error('Delete not implemented');
  }
  
  async getAnalytics(platformPostId: string): Promise<any> {
    throw new Error('Analytics not implemented');
  }
  
  async cleanup(): Promise<void> {
    // Default implementation does nothing
  }
  
  protected async handleRateLimit(headers: Record<string, string>): Promise<void> {
    const remaining = headers['x-ratelimit-remaining'];
    const reset = headers['x-ratelimit-reset'];
    
    if (remaining) {
      this.rateLimitRemaining = parseInt(remaining, 10);
    }
    
    if (reset) {
      const resetTime = parseInt(reset, 10) * 1000; // Convert to milliseconds
      this.rateLimitResetAt = new Date(resetTime);
    }
    
    // If we're close to rate limit, wait before proceeding
    if (this.rateLimitRemaining < 10) {
      const now = Date.now();
      const resetTime = this.rateLimitResetAt.getTime();
      const waitTime = Math.max(0, resetTime - now) + 1000; // Add 1s buffer
      
      if (waitTime > 0) {
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }
  
  protected initializeRateLimits(): void {
    if (this.config.rateLimit) {
      this.rateLimitRemaining = this.config.rateLimit.remaining || 60;
      this.rateLimitResetAt = this.config.rateLimit.resetAt || new Date(Date.now() + 3600000);
    }
  }
  
  protected validatePostContent(post: Post): void {
    if (!post.content.text && !post.content.mediaUrls?.length) {
      throw new Error('Post must have either text or media content');
    }
    
    if (post.content.text && post.content.text.length > 1000) {
      throw new Error('Post text exceeds maximum length of 1000 characters');
    }
    
    if (post.content.mediaUrls && post.content.mediaUrls.length > 10) {
      throw new Error('Maximum of 10 media items allowed per post');
    }
  }
  
  protected formatHashtags(hashtags: string[] = []): string {
    return hashtags
      .map(tag => tag.startsWith('#') ? tag : `#${tag}`)
      .join(' ');
  }
}

/**
 * Mock platform client for testing
 */
export class MockPlatformClient extends BasePlatformClient {
  private publishedPosts: Map<string, Post> = new Map();
  
  async publish(post: Post): Promise<PlatformPostResponse> {
    this.validatePostContent(post);
    
    const platformPostId = `mock_${Date.now()}`;
    this.publishedPosts.set(platformPostId, post);
    
    return {
      id: platformPostId,
      url: `https://mock.social/posts/${platformPostId}`,
      publishedAt: new Date(),
      platform: post.platform,
      metadata: {}
    };
  }
  
  async update(post: Post, platformPostId: string): Promise<PlatformPostResponse> {
    if (!this.publishedPosts.has(platformPostId)) {
      throw new Error('Post not found');
    }
    
    this.validatePostContent(post);
    this.publishedPosts.set(platformPostId, post);
    
    return {
      id: platformPostId,
      url: `https://mock.social/posts/${platformPostId}`,
      publishedAt: new Date(),
      platform: post.platform,
      metadata: { updated: true }
    };
  }
  
  async delete(platformPostId: string): Promise<boolean> {
    return this.publishedPosts.delete(platformPostId);
  }
  
  async getAnalytics(platformPostId: string): Promise<any> {
    if (!this.publishedPosts.has(platformPostId)) {
      throw new Error('Post not found');
    }
    
    return {
      views: Math.floor(Math.random() * 1000),
      likes: Math.floor(Math.random() * 100),
      shares: Math.floor(Math.random() * 50),
      comments: Math.floor(Math.random() * 20)
    };
  }
}

// Export platform client factory
export function createPlatformClient(platform: string, config: PlatformConfig): PlatformClient {
  // In a real implementation, this would return the appropriate client based on the platform
  // For now, we'll just return a mock client
  return new MockPlatformClient(config);
}
