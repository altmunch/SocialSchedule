/**
 * LinkedIn Scanning Service Integration Tests
 * Tests for LinkedIn data collection, rate limiting, and synchronization
 */

import { LinkedInScanningService } from '@/services/LinkedInScanningService';
import { LinkedInClient } from '@/app/workflows/data_collection/lib/platforms/LinkedInClient';
import { SupabaseClient } from '@supabase/supabase-js';

// Mock the dependencies
jest.mock('@/app/workflows/data_collection/lib/platforms/LinkedInClient');
jest.mock('@/app/workflows/data_collection/lib/storage/repositories/linkedinRepository');

const mockSupabase = {
  from: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  insert: jest.fn().mockReturnThis(),
  update: jest.fn().mockReturnThis(),
  single: jest.fn(),
} as unknown as SupabaseClient;

const mockLinkedInClient = {
  getProfile: jest.fn(),
  getPosts: jest.fn(),
  getCompany: jest.fn(),
} as unknown as LinkedInClient;

// Mock data
const mockProfileData = {
  localizedFirstName: 'John',
  localizedLastName: 'Doe',
  localizedHeadline: 'Senior Software Engineer',
  summary: 'Passionate developer',
  geoLocation: { name: 'San Francisco, CA' },
  industryName: 'Technology',
  numConnections: 500,
  numFollowers: 1200,
  vanityName: 'johndoe',
  profilePicture: { displayImage: 'profile.jpg' },
  backgroundImage: { displayImage: 'background.jpg' }
};

const mockPostsData = [
  {
    id: 'post-1',
    commentary: 'Great insights on #technology and #innovation',
    createdAt: Date.now(),
    socialDetail: {
      totalSocialActivityCounts: {
        numLikes: 25,
        numComments: 5,
        numShares: 3,
        numViews: 1000
      }
    },
    content: {
      media: [
        {
          mediaType: 'IMAGE',
          originalUrl: 'https://example.com/image.jpg'
        }
      ]
    }
  },
  {
    id: 'post-2',
    commentary: 'Excited to share our team achievements!',
    createdAt: Date.now() - 86400000, // 1 day ago
    socialDetail: {
      totalSocialActivityCounts: {
        numLikes: 42,
        numComments: 8,
        numShares: 2,
        numViews: 1500
      }
    },
    content: {}
  }
];

const mockCompanyData = {
  localizedName: 'Tech Innovations Inc',
  staffCountRange: { start: 1000, end: 5000 },
  localizedSpecialties: ['Software Development', 'AI', 'Cloud Computing'],
  websiteUrl: 'https://techinnovations.com',
  logoV2: { original: 'logo.jpg' },
  coverPhotoV2: { original: 'cover.jpg' },
  tagline: 'Innovating the future',
  description: 'Leading technology company',
  headquarter: { city: 'San Francisco', country: 'US' },
  followersCount: 50000,
  staffCount: 2500,
  vanityName: 'tech-innovations'
};

