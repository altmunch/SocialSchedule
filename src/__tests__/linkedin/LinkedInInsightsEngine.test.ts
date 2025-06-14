/**
 * LinkedIn Insights Engine Tests
 * Comprehensive unit tests for LinkedIn analytics functionality
 */

import { LinkedInInsightsEngine, LinkedInAnalysisRequest } from '@/app/workflows/data_analysis/engines/LinkedInInsightsEngine';
import { RawLinkedInPost, RawLinkedInProfile, RawLinkedInCompany } from '@/app/workflows/data_collection/types/linkedinTypes';
import { SupabaseClient } from '@supabase/supabase-js';

// Mock Supabase client
const mockSupabase = {
  from: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  gte: jest.fn().mockReturnThis(),
  lte: jest.fn().mockReturnThis(),
  order: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  single: jest.fn(),
  // Add other methods as needed
} as unknown as SupabaseClient;

// Mock data
const mockLinkedInProfile: RawLinkedInProfile = {
  platform_user_id: 'test-user-123',
  user_id: 'user-456',
  display_name: 'John Doe',
  headline: 'Senior Software Engineer',
  summary: 'Passionate about building scalable applications',
  location: 'San Francisco, CA',
  industry: 'Technology',
  connections_count: 500,
  followers_count: 1200,
  profile_views: 150,
  skills: ['JavaScript', 'React', 'Node.js'],
  experience: [],
  education: [],
  certifications: [],
  languages: ['English', 'Spanish'],
  profile_url: 'https://linkedin.com/in/johndoe',
  profile_picture_url: 'https://example.com/profile.jpg',
  background_image_url: 'https://example.com/background.jpg',
  is_premium: false,
  premium_features: [],
  last_fetched_at: new Date(),
  raw_data: {}
};

const mockLinkedInPosts: RawLinkedInPost[] = [
  {
    platform_post_id: 'post-1',
    user_id: 'user-456',
    platform_user_id: 'test-user-123',
    post_type: 'TEXT',
    content: 'Just launched a new feature! #innovation #tech',
    media_urls: [],
    timestamp: new Date('2024-01-15T10:00:00Z'),
    likes_count: 25,
    comments_count: 5,
    shares_count: 3,
    clicks_count: 45,
    impressions_count: 1000,
    reach_count: 800,
    engagement_rate: 3.3,
    hashtags: ['#innovation', '#tech'],
    mentions: [],
    post_url: 'https://linkedin.com/feed/update/post-1',
    is_promoted: false,
    industry: 'Technology',
    seniority_level: 'Senior',
    company_size: '1000-5000',
    job_function: 'Engineering',
    last_fetched_at: new Date(),
    raw_data: {}
  },
  {
    platform_post_id: 'post-2',
    user_id: 'user-456',
    platform_user_id: 'test-user-123',
    post_type: 'IMAGE',
    content: 'Team building event today! Great to see everyone collaborate.',
    media_urls: ['https://example.com/image.jpg'],
    timestamp: new Date('2024-01-12T14:30:00Z'),
    likes_count: 42,
    comments_count: 8,
    shares_count: 2,
    clicks_count: 120,
    impressions_count: 1500,
    reach_count: 1200,
    engagement_rate: 3.47,
    hashtags: [],
    mentions: [],
    post_url: 'https://linkedin.com/feed/update/post-2',
    is_promoted: false,
    industry: 'Technology',
    seniority_level: 'Mid',
    company_size: '1000-5000',
    job_function: 'Engineering',
    last_fetched_at: new Date(),
    raw_data: {}
  }
];

