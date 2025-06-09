import axios, { AxiosInstance } from "axios";
import { BasePlatformClient } from "../base-platform";
import {
  ApiConfig,
  ApiResponse,
  Platform,
  PlatformPost,
  PlatformPostMetrics,
  PlatformUserActivity,
  PlatformComment,
} from "../types";

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
  protected readonly platform: Platform = Platform.TIKTOK;
  private static readonly DEFAULT_CONFIG: ApiConfig = {
    baseUrl: "https://open.tiktokapis.com",
    version: "v2",
    rateLimit: {
      requests: 5, // TikTok's standard rate limit per second
      perSeconds: 1,
    },
    headers: {
      "Content-Type": "application/json",
    },
  };

  constructor(
    authTokenManager: any,
    userId?: string,
    config: Partial<ApiConfig> = {},
  ) {
    const mergedConfig = { ...TikTokClient.DEFAULT_CONFIG, ...config };
    super(mergedConfig, authTokenManager, userId);

    this.client = axios.create({
      baseURL: `${mergedConfig.baseUrl}/${mergedConfig.version}`,
      timeout: mergedConfig.timeout,
      headers: {
        "Content-Type": "application/json",
      },
    });

    this.setupInterceptors();
  }

  protected setupInterceptors() {
    // Request interceptor - add auth token to all requests
    this.client.interceptors.request.use((config) => {
      // Minimal: just return config
      return config;
    });

    // Response interceptor - just return response or error
    this.client.interceptors.response.use(
      (response) => response,
      (error) => Promise.reject(error),
    );
  }

  protected async getAuthHeaders(): Promise<Record<string, string>> {
    // Implement as async to match base class/interface
    return {
      Authorization: `Bearer token`, // Replace with real token logic
    };
  }

  async getPostMetrics(
    postId: string,
  ): Promise<ApiResponse<PlatformPostMetrics>> {
    return { data: undefined };
  }
  async getUserActivity(): Promise<ApiResponse<PlatformUserActivity>> {
    return { data: undefined };
  }
  async getUserVideos(options?: {
    userId?: string;
    cursor?: string;
    limit?: number;
  }): Promise<
    ApiResponse<{
      posts: PlatformPost[];
      nextPageCursor?: string;
      hasMore?: boolean;
    }>
  > {
    // TODO: Implement actual TikTok API call logic here
    return { data: { posts: [], nextPageCursor: undefined, hasMore: false } };
  }
  async getVideoComments(
    postId: string,
    options?: { cursor?: string; limit?: number },
  ): Promise<
    ApiResponse<{
      comments: PlatformComment[];
      nextPageCursor?: string;
      hasMore?: boolean;
    }>
  > {
    // TODO: Implement actual TikTok API call logic here
    return {
      data: { comments: [], nextPageCursor: undefined, hasMore: false },
    };
  }

  // Minimal no-op handleRateLimit to satisfy abstract member requirement
  protected handleRateLimit(headers: Record<string, any>): void {
    // No-op for now
  }
}

export default TikTokClient;
