// Basic test for TikTokClient
const { TikTokClient } = require('../src/app/data_collection/lib/platforms/TikTokClient');
const { AuthTokenManagerService } = require('../src/app/data_collection/functions/AuthTokenManagerService');

// Mock AuthTokenManagerService
jest.mock('../src/app/data_collection/functions/AuthTokenManagerService');

describe('TikTokClient Basic Test', () => {
  let client;
  let mockAuthTokenManager;

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    
    // Create a new instance of the TikTokClient for each test
    mockAuthTokenManager = new AuthTokenManagerService();
    
    // Mock the getCredentials method
    mockAuthTokenManager.getCredentials.mockResolvedValue({
      accessToken: 'test_access_token',
      refreshToken: 'test_refresh_token',
      expiresAt: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
      clientId: 'test_client_id',
      clientSecret: 'test_client_secret',
    });
    
    client = new TikTokClient({
      baseUrl: 'https://test-api.tiktok.com',
      platform: 'tiktok',
      version: 'v2',
    }, mockAuthTokenManager);
    
    // Mock the _callTikTokApi method
    client._callTikTokApi = jest.fn();
  });

  it('should be defined', () => {
    expect(client).toBeDefined();
  });

  it('should get user info', async () => {
    // Mock the API response
    const mockUserInfo = {
      data: {
        user: {
          id: 'test-user-id',
          username: 'testuser',
          display_name: 'Test User',
        },
      },
    };
    
    client._callTikTokApi.mockResolvedValue(mockUserInfo);
    
    // Call the method
    const userInfo = await client.getUserInfo();
    
    // Verify the results
    expect(userInfo).toEqual(mockUserInfo.data);
    expect(client._callTikTokApi).toHaveBeenCalledWith(
      'GET',
      '/user/info/',
      { fields: ['id', 'username', 'display_name'] }
    );
  });
});
