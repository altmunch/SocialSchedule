import { ApiCostEstimator, ApiCostEstimateReport } from './ApiCostEstimator';

describe('ApiCostEstimator', () => {
  it('returns zero cost for no analyzers', () => {
    const report: ApiCostEstimateReport = ApiCostEstimator.estimateApiCostForAnalysisRound([]);
    expect(report.totalUsd).toBe(0);
    expect(report.totalTokens).toBe(0);
    expect(report.openaiCalls).toBe(0);
    expect(report.breakdown).toEqual([]);
  });

  it('calculates cost for single analyzer', () => {
    const analyzer = {
      getMetrics: () => ({
        model: 'gpt-3.5-turbo',
        totalTokensUsed: 1000,
        openaiAnalysisCount: 2,
      }),
    };
    const report = ApiCostEstimator.estimateApiCostForAnalysisRound([analyzer]);
    expect(report.totalUsd).toBeCloseTo(0.002, 5);
    expect(report.totalTokens).toBe(1000);
    expect(report.openaiCalls).toBe(2);
    expect(report.breakdown).toHaveLength(1);
    const breakdown = report.breakdown[0];
    expect(breakdown.model).toBe('gpt-3.5-turbo');
    expect(breakdown.totalTokens).toBe(1000);
    expect(breakdown.openaiCalls).toBe(2);
    expect(breakdown.estimatedCostUsd).toBeCloseTo(0.002, 5);
  });

  it('aggregates multiple analyzers and models', () => {
    const analyzer1 = {
      getMetrics: () => ({
        model: 'gpt-3.5-turbo',
        totalTokensUsed: 2000,
        openaiAnalysisCount: 1,
      }),
    };
    const analyzer2 = {
      getMetrics: () => ({
        model: 'gpt-4',
        totalTokensUsed: 1000,
        openaiAnalysisCount: 1,
      }),
    };
    const report = ApiCostEstimator.estimateApiCostForAnalysisRound([analyzer1, analyzer2]);
    expect(report.totalUsd).toBeCloseTo((2000/1000)*0.002 + (1000/1000)*0.03, 5);
    expect(report.totalTokens).toBe(3000);
    expect(report.openaiCalls).toBe(2);
    expect(report.breakdown).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          model: 'gpt-3.5-turbo',
          totalTokens: 2000,
          openaiCalls: 1,
          estimatedCostUsd: expect.closeTo(0.004, 5),
        }),
        expect.objectContaining({
          model: 'gpt-4',
          totalTokens: 1000,
          openaiCalls: 1,
          estimatedCostUsd: expect.closeTo(0.03, 5),
        }),
      ])
    );
  });

  it('skips analyzers with disabled tracking', () => {
    const analyzer = { getMetrics: () => ({ trackingDisabled: true }) };
    const report = ApiCostEstimator.estimateApiCostForAnalysisRound([analyzer]);
    expect(report.totalUsd).toBe(0);
    expect(report.breakdown).toEqual([]);
  });

  it('handles unknown model with fallback', () => {
    const analyzer = {
      getMetrics: () => ({
        model: 'unknown-model',
        totalTokensUsed: 1000,
        openaiAnalysisCount: 1,
      }),
    };
    const report = ApiCostEstimator.estimateApiCostForAnalysisRound([analyzer]);
    expect(report.totalUsd).toBeCloseTo(0.002, 5);
    expect(report.breakdown[0].model).toBe('unknown-model');
  });
});
