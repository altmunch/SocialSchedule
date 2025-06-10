import { TacticMap } from '../TacticMap';
import type { TaxonomyMapResult } from '../TaxonomyMapper';

describe('TacticMap', () => {
  const map = new TacticMap();

  it('generates nodes and edges from taxonomy', () => {
    const taxonomy: TaxonomyMapResult = {
      hookTaxonomy: { try: ['Try this now'], check: ['Check out our new product'] },
      ctaTaxonomy: { like: ['like'], follow: ['follow'] },
      formatTaxonomy: { video: ['video'], image: ['image'] },
    };
    const result = map.generateMap(taxonomy);
    // Check nodes
    expect(result.nodes).toEqual(
      expect.arrayContaining([
        { id: 'hook:Try this now', label: 'Try this now', type: 'hook' },
        { id: 'hook:Check out our new product', label: 'Check out our new product', type: 'hook' },
        { id: 'hook-group:try', label: 'try', type: 'hook' },
        { id: 'hook-group:check', label: 'check', type: 'hook' },
        { id: 'cta:like', label: 'like', type: 'cta' },
        { id: 'cta:follow', label: 'follow', type: 'cta' },
        { id: 'cta-group:like', label: 'like', type: 'cta' },
        { id: 'cta-group:follow', label: 'follow', type: 'cta' },
        { id: 'format:video', label: 'video', type: 'format' },
        { id: 'format:image', label: 'image', type: 'format' },
        { id: 'format-group:video', label: 'video', type: 'format' },
        { id: 'format-group:image', label: 'image', type: 'format' },
      ])
    );
    // Check edges
    expect(result.edges).toEqual(
      expect.arrayContaining([
        { from: 'hook-group:try', to: 'hook:Try this now', relation: 'group' },
        { from: 'hook-group:check', to: 'hook:Check out our new product', relation: 'group' },
        { from: 'cta-group:like', to: 'cta:like', relation: 'group' },
        { from: 'cta-group:follow', to: 'cta:follow', relation: 'group' },
        { from: 'format-group:video', to: 'format:video', relation: 'group' },
        { from: 'format-group:image', to: 'format:image', relation: 'group' },
      ])
    );
  });
}); 