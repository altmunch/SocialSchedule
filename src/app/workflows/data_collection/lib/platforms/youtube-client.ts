// difficult: YouTube Data API has complex quota system and requires careful quota management
// Be mindful of quota costs for each API call

import { BasePlatformClient, HeaderValue } from './base-platform';
import { ApiConfig, ApiResponse, PlatformComment, PlatformPostMetrics, PlatformUserActivity, PlatformPost } from './types';
import { YouTubeCommentThreadListResponseSchema, YouTubeCommentThread, YouTubeChannelListResponseSchema, YouTubeChannelListResponse, YouTubeVideoListResponseSchema, YouTubeVideoListResponse, YouTubeVideo } from './youtube.types';
import { Platform } from '../../../deliverables/types/deliverables_types';
import { IAuthTokenManager } from '../auth.types';

export class YouTubeClient extends BasePlatformClient {
  public readonly platform: Platform = Platform.YOUTUBE;
  private static readonly DEFAULT_CONFIG: ApiConfig = {
    baseUrl: 'https://www.googleapis.com/youtube/v3',
    version: 'v3',
    rateLimit: {
      requests: 10000,  // YouTube's quota limit is the main constraint, not request rate
      perSeconds: 60
    }
  };

  private channelId: string | null = null;

  constructor(config: Partial<ApiConfig> = {}, authTokenManager: IAuthTokenManager, userId?: string) {
    super({ ...YouTubeClient.DEFAULT_CONFIG, ...config }, authTokenManager, userId);
  }

  protected handleRateLimit(headers: Record<string, HeaderValue>): void {
    // YouTube uses a quota system. BasePlatformClient handles generic rate limit delays.
    // This method can be used to parse YouTube-specific quota headers and log them or update internal state if needed.
    const quotaUser = headers['x-goog-quota-user'] as string || headers['quota-user'] as string; // Google often uses 'x-goog-quota-user'
    const quotaRemaining = headers['x-ratelimit-remaining'] as string; // This header might not be standard for YouTube API quota

    this.log('debug', 'YouTube handleRateLimit called.', { quotaUser, quotaRemaining, allHeaders: headers });

    // Example: Update internal rateLimit object if specific headers are present
    // const limit = headers['x-youtube-quota-limit'] ? parseInt(headers['x-youtube-quota-limit'] as string, 10) : undefined;
    // const remaining = headers['x-youtube-quota-remaining'] ? parseInt(headers['x-youtube-quota-remaining'] as string, 10) : undefined;
    // const reset = headers['x-youtube-quota-reset'] ? parseInt(headers['x-youtube-quota-reset'] as string, 10) : undefined; // Assuming reset is a timestamp

    // if (limit !== undefined && remaining !== undefined && reset !== undefined) {
    //   this.rateLimit = { limit, remaining, reset };
    //   this.log('info', `YouTube quota updated: ${remaining}/${limit}, resets at ${new Date(reset * 1000).toISOString()}`);
    // } else if (quotaRemaining && parseInt(quotaRemaining, 10) < 100) {
    //   this.log('warn', `Low YouTube quota detected (generic header): ${quotaRemaining}. BaseClient handles retries/delays.`);
    // }
  }

  private async ensureChannelId(): Promise<string> {
    if (this.channelId) return this.channelId;

    const url = `${this.config.baseUrl}/channels`;
    try {
      const response = await this.request<YouTubeChannelListResponse>({
        url,
        method: 'GET',
        params: { part: 'id', mine: true },
      });

      // BasePlatformClient's request method throws for non-2xx, so response.data should exist.
      // Zod validation for the actual data structure
      const validationResult = YouTubeChannelListResponseSchema.safeParse(response.data);
      if (!validationResult.success) {
        this.log('error', 'ensureChannelId response validation failed', { error: validationResult.error.flatten(), data: response.data });
        throw new Error('Failed to validate channel ID response from YouTube.');
      }

      const channelData = validationResult.data;
      this.channelId = channelData.items?.[0]?.id || null;

      if (!this.channelId) {
        this.log('error', 'No channel ID found for the authenticated user in YouTube response.', { data: channelData });
        throw new Error('No channel found for the authenticated user on YouTube.');
      }
      return this.channelId;
    } catch (error: any) {
      this.log('error', 'Failed to fetch YouTube channel ID', { error: error.message, stack: error.stack });
      // Re-throw or handle as a more specific PlatformError if BaseClient doesn't already
      throw new Error(`Failed to fetch YouTube channel ID: ${error.message}`);
    }
  }

