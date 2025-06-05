/**
 * ApiCostEstimator aggregates and estimates total API costs (USD) for one analysis round.
 * It sums usage/costs from all AI modules (e.g. SentimentAnalyzer, EnhancedTextAnalyzer).
 * Usage: Call estimateApiCostForAnalysisRound() after an analysis round.
 */

// Supported OpenAI models and their pricing per 1K tokens (update as needed)
const OPENAI_PRICING_PER_1K = {
  'gpt-3.5-turbo': 0.002,  // $0.002 per 1K tokens (input)
  'gpt-4': 0.03,          // $0.03 per 1K tokens (input)
  'gpt-4-32k': 0.06,      // $0.06 per 1K tokens (input)
} as const;

type OpenAIModel = keyof typeof OPENAI_PRICING_PER_1K;

// Cost breakdown for a specific model
export interface ApiCostBreakdown {
  model: string;
  totalTokens: number;
  openaiCalls: number;
  estimatedCostUsd: number;
}

export interface ApiCostEstimateReport {
  totalUsd: number;
  totalTokens: number;
  openaiCalls: number;
  breakdown: ApiCostBreakdown[];
}

export class ApiCostEstimator {
  /**
   * Estimate total API cost for a round of analysis.
   * @param analyzers Array of analyzers (must expose getCostStatistics or getMetrics)
   */
  static estimateApiCostForAnalysisRound(analyzers: any[]): ApiCostEstimateReport {
    const breakdownMap: Record<string, ApiCostBreakdown> = {};
    let totalUsd = 0;
    let totalTokens = 0;
    let openaiCalls = 0;

    analyzers.forEach(analyzer => {
      const stats = typeof analyzer.getCostStatistics === 'function'
        ? analyzer.getCostStatistics()
        : (typeof analyzer.getMetrics === 'function' ? analyzer.getMetrics() : null);
      if (!stats || stats.trackingDisabled) return;

      // Get model name or default to gpt-3.5-turbo
      const model = stats.model || 'gpt-3.5-turbo';
      const tokens = stats.totalTokensUsed || 0;
      const calls = stats.openaiAnalysisCount || 0;
      
      // Safely get price per 1K tokens with fallback
      const pricePer1K = Object.prototype.hasOwnProperty.call(OPENAI_PRICING_PER_1K, model)
        ? OPENAI_PRICING_PER_1K[model as OpenAIModel]
        : OPENAI_PRICING_PER_1K['gpt-3.5-turbo'];
        
      const estimatedCost = tokens > 0 ? (tokens / 1000) * pricePer1K : 0;

      if (!breakdownMap[model]) {
        breakdownMap[model] = {
          model,
          totalTokens: 0,
          openaiCalls: 0,
          estimatedCostUsd: 0,
        };
      }
      breakdownMap[model].totalTokens += tokens;
      breakdownMap[model].openaiCalls += calls;
      breakdownMap[model].estimatedCostUsd += estimatedCost;

      totalUsd += estimatedCost;
      totalTokens += tokens;
      openaiCalls += calls;
    });

    return {
      totalUsd: Number(totalUsd.toFixed(5)),
      totalTokens,
      openaiCalls,
      breakdown: Object.values(breakdownMap),
    };
  }
}
