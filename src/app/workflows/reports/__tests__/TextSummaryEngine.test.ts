import { TextSummaryEngine } from '../TextSummaryEngine';

describe('TextSummaryEngine', () => {
  it('returns a summary for sample input', async () => {
    // Mock HuggingFace API
    const engine = new TextSummaryEngine('fake-api-key');
    engine['hf'] = { summarization: async () => [{ summary_text: 'Summary.' }] };
    const summary = await engine.summarizeText('This is a long text that needs to be summarized.');
    expect(typeof summary).toBe('string');
    expect(summary.length).toBeGreaterThan(0);
  });
}); 