// SEO & Keyword Integration Service
import { SEMrushClient } from '../utils/semrush-client';
import { KeyBERTClient } from '../utils/keybert-client';

export class SEOKeywordService {
  constructor(private semrush: SEMrushClient, private keybert: KeyBERTClient) {}

  /**
   * Get optimized keywords for a piece of text using SEMrush (trending) and KeyBERT (context-aware).
   * Dynamic weighting and positional encoding are applied.
   */
  async getOptimizedKeywords(text: string): Promise<string[]> {
    try {
      // Get trending keywords from SEMrush
      const trending = await this.semrush.getTrendingKeywords(text); // [{keyword, search_volume, trend_velocity}]
      // Get context-aware keywords from KeyBERT
      const extracted = await this.keybert.extract(text); // [{keyword, relevance}]

      // Merge and deduplicate
      const allKeywords = new Map<string, any>();
      for (const k of trending) {
        allKeywords.set(k.keyword, { ...k, source: 'semrush' });
      }
      for (const k of extracted) {
        if (!allKeywords.has(k.keyword)) {
          allKeywords.set(k.keyword, { ...k, search_volume: 0, trend_velocity: 0, source: 'keybert' });
        }
      }

      // Dynamic weighting
      const scored = Array.from(allKeywords.values()).map(k => ({
        ...k,
        score: (k.search_volume * 0.6) + (k.trend_velocity * 0.4) + (k.relevance || 0)
      }));

      // Positional encoding: prioritize keywords that appear early in text
      for (const k of scored) {
        const pos = text.indexOf(k.keyword);
        k.positionScore = pos >= 0 && pos < 50 ? 1 : 0;
        k.score += k.positionScore * 10; // boost for early appearance
      }

      // Sort by score descending
      scored.sort((a, b) => b.score - a.score);
      // Return top 10 keywords
      return scored.slice(0, 10).map(k => k.keyword);
    } catch (err) {
      console.error('SEOKeywordService error:', err);
      return [];
    }
  }
}
