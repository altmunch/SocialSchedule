import { EnhancedTextAnalyzer } from '../../enhancedTextAnalyzer';
import { createTestConfig, createMockOpenAI } from '../testUtils';
import { jest } from '@jest/globals';

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

// Mock the internal summarization model
const mockLocalSummarize = jest.fn() as jest.MockedFunction<(text: string) => Promise<ContentSummaryResult>>;
const mockLocalExtractKeyPhrases = jest.fn() as jest.MockedFunction<(text: string) => Promise<string[]>>;
const mockLocalDetectLanguage = jest.fn() as jest.MockedFunction<(text: string) => Promise<string>>;

// Mock the EnhancedTextAnalyzer class methods
jest.mock('../../enhancedTextAnalyzer', () => {
  const actual = jest.requireActual('../../enhancedTextAnalyzer') as typeof import('../../enhancedTextAnalyzer');
  
  // Create a mock class that extends the actual implementation
  class MockEnhancedTextAnalyzer extends actual.EnhancedTextAnalyzer {
    // Mock internal methods with proper typing
    protected override localSummarize = mockLocalSummarize as unknown as (text: string) => Promise<ContentSummaryResult>;
    protected override localExtractKeyPhrases = mockLocalExtractKeyPhrases as unknown as (text: string) => Promise<string[]>;
    protected override localDetectLanguage = mockLocalDetectLanguage as unknown as (text: string) => Promise<string>;
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
    mockLocalSummarize.mockResolvedValue({
      shortSummary: sampleSummary,
      keyPoints: ['Key point 1', 'Key point 2']
    });
    
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
      
      mockLocalSummarize.mockResolvedValueOnce({
        shortSummary: expectedSummary,
        keyPoints: expectedKeyPoints,
      });
      
      // Act
      const result = await analyzer.summarizeContent(text);
      
      // Assert
      expect(mockLocalSummarize).toHaveBeenCalledWith(text);
      expect(result).toEqual({
        shortSummary: expectedSummary,
        keyPoints: expectedKeyPoints,
        source: 'local',
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
      mockOpenAI.chat.completions.create = jest.fn().mockResolvedValue(mockResponse);
      
      // Create analyzer with OpenAI enabled
      const openaiAnalyzer = createTestAnalyzer({
        useLocalModel: false,
      });
      
      // Act
      const result = await openaiAnalyzer.summarizeContent(text);
      
      // Assert
      expect(mockOpenAI.chat.completions.create).toHaveBeenCalled();
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
      mockOpenAI.chat.completions.create.mockRejectedValue(error);
      
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
      const mockSummaries: ContentSummaryResult[] = texts.map((text, index) => ({
        shortSummary: `Summary ${index + 1}: ${text.substring(0, 15)}...`,
        keyPoints: [`Key point ${index + 1}`],
        sentiment: 'neutral',
        source: 'local',
        processingTimeMs: 0
      }));
      
      // Mock the summarizationBatcher's add method
      const mockAdd = jest.fn<Promise<ContentSummaryResult>, [string]>();
      mockSummaries.forEach((summary, index) => {
        mockAdd.mockResolvedValueOnce(summary);
      });
      
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
      mockOpenAI.chat.completions.create = jest.fn().mockRejectedValue(new Error('API Error'));
      
      // Act & Assert
      await expect(failingAnalyzer.summarizeContent('Test failure'))
        .rejects
        .toThrow('All models failed');
    });
    
    it('handles cache errors gracefully', async () => {
      // Arrange
      const cacheError = new Error('Cache error');
      const cache = {
        get: jest.fn().mockRejectedValue(cacheError),
        set: jest.fn().mockResolvedValue(undefined),
        getOrCompute: jest.fn().mockImplementation(async (key: string, fn: () => Promise<ContentSummaryResult>) => {
          // Simulate cache get failure but still call the function
          return fn();
        }),
        has: jest.fn().mockReturnValue(false),
      };
      
      // @ts-ignore - Accessing private property for testing
      analyzer.cache = cache;
      
      // Mock the actual summarization
      const mockSummary: ContentSummaryResult = {
        shortSummary: 'Test summary',
        keyPoints: ['Test point'],
        sentiment: 'neutral',
        source: 'local',
        processingTimeMs: 0
      };
      mockLocalSummarize.mockResolvedValue(mockSummary);
      
      // Act
      const result = await analyzer.summarizeContent('Test cache error');
      
      // Assert - Should still work even if cache fails
      expect(result).toBeDefined();
      expect(result.shortSummary).toBe('Test summary');
      expect(console.error).toHaveBeenCalled();
    });
  });
});
