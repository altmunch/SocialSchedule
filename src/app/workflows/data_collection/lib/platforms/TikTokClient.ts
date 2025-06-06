import { BasePlatformClient, HeaderValue, ApiResponse as BaseApiResponse } from './base-platform';
import { ApiConfig as PlatformSpecificApiConfig } from './types';
import { IAuthTokenManager } from '../auth.types';
import { Platform } from '../../../deliverables/types/deliverables_types';
import { ApiError, PlatformError, RateLimitError, ValidationError } from '../utils/errors';
import { z } from 'zod';

import {
  TikTokApiErrorData,
  // User Info
  TikTokUserInfoRequest,
  TikTokUserInfoResponseSchema,
  type TikTokUserInfoResponse,
  type TikTokUserInfo,
  type TikTokUserInfoResponseData, // Added this import
  // Video List
  TikTokVideoListRequest,
  TikTokVideoListResponseSchema,
  type TikTokVideoListResponse,
  type TikTokVideoListResponseData,
  // Video Query (Analytics)
  TikTokVideoQueryRequest,
  TikTokVideoQueryResponseSchema,
  type TikTokVideoQueryResponse,
  type TikTokVideoQueryResponseData,
  // Video Upload
  TikTokVideoUploadInitRequest,
  TikTokVideoUploadInitResponseSchema,
  type TikTokVideoUploadInitResponse,
  type TikTokVideoUploadInitResponseData,
  // Video Publish
  TikTokVideoPublishRequest,
  TikTokVideoPublishResponseSchema,
  type TikTokVideoPublishResponse,
  type TikTokVideoPublishResponseData,
  // Convenience
  TikTokPostVideoParamsSchema,
  type TikTokPostVideoParams
} from './tiktok.types';

const TIKTOK_DEFAULT_TIMEOUT = 20000;
const TIKTOK_API_VERSION = 'v2';

export class TikTokClient extends BasePlatformClient {
  protected readonly platform: Platform = Platform.TIKTOK;

  constructor(
    platformConfigFromFactory: PlatformSpecificApiConfig,
    authTokenManager: IAuthTokenManager,
    userId?: string
  ) {
    const configForSuper: PlatformSpecificApiConfig = {
      baseUrl: platformConfigFromFactory.baseUrl || `https://open.tiktokapis.com/${TIKTOK_API_VERSION}`,
      version: platformConfigFromFactory.version || TIKTOK_API_VERSION,
      rateLimit: platformConfigFromFactory.rateLimit,
      timeout: platformConfigFromFactory.timeout || TIKTOK_DEFAULT_TIMEOUT,
      headers: {
        ...platformConfigFromFactory.headers,
        'Content-Type': 'application/json; charset=UTF-8',
      }
    };
    super(configForSuper, authTokenManager, userId as string | undefined);
  }

  protected handleRateLimit(headers: Record<string, HeaderValue>): void {
    const limit = headers['x-ratelimit-limit'];
    const remaining = headers['x-ratelimit-remaining'];
    const reset = headers['x-ratelimit-reset'];

    if (limit && remaining && reset) {
      this.rateLimit = {
        limit: parseInt(Array.isArray(limit) ? limit[0] : limit, 10),
        remaining: parseInt(Array.isArray(remaining) ? remaining[0] : remaining, 10),
        reset: parseInt(Array.isArray(reset) ? reset[0] : reset, 10),
      };
      this.log('info', `Updated TikTok rate limit: ${JSON.stringify(this.rateLimit)}`, this.rateLimit);
    } else {
      this.log('debug', 'TikTok rate limit headers (X-RateLimit-*) not found or incomplete.');
    }
  }

  private async _callTikTokApi<TRequest, TApiDataField, TFullResponse extends { error: TikTokApiErrorData, data?: TApiDataField } >(
    endpoint: string,
    payload: TRequest,
    responseSchema: z.ZodType<TFullResponse, z.ZodTypeDef, any>,
    methodName: string
  ): Promise<BaseApiResponse<TApiDataField>> {
    try {
      const axiosResponse = await this.client.post<TFullResponse>(endpoint, payload);
      const validationResult = responseSchema.safeParse(axiosResponse.data);

      if (!validationResult.success) {
        this.log('error', `TikTok API response validation failed for ${methodName}`, {
          errors: validationResult.error.flatten(), rawData: axiosResponse.data
        });
        throw new ValidationError(this.platform, `TikTok API response validation failed for ${methodName}.`, validationResult.error.issues);
      }

      const responseDataTyped = validationResult.data;

      if (responseDataTyped.error && responseDataTyped.error.code !== 'ok') {
        this.log('error', `TikTok API error in ${methodName}: ${responseDataTyped.error.message}`, responseDataTyped.error);
        // Pass axiosResponse.status as the statusCode for ApiError
        throw new ApiError(this.platform, responseDataTyped.error.code, responseDataTyped.error.message, axiosResponse.status, responseDataTyped.error);
      }

      return { data: responseDataTyped.data as TApiDataField, rateLimit: this.rateLimit === null ? undefined : this.rateLimit };
    } catch (error) {
      if (error instanceof ApiError || error instanceof ValidationError || error instanceof RateLimitError || error instanceof PlatformError) {
        throw error;
      }
      this.log('error', `Unhandled error in ${methodName}`, { error });
      throw new PlatformError(this.platform, `Unhandled error in ${methodName}: ${(error as Error).message}`);
    }
  }

