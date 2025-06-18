// difficult: TikTok API client implementation
import { BasePlatformClient } from './BasePlatformClient';
import { PostMetrics, PaginatedResponse, Pagination, Platform, ApiError, ApiResponse } from '../types';
import { AuthTokenManagerService } from '../AuthTokenManagerService';
import { MonitoringSystem } from '../monitoring/MonitoringSystem';
import { OAuth2Credentials } from '../authTypes';

interface TikTokVideo {
  id: string;
  create_time: number;
  stats: {
    play_count: number;
    digg_count: number;
    comment_count: number;
    share_count: number;
    play_time: number;
  };
  /**
   * The description of the video (not a subtitle). This is the main caption/description field.
   */
  desc?: string;
  video_url: string;
  [key: string]: any; // For any additional fields
}

// Extend the base Pagination interface to include TikTok-specific fields
interface TikTokPagination extends Pagination {
  cursor: string | null;
  has_more: boolean;
}

interface TikTokVideoListResponse {
  videos: TikTokVideo[];
  cursor: string | null;
  has_more: boolean;
}

interface TikTokUserInfoResponse {
  user: {
    id: string;
    follower_count: number;
    [key: string]: any;
  };
}

interface TikTokBatchVideoResponse {
  data: {
    videos: TikTokVideo[];
  };
  error?: {
    code: string;
    message: string;
  };
}

export class TikTokClient extends BasePlatformClient {
  private readonly API_BASE = 'https://open.tiktokapis.com/v2';
  private authTokenManager: AuthTokenManagerService;
  private monitoringSystem: MonitoringSystem;
  private systemUserId?: string;

  constructor(
    accessToken: string,
    authTokenManager: AuthTokenManagerService,
    monitoringSystem: MonitoringSystem,
    systemUserId?: string
  ) {
    super(accessToken, Platform.TIKTOK);
    this.authTokenManager = authTokenManager;
    this.monitoringSystem = monitoringSystem;
    this.systemUserId = systemUserId;
  }