describe('LinkedInInsightsEngine', () => {
  let engine: LinkedInInsightsEngine;
  let mockRequest: LinkedInAnalysisRequest;

  beforeEach(() => {
    engine = new LinkedInInsightsEngine(mockSupabase);
    mockRequest = {
      userId: 'user-456',
      profileId: 'test-user-123',
      includeCompetitorAnalysis: true,
      industry: 'Technology',
      timeframe: {
        start: new Date('2024-01-01'),
        end: new Date('2024-01-31')
      },
      correlationId: 'test-correlation-123'
    };

    // Reset all mocks
    jest.clearAllMocks();
  });

  describe('analyzeLinkedInPresence', () => {
    beforeEach(() => {
      // Mock Supabase responses
      (mockSupabase.from as jest.Mock).mockImplementation((table: string) => {
        if (table === 'raw_linkedin_profiles') {
          return {
            ...mockSupabase,
            single: jest.fn().mockResolvedValue({ data: mockLinkedInProfile, error: null })
          };
        }
        if (table === 'raw_linkedin_posts') {
          return {
            ...mockSupabase,
            single: jest.fn().mockResolvedValue({ data: mockLinkedInPosts, error: null })
          };
        }
        return mockSupabase;
      });
    });

    it('should successfully analyze LinkedIn presence with complete data', async () => {
      const result = await engine.analyzeLinkedInPresence(mockRequest);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.engagementMetrics).toBeDefined();
      expect(result.data?.audienceDemographics).toBeDefined();
      expect(result.data?.contentInsights).toBeDefined();
      expect(result.data?.professionalGrowth).toBeDefined();
      expect(result.data?.recommendations).toBeDefined();
      expect(result.metadata?.source).toBe('LinkedInInsightsEngine');
    });

    it('should include competitor analysis when requested', async () => {
      const result = await engine.analyzeLinkedInPresence(mockRequest);

      expect(result.success).toBe(true);
      expect(result.data?.competitorComparison).toBeDefined();
      expect(result.data?.competitorComparison?.topCompetitors).toHaveLength(3);
    });

    it('should handle missing profile data gracefully', async () => {
      (mockSupabase.from as jest.Mock).mockImplementation((table: string) => {
        if (table === 'raw_linkedin_profiles') {
          return {
            ...mockSupabase,
            single: jest.fn().mockResolvedValue({ data: null, error: null })
          };
        }
        return mockSupabase;
      });

      const result = await engine.analyzeLinkedInPresence(mockRequest);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    it('should handle database errors appropriately', async () => {
      (mockSupabase.from as jest.Mock).mockImplementation(() => ({
        ...mockSupabase,
        single: jest.fn().mockRejectedValue(new Error('Database connection failed'))
      }));

      const result = await engine.analyzeLinkedInPresence(mockRequest);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('LINKEDIN_ANALYSIS_ERROR');
    });

    it('should exclude competitor analysis when not requested', async () => {
      const requestWithoutCompetitor = {
        ...mockRequest,
        includeCompetitorAnalysis: false
      };

      const result = await engine.analyzeLinkedInPresence(requestWithoutCompetitor);

      expect(result.success).toBe(true);
      expect(result.data?.competitorComparison).toBeUndefined();
    });
  });

  describe('engagement metrics calculation', () => {
    it('should calculate correct engagement metrics from posts', async () => {
      // Mock the private method by accessing it through the public interface
      const result = await engine.analyzeLinkedInPresence(mockRequest);

      expect(result.success).toBe(true);
      expect(result.data?.engagementMetrics.engagementRate).toBeGreaterThan(0);
      expect(result.data?.engagementMetrics.totalLikes).toBe(67); // 25 + 42
      expect(result.data?.engagementMetrics.totalComments).toBe(13); // 5 + 8
      expect(result.data?.engagementMetrics.totalShares).toBe(5); // 3 + 2
    });

    it('should handle zero engagement posts', async () => {
      const postsWithZeroEngagement = mockLinkedInPosts.map(post => ({
        ...post,
        likes_count: 0,
        comments_count: 0,
        shares_count: 0
      }));

      (mockSupabase.from as jest.Mock).mockImplementation((table: string) => {
        if (table === 'raw_linkedin_posts') {
          return {
            ...mockSupabase,
            single: jest.fn().mockResolvedValue({ data: postsWithZeroEngagement, error: null })
          };
        }
        return mockSupabase;
      });

      const result = await engine.analyzeLinkedInPresence(mockRequest);

      expect(result.success).toBe(true);
      expect(result.data?.engagementMetrics.engagementRate).toBe(0);
    });
  });

  describe('content insights generation', () => {
    it('should identify optimal posting times', async () => {
      const result = await engine.analyzeLinkedInPresence(mockRequest);

      expect(result.success).toBe(true);
      expect(result.data?.contentInsights.optimalPostTimes).toBeDefined();
      expect(result.data?.contentInsights.optimalPostTimes.length).toBeGreaterThan(0);
    });

    it('should analyze content type performance', async () => {
      const result = await engine.analyzeLinkedInPresence(mockRequest);

      expect(result.success).toBe(true);
      expect(result.data?.contentInsights.topPerformingContentTypes).toBeDefined();
      expect(result.data?.contentInsights.topPerformingContentTypes.length).toBeGreaterThan(0);
    });

    it('should provide hashtag recommendations', async () => {
      const result = await engine.analyzeLinkedInPresence(mockRequest);

      expect(result.success).toBe(true);
      expect(result.data?.contentInsights.hashtagRecommendations).toBeDefined();
      expect(result.data?.contentInsights.hashtagRecommendations.length).toBeGreaterThan(0);
    });
  });

  describe('audience demographics analysis', () => {
    it('should analyze seniority level distribution', async () => {
      const result = await engine.analyzeLinkedInPresence(mockRequest);

      expect(result.success).toBe(true);
      expect(result.data?.audienceDemographics.seniority).toBeDefined();
      expect(typeof result.data?.audienceDemographics.seniority).toBe('object');
    });

    it('should analyze industry distribution', async () => {
      const result = await engine.analyzeLinkedInPresence(mockRequest);

      expect(result.success).toBe(true);
      expect(result.data?.audienceDemographics.industry).toBeDefined();
      expect(result.data?.audienceDemographics.industry.Technology).toBeDefined();
    });

    it('should analyze company size distribution', async () => {
      const result = await engine.analyzeLinkedInPresence(mockRequest);

      expect(result.success).toBe(true);
      expect(result.data?.audienceDemographics.companySize).toBeDefined();
      expect(result.data?.audienceDemographics.companySize['1000-5000']).toBeDefined();
    });
  });

  describe('professional growth metrics', () => {
    it('should calculate thought leadership score', async () => {
      const result = await engine.analyzeLinkedInPresence(mockRequest);

      expect(result.success).toBe(true);
      expect(result.data?.professionalGrowth.thoughtLeadershipScore).toBeDefined();
      expect(result.data?.professionalGrowth.thoughtLeadershipScore).toBeGreaterThanOrEqual(0);
      expect(result.data?.professionalGrowth.thoughtLeadershipScore).toBeLessThanOrEqual(100);
    });

    it('should determine profile view trend', async () => {
      const result = await engine.analyzeLinkedInPresence(mockRequest);

      expect(result.success).toBe(true);
      expect(result.data?.professionalGrowth.profileViewTrend).toBeDefined();
      expect(['increasing', 'decreasing', 'stable']).toContain(
        result.data?.professionalGrowth.profileViewTrend
      );
    });

    it('should calculate industry position percentile', async () => {
      const result = await engine.analyzeLinkedInPresence(mockRequest);

      expect(result.success).toBe(true);
      expect(result.data?.professionalGrowth.industryPosition).toBeDefined();
      expect(result.data?.professionalGrowth.industryPosition).toBeGreaterThanOrEqual(0);
      expect(result.data?.professionalGrowth.industryPosition).toBeLessThanOrEqual(100);
    });
  });

  describe('recommendations generation', () => {
    it('should generate engagement recommendations for low engagement', async () => {
      // Create posts with low engagement
      const lowEngagementPosts = mockLinkedInPosts.map(post => ({
        ...post,
        engagement_rate: 0.5 // Very low engagement
      }));

      (mockSupabase.from as jest.Mock).mockImplementation((table: string) => {
        if (table === 'raw_linkedin_posts') {
          return {
            ...mockSupabase,
            single: jest.fn().mockResolvedValue({ data: lowEngagementPosts, error: null })
          };
        }
        return mockSupabase;
      });

      const result = await engine.analyzeLinkedInPresence(mockRequest);

      expect(result.success).toBe(true);
      expect(result.data?.recommendations).toBeDefined();
      
      const engagementRecs = result.data?.recommendations.filter(rec => rec.type === 'engagement');
      expect(engagementRecs?.length).toBeGreaterThan(0);
    });

    it('should generate content recommendations', async () => {
      const result = await engine.analyzeLinkedInPresence(mockRequest);

      expect(result.success).toBe(true);
      expect(result.data?.recommendations).toBeDefined();
      
      const contentRecs = result.data?.recommendations.filter(rec => rec.type === 'content');
      expect(contentRecs?.length).toBeGreaterThan(0);
    });

    it('should generate posting time recommendations', async () => {
      const result = await engine.analyzeLinkedInPresence(mockRequest);

      expect(result.success).toBe(true);
      expect(result.data?.recommendations).toBeDefined();
      
      const postingRecs = result.data?.recommendations.filter(rec => rec.type === 'posting');
      expect(postingRecs?.length).toBeGreaterThan(0);
    });

    it('should prioritize recommendations correctly', async () => {
      const result = await engine.analyzeLinkedInPresence(mockRequest);

      expect(result.success).toBe(true);
      expect(result.data?.recommendations).toBeDefined();
      
      // Check that all recommendations have valid priorities
      result.data?.recommendations.forEach(rec => {
        expect(['high', 'medium', 'low']).toContain(rec.priority);
        expect(rec.expectedImpact).toBeDefined();
        expect(rec.expectedImpact.length).toBeGreaterThan(0);
      });
    });
  });

  describe('error handling', () => {
    it('should handle network timeouts gracefully', async () => {
      (mockSupabase.from as jest.Mock).mockImplementation(() => ({
        ...mockSupabase,
        single: jest.fn().mockRejectedValue(new Error('Network timeout'))
      }));

      const result = await engine.analyzeLinkedInPresence(mockRequest);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('LINKEDIN_ANALYSIS_ERROR');
      expect(result.metadata?.correlationId).toBe(mockRequest.correlationId);
    });

    it('should validate input parameters', async () => {
      const invalidRequest = {
        ...mockRequest,
        userId: '', // Invalid empty user ID
      };

      const result = await engine.analyzeLinkedInPresence(invalidRequest);

      // Should still process but might have limitations
      expect(result).toBeDefined();
    });
  });

  describe('performance', () => {
    it('should complete analysis within reasonable time', async () => {
      const startTime = Date.now();
      const result = await engine.analyzeLinkedInPresence(mockRequest);
      const endTime = Date.now();

      expect(result.success).toBe(true);
      expect(endTime - startTime).toBeLessThan(5000); // Should complete within 5 seconds
    });

    it('should handle large datasets efficiently', async () => {
      // Create a large dataset
      const largePosts = Array.from({ length: 100 }, (_, i) => ({
        ...mockLinkedInPosts[0],
        platform_post_id: `post-${i}`,
        timestamp: new Date(2024, 0, i + 1) // Different dates
      }));

      (mockSupabase.from as jest.Mock).mockImplementation((table: string) => {
        if (table === 'raw_linkedin_posts') {
          return {
            ...mockSupabase,
            single: jest.fn().mockResolvedValue({ data: largePosts, error: null })
          };
        }
        return mockSupabase;
      });

      const startTime = Date.now();
      const result = await engine.analyzeLinkedInPresence(mockRequest);
      const endTime = Date.now();

      expect(result.success).toBe(true);
      expect(endTime - startTime).toBeLessThan(10000); // Should handle 100 posts within 10 seconds
    });
  });
}); 