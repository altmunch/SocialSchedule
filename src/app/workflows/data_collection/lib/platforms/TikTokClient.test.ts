// c:\SocialSchedule\src\app\data_collection\lib\platforms\TikTokClient.test.ts
import { TikTokClient } from './TikTokClient';
import { AuthTokenManagerService } from '../../functions/AuthTokenManagerService';
import { ApiConfig } from './types';
import { Platform } from '../../../deliverables/types/deliverables_types';
import {
  TikTokUserInfoRequest,
  TikTokUserInfoResponseData,
  TikTokVideoListRequest,
  TikTokVideoListResponseData,
  TikTokVideoQueryRequest,
  TikTokVideoQueryResponseData,
  TikTokVideoUploadInitRequest,
  TikTokVideoUploadInitResponseData,
  TikTokVideoPublishRequest,
  TikTokVideoPublishResponseData,
  TikTokPostVideoParams,
  TikTokApiErrorData,
  TikTokUserInfo,
  TikTokVideoData, // Corrected: For general video data, often in lists
  TikTokVideoQueryDetail, // Corrected: For detailed video data from query endpoint
} from './tiktok.types';
import { ApiError, ValidationError, RateLimitError } from '../utils/errors';
import { IAuthTokenManager, OAuth2Credentials, AuthStrategy } from '../auth.types';

// Mock dependencies
jest.mock('../../functions/AuthTokenManagerService');

// Mock console methods to keep test output clean
jest.spyOn(console, 'log').mockImplementation(() => {});
jest.spyOn(console, 'warn').mockImplementation(() => {});
jest.spyOn(console, 'error').mockImplementation(() => {});

