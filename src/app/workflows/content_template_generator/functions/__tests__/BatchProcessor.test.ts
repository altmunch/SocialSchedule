import { BatchProcessor } from '../BatchProcessor';

describe('BatchProcessor', () => {
  it('processes a batch of product descriptions', async () => {
    const mockTransformer = {
      transform: jest.fn(async (desc, platform) => ({
        templates: [{ hook: desc, script: '', visuals: '', audio: '' }],
        productDescription: desc,
        platform,
      })),
    };
    const processor = new BatchProcessor(mockTransformer as any);
    const descriptions = ['a', 'b', 'c'];
    const result = await processor.processBatch(descriptions, 'tiktok');
    expect(result).toHaveLength(3);
    expect(result[0].productDescription).toBe('a');
    expect(result[1].productDescription).toBe('b');
    expect(result[2].productDescription).toBe('c');
  });
}); 