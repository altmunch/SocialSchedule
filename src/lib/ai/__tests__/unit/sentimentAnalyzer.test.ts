import { SentimentAnalyzer } from '../../sentimentAnalyzer';
import { createTestConfig, createMockOpenAI, flushPromises } from '../testUtils';

describe('SentimentAnalyzer', () => {
  let analyzer: SentimentAnalyzer;
  let mockOpenAI: ReturnType<typeof createMockOpenAI>;

  beforeEach(() => {
    mockOpenAI = createMockOpenAI();
    jest.mock('openai', () => ({
      OpenAI: jest.fn().mockImplementation(() => mockOpenAI)
    }));
  });

  describe('Local Analysis', () => {
    beforeEach(() => {
      analyzer = new SentimentAnalyzer(createTestConfig({
        useLocalModel: true,
      }));
    });

    it('returns neutral for empty text', async () => {
      const result = await analyzer.analyzeSentiment('');
      expect(result.sentiment).toBe('neutral');
      expect(result.source).toBe('local');
    });

    it('detects positive sentiment', async () => {
      const result = await analyzer.analyzeSentiment('I love this product! It\'s amazing!');
      expect(result.sentiment).toBe('positive');
      expect(result.sentimentScore.score).toBeGreaterThan(0.2);
    });

    it('detects negative sentiment', async () => {
      const result = await analyzer.analyzeSentiment('I hate this product! It\'s terrible!');
      expect(result.sentiment).toBe('negative');
      expect(result.sentimentScore.score).toBeLessThan(-0.2);
    });
  });

  describe('OpenAI Analysis', () => {
    beforeEach(() => {
      analyzer = new SentimentAnalyzer(createTestConfig({
        useLocalModel: false,
        openaiApiKey: 'test-key',
      }));
    });

    it('calls OpenAI API and processes response', async () => {
      mockOpenAI.chat.completions.create.mockResolvedValueOnce({
        choices: [{
          message: {
            content: JSON.stringify({
              sentiment: 'positive',
              score: 0.9,
              confidence: 0.95
            })
          }
        }],
        usage: { total_tokens: 42 }
      } as any);

      const result = await analyzer.analyzeSentiment('This is great!');
      
      expect(mockOpenAI.chat.completions.create).toHaveBeenCalled();
      expect(result.sentiment).toBe('positive');
      expect(result.sentimentScore.score).toBe(0.9);
      expect(result.source).toBe('openai');
    });

    it('falls back to local analysis on API error', async () => {
      mockOpenAI.chat.completions.create.mockRejectedValueOnce(new Error('API Error'));
      
      const result = await analyzer.analyzeSentiment('This should use local analysis');
      
      expect(result.source).toBe('local');
    });
  });

  describe('Caching', () => {
    it('returns cached result for same input', async () => {
      analyzer = new SentimentAnalyzer(createTestConfig({
        useLocalModel: true,
      }));
      
      const text = 'This should be cached';
      const result1 = await analyzer.analyzeSentiment(text);
      const result2 = await analyzer.analyzeSentiment(text);
      
      expect(result1).toEqual(result2);
    });
  });

  describe('Cost Tracking', () => {
    it('tracks local analysis when enabled', async () => {
      analyzer = new SentimentAnalyzer(createTestConfig({
        useLocalModel: true,
        costTrackingEnabled: true,
      }));
      
      await analyzer.analyzeSentiment('test');
      const stats = analyzer.getCostStatistics();
      
      expect(stats.localAnalysisCount).toBe(1);
      expect(stats.openaiAnalysisCount).toBe(0);
    });

    it('tracks OpenAI usage when enabled', async () => {
      mockOpenAI.chat.completions.create.mockResolvedValueOnce({
        choices: [{
          message: {
            content: JSON.stringify({
              sentiment: 'neutral',
              score: 0.1,
              confidence: 0.9
            })
          }
        }],
        usage: { total_tokens: 50 }
      } as any);

      analyzer = new SentimentAnalyzer(createTestConfig({
        useLocalModel: false,
        costTrackingEnabled: true,
        openaiApiKey: 'test-key',
      }));
      
      await analyzer.analyzeSentiment('test');
      const stats = analyzer.getCostStatistics();
      
      expect(stats.openaiAnalysisCount).toBe(1);
      expect(stats.totalTokensUsed).toBe(50);
      expect(stats.estimatedCost).toBeGreaterThan(0);
    });
  });
});
