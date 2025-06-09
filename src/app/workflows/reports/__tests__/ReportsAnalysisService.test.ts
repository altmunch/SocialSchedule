import { ReportsAnalysisService } from '../ReportsAnalysisService';
import { SupabaseClient } from '@supabase/supabase-js';

describe('ReportsAnalysisService', () => {
  const supabase = {} as SupabaseClient;
  const service = new ReportsAnalysisService(supabase);
  const request = {
    userId: 'user-1',
    platform: 'TikTok' as const,
    timeRange: { start: new Date().toISOString(), end: new Date().toISOString() },
    correlationId: 'corr-1',
  };

  it('returns HTML report with chart', async () => {
    const options = { format: 'html', includeCharts: true, includeRawData: false };
    const result = await service.getFullReport(request, options);
    expect(typeof result).toBe('string');
    expect(result).toContain('<html>');
  });

  it('returns JSON report with e-commerce metrics', async () => {
    const options = { format: 'json', includeCharts: false, includeRawData: true };
    const result = await service.getFullReport(request, options);
    expect(typeof result).toBe('string');
    expect(result).toContain('eCommerceMetrics');
  });
}); 