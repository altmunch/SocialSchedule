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

describe('SentimentAnalyzer - Extended Tests', () => {
  let analyzer: SentimentAnalyzer;
  let mockOpenAIInstance: jest.Mocked<OpenAI>;
  let mockCache: jest.Mocked<Cache<string, SentimentResult>>;
  let mockApiCostEstimator: jest.Mocked<typeof ApiCostEstimator>;
  let mockConfig: SentimentAnalyzerConfig;

  beforeEach(() => {
    jest.clearAllMocks();

    mockOpenAIInstance = new OpenAI({ apiKey: 'test-key' }) as jest.Mocked<OpenAI>;
    mockCache = new Cache() as jest.Mocked<Cache<string, SentimentResult>>;

    mockApiCostEstimator = ApiCostEstimator as jest.Mocked<typeof ApiCostEstimator>;
    jest.spyOn(mockApiCostEstimator, 'estimateApiCostForAnalysisRound').mockReturnValue({
      totalUsd: 0.001,
      totalTokens: 100,
      openaiCalls: 1,
      breakdown: []
    });

    mockConfig = {
      useLocalModel: false,
      openaiApiKey: 'test-key',
      confidenceThreshold: 0.7,
      maxCacheSize: 1000,
      cacheTtlMs: 24 * 60 * 60 * 1000,
      costTrackingEnabled: true,
    };

    analyzer = new SentimentAnalyzer(mockConfig, mockOpenAIInstance, mockCache, mockApiCostEstimator);
  });

  it('should analyze sentiment using OpenAI API', async () => {
    mockOpenAIInstance.chat.completions.create.mockResolvedValueOnce({
      choices: [{
        message: {
          content: 'Sentiment: positive, Score: 0.9'
        }
      }]
    });

    const result = await analyzer.analyzeSentiment('This is a positive sentence');
    expect(result).toEqual({
      sentiment: 'positive',
      sentimentScore: { score: 0.9, magnitude: 0, confidence: 0 },
      source: 'openai',
      processingTimeMs: expect.any(Number),
    });
    expect(mockOpenAIInstance.chat.completions.create).toHaveBeenCalledTimes(1);
    expect(mockCache.get).toHaveBeenCalledWith('sentiment:this is a positive sentence');
    expect(mockCache.set).toHaveBeenCalledWith('sentiment:this is a positive sentence', {
      sentiment: 'positive',
      sentimentScore: { score: 0.9, magnitude: 0, confidence: 0 },
      source: 'openai',
      processingTimeMs: expect.any(Number),
    });
    expect(mockApiCostEstimator.estimateApiCostForAnalysisRound).toHaveBeenCalledTimes(1);
  });

  it('should use local model if configured', async () => {
    analyzer = new SentimentAnalyzer({
      ...mockConfig,
      useLocalModel: true,
    }, mockOpenAIInstance, mockCache, mockApiCostEstimator);

    const result = await analyzer.analyzeSentiment('This is a test sentence');
    expect(result).toEqual({
      sentiment: 'neutral',
      sentimentScore: { score: 0, magnitude: 0, confidence: 0 },
      source: 'local',
      processingTimeMs: expect.any(Number),
    });
    expect(mockOpenAIInstance.chat.completions.create).not.toHaveBeenCalled();
    expect(mockCache.get).toHaveBeenCalledWith('sentiment:this is a test sentence');
    expect(mockCache.set).toHaveBeenCalledWith('sentiment:this is a test sentence', {
      sentiment: 'neutral',
      sentimentScore: { score: 0, magnitude: 0, confidence: 0 },
      source: 'local',
      processingTimeMs: expect.any(Number),
    });
    expect(mockApiCostEstimator.estimateApiCostForAnalysisRound).toHaveBeenCalledTimes(1);
  });

  it('should return cached result if available', async () => {
    const cachedResult: SentimentResult = {
      sentiment: 'negative',
      sentimentScore: { score: 0.1, magnitude: 0, confidence: 0 },
      source: 'cached',
      processingTimeMs: 10,
    };
    mockCache.get.mockResolvedValueOnce(cachedResult);

    const result = await analyzer.analyzeSentiment('This is a negative sentence');
    expect(result).toEqual(cachedResult);
    expect(mockOpenAIInstance.chat.completions.create).not.toHaveBeenCalled();
    expect(mockCache.get).toHaveBeenCalledWith('sentiment:this is a negative sentence');
    expect(mockCache.set).not.toHaveBeenCalled();
    expect(mockApiCostEstimator.estimateApiCostForAnalysisRound).toHaveBeenCalledTimes(1);
  });

  it('should handle API errors gracefully', async () => {
    mockOpenAIInstance.chat.completions.create.mockRejectedValueOnce(new Error('OpenAI API error'));

    const result = await analyzer.analyzeSentiment('This is a problematic sentence');
    expect(result).toEqual({
      sentiment: 'neutral',
      sentimentScore: { score: 0, magnitude: 0, confidence: 0 },
      source: 'local',
      processingTimeMs: expect.any(Number),
    });
    expect(mockApiCostEstimator.estimateApiCostForAnalysisRound).toHaveBeenCalledTimes(1);
  });

  it('should correctly parse sentiment and score from API response', async () => {
    mockOpenAIInstance.chat.completions.create.mockResolvedValueOnce({
      choices: [{
        message: {
          content: 'Sentiment: positive, Score: 0.85'
        }
      }]
    });
    const result = await analyzer.analyzeSentiment('Great product!');
    expect(result).toEqual({
      sentiment: 'positive',
      sentimentScore: { score: 0.85, magnitude: 0, confidence: 0 },
      source: 'openai',
      processingTimeMs: expect.any(Number),
    });
  });

  it('should handle missing sentiment or score in API response', async () => {
    mockOpenAIInstance.chat.completions.create.mockResolvedValueOnce({
      choices: [{
        message: {
          content: 'Just a random response'
        }
      }]
    });
    const result = await analyzer.analyzeSentiment('Mixed feelings.');
    expect(result).toEqual({
      sentiment: 'neutral',
      sentimentScore: { score: 0, magnitude: 0, confidence: 0 },
      source: 'openai',
      processingTimeMs: expect.any(Number),
    });
  });

  it('should handle invalid score format in API response', async () => {
    mockOpenAIInstance.chat.completions.create.mockResolvedValueOnce({
      choices: [{
        message: {
          content: 'Sentiment: negative, Score: invalid'
        }
      }]
    });
    const result = await analyzer.analyzeSentiment('Very bad!');
    expect(result).toEqual({
      sentiment: 'negative',
      sentimentScore: { score: 0, magnitude: 0, confidence: 0 },
      source: 'openai',
      processingTimeMs: expect.any(Number),
    });
  });

  it('should return neutral for empty or very short text', async () => {
    const resultEmpty = await analyzer.analyzeSentiment('');
    expect(resultEmpty).toEqual({
      sentiment: 'neutral',
      sentimentScore: { score: 0, magnitude: 0, confidence: 0 },
      source: 'local',
      processingTimeMs: expect.any(Number),
    });

    const resultShort = await analyzer.analyzeSentiment('ok');
    expect(resultShort).toEqual({
      sentiment: 'neutral',
      sentimentScore: { score: 0, magnitude: 0, confidence: 0 },
      source: 'local',
      processingTimeMs: expect.any(Number),
    });
    expect(mockOpenAIInstance.chat.completions.create).not.toHaveBeenCalled();
  });

  it('should return neutral if confidenceThreshold is not met by local model', async () => {
    analyzer = new SentimentAnalyzer({
      ...mockConfig,
      useLocalModel: true,
    }, mockOpenAIInstance, mockCache, mockApiCostEstimator);

    const result = await analyzer.analyzeSentiment('This is a slightly positive sentence');
    expect(result).toEqual({
      sentiment: 'neutral',
      sentimentScore: { score: 0, magnitude: 0, confidence: 0 },
      source: 'local',
      processingTimeMs: expect.any(Number),
    });
    expect(mockOpenAIInstance.chat.completions.create).not.toHaveBeenCalled();
  });

  it('should return sentiment from local model if confidenceThreshold is met', async () => {
    analyzer = new SentimentAnalyzer({
      ...mockConfig,
      useLocalModel: true,
      confidenceThreshold: 0.5,
    }, mockOpenAIInstance, mockCache, mockApiCostEstimator);

    const result = await analyzer.analyzeSentiment('This is a positive sentence');
    expect(result).toEqual({
      sentiment: 'neutral',
      sentimentScore: { score: 0, magnitude: 0, confidence: 0 },
      source: 'local',
      processingTimeMs: expect.any(Number),
    });
    expect(mockOpenAIInstance.chat.completions.create).not.toHaveBeenCalled();
  });

  it('should not call OpenAI if text is too long (exceeds max tokens)', async () => {
    const longText = 'a'.repeat(9000);

    const result = await analyzer.analyzeSentiment(longText);
    expect(result).toEqual({
      sentiment: 'neutral',
      sentimentScore: { score: 0, magnitude: 0, confidence: 0 },
      source: 'local',
      processingTimeMs: expect.any(Number),
    });
    expect(mockOpenAIInstance.chat.completions.create).not.toHaveBeenCalled();
    expect(mockApiCostEstimator.estimateApiCostForAnalysisRound).toHaveBeenCalledTimes(1);
  });

  it('should correctly update cost tracking based on analysis path', async () => {
    // Test 1: OpenAI call
    analyzer = new SentimentAnalyzer({
      ...mockConfig,
      useLocalModel: false,
    }, mockOpenAIInstance, mockCache, mockApiCostEstimator);

    mockOpenAIInstance.chat.completions.create.mockResolvedValueOnce({
      choices: [{
        message: {
          content: 'Sentiment: positive, Score: 0.9'
        }
      }]
    });
    await analyzer.analyzeSentiment('text via openai');
    expect((analyzer as any).costTracking.openaiAnalysisCount).toBe(1);
    expect((analyzer as any).costTracking.localAnalysisCount).toBe(0);
    expect((analyzer as any).costTracking.cacheHitCount).toBe(0);

    // Test 2: Cached result
    analyzer = new SentimentAnalyzer(mockConfig, mockOpenAIInstance, mockCache, mockApiCostEstimator);
    mockCache.get.mockResolvedValueOnce({
      sentiment: 'neutral',
      sentimentScore: { score: 0, magnitude: 0, confidence: 0 },
      source: 'cached',
      processingTimeMs: 10,
    });
    await analyzer.analyzeSentiment('text via cache');
    expect((analyzer as any).costTracking.openaiAnalysisCount).toBe(0);
    expect((analyzer as any).costTracking.localAnalysisCount).toBe(0);
    expect((analyzer as any).costTracking.cacheHitCount).toBe(1);

    // Test 3: Local model
    analyzer = new SentimentAnalyzer({
      ...mockConfig,
      useLocalModel: true,
    }, mockOpenAIInstance, mockCache, mockApiCostEstimator);
    await analyzer.analyzeSentiment('text via local');
    expect((analyzer as any).costTracking.openaiAnalysisCount).toBe(0);
    expect((analyzer as any).costTracking.localAnalysisCount).toBe(1);
    expect((analyzer as any).costTracking.cacheHitCount).toBe(0);
  });

  it('should return neutral for non-string inputs', async () => {
    const resultNull = await analyzer.analyzeSentiment(null as any);
    expect(resultNull).toEqual({
      sentiment: 'neutral',
      sentimentScore: { score: 0, magnitude: 0, confidence: 0 },
      source: 'local',
      processingTimeMs: expect.any(Number),
    });
    const resultUndefined = await analyzer.analyzeSentiment(undefined as any);
    expect(resultUndefined).toEqual({
      sentiment: 'neutral',
      sentimentScore: { score: 0, magnitude: 0, confidence: 0 },
      source: 'local',
      processingTimeMs: expect.any(Number),
    });
  });
});
