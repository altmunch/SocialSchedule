import { ContentOptimizer } from '../../contentOptimizer';
import { Platform } from '@/types/platform';

describe('ContentOptimizer', () => {
  describe('optimizeContent', () => {
    it('returns optimized content for Instagram', () => {
      const content = 'This is a test content that needs optimization.';
      const result = ContentOptimizer.optimizeContent(content, 'instagram');
      
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
      expect(result).toContain('#'); // Should add hashtags for Instagram
    });

    it('returns optimized content for Twitter', () => {
      const content = 'This is a test content that needs optimization.';
      const result = ContentOptimizer.optimizeContent(content, 'twitter');
      
      expect(typeof result).toBe('string');
      expect(result.length).toBeLessThanOrEqual(280); // Twitter's character limit
    });

    it('respects max length', () => {
      const longContent = 'a'.repeat(3000);
      const result = ContentOptimizer.optimizeContent(longContent, 'twitter');
      expect(result.length).toBeLessThanOrEqual(280);
    });
  });

  describe('getImageDimensions', () => {
    it('returns correct dimensions for 1:1 aspect ratio', () => {
      const { width, height } = ContentOptimizer.getImageDimensions('1:1');
      expect(width).toBe(1200);
      expect(height).toBe(1200);
    });

    it('returns correct dimensions for 16:9 aspect ratio', () => {
      const { width, height } = ContentOptimizer.getImageDimensions('16:9');
      expect(width).toBe(1200);
      expect(height).toBe(675); // 1200 * (9/16)
    });
  });
});
