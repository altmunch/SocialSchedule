import { TaxonomyMapper } from '../TaxonomyMapper';
import type { TacticExtractionResult } from '../TacticExtractor';

describe('TaxonomyMapper', () => {
  const mapper = new TaxonomyMapper();

  it('maps hooks, ctas, and formats to taxonomy', () => {
    const input: TacticExtractionResult = {
      hooks: ['Try this now', 'Check out our new product', 'Try again'],
      ctas: ['like', 'follow', 'check out', 'learn more'],
      formats: ['video', 'image', 'video'],
    };
    const result = mapper.mapToTaxonomy(input);
    expect(result.hookTaxonomy['try']).toEqual(['Try this now', 'Try again']);
    expect(result.hookTaxonomy['check']).toEqual(['Check out our new product']);
    expect(result.ctaTaxonomy['like']).toEqual(['like']);
    expect(result.ctaTaxonomy['check']).toEqual(['check out']);
    expect(result.formatTaxonomy['video']).toEqual(['video', 'video']);
    expect(result.formatTaxonomy['image']).toEqual(['image']);
  });

  it('handles empty input', () => {
    const result = mapper.mapToTaxonomy({ hooks: [], ctas: [], formats: [] });
    expect(result.hookTaxonomy).toEqual({});
    expect(result.ctaTaxonomy).toEqual({});
    expect(result.formatTaxonomy).toEqual({});
  });
}); 