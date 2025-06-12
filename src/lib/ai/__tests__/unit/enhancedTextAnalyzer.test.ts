import { EnhancedTextAnalyzer } from '../../enhancedTextAnalyzer';
import { createTestConfig, createMockOpenAI } from '../testUtils/index';
import { jest } from '@jest/globals';
import { EnhancedCache, CacheOptions, CacheStats } from '../../../utils/caching';

// Mock the console to reduce test noise
const originalConsole = { ...console };
const mockConsole = {
  ...originalConsole,
  error: jest.fn(),
  log: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
};

// Mock the OpenAI client
let mockOpenAI: ReturnType<typeof createMockOpenAI>;

// Define mock return types
interface MockSummaryResult {
  shortSummary: string;
  keyPoints: string[];
}

// Import the ContentSummaryResult type
import { ContentSummaryResult } from '../../enhancedTextAnalyzer';

// Helper function to create a mock summary
const createMockSummary = (partial: Partial<ContentSummaryResult> = {}): ContentSummaryResult => ({
  shortSummary: 'Test summary',
  keyPoints: ['Test point'],
  sentiment: 'neutral',
  source: 'local',
  processingTimeMs: 0,
  ...partial
});

// Mock the internal summarization model with proper typing
const mockLocalSummarize = jest.fn() as jest.MockedFunction<(text: string) => Promise<ContentSummaryResult>>;
const mockLocalExtractKeyPhrases = jest.fn() as jest.MockedFunction<(text: string) => Promise<string[]>>;
const mockLocalDetectLanguage = jest.fn() as jest.MockedFunction<(text: string) => Promise<string>>;

// Mock the EnhancedTextAnalyzer class methods
jest.mock('../../enhancedTextAnalyzer', () => {
  const actual = jest.requireActual('../../enhancedTextAnalyzer') as typeof import('../../enhancedTextAnalyzer');
  
  // Create a mock class that extends the actual implementation
  class MockEnhancedTextAnalyzer extends actual.EnhancedTextAnalyzer {
    // Mock internal methods with proper typing
    protected localSummarize = mockLocalSummarize as unknown as (text: string) => Promise<ContentSummaryResult>;
    protected localExtractKeyPhrases = mockLocalExtractKeyPhrases as unknown as (text: string) => Promise<string[]>;
    protected localDetectLanguage = mockLocalDetectLanguage as unknown as (text: string) => Promise<string>;
  }
  
  return {
    ...actual,
    EnhancedTextAnalyzer: MockEnhancedTextAnalyzer,
  };
});

