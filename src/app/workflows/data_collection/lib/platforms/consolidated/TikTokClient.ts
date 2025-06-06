import axios, { AxiosError, AxiosInstance, AxiosHeaders } from 'axios';
import { 
  TikTokApiUserNode, 
  TikTokApiVideoNode, 
  TikTokApiResponse,
  TikTokApiPagination 
} from '../../../../../types/tiktokTypes';
import { 
  BasePlatformClient, 
  ApiConfig, 
  ApiCredentials, 
  HeaderValue, 
  ApiResponse,
  RequestOptions 
} from '../base-platform';

interface TikTokApiErrorResponse {
  error: {
    code: string;
    message: string;
    log_id?: string;
  };
  [key: string]: any;
}

export class TikTokClient extends BasePlatformClient {
  protected client: AxiosInstance;
  private static readonly DEFAULT_CONFIG: ApiConfig = {
    baseUrl: 'https://open.tiktokapis.com',
    version: 'v2',
    rateLimit: {
      requests: 5,  // TikTok's standard rate limit per second
      perSeconds: 1
    },
    headers: {
      'Content-Type': 'application/json',
    },
  };

  constructor(credentials: ApiCredentials, config: Partial<ApiConfig> = {}) {
    const mergedConfig = { ...TikTokClient.DEFAULT_CONFIG, ...config };
    super(mergedConfig, credentials);
    
    this.client = axios.create({
      baseURL: `${mergedConfig.baseUrl}/${mergedConfig.version}`,
      timeout: mergedConfig.timeout,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  protected setupInterceptors() {
    // Request interceptor - add auth token to all requests
    this.client.interceptors.request.use((config) => {
      if (!config.headers.get('Authorization')) {
        const headers = new AxiosHeaders(config.headers);
        Object.entries(this.getAuthHeaders()).forEach(([key, value]) => {
          headers.set(key, value);
        });
        config.headers = headers;
      }
      return config;
    });

    // Response interceptor - errors are handled by BasePlatformClient
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError<TikTokApiErrorResponse>) => {
        if (error.response?.data?.error) {
          const apiError = error.response.data.error;
          console.error(
            `TikTok API Error: ${apiError.message} ` +
            `(Code: ${apiError.code || 'N/A'}, Log ID: ${apiError.log_id || 'N/A'})`
          );
        }
        return Promise.reject(error);
      }
    );
  }

  protected getAuthHeaders(): Record<string, string> {
    return {
      'Authorization': `Bearer ${this.credentials.accessToken}`,
    };
  }

  /**
   * Makes a GET request to the TikTok API
   * @param endpoint API endpoint (without base URL)
   * @param params Query parameters
   * @param options Request options
   */
  public async get<T>(
    endpoint: string,
    params?: Record<string, any>,
    options: Omit<RequestOptions, 'method' | 'url' | 'params'> = {}
  ): Promise<ApiResponse<T>> {
    return super.get<T>(endpoint, params, options);
  }

  /**
   * Makes a POST request to the TikTok API
   * @param endpoint API endpoint (without base URL)
   * @param data Request body data
   * @param options Request options
   */
  public async post<T>(
    endpoint: string,
    data?: any,
    options: Omit<RequestOptions, 'method' | 'url' | 'data'> = {}
  ): Promise<ApiResponse<T>> {
    return super.post<T>(endpoint, data, options);
  }

  /**
   * Fetches basic data about a TikTok user.
   * @param userId The TikTok User ID (defaults to 'me' for authenticated user).
   * @returns User information or null if not found
   */
  async getUserInfo(userId: string = 'me'): Promise<TikTokApiUserNode | null> {
    const response = await this.post<{ data: { user: TikTokApiUserNode } }>('/user/info/', {
      fields: [
        'open_id',
        'union_id',
        'avatar_url',
        'avatar_url_100',
        'avatar_url_200',
        'avatar_large_url',
        'display_name',
        'bio_description',
        'profile_deep_link',
        'is_verified',
        'follower_count',
        'following_count',
        'likes_count',
        'video_count',
      ]
    });
    
    if (!response.data) {
      return null;
    }
    
    return response.data.data?.user || null;
  }

  /**
   * Fetches videos for a TikTok user.
   * @param userId The TikTok User ID (defaults to 'me' for authenticated user).
   * @param limit Maximum number of videos to retrieve (default: 20, max: 50).
   * @param cursor Pagination cursor for the next set of results.
   * @returns Object containing videos array and pagination info, or null on error
   */
  async getUserVideos(
    userId: string = 'me',
    limit: number = 20,
    cursor?: string
  ): Promise<{ videos: TikTokApiVideoNode[]; cursor?: string; hasMore: boolean } | null> {
    const response = await this.post<{
      data: {
        videos: TikTokApiVideoNode[];
        cursor?: string;
        has_more: boolean;
      };
    }>('/video/list/', {
      fields: [
        'id',
        'title',
        'video_description',
        'create_time',
        'cover_image_url',
        'share_url',
        'duration',
        'height',
        'width',
        'like_count',
        'comment_count',
        'share_count',
        'view_count',
        'play_url',
        'download_url',
        'format',
        'is_ads',
        'music',
        'hashtags',
        'mentions',
        'location'
      ],
      max_count: Math.min(Math.max(1, limit), 50), // Ensure limit is between 1-50
      cursor,
    });

    if (!response.data) {
      return null;
    }

    return {
      videos: response.data.data?.videos || [],
      cursor: response.data.data?.cursor,
      hasMore: response.data.data?.has_more || false
    };
  }

  /**
   * Fetches comments for a specific video.
   * @param videoId The ID of the video
   * @param limit Maximum number of comments to retrieve (default: 20, max: 50)
   * @param cursor Pagination cursor for the next set of results
   * @returns Object containing comments array and pagination info, or null on error
   */
  async getVideoComments(
    videoId: string, 
    limit: number = 20, 
    cursor?: string
  ): Promise<{ comments: any[]; cursor?: string } | null> {
    const response = await this.post<TikTokApiResponse<{
      comments: any[];
      cursor?: string;
    }>>(
      '/video/comments/',
      {
        video_id: videoId,
        count: Math.min(Math.max(1, limit), 50), // Ensure limit is between 1-50
        cursor,
      }
    );

    if (!response.data || response.error) {
      return null;
    }

    return {
      comments: response.data.data?.comments || [],
      cursor: response.data.data?.cursor
    };
  }

  /**
   * Fetches details for a specific video.
   * @param videoId The ID of the video to fetch
   * @returns Video details or null if not found
   */
  async getVideoDetails(videoId: string): Promise<TikTokApiVideoNode | null> {
    const response = await this.post<TikTokApiResponse<{ video: TikTokApiVideoNode }>>(
      '/video/query/',
      {
        video_id: videoId,
        fields: [
          'id',
          'title',
          'video_description',
          'create_time',
          'cover_image_url',
          'share_url',
          'duration',
          'like_count',
          'comment_count',
          'share_count',
          'view_count',
          'play_url',
          'download_url',
          'music',
          'hashtags',
          'mentions',
          'location'
        ]
      }
    );

    if (!response.data || response.error) {
      return null;
    }

    return response.data.data?.video || null;
  }

  /**
   * Handles rate limiting based on response headers.
   * @param headers Response headers from the API.
   */
  protected handleRateLimit(headers: Record<string, HeaderValue>): void {
    const remaining = Array.isArray(headers['x-ratelimit-remaining']) 
      ? headers['x-ratelimit-remaining'][0] 
      : headers['x-ratelimit-remaining'];
      
    const reset = Array.isArray(headers['x-ratelimit-reset'])
      ? headers['x-ratelimit-reset'][0]
      : headers['x-ratelimit-reset'];
    
    if (remaining === '0' && reset) {
      const resetTime = parseInt(String(reset), 10) * 1000; // Convert to milliseconds
      const now = Date.now();
      const waitTime = Math.max(0, resetTime - now);
      
      if (waitTime > 0) {
        // In a real implementation, you might want to queue requests
        console.warn(`Rate limit reached. Please wait ${Math.ceil(waitTime / 1000)} seconds before making more requests.`);
      }
    }
    
    // Call parent's updateRateLimit to handle the rate limit tracking
    this.updateRateLimit(headers);
  }
}

export default TikTokClient;