describe('TikTokClient', () => {
  let client: TikTokClient;
  let mockAuthTokenManager: jest.Mocked<IAuthTokenManager>;

  const mockApiConfig: ApiConfig = {
    baseUrl: 'https://open-api.tiktok.com', // Dummy base URL for tests
    platform: Platform.TIKTOK,
    version: 'v2',
    rateLimit: { requests: 10, perSeconds: 1 }, // Added proper rate limit configuration
  };

  const mockUserId = 'test-user-id';
  const mockOAuthCredentials: OAuth2Credentials = {
    strategy: AuthStrategy.OAUTH2,
    accessToken: 'test_access_token',
    refreshToken: 'test_refresh_token',
    expiresAt: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now in seconds
    clientId: 'test_client_id',
    clientSecret: 'test_client_secret',
    scope: 'user.info.basic,video.list',
    openId: 'test_open_id',
    lastRefreshedAt: new Date().toISOString()
  };

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();

    // Create a proper mock implementation of IAuthTokenManager
    mockAuthTokenManager = {
      getValidCredentials: jest.fn().mockResolvedValue(mockOAuthCredentials),
      storeCredentials: jest.fn().mockResolvedValue(undefined),
      clearCredentials: jest.fn().mockResolvedValue(undefined),
      refreshOAuth2Token: jest.fn().mockResolvedValue(mockOAuthCredentials as any),
      exchangeAuthCodeForToken: jest.fn().mockResolvedValue(mockOAuthCredentials as any)
    } as jest.Mocked<IAuthTokenManager>;

    client = new TikTokClient(mockApiConfig, mockAuthTokenManager, mockUserId);

    // Spy on the private _callTikTokApi method with proper typing
    jest.spyOn(client as any, '_callTikTokApi').mockImplementation(async (endpoint, payload, responseSchema, methodName) => {
      // Default mock implementation - can be overridden in specific tests
      // This basic mock assumes success and returns minimal valid data based on schema
      // For actual tests, this will be replaced by more specific mockResolvedValueOnce calls
      if (methodName === 'getUserInfo') {
        return {
          data: {
            user: {
              open_id: 'test_open_id',
              union_id: 'test_union_id',
              avatar_url: 'http://example.com/avatar.jpg',
              display_name: 'Test User',
              bio_description: 'Test bio',
              profile_deep_link: 'tiktok://user?id=123',
              is_verified: false,
              follower_count: 100,
              following_count: 50,
              likes_count: 1000,
            } as TikTokUserInfo,
          } as TikTokUserInfoResponseData,
          rateLimit: undefined,
        };
      }
      // Add other default mocks if needed, or throw an error for unmocked methods
      throw new Error(`_callTikTokApi mock not implemented for ${methodName}`);
    });
  });

  describe('constructor', () => {
    it('should initialize correctly', () => {
      expect(client).toBeInstanceOf(TikTokClient);
      // Add any other constructor-related assertions if necessary
    });
  });

  describe('getUserInfo', () => {
    const requestParams: TikTokUserInfoRequest = { fields: ['open_id', 'union_id', 'avatar_url', 'display_name'] };
    const mockUserInfoData: TikTokUserInfo = {
      open_id: 'mock_open_id',
      union_id: 'mock_union_id',
      avatar_url: 'http://example.com/avatar.png',
      display_name: 'Mock User',
      bio_description: 'Mock bio',
      profile_deep_link: 'tiktok://user?id=mock123',
      is_verified: true,
      follower_count: 120,
      following_count: 60,
      likes_count: 1500,
    };
    const mockSuccessfulResponse: TikTokUserInfoResponseData = { user: mockUserInfoData };

    it('should return user info on successful API call', async () => {
      // Override the default _callTikTokApi mock for this specific test
      (client as any)._callTikTokApi.mockResolvedValueOnce({
        data: mockSuccessfulResponse,
        rateLimit: undefined,
      });

      const result = await client.getUserInfo(requestParams);

      expect((client as any)._callTikTokApi).toHaveBeenCalledWith(
        '/user/info/',
        requestParams,
        expect.anything(), // Zod schema
        'getUserInfo'
      );
      expect(result).toEqual(mockUserInfoData);
    });

    it('should throw ApiError when TikTok API returns an error', async () => {
      const mockApiErrorDetails: TikTokApiErrorData = {
        code: 'api_error_code',
        message: 'TikTok API returned an error.',
        log_id: 'test_log_id',
      };
      // Simulate _callTikTokApi throwing an ApiError, as it would if TikTok's response indicated an error
       (client as any)._callTikTokApi.mockImplementationOnce(async () => {
        throw new ApiError(Platform.TIKTOK, mockApiErrorDetails.code, mockApiErrorDetails.message, 400, mockApiErrorDetails);
      });

      // We expect getUserInfo to propagate this ApiError
      await expect(client.getUserInfo(requestParams)).rejects.toThrow(ApiError);
      // Check the properties of the thrown ApiError instance
      // Note: A separate expect is needed if the same call is made twice due to jest-circus behavior with async rejects
      const thrownError = await client.getUserInfo(requestParams).catch(e => e);
      expect(thrownError).toBeInstanceOf(ApiError);
      expect(thrownError).toMatchObject({
        platform: Platform.TIKTOK,
        code: mockApiErrorDetails.code,
        message: expect.stringContaining(mockApiErrorDetails.message),
        statusCode: 400,
        details: mockApiErrorDetails, // Ensure details are passed through
      });
    });

    it('should throw ValidationError if _callTikTokApi returns data that fails schema validation (simulated)', async () => {
      // To test this properly for getUserInfo, _callTikTokApi itself would throw ValidationError
      // because it's responsible for parsing. We simulate that throw.
      (client as any)._callTikTokApi.mockImplementationOnce(async () => {
        throw new ValidationError(Platform.TIKTOK, 'Simulated validation failed', [{ path: ['user', 'open_id'], message: 'is required'}]);
      });

      await expect(client.getUserInfo(requestParams)).rejects.toThrow(ValidationError);
      await expect(client.getUserInfo(requestParams)).rejects.toMatchObject({
        platform: Platform.TIKTOK,
        code: 'VALIDATION_ERROR',
        message: expect.stringContaining('Simulated validation failed'),
        validationIssues: expect.arrayContaining([
          expect.objectContaining({ path: ['user', 'open_id'] })
        ])
      });
    });

    it('should correctly pass request parameters to _callTikTokApi', async () => {
      (client as any)._callTikTokApi.mockResolvedValueOnce({
        data: mockSuccessfulResponse,
        rateLimit: undefined,
      });
      const specificParams: TikTokUserInfoRequest = { fields: ['follower_count', 'likes_count'] };
      await client.getUserInfo(specificParams);
      expect((client as any)._callTikTokApi).toHaveBeenCalledWith(
        'getUserInfo',
        expect.objectContaining({ data: specificParams }),
        expect.anything(),
        specificParams
      );
    });
  });

  describe('listUserVideos', () => {
    const requestParams: TikTokVideoListRequest = { 
      fields: ['id', 'create_time', 'video_description', 'cover_image_url'],
      max_count: 10 
    };
    const mockVideoListData: TikTokVideoListResponseData = {
      videos: [
        {
          id: 'video123',
          create_time: 1672531200, // Unix timestamp for 2023-01-01T00:00:00Z
          video_description: 'Test video',
          cover_image_url: 'http://example.com/cover.jpg',
          duration: 30,
          view_count: 1000,
          like_count: 100,
          comment_count: 20,
          share_count: 30,
          share_url: 'http://tiktok.com/v/video123'
        }
      ],
      cursor: 'next_cursor',
      has_more: true
    };

    it('should return video list on successful API call', async () => {
      (client as any)._callTikTokApi.mockResolvedValueOnce({
        data: mockVideoListData,
        rateLimit: undefined,
      });

      const result = await client.listUserVideos(requestParams);

      expect((client as any)._callTikTokApi).toHaveBeenCalledWith(
        '/video/list/',
        requestParams,
        expect.anything(),
        'listUserVideos'
      );
      expect(result).toEqual(mockVideoListData);
    });

    it('should throw ApiError when TikTok API returns an error', async () => {
      const apiErrorData: TikTokApiErrorData = {
        code: 'list_video_error',
        message: 'Error listing videos.',
        log_id: 'test_log_id_list_video',
      };
      (client as any)._callTikTokApi.mockImplementationOnce(() => {
        throw new ApiError(Platform.TIKTOK, apiErrorData.code, apiErrorData.message, 400, apiErrorData);
      });
      await expect(client.listUserVideos(requestParams)).rejects.toThrow(ApiError);
    });

    it('should throw ValidationError if response data is invalid (simulated)', async () => {
      (client as any)._callTikTokApi.mockImplementationOnce(() => {
        throw new ValidationError(Platform.TIKTOK, 'Invalid video list data', [{ path: ['videos', '0', 'id'], message: 'is required'}]);
      });
      await expect(client.listUserVideos(requestParams)).rejects.toThrow(ValidationError);
    });
  });

  describe('queryVideos', () => {
    const requestParams: TikTokVideoQueryRequest = { fields: ['id', 'video_description', 'view_count'], video_ids: ['videoId1'] }; // Changed fields to array
    const mockVideoAnalyticsData: TikTokVideoQueryDetail = { // Changed TikTokVideoAnalytics to TikTokVideoQueryDetail
      id: 'video_id_1',
      video_description: 'Test video 1',
      like_count: 150,
      comment_count: 20,
      share_count: 8,
      view_count: 1200,
      create_time: 1678886400,
      cover_image_url: 'http://example.com/cover1.jpg',
      share_url: 'http://tiktok.com/v/video_id_1'
    };
    const mockSuccessfulResponse: TikTokVideoQueryResponseData = {
      videos: [mockVideoAnalyticsData],
    };

    it('should return video analytics on successful API call', async () => {
      (client as any)._callTikTokApi.mockResolvedValueOnce({
        data: mockSuccessfulResponse,
        rateLimit: undefined,
      });
      const result = await client.queryVideos(requestParams);
      expect((client as any)._callTikTokApi).toHaveBeenCalledWith(
        '/video/query/',
        requestParams,
        expect.anything(),
        'queryVideos'
      );
      expect(result).toEqual(mockSuccessfulResponse);
    });

    it('should throw ApiError when TikTok API returns an error', async () => {
      const apiErrorData: TikTokApiErrorData = {
        code: 'upload_init_error',
        message: 'Error initiating upload.',
        log_id: 'test_log_id_upload_init',
      };
      (client as any)._callTikTokApi.mockImplementationOnce(() => {
        throw new ApiError(Platform.TIKTOK, apiErrorData.code, apiErrorData.message, 400, apiErrorData);
      });
      await expect(client.queryVideos(requestParams)).rejects.toThrow(ApiError);
    });
  });

  describe('initiateVideoUpload', () => {
    const requestParams: TikTokVideoUploadInitRequest = { source_info: { source: 'PULL_URL', video_url: 'http://example.com/video.mp4' } };
    const mockSuccessfulResponse: TikTokVideoUploadInitResponseData = {
      upload_id: 'upload_123',
      upload_url: 'https://mock.tiktok.com/upload/path/123',
    };

    it('should return upload info on successful API call', async () => {
      (client as any)._callTikTokApi.mockResolvedValueOnce({
        data: mockSuccessfulResponse,
        rateLimit: undefined,
      });

      const result = await client.initiateVideoUpload(requestParams);

      expect((client as any)._callTikTokApi).toHaveBeenCalledWith(
        '/video/upload/',
        requestParams,
        expect.anything(),
        'initiateVideoUpload'
      );
      expect(result).toEqual(mockSuccessfulResponse);
    });

    it('should throw ApiError when TikTok API returns an error', async () => {
      const apiErrorData: TikTokApiErrorData = {
        code: 'upload_init_error',
        message: 'Error initiating upload.',
        log_id: 'test_log_id_upload_init',
      };
      (client as any)._callTikTokApi.mockImplementationOnce(() => {
        throw new ApiError(Platform.TIKTOK, apiErrorData.code, apiErrorData.message, 400, apiErrorData);
      });
      await expect(client.initiateVideoUpload(requestParams)).rejects.toThrow(ApiError);
    });
  });

  describe('publishVideo', () => {
    const requestParams: TikTokVideoPublishRequest = {
      upload_id: 'upload_123',
      title: 'Test Video',
      description: 'Test description',
      privacy_level: 'PUBLIC_TO_EVERYONE',
      disable_comment: false,
      disable_duet: false,
      disable_stitch: false
    };
    const mockPublishResponse: TikTokVideoPublishResponseData = {
      video_id: 'video_123'
    };

    it('should return publish info on successful API call', async () => {
      (client as any)._callTikTokApi.mockResolvedValueOnce({
        data: mockPublishResponse,
        rateLimit: undefined,
      });

      const result = await client.publishVideo(requestParams);

      expect((client as any)._callTikTokApi).toHaveBeenCalledWith(
        '/video/publish/',
        requestParams,
        expect.anything(),
        'publishVideo'
      );
      expect(result).toEqual(mockPublishResponse);
    });

    it('should throw ApiError when TikTok API returns an error', async () => {
      const apiErrorData: TikTokApiErrorData = {
        code: 'publish_error',
        message: 'Error publishing video.',
        log_id: 'test_log_id_publish',
      };
      (client as any)._callTikTokApi.mockImplementationOnce(() => {
        throw new ApiError(Platform.TIKTOK, apiErrorData.code, apiErrorData.message, 400, apiErrorData);
      });
      await expect(client.publishVideo(requestParams)).rejects.toThrow(ApiError);
    });
  });

  describe('postVideo', () => {
    const postParams: TikTokPostVideoParams = {
      video_url: 'http://example.com/video.mp4',
      description: 'My awesome video #cool #tiktok', // Changed text to description
      title: 'My Awesome Video', // Added title as it's often required or useful
      privacy_level: 'PUBLIC_TO_EVERYONE', // Example, adjust as per actual type
      // ... other params as needed by TikTokPostVideoParams
    };
    const mockUploadInitResponse: TikTokVideoUploadInitResponseData = {
      upload_id: 'upload_session_id_456',
      upload_url: 'https://mock.tiktok.com/upload/session_456'
    };
    const mockPublishResponse: TikTokVideoPublishResponseData = {
      video_id: 'vid_final_123'
    };

    it('should successfully initiate upload and publish video', async () => {
      const callTikTokApiMock = jest.spyOn(client as any, '_callTikTokApi')
        .mockImplementationOnce(async (...args: any[]) => { // initiateVideoUpload success
          const methodName = args[0];
          if (methodName === 'initiateVideoUpload') return { data: mockUploadInitResponse, rateLimit: undefined };
          throw new Error('Unexpected call in postVideo mock for initiateVideoUpload');
        })
        .mockImplementationOnce(async (...args: any[]) => { // publishVideo success
          const methodName = args[0];
          if (methodName === 'publishVideo') return { data: mockPublishResponse, rateLimit: undefined };
          throw new Error('Unexpected call in postVideo mock for publishVideo');
        });

      const result = await client.postVideo(postParams);

      expect(callTikTokApiMock).toHaveBeenCalledTimes(2);
      expect(callTikTokApiMock).toHaveBeenNthCalledWith(1,
        'initiateVideoUpload',
        expect.objectContaining({
          method: 'POST',
          url: '/v2/video/upload/',
          data: { source_info: { source: 'PULL_URL', video_url: postParams.video_url } },
        }),
        expect.anything(),
        { source_info: { source: 'PULL_URL', video_url: postParams.video_url } }
      );
      expect(callTikTokApiMock).toHaveBeenNthCalledWith(2,
        'publishVideo',
        expect.objectContaining({
          method: 'POST',
          url: '/v2/video/publish/',
          data: {
            upload_id: mockUploadInitResponse.upload_id,
            title: postParams.title,
            text: postParams.description,
            privacy_settings: postParams.privacy_level,
            disable_comment: postParams.disable_comment,
            disable_duet: postParams.disable_duet,
            disable_stitch: postParams.disable_stitch,
            // Removed unsupported properties
          },
        }),
        expect.anything(),
        {
          upload_id: mockUploadInitResponse.upload_id,
          title: postParams.title,
          text: postParams.description,
          privacy_settings: postParams.privacy_level,
          disable_comment: postParams.disable_comment,
          disable_duet: postParams.disable_duet,
          disable_stitch: postParams.disable_stitch,
          // Removed unsupported properties
        }
      );
      expect(result).toEqual(mockPublishResponse);
    });

    it('should throw error if initiateVideoUpload fails', async () => {
      const mockApiErrorDetails: TikTokApiErrorData = {
        code: 'upload_failed_in_post',
        message: 'Simulated upload initiation failure in postVideo.',
        log_id: 'log_post_upload_fail'
      };
      (client as any)._callTikTokApi.mockImplementationOnce(() => {
        throw new ApiError(Platform.TIKTOK, mockApiErrorDetails.code, mockApiErrorDetails.message, 400, mockApiErrorDetails);
      });

      await expect(client.postVideo(postParams)).rejects.toThrow(ApiError);
      expect((client as any)._callTikTokApi).toHaveBeenCalledTimes(1); // Only initiateVideoUpload should be called
    });

    it('should throw error if publishVideo fails', async () => {
      const callTikTokApiMock = (client as any)._callTikTokApi as jest.Mock;
      const apiErrorData: TikTokApiErrorData = { 
        code: 'publish_fail', 
        message: 'Publish failed in postVideo', 
        log_id: 'log6' 
      };

      // Mock successful initiateVideoUpload
      callTikTokApiMock.mockResolvedValueOnce({ 
        data: mockUploadInitResponse, 
        rateLimit: undefined 
      });
      
      // Mock failed publishVideo
      callTikTokApiMock.mockImplementationOnce(() => {
        throw new ApiError(Platform.TIKTOK, apiErrorData.code, apiErrorData.message, 400, apiErrorData);
      });

      await expect(client.postVideo(postParams)).rejects.toThrow(ApiError);
      expect(callTikTokApiMock).toHaveBeenCalledTimes(2); // Both methods should be called
    });
  });

});
