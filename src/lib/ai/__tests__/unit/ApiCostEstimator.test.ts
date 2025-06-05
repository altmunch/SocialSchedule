import { ApiCostEstimator } from '../../ApiCostEstimator';

describe('ApiCostEstimator', () => {
  // Reset static state between tests
  beforeEach(() => {
    // Reset any static state if needed
  });

  it('returns zero cost for no analyzers', () => {
    const report = ApiCostEstimator.estimateApiCostForAnalysisRound([]);
    
    expect(report.totalUsd).toBe(0);
    expect(report.totalTokens).toBe(0);
    expect(report.openaiCalls).toBe(0);
    expect(report.breakdown).toEqual([]);
  });

  it('calculates cost for a single analyzer', () => {
    const mockAnalyzer = {
      getCostStatistics: () => ({
        model: 'gpt-3.5-turbo',
        totalTokensUsed: 1000,
        openaiAnalysisCount: 2,
        localAnalysisCount: 0,
        trackingDisabled: false,
      }),
    };

    const report = ApiCostEstimator.estimateApiCostForAnalysisRound([mockAnalyzer]);
    
    // 1000 tokens * $0.002/1K tokens = $0.002
    expect(report.totalUsd).toBeCloseTo(0.002, 5);
    expect(report.totalTokens).toBe(1000);
    expect(report.openaiCalls).toBe(2);
    
    // Verify breakdown
    expect(report.breakdown).toHaveLength(1);
    const breakdown = report.breakdown[0];
    expect(breakdown.model).toBe('gpt-3.5-turbo');
    expect(breakdown.totalTokens).toBe(1000);
    expect(breakdown.openaiCalls).toBe(2);
    expect(breakdown.estimatedCostUsd).toBeCloseTo(0.002, 5);
  });

  it('aggregates costs from multiple analyzers', () => {
    const mockAnalyzers = [
      {
        getMetrics: () => ({
          model: 'gpt-3.5-turbo',
          totalTokensUsed: 1500,
          openaiAnalysisCount: 3,
          localAnalysisCount: 0,
          trackingDisabled: false,
        }),
      },
      {
        getMetrics: () => ({
          model: 'gpt-4',
          totalTokensUsed: 2000,
          openaiAnalysisCount: 1,
          localAnalysisCount: 0,
          trackingDisabled: false,
        }),
      },
    ];

    const report = ApiCostEstimator.estimateApiCostForAnalysisRound(mockAnalyzers);
    
    // (1500 * $0.002 + 2000 * $0.03) / 1000 = $0.063
    expect(report.totalUsd).toBeCloseTo(0.063, 5);
    expect(report.totalTokens).toBe(3500);
    expect(report.openaiCalls).toBe(4);
    
    // Verify breakdown has both models
    expect(report.breakdown).toHaveLength(2);
    
    // Verify GPT-3.5 breakdown
    const gpt35Breakdown = report.breakdown.find(b => b.model === 'gpt-3.5-turbo');
    expect(gpt35Breakdown).toBeDefined();
    expect(gpt35Breakdown?.totalTokens).toBe(1500);
    expect(gpt35Breakdown?.estimatedCostUsd).toBeCloseTo(0.003, 5);
    
    // Verify GPT-4 breakdown
    const gpt4Breakdown = report.breakdown.find(b => b.model === 'gpt-4');
    expect(gpt4Breakdown).toBeDefined();
    expect(gpt4Breakdown?.totalTokens).toBe(2000);
    expect(gpt4Breakdown?.estimatedCostUsd).toBeCloseTo(0.06, 5);
  });

  it('handles unknown models with fallback pricing', () => {
    const mockAnalyzer = {
      getMetrics: () => ({
        model: 'unknown-model',
        totalTokensUsed: 1000,
        openaiAnalysisCount: 1,
        localAnalysisCount: 0,
        trackingDisabled: false,
      }),
    };

    const report = ApiCostEstimator.estimateApiCostForAnalysisRound([mockAnalyzer]);
    
    // Should fall back to gpt-3.5-turbo pricing
    expect(report.breakdown[0].model).toBe('unknown-model');
    expect(report.totalUsd).toBeCloseTo(0.002, 5);
  });

  it('skips analyzers with tracking disabled', () => {
    const mockAnalyzers = [
      {
        getMetrics: () => ({
          model: 'gpt-3.5-turbo',
          totalTokensUsed: 1000,
          openaiAnalysisCount: 1,
          trackingDisabled: true,
        }),
      },
      {
        getMetrics: () => ({
          model: 'gpt-4',
          totalTokensUsed: 1000,
          openaiAnalysisCount: 1,
          trackingDisabled: false,
        }),
      },
    ];

    const report = ApiCostEstimator.estimateApiCostForAnalysisRound(mockAnalyzers);
    
    // Should only include the analyzer with tracking enabled
    expect(report.breakdown).toHaveLength(1);
    expect(report.breakdown[0].model).toBe('gpt-4');
    expect(report.totalUsd).toBeCloseTo(0.03, 5);
  });
});