  async getUserInfo(params: TikTokUserInfoRequest): Promise<BaseApiResponse<TikTokUserInfo | undefined>> {
    const response = await this._callTikTokApi<TikTokUserInfoRequest, TikTokUserInfoResponseData, TikTokUserInfoResponse>(
      '/user/info/',
      params,
      TikTokUserInfoResponseSchema,
      'getUserInfo'
    );
    return { data: response.data?.user, rateLimit: response.rateLimit };
  }

  async listUserVideos(params: TikTokVideoListRequest): Promise<BaseApiResponse<TikTokVideoListResponseData>> {
    return this._callTikTokApi<TikTokVideoListRequest, TikTokVideoListResponseData, TikTokVideoListResponse>(
      '/video/list/',
      params,
      TikTokVideoListResponseSchema,
      'listUserVideos'
    );
  }

  async queryVideos(params: TikTokVideoQueryRequest): Promise<BaseApiResponse<TikTokVideoQueryResponseData>> {
    return this._callTikTokApi<TikTokVideoQueryRequest, TikTokVideoQueryResponseData, TikTokVideoQueryResponse>(
      '/video/query/',
      params,
      TikTokVideoQueryResponseSchema,
      'queryVideos'
    );
  }

  async initiateVideoUpload(params: TikTokVideoUploadInitRequest): Promise<BaseApiResponse<TikTokVideoUploadInitResponseData>> {
    return this._callTikTokApi<TikTokVideoUploadInitRequest, TikTokVideoUploadInitResponseData, TikTokVideoUploadInitResponse>(
      '/video/upload/',
      params,
      TikTokVideoUploadInitResponseSchema,
      'initiateVideoUpload'
    );
  }

  async publishVideo(params: TikTokVideoPublishRequest): Promise<BaseApiResponse<TikTokVideoPublishResponseData>> {
    return this._callTikTokApi<TikTokVideoPublishRequest, TikTokVideoPublishResponseData, TikTokVideoPublishResponse>(
      '/video/publish/',
      params,
      TikTokVideoPublishResponseSchema,
      'publishVideo'
    );
  }

  async postVideo(params: TikTokPostVideoParams): Promise<BaseApiResponse<TikTokVideoPublishResponseData | undefined>> {
    this.log('info', 'Attempting to post video to TikTok via PULL_URL strategy.', { title: params.title });

    const validationResult = TikTokPostVideoParamsSchema.safeParse(params);
    if (!validationResult.success) {
        this.log('error', 'Invalid parameters for postVideo', { errors: validationResult.error.flatten() });
        throw new ValidationError(this.platform, 'Invalid parameters for postVideo.', validationResult.error.issues);
    }
    const validatedParams = validationResult.data;

    const initParams: TikTokVideoUploadInitRequest = {
      source_info: {
        source: 'PULL_URL',
        video_url: validatedParams.video_url,
      },
    };
    const initApiResponse = await this.initiateVideoUpload(initParams);

    const initData = initApiResponse.data;
    if (!initData?.upload_id) {
      this.log('error', 'Failed to initiate TikTok video upload. No upload_id received.', { initApiResponse });
      throw new PlatformError(this.platform, 'Failed to initiate TikTok video upload. No upload_id.', 'UPLOAD_INIT_FAILED');
    }
    const uploadId = initData.upload_id;
    this.log('info', `TikTok video upload initiated. Upload ID: ${uploadId}`, { uploadId });

    await new Promise(resolve => setTimeout(resolve, 5000)); 

    const publishParams: TikTokVideoPublishRequest = {
      upload_id: uploadId,
      title: validatedParams.title,
      description: validatedParams.description,
      privacy_level: validatedParams.privacy_level,
      disable_comment: validatedParams.disable_comment,
      disable_duet: validatedParams.disable_duet,
      disable_stitch: validatedParams.disable_stitch,
    };

    return this.publishVideo(publishParams);
  }
}
