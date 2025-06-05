import { EnhancedTextAnalyzer } from '../../enhancedTextAnalyzer';
import { createTestConfig, createMockOpenAI } from '../testUtils';

describe('EnhancedTextAnalyzer - Extended Tests', () => {
  let analyzer: EnhancedTextAnalyzer;
  let mockOpenAI: ReturnType<typeof createMockOpenAI>;

  beforeEach(() => {
    mockOpenAI = createMockOpenAI();
    jest.mock('openai', () => ({
      OpenAI: jest.fn().mockImplementation(() => mockOpenAI)
    }));

    analyzer = new EnhancedTextAnalyzer(createTestConfig({
      useLocalModel: true,
    }));
  });

  describe('analyzeComplexity', () => {
    it('returns complexity metrics', async () => {
      const text = 'This is a test sentence. It contains multiple clauses.';
      const result = await analyzer.analyzeComplexity(text);
      
      expect(result).toHaveProperty('wordCount');
      expect(result).toHaveProperty('sentenceCount');
      expect(result).toHaveProperty('averageWordLength');
      expect(result.wordCount).toBeGreaterThan(0);
    });
  });

  describe('detectLanguage', () => {
    it('detects English language', async () => {
      const text = 'This is an English text';
      const result = await analyzer.detectLanguage(text);
      
      expect(result.language).toBe('en');
      expect(result.confidence).toBeGreaterThan(0.9);
    });

    it('detects other languages', async () => {
      const text = 'Este es un texto en español';
      const result = await analyzer.detectLanguage(text);
      
      expect(result.language).toBe('es');
      expect(result.confidence).toBeGreaterThan(0.7);
    });
  });

  describe('extractKeyPhrases', () => {
    it('extracts key phrases from text', async () => {
      const text = 'Artificial intelligence is transforming business. Machine learning helps with automation.';
      const result = await analyzer.extractKeyPhrases(text);
      
      expect(Array.isArray(result.phrases)).toBe(true);
      expect(result.phrases.length).toBeGreaterThan(0);
      result.phrases.forEach(phrase => {
        expect(phrase).toHaveProperty('text');
        expect(phrase).toHaveProperty('score');
      });
    });
  });

  describe('analyzeReadability', () => {
    it('calculates readability scores', async () => {
      const text = 'The quick brown fox jumps over the lazy dog.';
      const result = await analyzer.analyzeReadability(text);
      
      expect(result).toHaveProperty('fleschKincaid');
      expect(result).toHaveProperty('smogIndex');
      expect(result).toHaveProperty('automatedReadability');
      expect(result.fleschKincaid).toBeGreaterThan(0);
    });
  });

  describe('batchProcess', () => {
    it('processes multiple texts efficiently', async () => {
      const texts = [
        'First test text',
        'Second test text with more content',
        'Third test text for batch processing'
      ];
      
      const results = await analyzer.batchProcess(texts, 'summarizeContent');
      
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBe(texts.length);
      results.forEach(result => {
        expect(result).toHaveProperty('shortSummary');
      });
    });
  });
});
