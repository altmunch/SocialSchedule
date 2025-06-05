import axios, { AxiosError, AxiosInstance } from 'axios';
import { InstagramApiMediaNode, InstagramApiUserNode } from '../../../../../types/instagramTypes';
import { 
  BasePlatformClient, 
  ApiConfig, 
  ApiCredentials, 
  HeaderValue, 
  ApiResponse,
  RequestOptions 
} from '../base-platform';

const INSTAGRAM_GRAPH_API_VERSION = 'v19.0';

interface InstagramApiErrorResponse {
  error: {
    message: string;
    type: string;
    code: number;
    error_subcode?: number;
    fbtrace_id: string;
  };
}

interface InstagramApiErrorResponse {
  error: {
    message: string;
    type: string;
    code: number;
    error_subcode?: number;
    fbtrace_id: string;
  };
}

export class InstagramClient extends BasePlatformClient {
  private static readonly DEFAULT_CONFIG: ApiConfig = {
    baseUrl: 'https://graph.instagram.com',
    version: INSTAGRAM_GRAPH_API_VERSION,
    rateLimit: {
      requests: 200,
      perSeconds: 3600, // Per hour
    },
    headers: {
      'Content-Type': 'application/json',
    },
  };

  protected client: AxiosInstance;

  constructor(credentials: ApiCredentials, config: Partial<ApiConfig> = {}) {
    const mergedConfig = { ...InstagramClient.DEFAULT_CONFIG, ...config };
    super(mergedConfig, credentials);
    
    this.client = axios.create({
      baseURL: `${mergedConfig.baseUrl}/${mergedConfig.version}`,
      timeout: mergedConfig.timeout,
      headers: {
        'Content-Type': 'application/json',
      },
      params: {
        access_token: this.credentials.accessToken,
      },
    });

    this.setupInterceptors();
  }

  protected handleRateLimit(headers: Record<string, HeaderValue>): void {
    this.updateRateLimit(headers);
  }

  protected setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use((config) => {
      // Add auth token to all requests
      if (config.params?.access_token === undefined) {
        config.params = {
          ...config.params,
          access_token: this.credentials.accessToken,
        };
      }
      return config;
    });

    // Response interceptor - errors are handled by BasePlatformClient
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError<InstagramApiErrorResponse>) => {
        if (error.response?.data?.error) {
          const apiError = error.response.data.error;
          console.error(
            `Instagram API Error: ${apiError.message} ` +
            `(Type: ${apiError.type || 'unknown'}, Code: ${apiError.code || 'N/A'})`
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
   * Makes a GET request to the Instagram API
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
   * Fetches basic data about an Instagram user.
   * @param userId The Instagram User ID (defaults to 'me' for authenticated user).
   * @param fields Fields to retrieve (comma-separated string).
   * @returns User information or null if not found
   */
  async getUserInfo(userId: string = 'me', fields?: string): Promise<InstagramApiUserNode | null> {
    const defaultFields = 'id,username,account_type,media_count,followers_count,follows_count,name,profile_picture_url,biography,website';
    const response = await this.get<InstagramApiUserNode>(`/${userId}`, {
      fields: fields || defaultFields,
    });
    return response.data || null;
  }

  /**
   * Fetches recent media for an Instagram user.
   * @param userId The Instagram User ID (defaults to 'me' for authenticated user).
   * @param fields Fields to retrieve (comma-separated string).
   * @param limit Maximum number of media items to retrieve (default: 25, max: 100).
   * @returns Media items with pagination info or null on error
   */
  async getUserMedia(
    userId: string = 'me',
    fields?: string,
    limit: number = 25
  ): Promise<{ data: InstagramApiMediaNode[]; paging?: any } | null> {
    const defaultFields =
      'id,caption,media_type,media_url,permalink,thumbnail_url,timestamp,username,children{media_url,media_type},comments_count,like_count,owner';
    const response = await this.get<{ data: InstagramApiMediaNode[]; paging?: any }>(
      `/${userId}/media`,
      {
        fields: fields || defaultFields,
        limit: Math.min(Math.max(1, limit), 100), // Ensure limit is between 1-100
      }
    );
    return response.data || null;
  }

  /**
   * Fetches details for a specific media item.
   * @param mediaId The ID of the media item.
   * @param fields Fields to retrieve (comma-separated string).
   * @returns Media details or null if not found
   */
  async getMediaDetails(mediaId: string, fields?: string): Promise<InstagramApiMediaNode | null> {
    const defaultFields =
      'id,caption,media_type,media_url,permalink,thumbnail_url,timestamp,username,children{media_url,media_type},comments_count,like_count,owner';
    const response = await this.get<InstagramApiMediaNode>(`/${mediaId}`, {
      fields: fields || defaultFields,
    });
    return response.data || null;
  }

  /**
   * Handles pagination for API endpoints that support it.
   * @param paginationUrl The full URL for the next/previous page of results.
   * @returns Paginated data or null on error
   */
  async getPaginatedData<T>(paginationUrl: string): Promise<T | null> {
    try {
      const response = await axios.get<T>(paginationUrl, {
        timeout: this.config.timeout,
        headers: this.getAuthHeaders(),
      });
      
      // Update rate limit from response headers if available
      if (response.headers) {
        const headers: Record<string, HeaderValue> = {};
        Object.entries(response.headers).forEach(([key, value]) => {
          headers[key] = value as HeaderValue;
        });
        this.handleRateLimit(headers);
      }
      
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<InstagramApiErrorResponse>;
      if (axiosError.response?.data?.error) {
        const apiError = axiosError.response.data.error;
        console.error(`Instagram API Pagination Error: ${apiError.message}`);
      }
      return null;
    }
  }
}

export default InstagramClient;
