// difficult: YouTube Data API v3 client implementation
import { BasePlatformClient } from './BasePlatformClient';
import { PostMetrics, PaginatedResponse, Pagination, Platform } from '../types';
import { AuthTokenManagerService } from '../AuthTokenManagerService';
import { MonitoringSystem } from '../monitoring/MonitoringSystem';
import { OAuth2Credentials } from '../authTypes';

interface YouTubeVideo {
  id: string;
  snippet: {
    title: string;
    description: string;
    publishedAt: string;
    thumbnails: {
      default: { url: string };
      medium: { url: string };
      high: { url: string };
    };
    channelTitle: string;
    tags?: string[];
  };
  contentDetails: {
    duration: string;
    dimension: string;
    definition: string;
    caption: string;
  };
  statistics: {
    viewCount: string;
    likeCount: string;
    commentCount: string;
    favoriteCount: string;
  };
  player: {
    embedHtml: string;
  };
  error?: {
    code: number;
    message: string;
    errors: Array<{
      message: string;
      domain: string;
      reason: string;
    }>;
  };
}

interface YouTubePlaylistItem {
  id: string;
  contentDetails: {
    videoId: string;
  };
  snippet: {
    publishedAt: string;
    channelId: string;
    title: string;
    description: string;
    thumbnails: {
      default: { url: string; width: number; height: number };
      medium: { url: string; width: number; height: number };
      high: { url: string; width: number; height: number };
    };
    channelTitle: string;
    playlistId: string;
    position: number;
    resourceId: {
      kind: string;
      videoId: string;
    };
  };
  status?: {
    privacyStatus: string;
  };
}

interface YouTubeChannel {
  id: string;
  contentDetails: {
    relatedPlaylists: {
      uploads: string;
    };
  };
}

interface YouTubePlaylistItemsApiResponse {
  items: YouTubePlaylistItem[];
  nextPageToken?: string;
  prevPageToken?: string;
  pageInfo?: {
    totalResults: number;
    resultsPerPage: number;
  };
}

export class YouTubeClient extends BasePlatformClient {
  private readonly API_BASE = 'https://www.googleapis.com/youtube/v3';
  private readonly SHORTS_MAX_DURATION = 60; // 60 seconds for Shorts
  private readonly MAX_RESULTS = 50; // YouTube API max results per page
  private readonly DEFAULT_LOOKBACK_DAYS = 30;
  private readonly CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour cache TTL
  
  constructor(
    accessToken: string,
    authTokenManager: AuthTokenManagerService,
    monitoringSystem: MonitoringSystem,
    systemUserId?: string
  ) {
    super(accessToken, Platform.YOUTUBE, authTokenManager, monitoringSystem, systemUserId);
  }
  
  /**
   * Fetches posts for a specific YouTube channel
   * @param channelId The YouTube channel ID
   * @param lookbackDays Number of days to look back for posts (default: 30)
   */
  async getUserPosts(
    userId: string, 
    lookbackDays: number = this.DEFAULT_LOOKBACK_DAYS, 
    maxPages: number = 5,
    maxResultsPerPage: number = 20
  ): Promise<PaginatedResponse<PostMetrics>> {
    const operation = 'YouTubeClient.getUserPosts';
    return this.throttleRequest(async (span) => {
      const credentials = await this.getCredentials();
      if (!credentials) {
        throw new Error('YouTube credentials not available.');
      }

      // Get the uploads playlist ID for the channel
      const uploadsPlaylistId = await this.getUploadsPlaylistId(userId);
      span.setAttribute('uploadsPlaylistId', uploadsPlaylistId);
      
      // Get videos from the uploads playlist
      const videos = await this.getVideosFromPlaylist(uploadsPlaylistId, lookbackDays, maxPages, credentials.accessToken);
      
      // Convert to PostMetrics format
      const posts = videos.map(video => this.mapToPostMetrics(video));
      
      return {
        data: posts,
        pagination: {
          total: posts.length,
          hasMore: false, // YouTube API doesn't provide a reliable way to determine if there are more pages
          page: 1,
          pageSize: posts.length,
          cursor: undefined
        }
      };
    }, operation);
  }
  
  /**
   * Fetches posts for a competitor's YouTube channel
   * @param username The competitor's YouTube channel ID
   * @param lookbackDays Number of days to look back for posts (default: 30)
   */
  async getCompetitorPosts(
    username: string, 
    lookbackDays: number = this.DEFAULT_LOOKBACK_DAYS, 
    maxPages: number = 5,
    maxResultsPerPage: number = 20
  ): Promise<PaginatedResponse<PostMetrics>> {
    const operation = 'YouTubeClient.getCompetitorPosts';
    return this.throttleRequest(async (span) => {
      // For competitors, we might not have direct channel ID access easily, 
      // so a public search for the username or a more involved process might be needed.
      // For now, reuse getUserPosts with the assumption that username can be mapped to userId.
      console.warn(`[YouTubeClient] getCompetitorPosts is a placeholder and assumes username can be directly used as userId. Real implementation may vary.`);
      return this.getUserPosts(username, lookbackDays, maxPages, maxResultsPerPage);
    }, operation);
  }
  
