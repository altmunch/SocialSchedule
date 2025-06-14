/**
 * LinkedIn API Client
 * Implements the LinkedIn REST API v2 for data collection
 * Handles posts, profiles, companies, and analytics
 */

import { BasePlatformClient, HeaderValue } from './base-platform';
import { Platform } from '../../../deliverables/types/deliverables_types';
import { IAuthTokenManager } from '../auth.types';
import { ApiConfig, ApiResponse, PlatformPostMetrics, PlatformUserActivity, PlatformPost, PlatformComment } from './types';
import {
  LinkedInApiPostNode,
  LinkedInApiProfileNode,
  LinkedInApiCompanyNode,
  LinkedInAnalyticsNode,
  LinkedInApiResponse,
  LinkedInApiError,
  LinkedInEngagementMetrics,
  LinkedInDemographics,
  LinkedInContentInsights
} from '../../types/linkedinTypes';

// LinkedIn API specific configurations
const LINKEDIN_API_VERSION = 'v2';
const LINKEDIN_BASE_URL = 'https://api.linkedin.com';

// LinkedIn API error response interface
interface LinkedInApiErrorResponse {
  error: {
    status: number;
    code: string;
    message: string;
    requestId?: string;
  };
}

export class LinkedInClient extends BasePlatformClient {
  protected readonly platform: Platform = Platform.LINKEDIN;

  private static readonly DEFAULT_CONFIG: ApiConfig = {
    baseUrl: LINKEDIN_BASE_URL,
    version: LINKEDIN_API_VERSION,
    rateLimit: {
      requests: 100, // LinkedIn allows 100 requests per day for most endpoints
      perSeconds: 86400, // Per day (24 hours)
    },
    headers: {
      'Content-Type': 'application/json',
      'X-Restli-Protocol-Version': '2.0.0', // LinkedIn REST API protocol version
    },
    timeout: 30000, // 30 seconds for LinkedIn API calls
  };

  constructor(
    platformConfigFromFactory: ApiConfig,
    authTokenManager: IAuthTokenManager,
    userId?: string
  ) {
    const mergedConfig = { ...LinkedInClient.DEFAULT_CONFIG, ...platformConfigFromFactory };
    super(mergedConfig, authTokenManager, userId);
  }

  protected handleRateLimit(headers: Record<string, HeaderValue>): void {
    // LinkedIn rate limiting headers
    const remaining = headers['x-ratelimit-remaining'];
    const resetTime = headers['x-ratelimit-reset'];
    
    if (remaining && resetTime) {
      const remainingRequests = parseInt(remaining as string, 10);
      const resetTimestamp = parseInt(resetTime as string, 10);
      
      this.rateLimit = {
        limit: 100, // Default LinkedIn limit
        remaining: remainingRequests,
        reset: resetTimestamp
      };

      this.log('debug', 'LinkedIn rate limit updated', {
        remaining: remainingRequests,
        resetAt: new Date(resetTimestamp * 1000).toISOString(),
      });
    }
  }

  /**
   * Get current user's LinkedIn profile
   */
  async getMyProfile(): Promise<ApiResponse<LinkedInApiProfileNode>> {
    try {
      const response = await this.request<LinkedInApiResponse<LinkedInApiProfileNode>>({
        url: '/people/~:(id,firstName,lastName,headline,profilePicture,industry,location)',
        method: 'GET'
      });

      if (response.data?.error) {
        return {
          error: {
            code: response.data.error.code || 'LINKEDIN_API_ERROR',
            message: response.data.error.message,
            details: response.data.error
          }
        };
      }

      return {
        data: response.data?.data
      };
    } catch (error) {
      return this.handleClientError(error, 'getMyProfile');
    }
  }

  /**
   * Get user's LinkedIn posts/shares
   */
  async getMyPosts(options?: { 
    count?: number;
    start?: number; 
  }): Promise<ApiResponse<LinkedInApiResponse<LinkedInApiPostNode[]>>> {
    try {
      const params = new URLSearchParams({
        q: 'authors',
        authors: `urn:li:person:${this.userId}`,
        count: String(options?.count || 25),
        start: String(options?.start || 0)
      });

      const response = await this.request<LinkedInApiResponse<LinkedInApiPostNode[]>>({
        url: `/shares?${params.toString()}`,
        method: 'GET'
      });

      if (response.data?.error) {
        return {
          error: {
            code: response.data.error.code || 'LINKEDIN_API_ERROR',
            message: response.data.error.message,
            details: response.data.error
          }
        };
      }

      return {
        data: response.data
      };
    } catch (error) {
      return this.handleClientError(error, 'getMyPosts');
    }
  }

  /**
   * Get LinkedIn post analytics
   */
  async getPostAnalytics(postUrn: string): Promise<ApiResponse<LinkedInAnalyticsNode>> {
    try {
      const response = await this.request<LinkedInApiResponse<LinkedInAnalyticsNode>>({
        url: `/organizationalEntityShareStatistics?q=organizationalEntity&organizationalEntity=${encodeURIComponent(postUrn)}`,
        method: 'GET'
      });

      if (response.data?.error) {
        return {
          error: {
            code: response.data.error.code || 'LINKEDIN_API_ERROR',
            message: response.data.error.message,
            details: response.data.error
          }
        };
      }

      return {
        data: response.data?.data
      };
    } catch (error) {
      return this.handleClientError(error, 'getPostAnalytics');
    }
  }