  async getPostMetrics(videoId: string): Promise<ApiResponse<PlatformPostMetrics>> {
    const url = `${this.config.baseUrl}/videos`;
    try {
      const response = await this.request<YouTubeVideoListResponse>({
        url,
        method: 'GET',
        params: { part: 'snippet,statistics,contentDetails', id: videoId },
      });

      const validationResult = YouTubeVideoListResponseSchema.safeParse(response.data);
      if (!validationResult.success) {
        this.log('error', `getPostMetrics response validation failed for video ${videoId}`, { error: validationResult.error.flatten(), data: response.data });
        return ApiResponse.error('Failed to validate video metrics response from YouTube.', 500, validationResult.error.flatten());
      }

      const videoData = validationResult.data;
      const video: YouTubeVideo | undefined = videoData.items?.[0];

      if (!video) {
        this.log('warn', `Video not found: ${videoId}`, { responseData: videoData });
        return ApiResponse.error('Video not found', 404);
      }

      return ApiResponse.success({
        postId: video.id,
        platform: Platform.YOUTUBE,
        likeCount: parseInt(video.statistics?.likeCount || '0', 10),
        commentCount: parseInt(video.statistics?.commentCount || '0', 10),
        viewCount: parseInt(video.statistics?.viewCount || '0', 10),
        shareCount: 0, // YouTube API does not provide share count directly
        saveCount: parseInt(video.statistics?.favoriteCount || '0', 10), // Favorite count as a proxy for saves
        publishedAt: video.snippet?.publishedAt ? new Date(video.snippet.publishedAt) : new Date(),
        sourceData: video,
      });
    } catch (error: any) {
      this.log('error', `Failed to fetch YouTube post metrics for video ${videoId}`, { error: error.message, stack: error.stack });
      // BasePlatformClient's request method should convert AxiosError to ApiResponse.error
      // If it's a different error, we might need to wrap it manually or ensure BaseClient does.
      if (error.isAxiosError && error.response) {
        return ApiResponse.error(`YouTube API Error: ${error.response.data?.error?.message || error.message}`, error.response.status, error.response.data);
      }
      return ApiResponse.error(`Failed to fetch post metrics: ${error.message}`, 500);
    }
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

  async getUserVideos(options?: {
    userId?: string;
    cursor?: string;
    limit?: number;
  }): Promise<ApiResponse<{ posts: PlatformPost[]; nextPageCursor?: string; hasMore?: boolean }>> {
    // Stub implementation for interface compatibility
    this.log('warn', '[YouTubeClient] getUserVideos called but not fully implemented');
    
    return {
      data: {
        posts: [],
        nextPageCursor: undefined,
        hasMore: false,
      },
      rateLimit: this.rateLimit || undefined,
    };
  }

  async getVideoComments(
    videoId: string,
    options?: { cursor?: string; limit?: number }
  ): Promise<ApiResponse<{ comments: PlatformComment[]; nextPageCursor?: string; hasMore?: boolean }>> {
    const { cursor: pageToken, limit = 20 } = options || {};
    const url = new URL(`${this.config.baseUrl}/commentThreads`);
    url.searchParams.append('part', 'snippet,replies');
    url.searchParams.append('videoId', videoId);
    url.searchParams.append('maxResults', limit.toString());
    url.searchParams.append('order', 'relevance'); // Or 'time' for newest first
    if (pageToken) {
      url.searchParams.append('pageToken', pageToken);
    }

    return this.enqueueRequest<{
      comments: PlatformComment[];
      nextPageCursor?: string;
      hasMore?: boolean;
    }>(async () => {
      const response = await fetch(url.toString(), {
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        // Let BasePlatformClient handle standard error parsing
        return response;
      }

      const rawData = await response.json();
      const validationResult = YouTubeCommentThreadListResponseSchema.safeParse(rawData);

      if (!validationResult.success) {
        console.error('YouTube API getVideoComments response validation error:', validationResult.error);
        return new Response(JSON.stringify({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Failed to validate YouTube comment threads response.',
            details: validationResult.error.flatten(),
          }
        }), { status: 500 });
      }

      const youtubeData = validationResult.data;
      const comments: PlatformComment[] = (youtubeData.items || []).map((item: YouTubeCommentThread): PlatformComment => ({
        id: item.id,
        postId: videoId,
        userId: item.snippet?.topLevelComment?.snippet?.authorChannelId?.value,
        userName: item.snippet?.topLevelComment?.snippet?.authorDisplayName,
        userProfileImageUrl: item.snippet?.topLevelComment?.snippet?.authorProfileImageUrl,
        text: item.snippet?.topLevelComment?.snippet?.textOriginal || '',
        likeCount: item.snippet?.topLevelComment?.snippet?.likeCount,
        replyCount: item.snippet?.totalReplyCount,
        publishedAt: item.snippet?.topLevelComment?.snippet?.publishedAt || new Date().toISOString(),
        updatedAt: item.snippet?.topLevelComment?.snippet?.updatedAt,
        platform: Platform.YOUTUBE,
        sourceData: item,
      }));

      return new Response(JSON.stringify({
        comments,
        nextPageCursor: youtubeData.nextPageToken,
        hasMore: !!youtubeData.nextPageToken,
      }), {
        status: 200,
        headers: response.headers, // Preserve original headers for rate limiting etc.
      });
    });
  }
}
