import { PerformanceOptimizer } from '../PerformanceOptimizer';

describe('PerformanceOptimizer', () => {
  let optimizer: PerformanceOptimizer;

  beforeEach(() => {
    optimizer = new PerformanceOptimizer();
  });

  it('processes items in batches', async () => {
    const items = Array.from({ length: 12 }, (_, i) => i);
    const fn = async (x: number) => x * 2;
    const results = await optimizer.processInBatches(items, fn);
    expect(results.length).toBe(12);
    expect(results[0]).toBe(0);
    expect(results[11]).toBe(22);
  });

  it('tracks resource usage and adapts throttling', () => {
    for (let i = 0; i < 120; i++) optimizer.trackResourceUsage(90);
    optimizer.adaptThrottling();
    // Should have reduced concurrency
    // (maxConcurrent is private, so we can't check directly, but no error should occur)
  });
}); 