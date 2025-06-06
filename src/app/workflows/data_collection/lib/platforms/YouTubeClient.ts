import { Platform } from "../../../deliverables/types/deliverables_types";
import { IAuthTokenManager } from "../auth.types";
import { ApiConfig, ApiResponse } from "./types";
import { BasePlatformClient, HeaderValue } from "./base-platform"; // Assuming ApiRateLimit is also exported from here or base

import {
  YouTubeVideoListResponseSchema,
  YouTubeVideoListResponse,
  YouTubeVideo,
  YouTubeCommentThreadListResponseSchema,
  YouTubeCommentThreadListResponse,
  YouTubeChannelListResponseSchema, // Added for channel list response schema
  YouTubeChannelListResponse, // Added for channel list response type
  YouTubeChannel, // Added for single channel details
} from './youtube.types';
import { PlatformError, RateLimitError, ApiError, ValidationError } from "../utils/errors";

export class YouTubeClient extends BasePlatformClient {
  protected readonly platform = Platform.YOUTUBE;

  constructor(config: ApiConfig, authTokenManager: IAuthTokenManager, userId?: string) {
    super(
      {
        ...config,
        baseUrl: config.baseUrl || 'https://www.googleapis.com/youtube/v3',
        // YouTube specific defaults can be added here if not in general config
      },
      authTokenManager,
      userId
    );
    this.log('info', 'YouTubeClient initialized', { userId });
  }

  protected handleRateLimit(headers: Record<string, HeaderValue>): void {
    // YouTube API uses a quota system. Standard rate limit headers (Limit, Remaining, Reset) are not typical.
    // This method will log any Google-specific headers (x-goog-*) that might provide context.
    const googleHeaders: Record<string, HeaderValue> = {};
    for (const key in headers) {
      if (key.toLowerCase().startsWith('x-goog-')) {
        googleHeaders[key] = headers[key];
      }
    }

    if (this.config.enableLogging && Object.keys(googleHeaders).length > 0) {
      this.log('debug', `YouTubeClient: Observed Google-specific headers.`, { googleHeaders });
    }
    // No direct update to this.rateLimit as YouTube quotas are not communicated this way.
  }

  // Example method: Get Video Details
  public async getVideoDetails(videoId: string): Promise<ApiResponse<YouTubeVideo | null>> {
    try {
      const response = await this.request<YouTubeVideoListResponse>({
        method: 'GET',
        url: '/videos',
        params: {
          part: 'snippet,status,contentDetails,statistics', // Customize as needed
          id: videoId,
        },
        useAuth: true, // Typically true for most YouTube Data API calls
      });

      const validationResult = YouTubeVideoListResponseSchema.safeParse(response.data);
      if (!validationResult.success) {
        this.log('error', 'YouTube API getVideoDetails validation error', { errors: validationResult.error.issues, videoId });
        throw new ValidationError(this.platform, 'Failed to validate video details response', validationResult.error.issues);
      }
      // Assuming the list response for a single ID returns one item
      const videoData = validationResult.data.items && validationResult.data.items.length > 0 ? validationResult.data.items[0] : null;
      return { data: videoData, rateLimit: this.rateLimit || undefined };
    } catch (error) {
      return this.handleClientError(error, 'getVideoDetails');
    }
  }

  // Example method: Get Comments for a Video
  public async getVideoComments(videoId: string, maxResults: number = 20): Promise<ApiResponse<YouTubeCommentThreadListResponse>> {
    try {
      const response = await this.request<YouTubeCommentThreadListResponse>({
        method: 'GET',
        url: '/commentThreads',
        params: {
          part: 'snippet,replies',
          videoId: videoId,
          maxResults: maxResults,
          order: 'relevance', // or 'time'
        },
        useAuth: true,
      });

      const validationResult = YouTubeCommentThreadListResponseSchema.safeParse(response.data);
      if (!validationResult.success) {
        this.log('error', 'YouTube API getVideoComments validation error', { errors: validationResult.error.issues, videoId });
        throw new ValidationError(this.platform, 'Failed to validate video comments response', validationResult.error.issues);
      }
      return { data: validationResult.data, rateLimit: this.rateLimit || undefined };
    } catch (error) {
      return this.handleClientError(error, 'getVideoComments');
    }
  }

