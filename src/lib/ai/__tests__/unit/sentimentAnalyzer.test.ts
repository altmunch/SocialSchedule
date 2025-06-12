import 'openai/shims/node';
import { OpenAI } from 'openai';
import { Cache } from '../../../utils/cache';
import { SentimentAnalyzer, SentimentAnalyzerConfig, SentimentResult } from '../../sentimentAnalyzer';
import { ApiCostEstimator, TrackingResult } from '../../ApiCostEstimator'; // Keep TrackingResult as it's used in mock
import { createTestConfig } from '../testUtils';

jest.mock('../../../utils/cache');
jest.mock('../../ApiCostEstimator');

describe('SentimentAnalyzer', () => {
  let analyzer: SentimentAnalyzer;
  let cache: jest.Mocked<Cache<string, any>>;
  let apiCostEstimator: jest.Mocked<ApiCostEstimator>;
  let mockOpenAI: jest.Mocked<OpenAI>;
  let mockConfig: SentimentAnalyzerConfig; // Define mockConfig type

  beforeEach(() => {
    jest.clearAllMocks();

    // Initialize mockConfig with necessary properties
    mockConfig = {
      useLocalModel: false, // Ensure OpenAI is used for relevant tests
      openaiApiKey: 'test-key', // Provide a dummy key
      confidenceThreshold: 0.7,
      maxCacheSize: 1000,
      cacheTtlMs: 24 * 60 * 60 * 1000,
      costTrackingEnabled: true, // Enable cost tracking for relevant tests
    };

    cache = new Cache() as jest.Mocked<Cache<string, any>>;
    apiCostEstimator = new ApiCostEstimator() as jest.Mocked<ApiCostEstimator>;

    mockOpenAI = {
      chat: {
        completions: {
          create: jest.fn(),
        },
      },
    } as unknown as jest.Mocked<OpenAI>; // Cast to unknown first then to Mocked<OpenAI>

    // Mock trackApiUsage for ApiCostEstimator if it's used (though SentimentAnalyzer initializes it)
    // This mock is needed because SentimentAnalyzer will try to call it
    apiCostEstimator.trackApiUsage = jest.fn().mockReturnValue({
      trackingDisabled: false,
      cacheHitRate: 0.5,
      apiUsageRate: 0.5,
      localAnalysisCount: 1,
      openaiAnalysisCount: 1,
      cacheHitCount: 0,
      totalTokensUsed: 100,
      estimatedCost: 0.001,
    } as TrackingResult);

    // Instantiate SentimentAnalyzer correctly with mockConfig and mockOpenAI
    analyzer = new SentimentAnalyzer(mockConfig, mockOpenAI); 
  });

  const mockOpenAIResponse = {
    choices: [
      {
        message: {
          content: JSON.stringify({
            sentiment: {
              sentiment: 'Positive',
              score: 0.85,
              nuance: 'Subtly positive',
              keywords: ['great', 'happy']
            },
            tone: {
              tone: 'Optimistic',
              score: 0.9,
              nuance: 'Uplifting',
              keywords: ['bright', 'future']
            },
            captions: {
              short: 'Happy vibes only',
              long: 'A delightful moment captured with joy and enthusiasm.',
              alternatives: ['Positive energy radiates', 'Joyful and bright']
            },
            hashtags: ['#HappyMoments', '#GoodVibesOnly'],
            emojis: ['😊', '✨'],
            suggestions: 'Consider adding a call to action related to happiness.'
          })
        }
      }
    ]
  };

  it('should analyze text and return sentiment, tone, captions, and hashtags', async () => {
    cache.get.mockReturnValue(undefined);
    mockOpenAI.chat.completions.create.mockResolvedValue(mockOpenAIResponse);

    const result = await analyzer.analyzeSentiment('This is a test sentence.', false); // Pass forceAI as false

    expect(mockOpenAI.chat.completions.create).toHaveBeenCalledTimes(1);
    expect(result).toEqual({
      sentiment: {
        sentiment: 'positive', // Ensure this matches the SentimentResult type
        sentimentScore: { score: 0.85, magnitude: expect.any(Number), confidence: expect.any(Number) }, // Added missing properties for SentimentScore
        emotions: expect.any(Object),
        language: expect.any(String),
        source: 'openai',
        processingTimeMs: expect.any(Number),
        tokens: expect.any(Number),
      },
      tone: {
        tone: 'Optimistic',
        score: 0.9,
        nuance: 'Uplifting',
        keywords: ['bright', 'future']
      },
      captions: {
        short: 'Happy vibes only',
        long: 'A delightful moment captured with joy and enthusiasm.',
        alternatives: ['Positive energy radiates', 'Joyful and bright']
      },
      hashtags: ['#HappyMoments', '#GoodVibesOnly'],
      emojis: ['😊', '✨'],
      suggestions: 'Consider adding a call to action related to happiness.'
    });
    expect(cache.set).toHaveBeenCalledWith('sentiment:test-correlation-id', expect.any(String), expect.any(Number)); // Changed to expect.any(String) and expect.any(Number) for cached data
  });

  it('should return cached result if available', async () => {
    const cachedResult: SentimentResult = {
      sentiment: { sentiment: 'neutral', sentimentScore: { score: 0.5, magnitude: 0.5, confidence: 0.9 } },
      tone: { tone: 'Informative', score: 0.6 },
      captions: { short: 'Cached caption', long: 'Long cached caption', alternatives: [] },
      hashtags: ['#cached'],
      emojis: [''],
      suggestions: '',
      source: 'cached',
      processingTimeMs: 0,
      tokens: 0
    };
    cache.get.mockReturnValue(cachedResult);

    const result = await analyzer.analyzeSentiment('This is a test sentence.', false);

    expect(mockOpenAI.chat.completions.create).not.toHaveBeenCalled();
    expect(result).toEqual(cachedResult);
  });

  it('should handle API errors gracefully', async () => {
    cache.get.mockReturnValue(undefined);
    mockOpenAI.chat.completions.create.mockRejectedValue(new Error('API Error'));

    await expect(analyzer.analyzeSentiment('Error test', false)).rejects.toThrow('API Error');
  });

  it('should throw an error if OpenAI response is invalid JSON', async () => {
    cache.get.mockReturnValue(undefined);
    mockOpenAI.chat.completions.create.mockResolvedValue({ choices: [{ message: { content: 'invalid json' } }] });

    await expect(analyzer.analyzeSentiment('Invalid JSON test', false)).rejects.toThrow('Failed to parse OpenAI response as JSON');
  });

  it('should throw a Zod error if parsed JSON does not match schema', async () => {
    cache.get.mockReturnValue(undefined);
    const malformedData = {
      sentiment: { sentiment: 'Positive' },
      // Missing tone, captions, hashtags, etc.
    };
    mockOpenAI.chat.completions.create.mockResolvedValue({
      choices: [{
        message: {
          content: JSON.stringify(malformedData)
        }
      }]
    });

    await expect(analyzer.analyzeSentiment('Zod schema test', false)).rejects.toThrow(/OpenAI response validation failed/);
  });

  // Cost tracking tests - uncommented and updated
  it('should track API usage with correct parameters for a new analysis', async () => {
    cache.get.mockReturnValue(undefined);
    mockOpenAI.chat.completions.create.mockResolvedValue(mockOpenAIResponse);
    await analyzer.analyzeSentiment('This is a test sentence.', false);
    // The cost tracking is internal to SentimentAnalyzer. We expect it to update its internal state.
    // We can test this by checking the getCostStatistics method.
    const stats = analyzer.getCostStatistics();
    expect(stats.openaiAnalysisCount).toBe(1);
    expect(stats.totalTokensUsed).toBeGreaterThan(0);
    expect(stats.estimatedCost).toBeGreaterThan(0);
  });

  it('should not track API usage if result is from cache', async () => {
    const cachedResult: SentimentResult = {
      sentiment: { sentiment: 'positive', sentimentScore: { score: 0.9, magnitude: 0.9, confidence: 0.9 } },
      source: 'cached',
      processingTimeMs: 10,
      tokens: 50,
      emojis: [],
      hashtags: [],
      suggestions: '',
      tone: { tone: 'Optimistic', score: 0.9, nuance: 'Uplifting', keywords: ['bright', 'future'] },
      captions: { short: 'Happy vibes only', long: 'A delightful moment captured with joy and enthusiasm.', alternatives: ['Positive energy radiates', 'Joyful and bright'] },
      language: 'en'
    };
    cache.get.mockReturnValue(cachedResult);
    await analyzer.analyzeSentiment('This is a test sentence.', false);
    const stats = analyzer.getCostStatistics();
    expect(stats.openaiAnalysisCount).toBe(0);
    expect(stats.localAnalysisCount).toBe(0);
    expect(stats.cacheHitCount).toBe(1);
  });

  it('should reset API usage stats', async () => {
    // First, perform an analysis to populate stats
    cache.get.mockReturnValue(undefined);
    mockOpenAI.chat.completions.create.mockResolvedValue(mockOpenAIResponse);
    await analyzer.analyzeSentiment('Text for reset', false);
    
    // Then, reset stats
    analyzer.resetCostTracking();
    const stats = analyzer.getCostStatistics();
    expect(stats.localAnalysisCount).toBe(0);
    expect(stats.openaiAnalysisCount).toBe(0);
    expect(stats.cacheHitCount).toBe(0);
    expect(stats.totalTokensUsed).toBe(0);
    expect(stats.estimatedCost).toBe(0);
  });
});