  /**
   * Gets metrics for a specific YouTube video
   * @param videoId The YouTube video ID
   */
  async getPostMetrics(videoId: string): Promise<PostMetrics> {
    const operation = 'YouTubeClient.getPostMetrics';
    return this.throttleRequest(async (span) => {
      const credentials = await this.getCredentials();
      if (!credentials) {
        throw new Error('YouTube credentials not available.');
      }
      const url = `${this.API_BASE}/videos?part=snippet,contentDetails,statistics,player&id=${videoId}&key=${credentials.accessToken}`;
      const data = await this.fetchWithRetry<{ items: YouTubeVideo[] }>(url, span); // Pass span for tracing
      
      if (!data.items || data.items.length === 0) {
        throw new Error('Video not found');
      }
      
      const video = data.items[0];
      const metrics = this.mapToPostMetrics(video);
      
      return metrics;
    }, operation);
  }

  /**
   * Gets the uploads playlist ID for a channel
   * @private
   */
  private async getUploadsPlaylistId(channelId: string): Promise<string> {
    const operation = 'YouTubeClient.getUploadsPlaylistId';
    return this.throttleRequest(async (span) => {
      const credentials = await this.getCredentials();
      if (!credentials) {
        throw new Error('YouTube credentials not available.');
      }
      // Check cache first
      const cacheKey = `uploads_playlist_${channelId}`;
      const cached = this.monitoringSystem.getCacheSystem().get('profiles', cacheKey);
      if (cached) {
        span.setAttribute('cache_hit', true);
        return (await cached).uploadsPlaylistId; // Assuming cached data structure matches
      }

      const url = `${this.API_BASE}/channels?part=contentDetails&id=${channelId}&key=${credentials.accessToken}`;
      const data = await this.fetchWithRetry<{ items: YouTubeChannel[] }>(url, span);

      if (!data.items || data.items.length === 0) {
        throw new Error(`Channel ${channelId} not found`);
      }
      const uploadsPlaylistId = data.items[0].contentDetails.relatedPlaylists.uploads;
      
      // Cache the result
      this.monitoringSystem.getCacheSystem().set('profiles', cacheKey, { uploadsPlaylistId }, { ttl: this.CACHE_TTL_MS });
      span.setAttribute('cache_hit', false);
      return uploadsPlaylistId;
    }, operation);
  }
  
  /**
   * Gets videos from a playlist with optional date filtering
   * @private
   */
  private async getVideosFromPlaylist(playlistId: string, lookbackDays: number, maxPagesToFetch: number = 5, accessToken: string): Promise<YouTubeVideo[]> {
    const operation = 'YouTubeClient.getVideosFromPlaylist';
    return this.throttleRequest(async (span) => {
      const allVideos: YouTubeVideo[] = [];
      let nextPageToken: string | undefined = undefined;
      let pagesFetched = 0;
      const publishedAfter = new Date(Date.now() - lookbackDays * 24 * 60 * 60 * 1000).toISOString();

      while (pagesFetched < maxPagesToFetch) {
        const url = `${this.API_BASE}/playlistItems?part=snippet,contentDetails&playlistId=${playlistId}&maxResults=${this.MAX_RESULTS}&key=${accessToken}${nextPageToken ? `&pageToken=${nextPageToken}` : ''}`;
        const data = await this.fetchWithRetry<{ items: YouTubePlaylistItem[], nextPageToken?: string }>(url, span);

        if (!data.items) {
          break; // No more items or an error occurred
        }

        // Filter videos by published date if lookbackDays is used
        const filteredItems = data.items.filter(item => 
          new Date(item.snippet.publishedAt) >= new Date(publishedAfter)
        );
        
        const videoIds = filteredItems.map(item => item.contentDetails.videoId);
        if (videoIds.length > 0) {
          const videoDetails = await this.getBatchVideoDetails(videoIds, accessToken, span); // Fetch full video details
          allVideos.push(...videoDetails);
        }

        nextPageToken = data.nextPageToken;
        pagesFetched++;

        if (!nextPageToken) {
          break; // No more pages
        }
      }
      return allVideos;
    }, operation);
  }

  private async getBatchVideoDetails(videoIds: string[], accessToken: string, parentSpan?: any): Promise<YouTubeVideo[]> {
    const operation = 'YouTubeClient.getBatchVideoDetails';
    return this.monitoringSystem.monitor(
      operation,
      async (span) => {
        const url = `${this.API_BASE}/videos?part=snippet,contentDetails,statistics,player&id=${videoIds.join(',')}&key=${accessToken}`;
        const data = await this.fetchWithRetry<{ items: YouTubeVideo[] }>(url, span); // Pass span for tracing
        return data.items || [];
      },
      { parentSpan, recordMetrics: true, alertOnError: true, errorSeverity: 'error' }
    );
  }
  
