import { SentimentAnalyzer } from '../../sentimentAnalyzer';
import { createTestConfig, createMockOpenAI } from '../testUtils';
import { jest } from '@jest/globals';
import { Cache } from '../../../../lib/utils/cache'; // Updated import path for Cache
import { performance } from 'perf_hooks';

// Mock the OpenAI module
jest.mock('openai', () => ({
  OpenAI: jest.fn().mockImplementation(() => createMockOpenAI())
}));

// Mock console.error to reduce test noise
const originalConsoleError = console.error;
const originalConsoleLog = console.log;

beforeEach(() => {
  console.error = jest.fn();
  console.log = jest.fn();
  jest.clearAllMocks();
});

afterEach(() => {
  console.error = originalConsoleError;
  console.log = originalConsoleLog;
});

// Add test output
const logTestInfo = (testName: string) => {
  console.log(`\n=== Running test: ${testName} ===\n`);
};

describe('SentimentAnalyzer - Extended Tests', () => {
  let analyzer: SentimentAnalyzer;
  
  beforeEach(() => {
    const config = createTestConfig({
      useLocalModel: true,
      costTrackingEnabled: true,
      openaiApiKey: 'test-key',
    });
    
    analyzer = new SentimentAnalyzer(config);
    
    // Mock the cache to avoid actual caching during tests
    const mockCache = {
      get: jest.fn().mockReturnValue(undefined),
      set: jest.fn().mockReturnThis(),
      clear: jest.fn(),
      // @ts-ignore - Mock implementation for testing
      _cache: new Map(),
    };
    
    // @ts-ignore - accessing private property for testing
    analyzer.cache = mockCache as unknown as Cache<string, any>;
  });

  describe('analyzeSentiment', () => {
    it('returns sentiment analysis with sentiment score', async () => {
      logTestInfo('analyzeSentiment - returns sentiment analysis with sentiment score');
      // Arrange
      const text = 'I absolutely love this product! It\'s amazing!';
      
      // Mock cache miss
      // @ts-ignore - accessing private property for testing
      analyzer.cache.get.mockReturnValue(undefined);
      
      // Mock performance.now() for consistent testing
      const originalPerformanceNow = performance.now;
      // @ts-ignore - Mocking performance.now for testing
      performance.now = jest.fn(() => 100);
      
      try {
        // Act
        const result = await analyzer.analyzeSentiment(text);
        
        // Assert
        // Check basic sentiment result structure
        expect(result).toHaveProperty('sentiment');
        expect(result).toHaveProperty('sentimentScore');
        expect(result).toHaveProperty('source', 'local');
        expect(result).toHaveProperty('processingTimeMs');
        
        expect(result.sentimentScore).toHaveProperty('score');
        expect(result.sentimentScore).toHaveProperty('magnitude');
        expect(result.sentimentScore).toHaveProperty('confidence');
        
        // Check score ranges
        expect(result.sentimentScore.score).toBeGreaterThanOrEqual(-1);
        expect(result.sentimentScore.score).toBeLessThanOrEqual(1);
        expect(result.sentimentScore.confidence).toBeGreaterThan(0);
        expect(result.sentimentScore.confidence).toBeLessThanOrEqual(1);
        
        // Check sentiment category
        expect(['positive', 'negative', 'neutral']).toContain(result.sentiment);
      } finally {
        // Restore original performance.now
        performance.now = originalPerformanceNow;
      }
    });

    it('returns negative sentiment for negative text', async () => {
      // Arrange
      const text = 'I really dislike this product. It\'s terrible!';
      
      // Mock cache miss
      // @ts-ignore - accessing private property for testing
      analyzer.cache.get.mockReturnValue(undefined);
      
      // Act
      const result = await analyzer.analyzeSentiment(text);
      
      // Assert
      expect(result.sentiment).toBe('negative');
      expect(result.sentimentScore.score).toBeLessThan(0);
    });

    it('returns neutral sentiment for neutral text', async () => {
      // Arrange
      const text = 'This is a product. It has features.';
      
      // Mock cache miss
      // @ts-ignore - accessing private property for testing
      analyzer.cache.get.mockReturnValue(undefined);
      
      // Act
      const result = await analyzer.analyzeSentiment(text);
      
      // Assert
      expect(result.sentiment).toBe('neutral');
      expect(Math.abs(result.sentimentScore.score)).toBeLessThan(0.3);
    });
    
    it('returns cached result when available', async () => {
      // Arrange
      const text = 'This should be cached';
      const cachedResult = {
        sentiment: 'positive' as const,
        sentimentScore: {
          score: 0.8,
          magnitude: 1.6,
          confidence: 0.9
        },
        source: 'cached' as const,
        processingTimeMs: 10
      };
      
      // Mock cache hit
      // @ts-ignore - accessing private property for testing
      analyzer.cache.get.mockReturnValue(cachedResult);
      
      // Act
      const result = await analyzer.analyzeSentiment(text);
      
      // Assert
      expect(result).toEqual(cachedResult);
      // @ts-ignore - accessing private property for testing
      expect(analyzer.cache.get).toHaveBeenCalledWith(expect.any(String));
    });
  });

  describe('resetCostTracking', () => {
    it('resets cost tracking metrics', async () => {
      logTestInfo('resetCostTracking - resets cost tracking metrics');
      // Arrange
      const text = 'I love this!';
      
      // Mock cache miss
      // @ts-ignore - accessing private property for testing
      analyzer.cache.get.mockReturnValue(undefined);
      
      // Act - Perform analysis
      await analyzer.analyzeSentiment(text);
      
      // Verify metrics were updated
      const initialStats = analyzer.getCostStatistics();
      if ('trackingDisabled' in initialStats) {
        expect(initialStats.trackingDisabled).toBeFalsy();
        return;
      }
      expect(initialStats.localAnalysisCount).toBeGreaterThan(0);
      
      // Reset tracking
      analyzer.resetCostTracking();
      
      // Assert - Check metrics after reset
      const stats = analyzer.getCostStatistics();
      
      // Check if tracking is enabled
      if ('trackingDisabled' in stats) {
        expect(stats.trackingDisabled).toBeFalsy();
        return;
      }
      
      expect(stats.localAnalysisCount).toBe(0);
      expect(stats.openaiAnalysisCount).toBe(0);
      expect(stats.cacheHitCount).toBe(0);
      expect(stats.totalTokensUsed).toBe(0);
      expect(stats.estimatedCost).toBe(0);
    });
  });

  describe('getCostStatistics', () => {
    it('returns cost tracking statistics', async () => {
      logTestInfo('getCostStatistics - returns cost tracking statistics');
      // Arrange - Reset tracking to known state
      analyzer.resetCostTracking();
      
      // Mock cache miss for first analysis
      // @ts-ignore - accessing private property for testing
      analyzer.cache.get.mockReturnValue(undefined);
      
      // Act - Perform first analysis (should be a local analysis)
      await analyzer.analyzeSentiment('First analysis');
      
      // Mock cache hit for second analysis
      const cachedResult = {
        sentiment: 'positive' as const,
        sentimentScore: {
          score: 0.8,
          magnitude: 1.6,
          confidence: 0.9
        },
        source: 'cached' as const,
        processingTimeMs: 5
      };
      // @ts-ignore - accessing private property for testing
      analyzer.cache.get.mockReturnValue(cachedResult);
      
      // Perform second analysis (should hit cache)
      await analyzer.analyzeSentiment('Cached analysis');
      
      // Get statistics
      const stats = analyzer.getCostStatistics();
      
      // Assert - Check if tracking is enabled
      if ('trackingDisabled' in stats) {
        expect(stats.trackingDisabled).toBeFalsy();
        return;
      }
      
      // Check all expected properties exist
      expect(stats).toHaveProperty('localAnalysisCount');
      expect(stats).toHaveProperty('openaiAnalysisCount');
      expect(stats).toHaveProperty('cacheHitCount');
      expect(stats).toHaveProperty('totalTokensUsed');
      expect(stats).toHaveProperty('estimatedCost');
      expect(stats).toHaveProperty('cacheHitRate');
      expect(stats).toHaveProperty('apiUsageRate');
      
      // Verify expected values
      expect(stats.localAnalysisCount).toBe(1);
      expect(stats.cacheHitCount).toBe(1);
      expect(stats.openaiAnalysisCount).toBe(0);
      
      // Verify calculations
      expect(stats.cacheHitRate).toBe(0.5); // 1 hit / (1 hit + 1 miss)
      expect(stats.apiUsageRate).toBe(0); // No OpenAI usage
      
      // Verify other rates are within expected ranges
      expect(stats.cacheHitRate).toBeGreaterThanOrEqual(0);
      expect(stats.cacheHitRate).toBeLessThanOrEqual(1);
      expect(stats.apiUsageRate).toBeGreaterThanOrEqual(0);
      expect(stats.apiUsageRate).toBeLessThanOrEqual(1);
    });
  });
});
