import { CrossModuleSync } from '../CrossModuleSync';

describe('CrossModuleSync', () => {
  it('generates prompt context from hooks', () => {
    const hooks = ['Try this now', 'Check out our new product'];
    const prompt = CrossModuleSync.feedCompetitorTacticsToPrompt(hooks);
    expect(prompt).toContain('Competitor hooks to consider:');
    expect(prompt).toContain('Try this now');
    expect(prompt).toContain('Check out our new product');
  });

  it('returns empty string for no hooks', () => {
    expect(CrossModuleSync.feedCompetitorTacticsToPrompt([])).toBe('');
  });

  it('compares templates with competitor hooks', () => {
    const templates = [
      { hook: 'Try this now!' },
      { hook: 'Something else' },
      { hook: 'Check out our new product today' },
    ];
    const hooks = ['Try this now', 'Check out our new product'];
    const result = CrossModuleSync.compareTemplatesWithTactics(templates, hooks);
    expect(result[0].matches).toContain('Try this now');
    expect(result[1].matches).toEqual([]);
    expect(result[2].matches).toContain('Check out our new product');
  });
}); 