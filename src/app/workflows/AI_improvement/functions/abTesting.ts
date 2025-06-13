// Simple A/B testing infrastructure for AI suggestions

const abGroups: Record<string, 'A' | 'B'> = {};
const abResults: { group: 'A' | 'B'; accepted: boolean }[] = [];

export function assignABGroup(userId: string): 'A' | 'B' {
  if (!abGroups[userId]) {
    // Simple deterministic assignment based on userId
    let sum = 0;
    for (let i = 0; i < userId.length; i++) {
      sum += userId.charCodeAt(i);
    }
    abGroups[userId] = sum % 2 === 0 ? 'A' : 'B';
  }
  return abGroups[userId];
}

export function recordSuggestionOutcome(userId: string, accepted: boolean): void {
  const group = abGroups[userId] || assignABGroup(userId);
  abResults.push({ group, accepted });
}

export function getAcceptanceRates(): { A: number; B: number } {
  const a = abResults.filter(r => r.group === 'A');
  const b = abResults.filter(r => r.group === 'B');
  return {
    A: a.length ? a.filter(r => r.accepted).length / a.length : 0,
    B: b.length ? b.filter(r => r.accepted).length / b.length : 0,
  };
} 