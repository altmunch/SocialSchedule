// difficult: Keyword extraction service using node-nlp as an alternative to KeyBERT
import { NlpManager } from 'node-nlp';

export class KeywordExtractor {
  private nlpManager: NlpManager;

  constructor() {
    this.nlpManager = new NlpManager({ languages: ['en'] });
  }

  /**
   * Extract keywords from text with scores
   * @param text Input text to extract keywords from
   * @param options Configuration options
   * @returns Array of keywords with scores
   */
  async extractKeywords(
    text: string,
    options: { keyphraseNgramRange?: [number, number]; stopWords?: string; topN?: number } = {}
  ): Promise<Array<[string, number]>> {
    try {
      // Simple keyword extraction using node-nlp
      const processed = await this.nlpManager.process('en', text);
      
      // Get entities and nouns as potential keywords
      const keywords = new Map<string, number>();
      
      // Add entities
      processed.entities.forEach((entity: any) => {
        if (entity.sourceText) {
          const keyword = entity.sourceText.toLowerCase();
          keywords.set(keyword, (keywords.get(keyword) || 0) + 1);
        }
      });
      
      // Add nouns from tokens
      processed.tokens
        .filter((token: any) => token.stem && token.stem.length > 2) // Filter out short words
        .forEach((token: any) => {
          const keyword = token.stem.toLowerCase();
          if (!options.stopWords || !options.stopWords.includes(keyword)) {
            keywords.set(keyword, (keywords.get(keyword) || 0) + 1);
          }
        });
      
      // Convert to array and sort by score
      const sortedKeywords = Array.from(keywords.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, options.topN || 10);
      
      return sortedKeywords;
    } catch (error) {
      console.error('Keyword extraction failed:', error);
      return [];
    }
  }
}

// Export a singleton instance
export const keywordExtractor = new KeywordExtractor();
