import { LlmWrapper } from '../LlmWrapper';

describe('LlmWrapper', () => {
  it('streams the correct number of templates', async () => {
    const wrapper = new LlmWrapper('mock-key');
    const results = [];
    for await (const template of wrapper.generateTemplates('Test product', 'tiktok', 3)) {
      results.push(template);
    }
    expect(results).toHaveLength(3);
    results.forEach((t, i) => {
      expect(t.hook).toContain('Test product');
      expect(t.script).toContain('Test product');
      expect(t.visuals).toContain('Test product');
      expect(t.audio).toContain('Test product');
    });
  });

  it('defaults to 5 templates if count not specified', async () => {
    const wrapper = new LlmWrapper('mock-key');
    const results = [];
    for await (const template of wrapper.generateTemplates('Another', 'instagram')) {
      results.push(template);
    }
    expect(results).toHaveLength(5);
  });
}); 