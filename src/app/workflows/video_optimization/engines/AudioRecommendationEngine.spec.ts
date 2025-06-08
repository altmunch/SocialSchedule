import { AudioRecommendationEngine } from './AudioRecommendationEngine';
import { AudioFeaturesInput, AudioRecommendationResult, RecommendedAudioTrackSchema } from '../../data_analysis/types/analysis_types';
import { z } from 'zod';

// Local Zod schema for validating the structure of AudioRecommendationResult data in tests
const LocalAudioRecommendationResultSchema = z.object({
  recommendations: z.array(RecommendedAudioTrackSchema),
  diversificationSuggestions: z.array(z.string()).optional(),
});
import OpenAI from 'openai';

// Mock OpenAI module
jest.mock('openai', () => {
  const mockCreate = jest.fn();
  return jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: mockCreate,
      },
    },
  }));
});

describe('AudioRecommendationEngine', () => {
  const MOCK_API_KEY = 'test-openai-api-key';
  let engine: AudioRecommendationEngine;
  let mockOpenAICreate: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    const MockedOpenAI = OpenAI as jest.MockedClass<typeof OpenAI>;
    // Pass options object to constructor
    const mockedOpenAIInstance = new MockedOpenAI({ apiKey: MOCK_API_KEY }); 
    mockOpenAICreate = mockedOpenAIInstance.chat.completions.create as jest.Mock;
    
    engine = new AudioRecommendationEngine(MOCK_API_KEY);
  });

  describe('constructor', () => {
    it('should throw an error if API key is not provided', () => {
      expect(() => new AudioRecommendationEngine('')).toThrow('OpenAI API key is required for AudioRecommendationEngine');
    });

    it('should initialize OpenAI client with the provided API key', () => {
      expect(OpenAI).toHaveBeenCalledWith({ apiKey: MOCK_API_KEY });
    });
  });

  describe('recommendAudio', () => {
    const sampleFeatures: AudioFeaturesInput = {
      videoContentSummary: 'A fast-paced action scene',
      desiredMood: ['energetic', 'intense'],
    };
    const correlationId = 'test-correlation-id-audio';

    it('should return successful audio recommendations on valid API response', async () => {
      const mockApiResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify({
                recommendations: [
                  { trackId: 'track1', title: 'Action Beat', artist: 'Composer A', genre: ['Electronic', 'Action'], mood: ['energetic'] },
                  { trackId: 'track2', title: 'Intense Drive', artist: 'Composer B', genre: ['Orchestral', 'Hybrid'], mood: ['intense', 'suspenseful'] },
                ],
                diversificationSuggestions: ['Consider a track with a contrasting calm section for buildup.'],
              }),
            },
          },
        ],
      };
      mockOpenAICreate.mockResolvedValue(mockApiResponse);

      const result = await engine.recommendAudio(sampleFeatures, correlationId);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.error).toBeUndefined();
      
      expect(() => LocalAudioRecommendationResultSchema.parse(result.data)).not.toThrow();
      
      expect(result.data?.recommendations).toHaveLength(2);
      expect(result.data?.recommendations[0].title).toBe('Action Beat');
      expect(result.data?.diversificationSuggestions).toContain('Consider a track with a contrasting calm section for buildup.');
      expect(result.metadata?.source).toBe('AudioRecommendationEngine');
      expect(result.metadata?.correlationId).toBe(correlationId);
      expect(mockOpenAICreate).toHaveBeenCalledTimes(1);
      expect(mockOpenAICreate).toHaveBeenCalledWith(expect.objectContaining({
        model: 'gpt-4-turbo-preview',
        response_format: { type: 'json_object' },
      }));
    });

    it('should return failure on API error', async () => {
      mockOpenAICreate.mockRejectedValue(new Error('OpenAI API Error'));

      const result = await engine.recommendAudio(sampleFeatures, correlationId);

      expect(result.success).toBe(false);
      expect(result.data).toBeUndefined();
      expect(result.error).toBeDefined();
      expect(result.error?.code).toBe('API_ERROR');
      expect(result.error?.message).toBe('Failed to recommend audio due to API error: OpenAI API Error');
      expect(result.metadata?.source).toBe('AudioRecommendationEngine');
    });

    it('should return failure on invalid JSON response', async () => {
      const mockApiResponse = {
        choices: [ { message: { content: 'Not JSON' } } ],
      };
      mockOpenAICreate.mockResolvedValue(mockApiResponse);

      const result = await engine.recommendAudio(sampleFeatures, correlationId);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('INVALID_RESPONSE_FORMAT');
      expect(result.error?.message).toMatch(/Failed to parse audio recommendation response: Unexpected token 'N'/);
    });
    
    it('should return failure if API response content is null', async () => {
      const mockApiResponse = { choices: [ { message: { content: null } } ] };
      mockOpenAICreate.mockResolvedValue(mockApiResponse);
      const result = await engine.recommendAudio(sampleFeatures, correlationId);
      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('INVALID_RESPONSE_FORMAT');
      expect(result.error?.message).toBe('Failed to parse audio recommendation response: API response content is null or empty.');
    });

    it('should return failure if API response choices are empty', async () => {
      const mockApiResponse = { choices: [] };
      mockOpenAICreate.mockResolvedValue(mockApiResponse);
      const result = await engine.recommendAudio(sampleFeatures, correlationId);
      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('INVALID_RESPONSE_FORMAT');
      expect(result.error?.message).toBe('Failed to parse audio recommendation response: No choices returned from API.');
    });
  });
});
