import { AutoPostAnalytics } from '../AutoPostAnalytics';

describe('AutoPostAnalytics', () => {
  let analytics: AutoPostAnalytics;

  beforeEach(() => {
    analytics = new AutoPostAnalytics();
  });

  it('records and retrieves outcomes', () => {
    analytics.recordOutcome({ postId: '1', platform: 'tiktok', engagement: 100, reach: 1000, timestamp: new Date() });
    expect(analytics.getAllOutcomes().length).toBe(1);
  });

  it('generates accurate report', () => {
    const now = new Date();
    analytics.recordOutcome({ postId: '1', platform: 'tiktok', engagement: 100, reach: 1000, roi: 2, timestamp: now });
    analytics.recordOutcome({ postId: '2', platform: 'instagram', engagement: 200, reach: 2000, roi: 3, timestamp: now });
    const report = analytics.generateReport(1);
    expect(report.totalPosts).toBe(2);
    expect(report.totalEngagement).toBe(300);
    expect(report.totalReach).toBe(3000);
    expect(report.avgROI).toBeCloseTo(2.5);
  });
}); 