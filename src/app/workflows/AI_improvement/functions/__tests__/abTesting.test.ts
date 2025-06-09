import { assignABGroup, recordSuggestionOutcome, getAcceptanceRates } from '../abTesting';

describe('A/B Testing Infrastructure', () => {
  it('should assign users to A or B group', () => {
    const group = assignABGroup('user1');
    expect(['A', 'B']).toContain(group);
    // Should be deterministic for the same user
    expect(assignABGroup('user1')).toBe(group);
  });

  it('should record suggestion outcomes and compute acceptance rates', () => {
    // Assign users
    const users = ['user2', 'user3', 'user4', 'user5'];
    users.forEach(u => assignABGroup(u));
    // Record outcomes
    recordSuggestionOutcome('user2', true);
    recordSuggestionOutcome('user3', false);
    recordSuggestionOutcome('user4', true);
    recordSuggestionOutcome('user5', false);
    const rates = getAcceptanceRates();
    expect(typeof rates.A).toBe('number');
    expect(typeof rates.B).toBe('number');
    expect(rates.A >= 0 && rates.A <= 1).toBe(true);
    expect(rates.B >= 0 && rates.B <= 1).toBe(true);
  });
}); 