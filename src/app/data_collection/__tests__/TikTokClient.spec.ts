import { TikTokClient } from '../lib/platforms/TikTokClient';
import { AuthTokenManager } from '../lib/storage/repositories/AuthTokenManager';
import { ApiError } from '../functions/errors';

describe('TikTokClient', () => {
  let tiktokClient: TikTokClient;
  let mockAuthTokenManager: any;

  beforeEach(() => {
    // Create a mock AuthTokenManager
    mockAuthTokenManager = {
      getToken: jest.fn(),
      refreshToken: jest.fn(),
    };

    // Initialize TikTokClient with the mock AuthTokenManager
    tiktokClient = new TikTokClient(mockAuthTokenManager, 'test-user-id');
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
      const result = await tiktokClient.getUserInfo();

      // Verify the result
      expect(result).toEqual(mockUserInfo);
    });

    it('should throw ApiError when API call fails', async () => {
      // Mock _callTikTokApi to throw an error
      const error = new ApiError('API Error', 500);
      // @ts-ignore - Accessing private method for testing
      tiktokClient._callTikTokApi = jest.fn().mockRejectedValue(error);

      // Verify the error is thrown
      await expect(tiktokClient.getUserInfo()).rejects.toThrow(ApiError);
    });
  });
});