  /**
   * Maps a YouTube video to the PostMetrics format
   * @private
   */
  private mapToPostMetrics(video: YouTubeVideo): PostMetrics {
    if (!video || !video.snippet || !video.statistics) {
      throw new Error('Invalid video data provided to mapToPostMetrics');
    }

    const hashtags = this.extractHashtags(video.snippet.description || '');
    const timestamp = new Date(video.snippet.publishedAt);

    const views = parseInt(video.statistics.viewCount || '0');
    const likes = parseInt(video.statistics.likeCount || '0');
    const comments = parseInt(video.statistics.commentCount || '0');
    const shares = 0; // YouTube API does not directly provide share count

    let contentType: PostMetrics['contentType'] = 'video';
    // YouTube videos are generally long-form, but check for shorts
    if (this.isShortVideo(video.contentDetails.duration)) {
      contentType = 'short';
    }

    return {
      postId: video.id,
      platform: Platform.YOUTUBE,
      timestamp: timestamp.toISOString(),
      metrics: {
        views: views,
        likes: likes,
        comments: comments,
        shares: shares,
        engagementRate: this.calculateEngagementRate({
          likes: likes,
          comments: comments,
          shares: shares,
          views: views,
          followerCount: 0 // YouTube API does not provide channel follower count directly here
        }),
      },
      contentType: contentType,
      caption: video.snippet.description,
      hashtags: hashtags,
      url: `https://www.youtube.com/watch?v=${video.id}`,
      thumbnailUrl: video.snippet.thumbnails.high.url,
      videoTitle: video.snippet.title,
      // Add other relevant fields if available in YouTubeVideo
    };
  }
  
  /**
   * Checks if a video is a short based on its duration
   * @private
   */
  private isShortVideo(duration: string): boolean {
    const durationInSeconds = this.parseDuration(duration);
    return durationInSeconds <= this.SHORTS_MAX_DURATION;
  }
  
  /**
   * Parses ISO 8601 duration format to seconds
   * @private
   */
  private parseDuration(duration: string): number {
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return 0;
    
    const hours = parseInt(match[1] || '0', 10);
    const minutes = parseInt(match[2] || '0', 10);
    const seconds = parseInt(match[3] || '0', 10);
    
    return hours * 3600 + minutes * 60 + seconds;
  }
  
  /**
   * Extracts hashtags from text
   * @private
   */
  private extractHashtags(text: string): string[] {
    const hashtagRegex = /#(\w+)/g;
    const matches = text.match(hashtagRegex);
    return matches ? matches.map(match => match.substring(1)) : [];
  }
  
  /**
   * Fetches data from URL with retry logic
   * @private
   */
  private async fetchWithRetry<T>(url: string, span: any, retries = 3, delay = 1000): Promise<T> {
    for (let i = 0; i < retries; i++) {
      try {
        const response = await fetch(url);
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          const errorMessage = `HTTP error! Status: ${response.status} - ${errorData.error?.message || response.statusText}`;
          span.addEvent('api_call_failed', { attempt: i + 1, status: response.status, error: errorMessage, url });
          if (response.status === 429) {
            const retryAfter = parseInt(response.headers.get('Retry-After') || '5');
            await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
          } else if (response.status >= 500) {
            await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
          }
          throw new Error(errorMessage);
        }
        span.addEvent('api_call_successful', { attempt: i + 1, url });
        return await response.json();
      } catch (error: any) {
        if (i === retries - 1) {
          span.recordException(error);
          this.monitoringSystem.getAlertManager().fireAlert(
            `youtube_api_critical_failure`,
            `YouTube API call failed after ${retries} retries for URL ${url}: ${error.message}`,
            'critical',
            { url, error: error.message, attempt: i + 1 }
          );
          throw error;
        }
        span.addEvent('retrying_api_call', { attempt: i + 1, error: error.message });
        await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
      }
    }
    throw new Error('Failed to fetch data after multiple retries.'); // Should not be reached
  }
  
  /**
   * Placeholder for fetching comments for a given YouTube video.
   * YouTube Data API has strict quotas and permissions for comments. This will return mock data.
   * @param videoId The ID of the video.
   * @returns A promise resolving to an array of mock comments.
   */
  async getPostComments(videoId: string): Promise<any[]> {
    console.warn(`[YouTubeClient] getPostComments is a placeholder and returns mock data. YouTube API for comments has strict quotas.`);
    return this.monitoringSystem.monitor(
      'YouTubeClient.getPostComments',
      async (span) => {
        // Simulate API call and latency
        await new Promise(resolve => setTimeout(resolve, 250));
        const mockComments = [
          { id: `yt-comment-${videoId}-1`, text: 'Awesome video!', author: 'yt_user_1', timestamp: new Date().toISOString() },
          { id: `yt-comment-${videoId}-2`, text: 'Very informative!', author: 'yt_user_2', timestamp: new Date().toISOString() },
        ];
        span.setAttribute('mock_data', true);
        span.setAttribute('video_id', videoId);
        return mockComments;
      },
      {
        recordMetrics: true,
        alertOnError: false,
        errorSeverity: 'info'
      }
    );
  }
}
