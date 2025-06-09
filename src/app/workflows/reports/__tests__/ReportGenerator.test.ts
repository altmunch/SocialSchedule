import { ReportGenerator, ReportOptions, EmailService } from '../ReportGenerator';

describe('ReportGenerator', () => {
  const generator = new ReportGenerator(new EmailService());
  const data = { summary: { engagement: 100 } };
  const insights = { keyFindings: ['Test finding'] };

  it('generates HTML report', async () => {
    const options: ReportOptions = { format: 'html', includeCharts: false, includeRawData: false };
    const result = await generator.generateReport(data, insights, options);
    expect(typeof result).toBe('string');
    expect(result).toContain('<html>');
  });

  it('generates JSON report', async () => {
    const options: ReportOptions = { format: 'json', includeCharts: false, includeRawData: false };
    const result = await generator.generateReport(data, insights, options);
    expect(typeof result).toBe('string');
    expect(result).toContain('keyFindings');
  });

  it('schedules recurring report', async () => {
    const config = { frequency: 'weekly' as const, recipients: ['test@example.com'], metrics: ['engagement'] };
    const options = { includeCharts: false, includeRawData: false };
    const result = await generator.scheduleRecurringReport(config, options);
    expect(result).toBe('Scheduled');
  });
}); 