describe('EnhancedTextAnalyzer', () => {
  let analyzer: EnhancedTextAnalyzer;
  let mockOpenAI: ReturnType<typeof createMockOpenAI>;
  
  // Sample test data
  const sampleText = 'This is a test text for analysis. It contains several sentences to test the text analysis capabilities.';
  const sampleSummary = 'Test summary';
  const sampleKeyPhrases = ['test', 'analysis', 'capabilities'];
  const sampleLanguage = 'en';
  
  // Helper function to create a test analyzer with custom config
  const createTestAnalyzer = (overrides: Partial<Parameters<typeof createTestConfig>[0]> = {}) => {
    return new EnhancedTextAnalyzer(createTestConfig({
      useLocalModel: true,
      openaiApiKey: 'test-key',
      cacheEnabled: true,
      ...overrides,
    }));
  };
  
  // Reset all mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock console
    global.console = mockConsole as typeof console;
    
    // Set up default mock responses
    mockLocalSummarize.mockResolvedValue(createMockSummary({
      shortSummary: sampleSummary,
      keyPoints: ['Key point 1', 'Key point 2']
    }));
    
    mockLocalExtractKeyPhrases.mockResolvedValue(sampleKeyPhrases);
    mockLocalDetectLanguage.mockResolvedValue(sampleLanguage);
    
    // Create a new instance for each test
    analyzer = createTestAnalyzer();
    
      // Mock OpenAI client
    mockOpenAI = createMockOpenAI();
    
    // Mock the OpenAI module
    jest.mock('openai', () => ({
      OpenAI: jest.fn().mockImplementation(() => mockOpenAI)
    }));
  });
  
  afterEach(() => {
    // Restore console
    global.console = originalConsole;
    
    // Clear all mocks
    jest.clearAllMocks();
  });

  describe('summarizeContent', () => {
    it('generates a summary using local model', async () => {
      // Arrange
      const text = 'This is a test text for summarization.';
      const expectedSummary = 'Test summary';
      const expectedKeyPoints = ['Point 1', 'Point 2'];
      
      mockLocalSummarize.mockResolvedValueOnce(createMockSummary({
        shortSummary: expectedSummary,
        keyPoints: expectedKeyPoints,
        source: 'local' as const
      }));
      
      // Act
      const result = await analyzer.summarizeContent(text);
      
      // Assert
      expect(mockLocalSummarize).toHaveBeenCalledWith(text);
      expect(result).toMatchObject({
        shortSummary: expectedSummary,
        keyPoints: expectedKeyPoints,
        source: 'local',
        sentiment: expect.any(String)
      });
    });
    
    it('generates a summary using OpenAI when local model is disabled', async () => {
      // Arrange
      const text = 'This is a test text for OpenAI summarization.';
      const expectedSummary = 'OpenAI generated summary';
      const expectedKeyPoints = ['AI point 1', 'AI point 2'];
      
      // Mock OpenAI response
      const mockResponse = {
        choices: [{
          message: {
            content: JSON.stringify({
              shortSummary: expectedSummary,
              keyPoints: expectedKeyPoints,
            })
          }
        }]
      };
      
      // Mock the OpenAI response
      (mockOpenAI.chat.completions.create as jest.MockedFunction<any>).mockImplementationOnce(() => Promise.resolve(mockResponse as any));
      
      // Create analyzer with OpenAI enabled
      const openaiAnalyzer = createTestAnalyzer({
        useLocalModel: false,
      });
      
      // Act
      const result = await openaiAnalyzer.summarizeContent(text);
      
      // Assert
      expect((mockOpenAI.chat.completions.create as jest.MockedFunction<any>).mock.calls).toHaveLength(1);
      expect(result).toMatchObject({
        shortSummary: expectedSummary,
        keyPoints: expect.arrayContaining(expectedKeyPoints),
        source: 'openai',
      });
    });
    
    it('handles empty input', async () => {
      // Act & Assert
      await expect(analyzer.summarizeContent(''))
        .rejects
        .toThrow('Text is required for summarization');
    });
    
    it('falls back to local model when OpenAI fails', async () => {
      // Arrange
      const text = 'Test fallback to local model';
      const error = new Error('OpenAI API error');
      
      // Mock OpenAI to fail
      mockOpenAI = createMockOpenAI();
      (mockOpenAI.chat.completions.create as jest.Mock).mockImplementationOnce(() => {
        throw error;
      });
      
      // Create analyzer with OpenAI enabled but will fallback
      const fallbackAnalyzer = createTestAnalyzer({
        useLocalModel: false,
      });
      
      // Act
      const result = await fallbackAnalyzer.summarizeContent(text);
      
      // Assert
      expect(console.warn).toHaveBeenCalledWith(
        'OpenAI summarization failed, falling back to local model',
        error
      );
      expect(result.source).toBe('local');
    });
  });

  describe('Batch Processing', () => {
    it('processes multiple texts in batch', async () => {
      // Arrange
      const texts = [
        'First test text for batch processing',
        'Second test text for batch processing',
        'Third test text for batch processing'
      ];
      

      
      // Create properly typed mock summaries
      const mockSummaries = texts.map((text, index) => 
        createMockSummary({
          shortSummary: `Summary ${index + 1}: ${text.substring(0, 15)}...`,
          keyPoints: [`Key point ${index + 1}`]
        })
      );
      
      // Mock the summarizationBatcher's add method
      // It should accept item, resolve, reject, and call resolve with the appropriate mock summary
      let currentSummaryIndexForMockAdd = 0; 
      const mockAdd = jest.fn(
        (
          textInput: string, 
          resolve: (value: ContentSummaryResult) => void,
          reject: (reason?: any) => void
        ) => {
          if (currentSummaryIndexForMockAdd < mockSummaries.length) {
            // Resolve with the next summary from the pre-defined list
            resolve(mockSummaries[currentSummaryIndexForMockAdd++]);
          } else {
            // This case indicates an issue with test setup (not enough mockSummaries)
            // or the batcher was called more times than expected.
            reject(new Error(`Mock summarizationBatcher.add called too many times. Text: ${textInput}`));
          }
        }
      );
      
      // @ts-expect-error - Accessing private property for testing
      analyzer.summarizationBatcher.add = mockAdd;
      
      // Act - Process each text through the batcher
      const results = await Promise.all(
        texts.map(text => analyzer.summarizeContent(text))
      );
      
      // Add the original content to results for assertion
      const resultsWithContent = results.map((result, index) => ({
        content: texts[index],
        summary: result
      }));
      
      // Assert
      expect(Array.isArray(resultsWithContent)).toBe(true);
      expect(resultsWithContent).toHaveLength(texts.length);
      
      resultsWithContent.forEach((result, index) => {
        expect(result).toMatchObject({
          content: texts[index],
          summary: expect.objectContaining({
            shortSummary: expect.stringContaining(`Summary ${index + 1}`),
            sentiment: expect.stringMatching(/^(positive|negative|neutral)$/),
            source: 'local',
          }),
        });
      });
    });
    
    it('handles empty input', async () => {
      // Act & Assert
      await expect(analyzer.summarizeContent(''))
        .rejects
        .toThrow('Text is required for summarization');
    });
  });

  describe('Error Handling', () => {
    it('throws error when both local and OpenAI models fail', async () => {
      // Arrange
      const error = new Error('All models failed');
      mockLocalSummarize.mockRejectedValue(error);
      
      // Create analyzer with OpenAI enabled but mocked to fail
      const failingAnalyzer = createTestAnalyzer({
        useLocalModel: false,
      });
      
      // Mock OpenAI to fail
      (mockOpenAI.chat.completions.create as jest.Mock).mockImplementationOnce(() => {
        throw new Error('API Error');
      });
      
      // Act & Assert
      await expect(failingAnalyzer.summarizeContent('Test failure'))
        .rejects
        .toThrow('All models failed');
    });
    
    it('handles cache errors gracefully', async () => {
      // Arrange
      // Create a mock cache that implements the EnhancedCache interface
      const mockCache: EnhancedCache<string, ContentSummaryResult> = {
        // @ts-ignore - Mock implementation doesn't need to match the full interface
        get: jest.fn().mockImplementation(() => {
          throw new Error('Cache error');
        }),
        
        // @ts-ignore - Mock implementation doesn't need to match the full interface
        set: jest.fn(),
        
        // @ts-ignore - Mock implementation doesn't need to match the full interface
        getOrCompute: jest.fn().mockImplementation(async (key, compute: () => Promise<ContentSummaryResult>) => {
          // Simulate cache get failure but still call the function
          return await compute();
        }),
        
        // @ts-ignore - Mock implementation doesn't need to match the full interface
        has: jest.fn().mockReturnValue(false),
        
        // @ts-ignore - Mock implementation doesn't need to match the full interface
        invalidate: jest.fn().mockReturnValue(true),
        
        // @ts-ignore - Mock implementation doesn't need to match the full interface
        clear: jest.fn(),
        
        // @ts-ignore - Mock implementation doesn't need to match the full interface
        getStats: jest.fn().mockReturnValue({
          hits: 0,
          misses: 0,
          evictions: 0,
          size: 0,
          hitRatio: 0
        }),
        
        // @ts-ignore - Mock implementation doesn't need to match the full interface
        evictExpired: jest.fn().mockReturnValue(0)
      };
      
      // @ts-expect-error - Accessing private property for testing
      analyzer.cache = mockCache;
      
      // Mock the actual summarization
      mockLocalSummarize.mockResolvedValue(createMockSummary({
        shortSummary: 'Test summary',
        keyPoints: ['Test point']
      }));
      
      // Act
      const result = await analyzer.summarizeContent('Test cache error');
      
      // Assert - Should still work even if cache fails
      expect(result).toBeDefined();
      expect(result.shortSummary).toBe('Test summary');
      expect(console.error).toHaveBeenCalled();
    });
  });
});
