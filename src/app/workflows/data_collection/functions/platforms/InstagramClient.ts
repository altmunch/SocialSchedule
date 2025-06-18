// difficult: Instagram Graph API client implementation
import { BasePlatformClient } from './BasePlatformClient';
import { PostMetrics, InstagramMediaProductType, PaginatedResponse, Pagination, Platform } from '../types';
import { AuthTokenManagerService } from '../AuthTokenManagerService';
import { MonitoringSystem } from '../monitoring/MonitoringSystem';
import { OAuth2Credentials } from '../authTypes';

// Helper function to extract hashtags from caption
function extractHashtags(caption: string | undefined): string[] {
  if (!caption) return [];
  const matches = caption.match(/#[a-zA-Z0-9_]+/g) || [];
  return matches.map(tag => tag.substring(1)); // Remove the '#' character
}

// Helper function to get a metric value from insights
function getMetricValue(insights: any, metricName: string): number {
  if (!insights?.data) return 0;
  const metric = insights.data.find((item: any) => item.name === metricName);
  return metric?.values?.[0]?.value || 0;
}

// Helper function to get engagement metrics
function getEngagementMetric(insights: any, metricType: string): number {
  if (!insights?.data) return 0;
  const metric = insights.data.find((item: any) => 
    item.title.toLowerCase().includes(metricType.toLowerCase())
  );
  return metric?.values?.[0]?.value || 0;
}

interface InstagramMedia {
  id: string;
  caption?: string;
  media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM';
  media_product_type?: InstagramMediaProductType;
  thumbnail_url?: string;
  video_title?: string;
  media_url: string;
  permalink: string;
  timestamp: string;
  username: string;
  insights?: {
    data: Array<{
      name: string;
      period: string;
      values: Array<{ value: number }>;
      title: string;
      description: string;
      id: string;
    }>;
  };
  children?: {
    data: Array<{ id: string }>;
  };
}

export class InstagramClient extends BasePlatformClient {
  private readonly API_BASE = 'https://graph.instagram.com/v16.0';
  private readonly API_VERSION = 'v16.0';
  private readonly FIELDS = [
    'id',
    'caption',
    'media_type',
    'media_url',
    'permalink',
    'timestamp',
    'username',
    'children{media_url,media_type}',
    'media_product_type',
    'thumbnail_url',
    'video_title',
  ].join(',');
  
  constructor(
    accessToken: string,
    authTokenManager: AuthTokenManagerService,
    monitoringSystem: MonitoringSystem,
    systemUserId?: string
  ) {
    super(accessToken, Platform.INSTAGRAM, authTokenManager, monitoringSystem, systemUserId);
  }

  async getPostMetrics(postId: string, mediaProductType?: InstagramMediaProductType): Promise<PostMetrics> {
    const operation = 'InstagramClient.getPostMetrics';
    return this.throttleRequest(async () => {
      const credentials = await this.getCredentials();
      if (!credentials) {
        throw new Error('Instagram credentials not available.');
      }
      // First, get the basic media data
      const mediaUrl = `${this.API_BASE}/${postId}?fields=${this.FIELDS}&access_token=${credentials.accessToken}`;
      const mediaResponse = await fetch(mediaUrl);
      
      if (!mediaResponse.ok) {
        const errorData = await mediaResponse.json().catch(() => ({}));
        throw new Error(
          `Instagram API error: ${mediaResponse.statusText} - ${errorData.error?.message || 'Unknown error'}`
        );
      }
      
      const media = await mediaResponse.json() as InstagramMedia;
      
      // Then get the insights
      let insightMetrics = ['engagement', 'impressions', 'reach', 'saved'];
      if (mediaProductType === 'STORY') {
        insightMetrics.push('story_replies', 'story_exits');
      } else {
        insightMetrics.push('video_views');
      }
      
      const insightsUrl = `${this.API_BASE}/${postId}/insights?metric=${insightMetrics.join(',')}&access_token=${credentials.accessToken}`;
      const insightsResponse = await fetch(insightsUrl);
      
      if (!insightsResponse.ok) {
        console.warn('Could not fetch insights for post', postId);
        this.monitoringSystem.getAlertManager().fireAlert(
          'instagram_insights_fetch_failed',
          `Could not fetch insights for Instagram post ${postId}: ${insightsResponse.statusText}`,
          'warning',
          { postId, platform: Platform.INSTAGRAM }
        );
      }
      
      const insights = await insightsResponse.json();
      
      return this.mapToPostMetrics(media, insights, mediaProductType);
    }, operation);
  }

  private async _getBusinessAccountId(username: string): Promise<string> {
    const operation = 'InstagramClient._getBusinessAccountId';
    return this.throttleRequest(async () => {
      const credentials = await this.getCredentials();
      if (!credentials) {
        throw new Error('Instagram credentials not available.');
      }
      const accountInfoUrl = `${this.API_BASE}/me/accounts?fields=instagram_business_account&access_token=${credentials.accessToken}`;
      const accountResponse = await fetch(accountInfoUrl);

      if (!accountResponse.ok) {
        const errorData = await accountResponse.json().catch(() => ({}));
        throw new Error(
          `Failed to get Instagram Business Account for user ${username}: ${accountResponse.statusText} - ${errorData.error?.message || 'Unknown error'}`
        );
      }

      const accountData = await accountResponse.json();
      const businessAccountId = accountData.data[0]?.instagram_business_account?.id;

      if (!businessAccountId) {
        throw new Error(`No Instagram Business Account found for user ${username}`);
      }
      return businessAccountId;
    }, operation);
  }

  private async _fetchPaginatedMedia(
    userId: string,
    lookbackDays: number = 30,
    mediaProductType?: InstagramMediaProductType,
    maxPages: number = 10,
    maxResultsPerPage: number = 20
  ): Promise<PaginatedResponse<PostMetrics>> {
    const operation = 'InstagramClient._fetchPaginatedMedia';
    return this.throttleRequest(async () => {
      const credentials = await this.getCredentials();
      if (!credentials) {
        throw new Error('Instagram credentials not available.');
      }

      const allPosts: PostMetrics[] = [];
      let nextPageUrl: string | null = null;
      let hasMore = true;
      let pagesFetched = 0;
      
      // Build the base URL with common parameters
      const baseUrl = `${this.API_BASE}/${userId}/media`;
      const params = new URLSearchParams({
        fields: this.FIELDS,
        limit: Math.min(maxResultsPerPage, 100).toString(),
        access_token: credentials.accessToken,
      });
      
      // Add media product type filter if specified
      if (mediaProductType) {
        params.append('media_product_type', mediaProductType);
      }
      
      // Add date range filter if lookbackDays is specified
      if (lookbackDays) {
        const endTime = Math.floor(Date.now() / 1000);
        const startTime = endTime - (lookbackDays * 24 * 60 * 60);
        params.append('since', startTime.toString());
        params.append('until', endTime.toString());
      }
      
      nextPageUrl = `${baseUrl}?${params.toString()}`;
      
      while (hasMore && nextPageUrl && pagesFetched < maxPages) {
        const response: Response = await fetch(nextPageUrl);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            `Instagram API error fetching paginated media: ${response.statusText} - ${errorData.error?.message || 'Unknown error'}`
          );
        }

        const data: {
          data?: any[];
          paging?: {
            next?: string;
          };
        } = await response.json();
        pagesFetched++;
        
        // Process the current page of media items
        if (data.data && Array.isArray(data.data)) {
          // Use processInBatches to handle rate limiting for individual getPostMetrics calls
          const pagePosts = await this.processInBatches(
            data.data,
            5, // Batch size for fetching individual post metrics
            (item: any) => this.getPostMetrics(item.id, item.media_product_type as InstagramMediaProductType)
              .catch(error => {
                this.monitoringSystem.getAlertManager().fireAlert(
                  'instagram_post_metrics_fetch_failed',
                  `Error fetching metrics for Instagram post ${item.id}: ${error.message}`,
                  'error',
                  { postId: item.id, platform: Platform.INSTAGRAM }
                );
                return null;
              })
          );
          
          allPosts.push(...pagePosts.filter((post): post is PostMetrics => post !== null));
        }

        nextPageUrl = data.paging?.next || null;
        hasMore = !!nextPageUrl && allPosts.length < maxPages * maxResultsPerPage; // Limit by maxResultsPerPage as well
      }
      
      return {
        data: allPosts,
        pagination: {
          cursor: nextPageUrl,
          hasMore,
          total: allPosts.length, // Approximation
          page: pagesFetched,
          pageSize: maxResultsPerPage,
        }
      };
    }, operation);
  }

  async getUserPosts(
    username: string,
    lookbackDays: number = 30,
    maxPages: number = 10,
    maxResultsPerPage: number = 20
  ): Promise<PaginatedResponse<PostMetrics>> {
    const operation = 'InstagramClient.getUserPosts';
    return this.monitoringSystem.monitor(
      operation,
      async (span) => {
        const businessAccountId = await this._getBusinessAccountId(username);
        if (!businessAccountId) {
          throw new Error(`Could not retrieve business account ID for ${username}`);
        }
        return this._fetchPaginatedMedia(businessAccountId, lookbackDays, undefined, maxPages, maxResultsPerPage);
      },
      { recordMetrics: true, alertOnError: true, errorSeverity: 'critical' }
    );
  }

  async getReels(
    username: string,
    lookbackDays: number = 30,
    maxPages: number = 10,
    maxResultsPerPage: number = 20
  ): Promise<PaginatedResponse<PostMetrics>> {
    const operation = 'InstagramClient.getReels';
    return this.monitoringSystem.monitor(
      operation,
      async (span) => {
        const businessAccountId = await this._getBusinessAccountId(username);
        if (!businessAccountId) {
          throw new Error(`Could not retrieve business account ID for ${username}`);
        }
        return this._fetchPaginatedMedia(businessAccountId, lookbackDays, 'REELS', maxPages, maxResultsPerPage);
      },
      { recordMetrics: true, alertOnError: true, errorSeverity: 'critical' }
    );
  }

  async getStories(
    username: string,
    lookbackDays: number = 1, // Stories are only available for 24 hours
    maxPages: number = 10,
    maxResultsPerPage: number = 20
  ): Promise<PaginatedResponse<PostMetrics>> {
    const operation = 'InstagramClient.getStories';
    return this.monitoringSystem.monitor(
      operation,
      async (span) => {
        const businessAccountId = await this._getBusinessAccountId(username);
        if (!businessAccountId) {
          throw new Error(`Could not retrieve business account ID for ${username}`);
        }
        return this._fetchPaginatedMedia(businessAccountId, lookbackDays, 'STORY', maxPages, maxResultsPerPage);
      },
      { recordMetrics: true, alertOnError: true, errorSeverity: 'critical' }
    );
  }

  async getCompetitorPosts(
    username: string,
    lookbackDays: number = 30,
    maxPages: number = 10,
    maxResultsPerPage: number = 20
  ): Promise<PaginatedResponse<PostMetrics>> {
    const operation = 'InstagramClient.getCompetitorPosts';
    return this.monitoringSystem.monitor(
      operation,
      async (span) => {
        // For competitors, we might not have business account access, so we use public data if available
        // This is a simplification; actual competitor data fetching might require different APIs or scraping
        console.warn(`[InstagramClient] getCompetitorPosts is a placeholder for public data fetching. Ensure proper access and terms of service compliance.`);
        // For now, simulate fetching user posts, as that's the closest available functionality
        return this.getUserPosts(username, lookbackDays, maxPages, maxResultsPerPage);
      },
      { recordMetrics: true, alertOnError: true, errorSeverity: 'warning' }
    );
  }

  private mapToPostMetrics(media: InstagramMedia, insights: any, mediaProductType?: InstagramMediaProductType): PostMetrics {
    if (!media) {
      throw new Error('Invalid media data provided to mapToPostMetrics');
    }
    
    const hashtags = extractHashtags(media.caption);
    const timestamp = new Date(media.timestamp);

    const views = getMetricValue(insights, 'video_views') || getMetricValue(insights, 'impressions');
    const likes = getMetricValue(insights, 'engagement'); // Instagram Graph API combines likes, comments, saves into 'engagement'
    const comments = getEngagementMetric(insights, 'comments'); // Placeholder, actual API requires specific permissions
    const shares = getEngagementMetric(insights, 'shares'); // Placeholder
    const saves = getMetricValue(insights, 'saved');

    let contentType: PostMetrics['contentType'] = 'other';
    if (mediaProductType === 'FEED' || media.media_type === 'IMAGE') {
      contentType = 'image';
    } else if (mediaProductType === 'REELS' || media.media_type === 'VIDEO') {
      contentType = 'video';
    } else if (mediaProductType === 'STORY') {
      contentType = 'story';
    } else if (media.media_type === 'CAROUSEL_ALBUM') {
      contentType = 'carousel';
    }

    return {
      postId: media.id,
      platform: Platform.INSTAGRAM,
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
          followerCount: 0 // Instagram API doesn't provide this directly here
        }),
        saves: saves
      },
      contentType: contentType,
      caption: media.caption,
      hashtags: hashtags,
      url: media.permalink,
      thumbnailUrl: media.thumbnail_url,
      videoTitle: media.video_title,
    };
  }

  /**
   * Placeholder for fetching comments for a given Instagram post.
   * Instagram Graph API has strict permissions for comments. This will return mock data.
   * @param postId The ID of the post.
   * @returns A promise resolving to an array of mock comments.
   */
  async getPostComments(postId: string): Promise<any[]> {
    console.warn(`[InstagramClient] getPostComments is a placeholder and returns mock data. Instagram API for comments is restricted.`);
    return this.monitoringSystem.monitor(
      'InstagramClient.getPostComments',
      async (span) => {
        // Simulate API call and latency
        await new Promise(resolve => setTimeout(resolve, 150));
        const mockComments = [
          { id: `ig-comment-${postId}-1`, text: 'Awesome content!', author: 'insta_user_1', timestamp: new Date().toISOString() },
          { id: `ig-comment-${postId}-2`, text: 'So true!', author: 'insta_user_2', timestamp: new Date().toISOString() },
        ];
        span.setAttribute('mock_data', true);
        span.setAttribute('post_id', postId);
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
