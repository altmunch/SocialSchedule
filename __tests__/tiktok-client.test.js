// Test file for TikTokClient
const { TikTokClient } = require('../src/app/data_collection/lib/platforms/TikTokClient');
const { AuthTokenManagerService } = require('../src/app/data_collection/functions/AuthTokenManagerService');

// Mock AuthTokenManagerService
jest.mock('../src/app/data_collection/functions/AuthTokenManagerService');

describe('TikTokClient', () => {
  let client;
  let mockAuthTokenManager;

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    
    // Create a new instance of the TikTokClient for each test
    mockAuthTokenManager = new AuthTokenManagerService();
    client = new TikTokClient({
      baseUrl: 'https://test-api.tiktok.com',
      platform: 'tiktok',
      version: 'v2',
    }, mockAuthTokenManager);
  });

  describe('getUserInfo', () => {
    it('should return user info', async () => {
      // Mock the _callTikTokApi method
      client._callTikTokApi = jest.fn().mockResolvedValue({
        data: {
          user: {
            id: 'test-user-id',
            username: 'testuser',
            display_name: 'Test User',
          },
        },
      });

      const userInfo = await client.getUserInfo();
      
      expect(userInfo).toBeDefined();
      expect(userInfo.user.id).toBe('test-user-id');
      expect(client._callTikTokApi).toHaveBeenCalledWith(
        'GET',
        '/user/info/',
        { fields: ['id', 'username', 'display_name'] }
      );
    });
  });
});
