// TargetFile: c:\SocialSchedule\src\app\deliverables\functions\product_link_optimizer.ts
import { ProductLinkPlacement } from '../types/deliverables_types';
import { EnhancedTextAnalyzer } from '@/lib/ai/enhancedTextAnalyzer'; // Assuming path

// Define a more structured Product type, perhaps in deliverables_types.ts or a shared types file
interface Product {
  id: string;
  name: string;
  url: string;
  keywords: string[]; // Keywords associated with the product for matching
  description?: string; // Product description for better matching
}

export class ProductLinkOptimizerService {
  private textAnalyzer: EnhancedTextAnalyzer;

  constructor(config?: any) {
    this.textAnalyzer = new EnhancedTextAnalyzer(config || {});
  }

  async optimizeProductLinks(
    videoContent: { caption?: string | null; description?: string | null; transcript?: string | null; videoId?: string },
    availableProducts: Product[]
  ): Promise<ProductLinkPlacement[]> {
    const placements: ProductLinkPlacement[] = [];
    const contentText = `${videoContent.caption || ''} ${videoContent.description || ''} ${videoContent.transcript || ''}`.toLowerCase();

    if (!contentText.trim() || availableProducts.length === 0) return [];

    for (const product of availableProducts) {
      // Use text analyzer for more sophisticated relevance scoring (e.g., semantic similarity)
      // const relevanceAnalysis = await this.textAnalyzer.analyzeSimilarity(contentText, product.description || product.keywords.join(' '));
      // const relevanceScore = relevanceAnalysis.similarityScore;
      
      // Simplified keyword matching for now:
      let keywordMatchScore = 0;
      for (const keyword of product.keywords) {
        if (contentText.includes(keyword.toLowerCase())) {
          keywordMatchScore++;
        }
      }

      // Consider a product relevant if it has at least one keyword match or high semantic similarity
      if (keywordMatchScore > 0 /* || relevanceScore > 0.7 */) { 
        placements.push({
          productId: product.id,
          callToAction: `Discover ${product.name}! Find out more here:`, // Improved CTA
          linkUrl: product.url,
          // Timestamp logic would require advanced video analysis (object/text recognition in frames)
          // timestamp: undefined, // Placeholder for future enhancement
        });
      }
    }
    
    // Sort by some relevance metric if available, otherwise limit
    // For now, just limit to a reasonable number, e.g., top 2-3 most relevant
    return placements.slice(0, 3);
  }
}