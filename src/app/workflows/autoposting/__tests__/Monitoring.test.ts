import { MonitoringService } from '../Monitoring';
import { ContentQueue } from '../ContentQueue';

describe('MonitoringService', () => {
  let monitoring: MonitoringService;
  let queue: ContentQueue;

  beforeEach(() => {
    monitoring = new MonitoringService();
    queue = new ContentQueue();
  });

  it('checks queue health', () => {
    expect(monitoring.checkQueueHealth(queue)).toBe('healthy');
    for (let i = 0; i < 10; i++) {
      queue.addToQueue({ content: {}, platforms: ['tiktok'], metadata: { scheduledTime: new Date() } });
    }
    expect(monitoring.checkQueueHealth(queue)).toBe('warning');
    for (let i = 0; i < 20; i++) {
      queue.addToQueue({ content: {}, platforms: ['tiktok'], metadata: { scheduledTime: new Date() } });
    }
    console.log('Queue length before critical check:', queue.getNextBatch().length);
    expect(monitoring.checkQueueHealth(queue)).toBe('critical');
  });

  it('detects anomalies', () => {
    for (let i = 0; i < 10; i++) monitoring.recordFailure();
    for (let i = 0; i < 5; i++) monitoring.recordSuccess();
    expect(monitoring.detectAnomalies()).toBe(true);
  });

  it('alerts admin (stub)', () => {
    const spy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    monitoring.alertAdmin('Test alert');
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('Test alert'));
    spy.mockRestore();
  });
}); 