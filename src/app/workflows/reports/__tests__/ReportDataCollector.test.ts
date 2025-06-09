import { collectReportData, ReportDataInput } from '../ReportDataCollector';

describe('collectReportData', () => {
  it('returns expected structure', async () => {
    const input: ReportDataInput = {
      platform: 'tiktok',
      dateRange: { start: new Date(), end: new Date() },
      metrics: ['engagement', 'roi'],
      eCommerce: { roi: true },
    };
    const result = await collectReportData(input);
    expect(result).toHaveProperty('summary');
    expect(result).toHaveProperty('timeSeries');
    expect(result).toHaveProperty('eCommerceMetrics');
  });
}); 