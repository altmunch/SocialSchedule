// difficult: YouTube Data API has complex quota system and requires careful quota management
// Be mindful of quota costs for each API call

import { BasePlatformClient } from './base-platform';
import { ApiConfig, ApiCredentials, ApiResponse, PlatformPostMetrics, PlatformUserActivity } from './types';

export class YouTubeClient extends BasePlatformClient {
  private static readonly DEFAULT_CONFIG: ApiConfig = {
    baseUrl: 'https://www.googleapis.com/youtube/v3',
    version: 'v3',
    rateLimit: {
      requests: 10000,  // YouTube's quota limit is the main constraint, not request rate
      perSeconds: 60
    }
  };

  private channelId: string | null = null;

  constructor(credentials: ApiCredentials, config: Partial<ApiConfig> = {}) {
    super({ ...YouTubeClient.DEFAULT_CONFIG, ...config }, credentials);
  }

  protected getAuthHeaders(): Record<string, string> {
    return {
      'Authorization': `Bearer ${this.credentials.accessToken}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    };
  }

  protected handleRateLimit(headers: Headers): void {
    // YouTube uses quota system rather than rate limits
    const quotaUser = headers.get('quota-user');
    const quotaRemaining = headers.get('x-ratelimit-remaining');
    
    if (quotaRemaining && parseInt(quotaRemaining, 10) < 100) {
      // If we're running low on quota, add a delay
      const waitTime = 60000; // 1 minute
      this.rateLimitQueue.unshift(() => 
        new Promise(resolve => setTimeout(resolve, waitTime))
      );
    }
  }

  private async ensureChannelId(): Promise<string> {
    if (this.channelId) return this.channelId;
    
    const url = `${this.config.baseUrl}/channels?part=id&mine=true`;
    const response = await fetch(url, {
      headers: this.getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch channel ID');
    }
    
    const data = await response.json();
    this.channelId = data.items?.[0]?.id || null;
    
    if (!this.channelId) {
      throw new Error('No channel found for the authenticated user');
    }
    
    return this.channelId;
  }

  async getPostMetrics(videoId: string): Promise<ApiResponse<PlatformPostMetrics>> {
    const url = `${this.config.baseUrl}/videos?part=statistics,contentDetails,snippet&id=${videoId}`;
    
    return this.enqueueRequest<PlatformPostMetrics>(async () => {
      const response = await fetch(url, {
        headers: this.getAuthHeaders()
      });

      const data = await response.json();
      
      if (!response.ok) {
        return response;
      }

      const video = data.items?.[0];
      if (!video) {
        return new Response(JSON.stringify({
          error: {
            code: 404,
            message: 'Video not found'
          }
        }), { status: 404 });
      }

      const stats = video.statistics;
      const duration = this.parseDuration(video.contentDetails?.duration);
      
      // Transform YouTube's response to our standard format
      return new Response(JSON.stringify({
        id: videoId,
        views: parseInt(stats.viewCount || '0', 10),
        likes: parseInt(stats.likeCount || '0', 10),
        comments: parseInt(stats.commentCount || '0', 10),
        shares: 0, // YouTube doesn't provide share count directly
        avgWatchTime: duration,
        timestamp: video.snippet?.publishedAt,
        engagementRate: this.calculateEngagementRate(stats)
      }), {
        status: 200,
        headers: response.headers
      });
    });
  }

  async getUserActivity(): Promise<ApiResponse<PlatformUserActivity>> {
    const channelId = await this.ensureChannelId();
    const url = `${this.config.baseUrl}/channels?part=statistics,snippet&id=${channelId}`;
    
    return this.enqueueRequest<PlatformUserActivity>(async () => {
      const response = await fetch(url, {
        headers: this.getAuthHeaders()
      });

      const data = await response.json();
      
      if (!response.ok) {
        return response;
      }

      const channel = data.items?.[0];
      if (!channel) {
        return new Response(JSON.stringify({
          error: {
            code: 404,
            message: 'Channel not found'
          }
        }), { status: 404 });
      }

      const stats = channel.statistics;
      
      // Transform YouTube's response to our standard format
      return new Response(JSON.stringify({
        followerCount: parseInt(stats.subscriberCount || '0', 10),
        followingCount: 0, // YouTube doesn't provide following count via API
        postCount: parseInt(stats.videoCount || '0', 10),
        lastUpdated: new Date().toISOString()
      }), {
        status: 200,
        headers: response.headers
      });
    });
  }

  private parseDuration(isoDuration: string): number | undefined {
    if (!isoDuration) return undefined;
    
    // Parse ISO 8601 duration format (e.g., PT1H2M3S)
    const match = isoDuration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
    if (!match) return undefined;
    
    const hours = parseInt(match[1]) || 0;
    const minutes = parseInt(match[2]) || 0;
    const seconds = parseInt(match[3]) || 0;
    
    return hours * 3600 + minutes * 60 + seconds;
  }

  private calculateEngagementRate(stats: any): number {
    if (!stats) return 0;
    
    const views = parseInt(stats.viewCount || '1', 10);
    const likes = parseInt(stats.likeCount || '0', 10);
    const comments = parseInt(stats.commentCount || '0', 10);
    
    // Basic engagement rate calculation (can be customized)
    return ((likes + comments) / views) * 100;
  }

  // Additional YouTube-specific methods
  async getVideoAnalytics(videoId: string) {
    const url = `${this.config.baseUrl}/videos?part=statistics,contentDetails,status&id=${videoId}`;
    
    return this.enqueueRequest<any>(async () => {
      const response = await fetch(url, {
        headers: this.getAuthHeaders()
      });

      return response;
    });
  }
}
