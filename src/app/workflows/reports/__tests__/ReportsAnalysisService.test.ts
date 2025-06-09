import { ReportsAnalysisService } from '../ReportsAnalysisService';
import { SupabaseClient } from '@supabase/supabase-js';
import { TextSummaryEngine } from '../TextSummaryEngine';

describe('ReportsAnalysisService', () => {
  const supabase = {} as SupabaseClient;
  const service = new ReportsAnalysisService(supabase);
  const request = {
    userId: 'user-1',
    platform: 'TikTok' as const,
    timeRange: { start: new Date().toISOString(), end: new Date().toISOString() },
    correlationId: 'corr-1',
  };

  beforeAll(() => {
    // Mock TextSummaryEngine for deterministic summary
    jest.spyOn(TextSummaryEngine.prototype, 'summarizeText').mockResolvedValue('Test summary.');
  });

  it('returns HTML report with chart and summary', async () => {
    const options = { format: 'html' as const, includeCharts: true, includeRawData: false };
    const result = await service.getFullReport(request, options);
    expect(typeof result).toBe('string');
    expect(result).toContain('<html>');
    expect(result).toContain('Test summary.');
  });

  it('returns JSON report with e-commerce metrics and summary', async () => {
    const options = { format: 'json' as const, includeCharts: false, includeRawData: true };
    const result = await service.getFullReport(request, options);
    expect(typeof result).toBe('string');
    expect(result).toContain('eCommerceMetrics');
    expect(result).toContain('Test summary.');
  });
}); 