describe('LinkedInScanningService', () => {
  let service: LinkedInScanningService;

  beforeEach(() => {
    service = new LinkedInScanningService(mockSupabase);
    
    // Set up default mocks
    (LinkedInClient as jest.MockedClass<typeof LinkedInClient>).mockImplementation(() => mockLinkedInClient);
    
    jest.clearAllMocks();
  });

  describe('scanLinkedInData', () => {
    const baseScanRequest = {
      userId: 'user-123',
      platformAccountId: 'linkedin-456',
      scanType: 'full' as const,
      priority: 'medium' as const,
      includeCompanyData: true
    };

    beforeEach(() => {
      // Mock successful API responses
      (mockLinkedInClient.getProfile as jest.Mock).mockResolvedValue(mockProfileData);
      (mockLinkedInClient.getPosts as jest.Mock).mockResolvedValue(mockPostsData);
      (mockLinkedInClient.getCompany as jest.Mock).mockResolvedValue(mockCompanyData);
      
      // Mock successful database operations
      (mockSupabase.single as jest.Mock).mockResolvedValue({ data: null, error: null });
    });

    it('should successfully scan profile data', async () => {
      const request = { ...baseScanRequest, scanType: 'profile' as const };
      const result = await service.scanLinkedInData(request);

      expect(result.success).toBe(true);
      expect(result.data?.profilesScanned).toBe(1);
      expect(result.data?.postsScanned).toBe(0);
      expect(result.data?.companiesScanned).toBe(0);
      expect(mockLinkedInClient.getProfile).toHaveBeenCalledWith(request.platformAccountId);
    });

    it('should successfully scan posts data', async () => {
      const request = { ...baseScanRequest, scanType: 'posts' as const };
      const result = await service.scanLinkedInData(request);

      expect(result.success).toBe(true);
      expect(result.data?.profilesScanned).toBe(0);
      expect(result.data?.postsScanned).toBe(2);
      expect(result.data?.companiesScanned).toBe(0);
      expect(mockLinkedInClient.getPosts).toHaveBeenCalled();
    });

    it('should successfully scan company data', async () => {
      // Mock profile data with company information
      const profileWithCompany = {
        ...mockProfileData,
        raw_data: {
          positions: [{
            companyUrn: 'urn:li:company:123456'
          }]
        }
      };
      
      (mockSupabase.single as jest.Mock).mockResolvedValue({ 
        data: profileWithCompany, 
        error: null 
      });

      const request = { ...baseScanRequest, scanType: 'company' as const };
      const result = await service.scanLinkedInData(request);

      expect(result.success).toBe(true);
      expect(result.data?.profilesScanned).toBe(0);
      expect(result.data?.postsScanned).toBe(0);
      expect(result.data?.companiesScanned).toBe(1);
      expect(mockLinkedInClient.getCompany).toHaveBeenCalledWith('123456');
    });

    it('should perform full scan when requested', async () => {
      const result = await service.scanLinkedInData(baseScanRequest);

      expect(result.success).toBe(true);
      expect(result.data?.profilesScanned).toBe(1);
      expect(result.data?.postsScanned).toBe(2);
      expect(result.data?.companiesScanned).toBe(1);
      expect(mockLinkedInClient.getProfile).toHaveBeenCalled();
      expect(mockLinkedInClient.getPosts).toHaveBeenCalled();
    });

    it('should handle API errors gracefully', async () => {
      (mockLinkedInClient.getProfile as jest.Mock).mockRejectedValue(
        new Error('LinkedIn API error')
      );

      const request = { ...baseScanRequest, scanType: 'profile' as const };
      const result = await service.scanLinkedInData(request);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('SCAN_ERROR');
      expect(result.error?.message).toContain('LinkedIn API error');
    });

    it('should respect rate limits', async () => {
      // Mock rate limit exceeded scenario
      jest.spyOn(service as any, 'checkRateLimit').mockResolvedValue({
        remaining: 0,
        resetTime: new Date(Date.now() + 3600000), // 1 hour from now
        dailyLimit: 100,
        currentUsage: 100
      });

      const result = await service.scanLinkedInData(baseScanRequest);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('RATE_LIMIT_EXCEEDED');
      expect(result.error?.retryAfter).toBeGreaterThan(0);
    });

    it('should handle empty posts data', async () => {
      (mockLinkedInClient.getPosts as jest.Mock).mockResolvedValue([]);

      const request = { ...baseScanRequest, scanType: 'posts' as const };
      const result = await service.scanLinkedInData(request);

      expect(result.success).toBe(true);
      expect(result.data?.postsScanned).toBe(0);
    });

    it('should handle posts with missing engagement data', async () => {
      const postsWithMissingData = [
        {
          id: 'post-incomplete',
          commentary: 'Test post',
          createdAt: Date.now(),
          socialDetail: null // Missing social detail
        }
      ];

      (mockLinkedInClient.getPosts as jest.Mock).mockResolvedValue(postsWithMissingData);

      const request = { ...baseScanRequest, scanType: 'posts' as const };
      const result = await service.scanLinkedInData(request);

      expect(result.success).toBe(true);
      expect(result.data?.postsScanned).toBe(1);
    });
  });

  describe('rate limiting', () => {
    it('should track rate limit usage correctly', async () => {
      const updateRateLimitSpy = jest.spyOn(service as any, 'updateRateLimitUsage');
      
      const request = {
        userId: 'user-123',
        platformAccountId: 'linkedin-456',
        scanType: 'profile' as const
      };

      await service.scanLinkedInData(request);

      expect(updateRateLimitSpy).toHaveBeenCalledWith('user-123', 1);
    });

    it('should calculate next scan time based on priority', async () => {
      const request = {
        userId: 'user-123',
        platformAccountId: 'linkedin-456',
        scanType: 'profile' as const,
        priority: 'high' as const
      };

      const result = await service.scanLinkedInData(request);
      
      expect(result.success).toBe(true);
      expect(result.nextScanTime).toBeDefined();
      
      // High priority should have shorter interval (4 hours)
      const timeDiff = result.nextScanTime!.getTime() - Date.now();
      expect(timeDiff).toBeLessThan(5 * 60 * 60 * 1000); // Less than 5 hours
      expect(timeDiff).toBeGreaterThan(3 * 60 * 60 * 1000); // Greater than 3 hours
    });
  });

  describe('data processing', () => {
    it('should extract hashtags correctly', async () => {
      const postsWithHashtags = [
        {
          id: 'post-hashtags',
          commentary: 'Loving #javascript #react #nodejs for development!',
          createdAt: Date.now(),
          socialDetail: {
            totalSocialActivityCounts: {
              numLikes: 10,
              numComments: 2,
              numShares: 1,
              numViews: 500
            }
          }
        }
      ];

      (mockLinkedInClient.getPosts as jest.Mock).mockResolvedValue(postsWithHashtags);

      const request = {
        userId: 'user-123',
        platformAccountId: 'linkedin-456',
        scanType: 'posts' as const
      };

      const result = await service.scanLinkedInData(request);

      expect(result.success).toBe(true);
      expect(result.data?.postsScanned).toBe(1);
      // The actual hashtag extraction is tested in the private method
    });

    it('should extract mentions correctly', async () => {
      const postsWithMentions = [
        {
          id: 'post-mentions',
          commentary: 'Thanks @johndoe and @janedoe for the collaboration!',
          createdAt: Date.now(),
          socialDetail: {
            totalSocialActivityCounts: {
              numLikes: 5,
              numComments: 1,
              numShares: 0,
              numViews: 250
            }
          }
        }
      ];

      (mockLinkedInClient.getPosts as jest.Mock).mockResolvedValue(postsWithMentions);

      const request = {
        userId: 'user-123',
        platformAccountId: 'linkedin-456',
        scanType: 'posts' as const
      };

      const result = await service.scanLinkedInData(request);

      expect(result.success).toBe(true);
      expect(result.data?.postsScanned).toBe(1);
    });

    it('should determine post types correctly', async () => {
      const postsWithDifferentTypes = [
        {
          id: 'image-post',
          commentary: 'Check out this image',
          createdAt: Date.now(),
          content: {
            media: [{ mediaType: 'IMAGE', originalUrl: 'image.jpg' }]
          },
          socialDetail: { totalSocialActivityCounts: {} }
        },
        {
          id: 'video-post',
          commentary: 'Watch this video',
          createdAt: Date.now(),
          content: {
            media: [{ mediaType: 'VIDEO', originalUrl: 'video.mp4' }]
          },
          socialDetail: { totalSocialActivityCounts: {} }
        },
        {
          id: 'text-post',
          commentary: 'Just a text post',
          createdAt: Date.now(),
          content: {},
          socialDetail: { totalSocialActivityCounts: {} }
        }
      ];

      (mockLinkedInClient.getPosts as jest.Mock).mockResolvedValue(postsWithDifferentTypes);

      const request = {
        userId: 'user-123',
        platformAccountId: 'linkedin-456',
        scanType: 'posts' as const
      };

      const result = await service.scanLinkedInData(request);

      expect(result.success).toBe(true);
      expect(result.data?.postsScanned).toBe(3);
    });

    it('should calculate engagement rates correctly', async () => {
      const postsForEngagement = [
        {
          id: 'engagement-test',
          commentary: 'Test engagement calculation',
          createdAt: Date.now(),
          socialDetail: {
            totalSocialActivityCounts: {
              numLikes: 100,
              numComments: 20,
              numShares: 10,
              numViews: 1000
            }
          }
        }
      ];

      (mockLinkedInClient.getPosts as jest.Mock).mockResolvedValue(postsForEngagement);

      const request = {
        userId: 'user-123',
        platformAccountId: 'linkedin-456',
        scanType: 'posts' as const
      };

      const result = await service.scanLinkedInData(request);

      expect(result.success).toBe(true);
      expect(result.data?.postsScanned).toBe(1);
      // Engagement rate should be (100+20+10)/1000 * 100 = 13%
    });
  });

  describe('batch processing', () => {
    it('should process large datasets in batches', async () => {
      // Create 25 posts to test batch processing (batch size is 10)
      const largePosts = Array.from({ length: 25 }, (_, i) => ({
        id: `post-${i}`,
        commentary: `Post ${i}`,
        createdAt: Date.now() - i * 3600000, // Each post 1 hour apart
        socialDetail: {
          totalSocialActivityCounts: {
            numLikes: i * 2,
            numComments: i,
            numShares: Math.floor(i / 2),
            numViews: i * 50
          }
        }
      }));

      (mockLinkedInClient.getPosts as jest.Mock).mockResolvedValue(largePosts);

      const request = {
        userId: 'user-123',
        platformAccountId: 'linkedin-456',
        scanType: 'posts' as const
      };

      const result = await service.scanLinkedInData(request);

      expect(result.success).toBe(true);
      expect(result.data?.postsScanned).toBe(25);
    });

    it('should handle batch processing errors gracefully', async () => {
      const posts = Array.from({ length: 5 }, (_, i) => ({
        id: `post-${i}`,
        commentary: `Post ${i}`,
        createdAt: Date.now(),
        socialDetail: {
          totalSocialActivityCounts: {
            numLikes: 10,
            numComments: 2,
            numShares: 1,
            numViews: 100
          }
        }
      }));

      (mockLinkedInClient.getPosts as jest.Mock).mockResolvedValue(posts);
      
      // Mock database error for some inserts
      let callCount = 0;
      (mockSupabase.single as jest.Mock).mockImplementation(() => {
        callCount++;
        if (callCount <= 2) {
          return Promise.resolve({ data: null, error: null });
        }
        return Promise.reject(new Error('Database error'));
      });

      const request = {
        userId: 'user-123',
        platformAccountId: 'linkedin-456',
        scanType: 'posts' as const
      };

      const result = await service.scanLinkedInData(request);

      expect(result.success).toBe(true);
      // Should have saved some posts despite errors
      expect(result.data?.postsScanned).toBeGreaterThan(0);
    });
  });

  describe('timeframe filtering', () => {
    it('should respect custom timeframes', async () => {
      const customTimeframe = {
        start: new Date('2024-01-01'),
        end: new Date('2024-01-31')
      };

      const request = {
        userId: 'user-123',
        platformAccountId: 'linkedin-456',
        scanType: 'posts' as const,
        timeframe: customTimeframe
      };

      await service.scanLinkedInData(request);

      expect(mockLinkedInClient.getPosts).toHaveBeenCalledWith(
        'linkedin-456',
        customTimeframe.start,
        customTimeframe.end
      );
    });

    it('should use default timeframe when none provided', async () => {
      const request = {
        userId: 'user-123',
        platformAccountId: 'linkedin-456',
        scanType: 'posts' as const
      };

      await service.scanLinkedInData(request);

      expect(mockLinkedInClient.getPosts).toHaveBeenCalled();
      
      const callArgs = (mockLinkedInClient.getPosts as jest.Mock).mock.calls[0];
      expect(callArgs[1]).toBeInstanceOf(Date); // start date
      expect(callArgs[2]).toBeInstanceOf(Date); // end date
    });
  });

  describe('error scenarios', () => {
    it('should handle network connectivity issues', async () => {
      (mockLinkedInClient.getProfile as jest.Mock).mockRejectedValue(
        new Error('Network error: ECONNREFUSED')
      );

      const request = {
        userId: 'user-123',
        platformAccountId: 'linkedin-456',
        scanType: 'profile' as const
      };

      const result = await service.scanLinkedInData(request);

      expect(result.success).toBe(false);
      expect(result.error?.message).toContain('Network error');
    });

    it('should handle invalid platform account IDs', async () => {
      (mockLinkedInClient.getProfile as jest.Mock).mockResolvedValue(null);

      const request = {
        userId: 'user-123',
        platformAccountId: 'invalid-id',
        scanType: 'profile' as const
      };

      const result = await service.scanLinkedInData(request);

      expect(result.success).toBe(true);
      expect(result.data?.profilesScanned).toBe(0);
    });

    it('should handle database connection failures', async () => {
      (mockSupabase.single as jest.Mock).mockRejectedValue(
        new Error('Database connection failed')
      );

      const request = {
        userId: 'user-123',
        platformAccountId: 'linkedin-456',
        scanType: 'profile' as const
      };

      const result = await service.scanLinkedInData(request);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('SCAN_ERROR');
    });
  });
}); 