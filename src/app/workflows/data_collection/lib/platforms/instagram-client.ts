// difficult: Instagram's Graph API requires long-lived tokens and has complex permissions
// Pay special attention to token expiration and permission scopes

import { BasePlatformClient } from './base-platform';
import { ApiConfig, ApiCredentials, ApiResponse, PlatformPostMetrics, PlatformUserActivity } from './types';

export class InstagramClient extends BasePlatformClient {
  protected readonly platform = 'INSTAGRAM' as any;
  private static readonly DEFAULT_CONFIG: ApiConfig = {
    baseUrl: 'https://graph.instagram.com',
    version: 'v12.0',
    rateLimit: {
      requests: 200,  // Instagram's standard rate limit
      perSeconds: 60  // Per hour, but we'll handle it per minute for better distribution
    }
  };

  private _platformUserId: string | null = null;
  
  // Getter for platform user ID
  private get platformUserId(): string {
    if (!this._platformUserId) {
      throw new Error('Platform User ID not initialized. Call ensureUserId() first.');
    }
    return this._platformUserId;
  }
  
  // Setter for platform user ID
  private set platformUserId(value: string) {
    this._platformUserId = value;
  }

  constructor(authTokenManager: any, userId?: string, config: Partial<ApiConfig> = {}) {
    super({ ...InstagramClient.DEFAULT_CONFIG, ...config }, authTokenManager, userId);
  }

  protected async getAuthHeaders(): Promise<Record<string, string>> {
    const credentials = await this.authTokenManager.getValidCredentials({ platform: this.platform, userId: this.userId });
    if (!credentials) {
      throw new Error('No valid credentials found');
    }
    return {
      'Authorization': `Bearer ${(credentials as any).accessToken}`,
      'Content-Type': 'application/json'
    };
  }

  protected handleRateLimit(headers: Headers): void {
    const usage = headers.get('X-App-Usage');
    if (!usage) return;

    try {
      const { call_count, total_cputime, total_time } = JSON.parse(usage);
      const threshold = 80; // Percentage threshold to start throttling
      
      // If any metric is above threshold, add a delay
      if (call_count > threshold || total_cputime > threshold || total_time > threshold) {
        const waitTime = 60000; // 1 minute
        this.rateLimitQueue.unshift(() => 
          new Promise(resolve => setTimeout(resolve, waitTime))
        );
      }
    } catch (error) {
      console.error('Failed to parse rate limit headers:', error);
    }
  }

  private async ensureUserId(): Promise<string> {
    if (this._platformUserId) return this.platformUserId;
    
    const url = `${this.config.baseUrl}/me?fields=id`;
    const headers = await this.getAuthHeaders();
    const response = await fetch(url, {
      headers
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch user ID');
    }
    
    const data = await response.json();
    this.platformUserId = data.id;
    return this.platformUserId;
  }

  async getPostMetrics(postId: string): Promise<ApiResponse<PlatformPostMetrics>> {
    const url = `${this.config.baseUrl}/${postId}?fields=id,comments_count,like_count,media_product_type,media_type,media_url,permalink,timestamp,username,caption`;
    
    return this.enqueueRequest<PlatformPostMetrics>(async () => {
      const headers = await this.getAuthHeaders();
      const response = await fetch(url, {
        headers
      });

      const data = await response.json();
      
      if (!response.ok) {
        return response;
      }

      // Transform Instagram's response to our standard format
      return new Response(JSON.stringify({
        id: data.id,
        views: data.video_views || 0, // Only available for video posts
        likes: data.like_count || 0,
        comments: data.comments_count || 0,
        shares: 0, // Instagram doesn't provide share count via API
        timestamp: data.timestamp,
        engagementRate: this.calculateEngagementRate(data)
      }), {
        status: 200,
        headers: response.headers
      });
    });
  }

  async getUserActivity(): Promise<ApiResponse<PlatformUserActivity>> {
    const userId = await this.ensureUserId();
    const url = `${this.config.baseUrl}/${userId}?fields=account_type,media_count,username,media.limit(1){like_count,comments_count}`;
    
    return this.enqueueRequest<PlatformUserActivity>(async () => {
      const headers = await this.getAuthHeaders();
      const response = await fetch(url, {
        headers
      });

      const data = await response.json();
      
      if (!response.ok) {
        return response;
      }

      // Transform Instagram's response to our standard format
      return new Response(JSON.stringify({
        followerCount: data.followers_count || 0, // Requires additional permission
        followingCount: data.follows_count || 0,  // Requires additional permission
        postCount: data.media_count || 0,
        lastUpdated: new Date().toISOString()
      }), {
        status: 200,
        headers: response.headers
      });
    });
  }

  private calculateEngagementRate(postData: any): number {
    if (!postData) return 0;
    
    const likes = postData.like_count || 0;
    const comments = postData.comments_count || 0;
    const views = postData.video_views || 1; // Avoid division by zero
    
    // Basic engagement rate calculation (can be customized)
    return (likes + comments) / views * 100;
  }

  // Additional Instagram-specific methods
  async getMediaInsights(mediaId: string) {
    const url = `${this.config.baseUrl}/${mediaId}/insights?metric=engagement,impressions,reach,saved,video_views`;
    
    return this.enqueueRequest<any>(async () => {
      const headers = await this.getAuthHeaders();
      const response = await fetch(url, {
        headers
      });

      return response;
    });
  }
}
