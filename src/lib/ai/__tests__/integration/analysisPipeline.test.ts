import { EnhancedTextAnalyzer } from '../../enhancedTextAnalyzer';
import { SentimentAnalyzer } from '../../sentimentAnalyzer';
import { ApiCostEstimator } from '../../ApiCostEstimator';
import { createTestConfig } from '../testUtils';

describe('Analysis Pipeline Integration', () => {
  let textAnalyzer: EnhancedTextAnalyzer;
  let sentimentAnalyzer: SentimentAnalyzer;

  beforeEach(() => {
    const config = createTestConfig({
      useLocalModel: true,
      costTrackingEnabled: true,
    });
    
    textAnalyzer = new EnhancedTextAnalyzer(config);
    sentimentAnalyzer = new SentimentAnalyzer(config);
  });

  it('performs end-to-end analysis', async () => {
    const text = `
      Artificial intelligence is transforming our world. 
      Machine learning helps computers learn from data. 
      This technology is amazing and has many applications!
    `;

    // Run analyses in parallel
    const [summary, sentiment] = await Promise.all([
      textAnalyzer.summarizeContent(text),
      sentimentAnalyzer.analyzeSentiment(text),
    ]);

    // Verify summary
    expect(summary.shortSummary.length).toBeLessThan(text.length);
    expect(summary.keyPoints.length).toBeGreaterThan(0);

    // Verify sentiment
    expect(['positive', 'neutral']).toContain(sentiment.sentiment);
    expect(sentiment.sentimentScore.confidence).toBeGreaterThan(0.5);
  });

  it('tracks costs across analyzers', async () => {
    const text = 'Test text for cost tracking';
    
    // Perform operations
    await Promise.all([
      textAnalyzer.summarizeContent(text),
      sentimentAnalyzer.analyzeSentiment(text),
    ]);

    // Get cost estimates
    const costReport = ApiCostEstimator.estimateApiCostForAnalysisRound([
      textAnalyzer,
      sentimentAnalyzer,
    ]);

    expect(costReport.totalUsd).toBeGreaterThanOrEqual(0);
    expect(costReport.breakdown.length).toBeGreaterThan(0);
  });

  it('handles errors gracefully', async () => {
    // Test with invalid input
    await expect(textAnalyzer.summarizeContent('')).rejects.toThrow();
    
    // Test with very long text (should be handled by truncation)
    const longText = 'a '.repeat(10000);
    const result = await textAnalyzer.summarizeContent(longText);
    expect(result.shortSummary).toBeDefined();
  });
});