  private handleClientError(error: any, methodName: string): ApiResponse<any> {
    this.log('error', `Error in YouTubeClient.${methodName}:`, { error });
    if (error instanceof ValidationError || error instanceof ApiError || error instanceof RateLimitError || error instanceof PlatformError) {
      return { error: { code: error.code, message: error.message, details: error.details }, rateLimit: this.rateLimit || undefined };
    }
    // Check for Google API specific error structure if error is from Axios
    if (error.isAxiosError && error.response?.data?.error) {
        const apiErrorData = error.response.data.error; // Contains code, message, errors[]

        // Check for quota exceeded errors specifically
        if (apiErrorData.errors && Array.isArray(apiErrorData.errors)) {
            const quotaErrorDetail = apiErrorData.errors.find((e: any) => 
                e.reason === 'quotaExceeded' || 
                e.reason === 'userRateLimitExceeded' || 
                e.reason === 'rateLimitExceeded' || // General rate limit reason
                e.domain === 'youtube.quota'
            );

            if (quotaErrorDetail) {
                this.log('warn', `YouTube API quota/rate limit exceeded in ${methodName}: ${quotaErrorDetail.message}`, { reason: quotaErrorDetail.reason, details: apiErrorData });
                const rateLimitError = new RateLimitError(
                    this.platform,
                    0, // Placeholder for retryAfter as YouTube daily quotas don't provide a specific backoff duration.
                    quotaErrorDetail.message || apiErrorData.message || 'YouTube API quota exceeded.',
                    error.response.status,
                    { // Details object
                        reason: quotaErrorDetail.reason || `youtube.quota.${apiErrorData.code || 'unknown'}`,
                        limit: null, 
                        remaining: null,
                        resetTime: 'Midnight PST', // YouTube daily quotas reset at a fixed time.
                        originalError: apiErrorData
                    }
                );
                return { error: { code: rateLimitError.code, message: rateLimitError.message, details: rateLimitError.details }, rateLimit: this.rateLimit || undefined };
            }
        }

        // If not a specific quota error, treat as a general ApiError
        const platformApiError = new ApiError(
            this.platform,
            String(apiErrorData.code || error.response.status),
            apiErrorData.message || 'Unknown YouTube API error',
            error.response.status,
            apiErrorData.errors || apiErrorData
        );
        return { error: { code: platformApiError.code, message: platformApiError.message, details: platformApiError.details }, rateLimit: this.rateLimit || undefined };
    }
    const genericError = new PlatformError(this.platform, 'CLIENT_SIDE_ERROR', error?.message || 'An unknown client-side error occurred.', { originalError: error });
    return { error: { code: genericError.code, message: genericError.message, details: genericError.details }, rateLimit: this.rateLimit || undefined };
  }

  // Example method: Get Channel Details
  public async getChannelDetails(channelId: string): Promise<ApiResponse<YouTubeChannel | null>> {
    try {
      const response = await this.request<YouTubeChannelListResponse>({
        method: 'GET',
        url: '/channels',
        params: {
          part: 'snippet,statistics,brandingSettings', // Adjust parts as needed
          id: channelId,
        },
        zodSchema: YouTubeChannelListResponseSchema, // Corrected property name
      });

      if (response.error) {
        // Error already handled and logged by this.request
        // The 'response' object itself is the ApiResponse, so response.error is correct.
        return { error: response.error, rateLimit: response.rateLimit };
      }

      // response.data directly contains the TResponseData (YouTubeChannelListResponse in this case)
      const channelList = response.data; // data is YouTubeChannelListResponse | null | undefined
      const channel = channelList?.items && channelList.items.length > 0 ? channelList.items[0] : null;

      if (!channel) {
        this.log('warn', `Channel not found or empty response for ID: ${channelId}`);
        return { data: null, rateLimit: response.rateLimit };
      }

      return { data: channel, rateLimit: response.rateLimit };

    } catch (error) {
      // This catch block is for unexpected errors during the method execution itself,
      // not for API errors which are handled by this.request and handleClientError.
      this.log('error', `Unexpected error in getChannelDetails for channel ID ${channelId}:`, error);
      const platformError = this.ensurePlatformError(error, 'getChannelDetails');
      return { error: { code: platformError.code, message: platformError.message, details: platformError.details }, rateLimit: this.rateLimit || undefined };
    }
  }

  // TODO: Implement other YouTube specific methods like uploadVideo, etc.

}
