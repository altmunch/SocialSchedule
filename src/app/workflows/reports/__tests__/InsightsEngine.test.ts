import { generateInsights, InsightInput } from '../InsightsEngine';

describe('generateInsights', () => {
  it('returns expected structure', async () => {
    const input: InsightInput = {
      metrics: { engagement: 100, roi: 2.5 },
      timeSeries: [
        { date: '2024-01-01', metrics: { engagement: 50 } },
        { date: '2024-01-02', metrics: { engagement: 100 } },
      ],
      platform: 'tiktok',
    };
    const result = await generateInsights(input);
    expect(result).toHaveProperty('keyFindings');
    expect(result).toHaveProperty('opportunities');
    expect(result).toHaveProperty('recommendations');
    expect(result).toHaveProperty('predictedTrends');
  });
}); 