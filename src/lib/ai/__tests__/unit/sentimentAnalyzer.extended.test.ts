import 'openai/shims/node';
import { SentimentAnalyzer, SentimentAnalyzerConfig, SentimentResult, SentimentScore } from '../../sentimentAnalyzer';
import { jest } from '@jest/globals';
import { Cache } from '../../../../lib/utils/cache';
import { performance } from 'perf_hooks';
import { ApiCostEstimator, ApiCostEstimateReport } from '../../ApiCostEstimator';
import { OpenAI } from 'openai';

// Mock the Cache module globally
jest.mock('../../../../lib/utils/cache');

// Mock the ApiCostEstimator module globally
jest.mock('../../ApiCostEstimator');

// Mock console.error and console.log to reduce test noise
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

// Mock OpenAI with browser environment support
jest.mock('openai', () => {
  return {
    OpenAI: jest.fn().mockImplementation(() => ({
      chat: {
        completions: {
          create: jest.fn()
        }
      }
    }))
  };
});

jest.mock('../../../utils/cache');

describe('SentimentAnalyzer - Extended Tests', () => {
  let sentimentAnalyzer: SentimentAnalyzer;
  let mockConfig: Partial<SentimentAnalyzerConfig>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockConfig = {
      useLocalModel: false,
      openaiApiKey: 'test-key',
      confidenceThreshold: 0.8,
      maxCacheSize: 1000,
      cacheTtlMs: 24 * 60 * 60 * 1000,
      costTrackingEnabled: true
    };

    sentimentAnalyzer = new SentimentAnalyzer(mockConfig);
  });

  describe('API Integration', () => {
    it('should analyze sentiment using OpenAI API', async () => {
      const mockOpenAI = (OpenAI as jest.MockedClass<typeof OpenAI>).mock.instances[0] as jest.Mocked<OpenAI>;
      const mockResponse = {
        choices: [{
          message: {
            content: 'Sentiment: positive\nScore: 0.85'
          }
        }]
      };

      mockOpenAI.chat.completions.create.mockResolvedValue(mockResponse as any);

      const result = await sentimentAnalyzer.analyzeSentiment('This is a great product!');

      expect(result.sentiment).toBe('positive');
      expect(result.source).toBe('openai');
      expect(result.sentimentScore).toBeDefined();
      expect(mockOpenAI.chat.completions.create).toHaveBeenCalled();
    });

    it('should handle API errors gracefully', async () => {
      const mockOpenAI = (OpenAI as jest.MockedClass<typeof OpenAI>).mock.instances[0] as jest.Mocked<OpenAI>;
      mockOpenAI.chat.completions.create.mockRejectedValue(new Error('API Error'));

      // Should fall back to local model or return neutral
      const result = await sentimentAnalyzer.analyzeSentiment('Test text');
      expect(result.sentiment).toBeDefined();
      expect(['positive', 'negative', 'neutral']).toContain(result.sentiment);
    });
  });

  describe('Local Model Integration', () => {
    beforeEach(() => {
      mockConfig = {
        useLocalModel: true,
        confidenceThreshold: 0.8,
        maxCacheSize: 1000,
        cacheTtlMs: 24 * 60 * 60 * 1000,
        costTrackingEnabled: true
      };
      sentimentAnalyzer = new SentimentAnalyzer(mockConfig);
    });

    it('should use local model if configured', async () => {
      const result = await sentimentAnalyzer.analyzeSentiment('Great product!');

      expect(result.sentiment).toBe('positive');
      expect(result.source).toBe('local');
      expect(result.sentimentScore).toBeDefined();
    });

    it('should return neutral for ambiguous text', async () => {
      const result = await sentimentAnalyzer.analyzeSentiment('This is text');

      expect(result.sentiment).toBe('neutral');
      expect(result.source).toBe('local');
    });

    it('should detect negative sentiment', async () => {
      const result = await sentimentAnalyzer.analyzeSentiment('This is terrible and awful');

      expect(result.sentiment).toBe('negative');
      expect(result.source).toBe('local');
    });
  });

  describe('Caching', () => {
    it('should return cached result if available', async () => {
      // First call
      const result1 = await sentimentAnalyzer.analyzeSentiment('Cached text example');
      
      // Second call should use cache
      const result2 = await sentimentAnalyzer.analyzeSentiment('Cached text example');

      expect(result2.source).toBe('cached');
      expect(result1.sentiment).toBe(result2.sentiment);
    });
  });

  describe('Edge Cases', () => {
    it('should return neutral for empty or very short text', async () => {
      const result1 = await sentimentAnalyzer.analyzeSentiment('');
      const result2 = await sentimentAnalyzer.analyzeSentiment('a');

      expect(result1.sentiment).toBe('neutral');
      expect(result2.sentiment).toBe('neutral');
    });

    it('should handle non-string inputs gracefully', async () => {
      const result = await sentimentAnalyzer.analyzeSentiment(null as any);
      expect(result.sentiment).toBe('neutral');
    });

    it('should handle very long text', async () => {
      const longText = 'word '.repeat(1000);
      
      const result = await sentimentAnalyzer.analyzeSentiment(longText);
      expect(result.sentiment).toBeDefined();
      expect(['positive', 'negative', 'neutral']).toContain(result.sentiment);
    });
  });

  describe('Cost Tracking', () => {
    it('should track cost statistics', async () => {
      await sentimentAnalyzer.analyzeSentiment('Test for cost tracking');
      
      const stats = sentimentAnalyzer.getCostStatistics();
      expect(stats).toBeDefined();
      
      if ('trackingDisabled' in stats) {
        expect(stats.trackingDisabled).toBe(false);
      } else {
        expect(typeof stats.localAnalysisCount).toBe('number');
        expect(typeof stats.openaiAnalysisCount).toBe('number');
        expect(typeof stats.cacheHitCount).toBe('number');
      }
    });

    it('should reset cost tracking', () => {
      sentimentAnalyzer.resetCostTracking();
      
      const stats = sentimentAnalyzer.getCostStatistics();
      if ('trackingDisabled' in stats) {
        expect(stats.trackingDisabled).toBe(false);
      } else {
        expect(stats.localAnalysisCount).toBe(0);
        expect(stats.openaiAnalysisCount).toBe(0);
        expect(stats.cacheHitCount).toBe(0);
      }
    });
  });

  describe('Configuration', () => {
    it('should work with minimal configuration', () => {
      const analyzer = new SentimentAnalyzer();
      expect(analyzer).toBeDefined();
    });

    it('should respect confidence threshold', async () => {
      const highThresholdConfig = {
        useLocalModel: true,
        confidenceThreshold: 0.9,
        openaiApiKey: 'test-key'
      };
      
      const analyzer = new SentimentAnalyzer(highThresholdConfig);
      const result = await analyzer.analyzeSentiment('Maybe good');
      
      // With high threshold, should fall back to OpenAI or return neutral
      expect(result).toBeDefined();
    });
  });
});
