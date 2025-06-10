import { ProductToTemplateTransformer } from '../ProductToTemplateTransformer';
import type { ContentTemplateBatch } from '../schema';

describe('ProductToTemplateTransformer', () => {
  it('transforms product description to ContentTemplateBatch', async () => {
    const mockLlm = {
      async *generateTemplates(description: string, platform: string) {
        yield { hook: 'h', script: 's', visuals: 'v', audio: 'a' };
      },
    };
    const transformer = new ProductToTemplateTransformer(mockLlm as any);
    const result = await transformer.transform('desc', 'tiktok');
    expect(result.productDescription).toBe('desc');
    expect(result.platform).toBe('tiktok');
    expect(result.templates).toHaveLength(1);
    expect(result.templates[0]).toEqual({ hook: 'h', script: 's', visuals: 'v', audio: 'a' });
  });
}); 