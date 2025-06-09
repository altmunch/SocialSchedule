import { ChartGenerator, ChartData } from '../ChartGenerator';

describe('ChartGenerator', () => {
  const chartData: ChartData = {
    type: 'line',
    title: 'Test Chart',
    data: [{ x: 1, y: 2 }],
  };

  it('creates SVG chart', async () => {
    const result = await ChartGenerator.createChart(chartData, 'svg');
    expect(typeof result).toBe('string');
    expect(result).toContain('<svg>');
  });

  it('creates JSON chart', async () => {
    const result = await ChartGenerator.createChart(chartData, 'json');
    expect(typeof result).toBe('string');
    expect(result).toContain('Test Chart');
  });

  it('creates dashboard', async () => {
    const result = await ChartGenerator.createDashboard([{ chart: chartData }]);
    expect(typeof result).toBe('string');
    expect(result).toContain('Dashboard');
  });
}); 