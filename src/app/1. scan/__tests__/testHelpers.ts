import { Platform, PostMetrics, Competitor, ScanResult, ScanOptions } from '../services/types';

// Mock data generators
export const generateMockPostMetrics = (overrides: Partial<PostMetrics> = {}): PostMetrics => ({
  id: `post-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
  platform: 'tiktok',
  views: 1000,
  likes: 100,
  comments: 10,
  shares: 5,
  watchTime: 45,
  engagementRate: 11.5,
  timestamp: new Date(),
  caption: 'Test post',
  hashtags: ['test'],
  url: 'https://example.com/post/1',
  ...overrides,
});

export const generateMockCompetitor = (overrides: Partial<Competitor> = {}): Competitor => ({
  id: `competitor-${Date.now()}`,
  username: 'test_competitor',
  platform: 'tiktok',
  followerCount: 10000,
  lastScraped: new Date(),
  ...overrides,
});

export const generateMockScanResult = (overrides: Partial<ScanResult> = {}): ScanResult => {
  const defaultMetrics = {
    totalPosts: 10,
    averageEngagement: 8.5,
    peakTimes: [
      { hour: 12, engagementScore: 15.5 },
      { hour: 18, engagementScore: 12.3 }
    ],
    topPerformingPosts: [generateMockPostMetrics()]
  };

  return {
    id: `scan-${Date.now()}`,
    status: 'completed',
    platform: 'tiktok',
    userId: 'user123',
    startTime: new Date(),
    endTime: new Date(),
    metrics: {
      ...defaultMetrics,
      ...overrides.metrics,
    },
    ...overrides,
  };
};

export const defaultScanOptions: ScanOptions = {
  platforms: ['tiktok'],
  lookbackDays: 7,
  includeOwnPosts: true,
  competitors: [],
};

// Mock implementations
export const mockPlatformClient = {
  getPostMetrics: jest.fn().mockResolvedValue(generateMockPostMetrics()),
  getUserPosts: jest.fn().mockResolvedValue([generateMockPostMetrics()]),
  getCompetitorPosts: jest.fn().mockResolvedValue([generateMockPostMetrics()]),
};

export const TEST_PLATFORMS: Platform[] = ['tiktok', 'instagram', 'youtube'];

// Helper function to wait for a specified time
export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));