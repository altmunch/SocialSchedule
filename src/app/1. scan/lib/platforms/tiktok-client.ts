// difficult: TikTok API has strict rate limits and authentication requirements
// Ensure proper error handling for rate limits and token refreshes

import { BasePlatformClient } from './base-platform';
import { ApiConfig, ApiCredentials, ApiResponse, PlatformPostMetrics, PlatformUserActivity } from './types';

export class TikTokClient extends BasePlatformClient {
  private static readonly DEFAULT_CONFIG: ApiConfig = {
    baseUrl: 'https://open.tiktokapis.com',
    version: 'v2',
    rateLimit: {
      requests: 5,  // TikTok's standard rate limit
      perSeconds: 1
    }
  };

  constructor(credentials: ApiCredentials, config: Partial<ApiConfig> = {}) {
    super({ ...TikTokClient.DEFAULT_CONFIG, ...config }, credentials);
  }

  protected getAuthHeaders(): Record<string, string> {
    return {
      'Authorization': `Bearer ${this.credentials.accessToken}`,
      'Content-Type': 'application/json'
    };
  }

  protected handleRateLimit(headers: Headers): void {
    const remaining = headers.get('X-RateLimit-Remaining');
    const reset = headers.get('X-RateLimit-Reset');
    
    if (remaining === '0' && reset) {
      const resetTime = parseInt(reset, 10) * 1000; // Convert to milliseconds
      const now = Date.now();
      const waitTime = Math.max(0, resetTime - now);
      
      if (waitTime > 0) {
        // Pause the queue until rate limit resets
        this.rateLimitQueue.unshift(() => 
          new Promise(resolve => setTimeout(resolve, waitTime))
        );
      }
    }
  }

  async getPostMetrics(postId: string): Promise<ApiResponse<PlatformPostMetrics>> {
    const url = `${this.config.baseUrl}/${this.config.version}/video/query/`;
    
    return this.enqueueRequest<PlatformPostMetrics>(async () => {
      const response = await fetch(url, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          filters: {
            video_ids: [postId]
          },
          fields: [
            'id',
            'view_count',
            'like_count',
            'comment_count',
            'share_count',
            'average_watch_time',
            'create_time'
          ]
        })
      });

      return response;
    });
  }

  async getUserActivity(): Promise<ApiResponse<PlatformUserActivity>> {
    const url = `${this.config.baseUrl}/${this.config.version}/user/info/`;
    
    return this.enqueueRequest<PlatformUserActivity>(async () => {
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      const data = await response.json();
      
      if (!response.ok) {
        return response;
      }

      // Transform TikTok's response to our standard format
      const userData = data.data?.user || {};
      return new Response(JSON.stringify({
        followerCount: userData.follower_count || 0,
        followingCount: userData.following_count || 0,
        postCount: userData.video_count || 0,
        lastUpdated: new Date().toISOString()
      }), {
        status: 200,
        headers: response.headers
      });
    });
  }

  // Additional TikTok-specific methods can be added here
  async getVideoAnalytics(videoId: string) {
    const url = `${this.config.baseUrl}/${this.config.version}/video/analytics/`;
    
    return this.enqueueRequest<any>(async () => {
      const response = await fetch(url, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          video_id: videoId,
          metrics: [
            'play_count',
            'total_play_time',
            'unique_play_time',
            'average_play_time',
            'total_replay_count'
          ]
        })
      });

      return response;
    });
  }
}
