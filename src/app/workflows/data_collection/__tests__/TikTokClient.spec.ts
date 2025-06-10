import { TikTokClient } from '../lib/platforms/TikTokClient';
import { AuthTokenManagerService } from '../lib/auth-token-manager.service';
import { ApiError } from '../lib/utils/errors';

describe('TikTokClient', () => {
  let tiktokClient: TikTokClient;
  let mockAuthTokenManager: any;

  beforeEach(() => {
    // Create a mock AuthTokenManager
    mockAuthTokenManager = {
      getValidCredentials: jest.fn(),
      storeCredentials: jest.fn(),
      clearCredentials: jest.fn(),
    };

    // Minimal valid config for TikTokClient
    const mockConfig = {
      baseUrl: 'https://mock.tiktok.api',
      version: 'v2',
      rateLimit: { requests: 100, perSeconds: 60 },
    };

    // Initialize TikTokClient with the mock config and AuthTokenManager
    tiktokClient = new TikTokClient(mockConfig, mockAuthTokenManager, 'test-user-id');
  });

  describe('getUserInfo', () => {
    it('should return user info on successful API call', async () => {
      // Mock the _callTikTokApi method
      const mockUserInfo = {
        id: '12345',
        username: 'testuser',
        display_name: 'Test User',
      };
      
      // @ts-ignore - Accessing private method for testing
      tiktokClient._callTikTokApi = jest.fn().mockResolvedValue(mockUserInfo);

      // Call the method
      const result = await tiktokClient.getUserInfo({ fields: ['open_id'] });

      // Verify the result
      expect(result).toEqual(mockUserInfo);
    });

    it('should throw ApiError when API call fails', async () => {
      // Mock _callTikTokApi to throw an error
      const error = new ApiError('API Error', 500);
      // @ts-ignore - Accessing private method for testing
      tiktokClient._callTikTokApi = jest.fn().mockRejectedValue(error);

      // Verify the error is thrown
      await expect(tiktokClient.getUserInfo({ fields: ['open_id'] })).rejects.toThrow(ApiError);
    });
  });
});
