// difficult: Tests for PostAnalyzer
import { PostAnalyzer } from '../services/analysis/PostAnalyzer';
import { generateMockPostMetrics } from './testHelpers';

describe('PostAnalyzer', () => {
  let postAnalyzer: PostAnalyzer;
  
  const mockPosts = [
    generateMockPostMetrics({
      id: 'post1',
      views: 1000,
      likes: 100,
      comments: 10,
      shares: 5,
      watchTime: 45,
      engagementRate: 11.5,
      timestamp: new Date('2023-01-01T10:00:00Z'),
      caption: 'Test post #test #example',
      hashtags: ['test', 'example'],
      metadata: { watchTime: 45 }
    }),
    generateMockPostMetrics({
      id: 'post2',
      views: 2000,
      likes: 200,
      comments: 20,
      shares: 10,
      watchTime: 60,
      engagementRate: 15.5,
      timestamp: new Date('2023-01-02T15:30:00Z'),
      caption: 'Another test post #test',
      hashtags: ['test'],
      metadata: { watchTime: 60 }
    })
  ];

  beforeEach(() => {
    postAnalyzer = new PostAnalyzer([...mockPosts]);
  });

  describe('calculateWeightedEngagement', () => {
    it('should calculate engagement score for a post', () => {
      const post = mockPosts[0];
      const score = (postAnalyzer as any).calculateWeightedEngagement(post);
      
      expect(score).toBeGreaterThan(0);
      expect(score).toBeLessThanOrEqual(100);
    });

    it('should return 0 for empty posts array', () => {
      const emptyAnalyzer = new PostAnalyzer([]);
      const score = (emptyAnalyzer as any).calculateWeightedEngagement(mockPosts[0]);
      expect(score).toBe(0);
    });
  });

  describe('calculateAverageEngagement', () => {
    it('should calculate average engagement across all posts', () => {
      const avgEngagement = (postAnalyzer as any).calculateAverageEngagement();
      
      expect(avgEngagement).toBeGreaterThan(0);
      expect(avgEngagement).toBeLessThanOrEqual(100);
    });

    it('should return 0 for empty posts array', () => {
      const emptyAnalyzer = new PostAnalyzer([]);
      const avgEngagement = (emptyAnalyzer as any).calculateAverageEngagement();
      expect(avgEngagement).toBe(0);
    });
  });

  describe('findPeakTimes', () => {
    it('should find peak engagement times', () => {
      const peakTimes = postAnalyzer.findPeakTimes('UTC');
      
      expect(Array.isArray(peakTimes)).toBe(true);
      expect(peakTimes.length).toBeGreaterThan(0);
      
      // Check that peak times are sorted by engagement
      for (let i = 1; i < peakTimes.length; i++) {
        expect(peakTimes[i].engagementScore).toBeLessThanOrEqual(peakTimes[i - 1].engagementScore);
      }
    });

    it('should handle different timezones', () => {
      const utcPeakTimes = postAnalyzer.findPeakTimes('UTC');
      const sgtPeakTimes = postAnalyzer.findPeakTimes('Asia/Singapore');
      
      // The actual values will differ but the structure should be the same
      expect(utcPeakTimes.length).toBeGreaterThan(0);
      expect(sgtPeakTimes.length).toBeGreaterThan(0);
      expect(utcPeakTimes[0].timezone).toBe('UTC');
      expect(sgtPeakTimes[0].timezone).toBe('Asia/Singapore');
    });
  });

  describe('findTopPerformingPosts', () => {
    it('should return top performing posts', () => {
      const topPosts = postAnalyzer.findTopPerformingPosts(1);
      
      expect(topPosts).toHaveLength(1);
      expect(topPosts[0].id).toBe('post2'); // post2 has higher engagement
    });

    it('should respect the limit parameter', () => {
      const topPosts = postAnalyzer.findTopPerformingPosts(1);
      expect(topPosts).toHaveLength(1);
      
      const allPosts = postAnalyzer.findTopPerformingPosts(10);
      expect(allPosts.length).toBe(2);
    });
  });

  describe('analyzeHashtags', () => {
    it('should analyze hashtag performance', () => {
      const hashtagStats = postAnalyzer.analyzeHashtags();
      
      expect(hashtagStats).toHaveLength(2);
      
      const testHashtag = hashtagStats.find(h => h.hashtag === 'test');
      const exampleHashtag = hashtagStats.find(h => h.hashtag === 'example');
      
      expect(testHashtag).toBeDefined();
      expect(exampleHashtag).toBeDefined();
      
      // 'test' appears in both posts, 'example' only in one
      expect(testHashtag?.count).toBe(2);
      expect(exampleHashtag?.count).toBe(1);
    });
  });

  describe('detectAnomalies', () => {
    it('should detect statistical anomalies', () => {
      // Add an outlier post
      const outlierPost = generateMockPostMetrics({
        views: 100000,
        likes: 50000,
        comments: 2000,
        shares: 1000,
        engagementRate: 75.5
      });
      
      const analyzerWithOutlier = new PostAnalyzer([...mockPosts, outlierPost]);
      const anomalies = analyzerWithOutlier.detectAnomalies(1.5);
      
      expect(anomalies).toHaveLength(1);
      expect(anomalies[0].id).toBe(outlierPost.id);
    });

    it('should return empty array when no anomalies found', () => {
      const anomalies = postAnalyzer.detectAnomalies(1.5);
      expect(anomalies).toHaveLength(0);
    });
  });

  describe('cache functionality', () => {
    it('should cache engagement calculations', () => {
      const analyzer = new PostAnalyzer([...mockPosts]);
      const post = mockPosts[0];
      
      // First call should be a cache miss
      const firstCall = (analyzer as any).calculateWeightedEngagement(post);
      
      // Second call should be a cache hit
      const secondCall = (analyzer as any).calculateWeightedEngagement(post);
      
      expect(firstCall).toBe(secondCall);
      
      // Check cache stats
      const stats = (analyzer as any).getCacheStats();
      expect(stats.hits).toBe(1);
      expect(stats.misses).toBe(1);
    });
  });
});
