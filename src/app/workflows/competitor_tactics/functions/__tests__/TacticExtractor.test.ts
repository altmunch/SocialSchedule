import { TacticExtractor } from '../TacticExtractor';
import type { PostMetrics } from '../../../data_collection/functions/types';

describe('TacticExtractor', () => {
  const extractor = new TacticExtractor();

  it('extracts hooks, ctas, and formats from posts', () => {
    const posts: PostMetrics[] = [
      { caption: 'Try this now! Like and follow for more.', type: 'video' } as any,
      { caption: 'Check out our new product. Buy today!', type: 'image' } as any,
      { caption: 'Learn more in the link in bio.', type: 'carousel' } as any,
      { caption: 'Try this now! Like and follow for more.', type: 'video' } as any, // duplicate
      { type: 'video' } as any, // no caption
    ];
    const result = extractor.extractTactics(posts);
    expect(result.hooks).toContain('Try this now');
    expect(result.hooks).toContain('Check out our new product');
    expect(result.hooks).toContain('Learn more in the link in bio');
    expect(result.ctas).toEqual(expect.arrayContaining(['like', 'follow', 'buy', 'learn more', 'check out', 'link in bio']));
    expect(result.formats).toEqual(expect.arrayContaining(['video', 'image', 'carousel']));
    expect(result.hooks.length).toBe(3);
  });

  it('handles empty input', () => {
    const result = extractor.extractTactics([]);
    expect(result.hooks).toEqual([]);
    expect(result.ctas).toEqual([]);
    expect(result.formats).toEqual([]);
  });
}); 