import { DashboardAPI } from '../DashboardAPI';
import { AutoPostingScheduler } from '../AutoPostingScheduler';
import { MonitoringService } from '../Monitoring';
import { NotificationService } from '../NotificationService';

describe('DashboardAPI', () => {
  let api: DashboardAPI;
  let scheduler: AutoPostingScheduler;
  let monitoring: MonitoringService;
  let notifications: NotificationService;
  const token = 'secure-admin-token';

  beforeEach(() => {
    scheduler = new AutoPostingScheduler();
    monitoring = new MonitoringService();
    notifications = new NotificationService();
    api = new DashboardAPI(scheduler, monitoring, notifications);
  });

  it('returns queue status for authorized user', () => {
    expect(api.getQueueStatus(token)).toHaveProperty('length');
  });

  it('throws for unauthorized access', () => {
    expect(() => api.getQueueStatus('bad-token')).toThrow('Unauthorized');
  });

  it('returns logs for authorized user', () => {
    expect(api.getLogs(token)).toContain('Log entry 1');
  });

  it('allows manual override actions', () => {
    expect(api.manualOverride(token, 'pause')).toEqual({ success: true });
    expect(api.manualOverride(token, 'resume')).toEqual({ success: true });
    expect(api.manualOverride(token, 'forcePost')).toEqual({ success: true });
  });

  it('returns real-time monitoring data', () => {
    const data = api.getRealTimeMonitoring(token);
    expect(data).toHaveProperty('successRate');
    expect(data).toHaveProperty('failureRate');
    expect(data).toHaveProperty('avgProcessingTime');
  });
}); 