  /**
   * Get company page information
   */
  async getCompanyPage(companyId: string): Promise<ApiResponse<LinkedInApiCompanyNode>> {
    try {
      const response = await this.request<LinkedInApiResponse<LinkedInApiCompanyNode>>({
        url: `/organizations/${companyId}`,
        method: 'GET'
      });

      if (response.data?.error) {
        return {
          error: {
            code: response.data.error.code || 'LINKEDIN_API_ERROR',
            message: response.data.error.message,
            details: response.data.error
          }
        };
      }

      return {
        data: response.data?.data
      };
    } catch (error) {
      return this.handleClientError(error, 'getCompanyPage');
    }
  }

  /**
   * Get company page analytics
   */
  async getCompanyAnalytics(companyId: string, timeRange?: { start: number; end: number }): Promise<ApiResponse<LinkedInAnalyticsNode>> {
    try {
      const params = new URLSearchParams({
        q: 'organizationalEntity',
        organizationalEntity: `urn:li:organization:${companyId}`
      });

      if (timeRange) {
        params.set('timeRange.start', String(timeRange.start));
        params.set('timeRange.end', String(timeRange.end));
      }

      const response = await this.request<LinkedInApiResponse<LinkedInAnalyticsNode>>({
        url: `/organizationalEntityShareStatistics?${params.toString()}`,
        method: 'GET'
      });

      if (response.data?.error) {
        return {
          error: {
            code: response.data.error.code || 'LINKEDIN_API_ERROR',
            message: response.data.error.message,
            details: response.data.error
          }
        };
      }

      return {
        data: response.data?.data
      };
    } catch (error) {
      return this.handleClientError(error, 'getCompanyAnalytics');
    }
  }

  /**
   * Create a LinkedIn post/share
   */
  async createPost(content: {
    text: string;
    visibility?: 'PUBLIC' | 'CONNECTIONS';
    mediaUrls?: string[];
  }): Promise<ApiResponse<LinkedInApiPostNode>> {
    try {
      const postData = {
        author: `urn:li:person:${this.userId}`,
        lifecycleState: 'PUBLISHED',
        specificContent: {
          'com.linkedin.ugc.ShareContent': {
            shareCommentary: {
              text: content.text
            },
            shareMediaCategory: content.mediaUrls ? 'IMAGE' : 'NONE'
          }
        },
        visibility: {
          'com.linkedin.ugc.MemberNetworkVisibility': content.visibility || 'PUBLIC'
        }
      };

      const response = await this.request<LinkedInApiResponse<LinkedInApiPostNode>>({
        url: '/ugcPosts',
        method: 'POST',
        data: postData
      });

      if (response.data?.error) {
        return {
          error: {
            code: response.data.error.code || 'LINKEDIN_API_ERROR',
            message: response.data.error.message,
            details: response.data.error
          }
        };
      }

      return {
        data: response.data?.data
      };
    } catch (error) {
      return this.handleClientError(error, 'createPost');
    }
  }

  // Implementation of PlatformClient interface methods
  async getPostMetrics(postId: string): Promise<ApiResponse<PlatformPostMetrics>> {
    return {
      data: {
        id: postId,
        views: 0,
        likes: 0,
        comments: 0,
        shares: 0,
        engagementRate: 0,
        timestamp: new Date().toISOString()
      }
    };
  }

  async getUserActivity(): Promise<ApiResponse<PlatformUserActivity>> {
    return {
      data: {
        followerCount: 0,
        followingCount: 0,
        postCount: 0,
        lastUpdated: new Date().toISOString()
      }
    };
  }

  async getUserVideos(options?: { 
    userId?: string; 
    cursor?: string; 
    limit?: number; 
  }): Promise<ApiResponse<{ posts: PlatformPost[]; nextPageCursor?: string; hasMore?: boolean }>> {
    return {
      data: {
        posts: [],
        nextPageCursor: undefined,
        hasMore: false
      }
    };
  }

  async getVideoComments(postId: string, options?: { 
    cursor?: string; 
    limit?: number; 
  }): Promise<ApiResponse<{ comments: PlatformComment[]; nextPageCursor?: string; hasMore?: boolean }>> {
    return {
      data: {
        comments: [],
        nextPageCursor: undefined,
        hasMore: false
      }
    };
  }

  private handleClientError(error: any, methodName: string): ApiResponse<any> {
    this.log('error', `LinkedIn API error in ${methodName}`, {
      error: error.message,
      status: error.response?.status,
      data: error.response?.data
    });

    return {
      error: {
        code: 'LINKEDIN_API_ERROR',
        message: error.message || 'An unknown error occurred',
        details: error
      }
    };
  }
}

export default LinkedInClient; 