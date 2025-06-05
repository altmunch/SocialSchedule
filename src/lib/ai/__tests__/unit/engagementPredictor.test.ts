import { EngagementPredictor } from '../../engagementPredictor';
import { Platform } from '@/types/platform';

describe('EngagementPredictor', () => {
  describe('predictEngagement', () => {
    it('returns engagement metrics for content', async () => {
      const platform: Platform = 'instagram';
      const content = 'This is a test content with #hashtag and @mention';
      const historicalData = [];
      
      const result = await EngagementPredictor.predictEngagement(
        platform,
        content,
        historicalData
      );
      
      expect(result).toHaveProperty('likes');
      expect(result).toHaveProperty('comments');
      expect(result).toHaveProperty('shares');
      expect(result).toHaveProperty('saves');
      expect(result).toHaveProperty('reach');
      expect(result).toHaveProperty('impressions');
      expect(result).toHaveProperty('engagementRate');
    });
  });

  describe('predictOptimalPostingTimes', () => {
    it('returns optimal posting times for a platform', async () => {
      const platform: Platform = 'twitter';
      const contentType = 'tweet';
      const historicalData = [];
      const count = 3;
      
      const result = await EngagementPredictor.predictOptimalPostingTimes(
        platform,
        contentType,
        historicalData,
        count
      );
      
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeLessThanOrEqual(count);
      result.forEach(slot => {
        expect(slot).toHaveProperty('startTime');
        expect(slot).toHaveProperty('endTime');
        expect(slot).toHaveProperty('score');
        expect(slot).toHaveProperty('confidence');
      });
    });
  });

  describe('simulateContentPerformance', () => {
    it('ranks content drafts by predicted engagement', async () => {
      const platform: Platform = 'instagram';
      const contentDrafts = [
        'This is a test post',
        'This is a better test post with #hashtag',
        'This is the best test post with #hashtag and @mention'
      ];
      const historicalData = [];
      
      const result = await EngagementPredictor.simulateContentPerformance(
        platform,
        contentDrafts,
        historicalData
      );
      
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(contentDrafts.length);
      
      // Verify results are sorted by engagement rate (highest first)
      for (let i = 1; i < result.length; i++) {
        expect(result[i-1].predictedEngagement.engagementRate).toBeGreaterThanOrEqual(
          result[i].predictedEngagement.engagementRate
        );
      }
    });
  });
});