  async getPostMetrics(postId: string): Promise<PostMetrics> {
    const operation = 'TikTokClient.getPostMetrics';
    return this.monitoringSystem.monitor(
      operation,
      async (span) => {
        const credentials = await this.getCredentials();
        if (!credentials) {
          throw new Error('TikTok credentials not available.');
        }
        const response = await fetch(`${this.API_BASE}/video/query/?video_ids=${postId}`, {
          headers: {
            'Authorization': `Bearer ${credentials.accessToken}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          span.recordException(new Error(`TikTok API error: ${response.statusText} - ${errorData.error?.message}`));
          throw new Error(
            `TikTok API error: ${response.statusText} - ${errorData.error?.message || 'Unknown error'}`
          );
        }

        const data = await response.json();
        const video = data.data.videos[0] as TikTokVideo;
        
        return this.mapToPostMetrics(video);
      },
      { 
        recordMetrics: true,
        alertOnError: true,
        errorSeverity: 'critical'
      }
    );
  }

  /**
   * Fetches a user's posts with pagination support
   * @param userId The TikTok user ID
   * @param lookbackDays Number of days to look back for posts (default: 30)
   * @param maxPages Maximum number of pages to fetch (default: 10)
   * @param maxResultsPerPage Maximum number of results per page (default: 20, max: 50)
   * @returns Promise with array of PostMetrics and pagination info
   */
  async getUserPosts(
    userId: string, 
    lookbackDays: number = 30,
    maxPages: number = 10,
    maxResultsPerPage: number = 20
  ): Promise<PaginatedResponse<PostMetrics>> {
    const operation = 'TikTokClient.getUserPosts';
    return this.monitoringSystem.monitor(
      operation,
      async (span) => {
        const credentials = await this.getCredentials();
        if (!credentials) {
          throw new Error('TikTok credentials not available.');
        }

        const endTime = Math.floor(Date.now() / 1000);
        const startTime = endTime - (lookbackDays * 24 * 60 * 60);
        
        let cursor: string | null = null;
        let hasMore = true;
        let page = 0;
        const allVideos: TikTokVideo[] = [];
        
        while (hasMore && page < maxPages) {
          page++;
          const params = new URLSearchParams({
            user_id: userId,
            start_time: startTime.toString(),
            end_time: endTime.toString(),
            max_count: Math.min(maxResultsPerPage, 50).toString(),
            ...(cursor ? { cursor } : {})
          });

          const response = await fetch(
            `${this.API_BASE}/video/list/?${params.toString()}`,
            {
              headers: {
                'Authorization': `Bearer ${credentials.accessToken}`,
                'Content-Type': 'application/json'
              }
            }
          );

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            span.recordException(new Error(`TikTok API error: ${response.status} - ${errorData.error?.message}`));
            throw new Error(
              `TikTok API error (${response.status}): ${errorData.error?.message || response.statusText}`
            );
          }

          const data: TikTokVideoListResponse = await response.json();
          
          if (data.videos && data.videos.length > 0) {
            allVideos.push(...data.videos);
          }
          
          cursor = data.cursor || null;
          hasMore = data.has_more && !!cursor;
          
          // If we've reached the lookback period, we can stop
          if (data.videos.length === 0 || 
              (data.videos[data.videos.length - 1].create_time < startTime)) {
            hasMore = false;
          }
        }
        
        // Process videos in batches to get detailed metrics
        const BATCH_SIZE = 5; // Process 5 videos at a time
        const DELAY_BETWEEN_BATCHES_MS = 1000; // 1 second between batches
        
        const posts = await this.processInBatches<TikTokVideo, PostMetrics>(
          allVideos,
          BATCH_SIZE,
          // Using a direct fetch here to avoid circular dependency with getPostMetrics
          // and allow for more granular error handling within the batch processing.
          async (video) => {
            try {
              const videoMetrics = await this.getPostMetrics(video.id); // Use the monitored method
              return videoMetrics;
            } catch (error) {
              this.monitoringSystem.getAlertManager().fireAlert(
                'tiktok_post_metrics_fetch_failed',
                `Failed to fetch metrics for video ${video.id}: ${error.message}`,
                'error',
                { videoId: video.id, error: error.message }
              );
              // Return a partial PostMetrics or re-throw based on desired error handling strategy
              return this.mapToPostMetrics(video); // Return base metrics if detailed fetch fails
            }
          },
          DELAY_BETWEEN_BATCHES_MS
        );
        
        // Ensure we have valid pagination values
        const pageSize = Math.min(maxResultsPerPage, posts.length);
        const totalPages = Math.ceil(posts.length / maxResultsPerPage);
        
        return {
          data: posts,
          pagination: {
            cursor: cursor || null,
            hasMore,
            pageSize,
            page: Math.min(maxPages, totalPages),
            total: posts.length
          }
        };
      },
      { 
        recordMetrics: true,
        alertOnError: true,
        errorSeverity: 'critical'
      }
    );
  }
  
  /**
   * Fetches detailed metrics for multiple video IDs in a single batch request
   * @param videoIds Array of video IDs to fetch metrics for
   */
  private async getBatchVideoMetrics(videoIds: string[]): Promise<PostMetrics[]> {
    const operation = 'TikTokClient.getBatchVideoMetrics';
    return this.monitoringSystem.monitor(
      operation,
      async (span) => {
        if (videoIds.length === 0) return [];
        const credentials = await this.getCredentials();
        if (!credentials) {
          throw new Error('TikTok credentials not available.');
        }
        
        const response = await fetch(
          `${this.API_BASE}/video/query/?video_ids=${videoIds.join(',')}`,
          {
            headers: {
              'Authorization': `Bearer ${credentials.accessToken}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          span.recordException(new Error(`TikTok batch API error: ${response.status} - ${errorData.error?.message}`));
          throw new Error(
            `TikTok batch API error (${response.status}): ${errorData.error?.message || response.statusText}`
          );
        }
        
        const data: TikTokBatchVideoResponse = await response.json();
        
        if (data.error) {
          span.recordException(new Error(`TikTok batch API error: ${data.error.message}`));
          throw new Error(`TikTok batch API error: ${data.error.message}`);
        }
        
        return data.data.videos.map(video => this.mapToPostMetrics(video));
      },
      { 
        recordMetrics: true,
        alertOnError: true,
        errorSeverity: 'error'
      }
    );
  }

  /**
   * Fetches posts from a competitor's profile
   * @param username TikTok username
   * @param lookbackDays Number of days to look back for posts (default: 30)
   * @param maxPages Maximum number of pages to fetch (default: 10)
   * @param maxResultsPerPage Maximum number of results per page (default: 20)
   * @returns Promise with array of PostMetrics and pagination info
   */
  async getCompetitorPosts(
    username: string, 
    lookbackDays: number = 30,
    maxPages: number = 10,
    maxResultsPerPage: number = 20
  ): Promise<PaginatedResponse<PostMetrics>> {
    const operation = 'TikTokClient.getCompetitorPosts';
    return this.monitoringSystem.monitor(
      operation,
      async (span) => {
        const credentials = await this.getCredentials();
        if (!credentials) {
          throw new Error('TikTok credentials not available.');
        }
        // First, get the user ID from username
        const userResponse = await fetch(`${this.API_BASE}/user/info/username/${username}`, {
          headers: {
            'Authorization': `Bearer ${credentials.accessToken}`,
            'Content-Type': 'application/json'
          }
        });

        if (!userResponse.ok) {
          const errorData = await userResponse.json().catch(() => ({}));
          span.recordException(new Error(`Failed to get user ID for ${username}: ${userResponse.status} - ${errorData.error?.message}`));
          throw new Error(
            `Failed to get user ID for ${username}: ${userResponse.status} - ${errorData.error?.message || userResponse.statusText}`
          );
        }

        const userData: { data: TikTokUserInfoResponse } = await userResponse.json();
        const userId = userData.data.user.id;
        
        // Then get their posts with pagination
        return this.getUserPosts(userId, lookbackDays, maxPages, maxResultsPerPage);
      },
      { 
        recordMetrics: true,
        alertOnError: true,
        errorSeverity: 'critical'
      }
    );
  }

  private mapToPostMetrics(video: TikTokVideo): PostMetrics {
    if (!video) {
      throw new Error('Invalid video data provided to mapToPostMetrics');
    }
    
    const hashtags = video.desc ? this.extractHashtags(video.desc) : [];
    const timestamp = new Date(video.create_time * 1000);

    return {
      postId: video.id,
      platform: Platform.TIKTOK,
      timestamp: timestamp.toISOString(),
      metrics: {
        views: video.stats.play_count,
        likes: video.stats.digg_count,
        comments: video.stats.comment_count,
        shares: video.stats.share_count,
        engagementRate: this.calculateEngagementRate({
          likes: video.stats.digg_count,
          comments: video.stats.comment_count,
          shares: video.stats.share_count,
          views: video.stats.play_count,
          followerCount: 0 // TikTok API doesn't provide this directly per video
        }),
      },
      contentType: 'video', // TikTok is primarily video
      caption: video.desc,
      hashtags: hashtags,
      url: video.video_url,
      // Add other relevant fields if available in TikTokVideo
    };
  }

  private extractHashtags(caption: string): string[] {
    const hashtagRegex = /#(\w+)/g;
    const matches = caption.match(hashtagRegex);
    return matches ? matches.map(match => match.substring(1)) : [];
  }

  /**
   * Placeholder for fetching comments for a given post.
   * TikTok API for comments is highly restricted and often requires special permissions.
   * For now, this will return mock data.
   * @param postId The ID of the post.
   * @returns A promise resolving to an array of mock comments.
   */
  async getPostComments(postId: string): Promise<any[]> {
    console.warn(`[TikTokClient] getPostComments is a placeholder and returns mock data. TikTok API for comments is restricted.`);
    return this.monitoringSystem.monitor(
      'TikTokClient.getPostComments',
      async (span) => {
        // Simulate API call and latency
        await new Promise(resolve => setTimeout(resolve, 200));
        const mockComments = [
          { id: `comment-${postId}-1`, text: 'Great video!', author: 'user_A', timestamp: new Date().toISOString() },
          { id: `comment-${postId}-2`, text: 'Loved it!', author: 'user_B', timestamp: new Date().toISOString() },
          { id: `comment-${postId}-3`, text: 'Very insightful.', author: 'user_C', timestamp: new Date().toISOString() },
        ];
        span.setAttribute('mock_data', true);
        span.setAttribute('post_id', postId);
        return mockComments;
      },
      {
        recordMetrics: true,
        alertOnError: false, // This is mock, so no critical alerts
        errorSeverity: 'info'
      }
    );
  }

  private async getCredentials(): Promise<OAuth2Credentials | null> {
    if (!this.systemUserId) {
      throw new Error('systemUserId is required for fetching credentials.');
    }
    const credentials = await this.authTokenManager.getValidCredentials(Platform.TIKTOK, this.systemUserId);
    if (!credentials || credentials.strategy !== 'oauth2') {
      this.monitoringSystem.getAlertManager().fireAlert(
        'tiktok_auth_failed',
        `No valid OAuth2 credentials found for TikTok and user ${this.systemUserId}`,
        'critical',
        { userId: this.systemUserId, platform: Platform.TIKTOK }
      );
      return null;
    }
    return credentials;
  }
}
