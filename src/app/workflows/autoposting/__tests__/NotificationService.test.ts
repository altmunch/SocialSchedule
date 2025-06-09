import { NotificationService } from '../NotificationService';

describe('NotificationService', () => {
  let service: NotificationService;

  beforeEach(() => {
    service = new NotificationService();
  });

  it('delivers notifications immediately if not throttled', () => {
    const spy = jest.spyOn(console, 'info').mockImplementation(() => {});
    service.sendNotification('success', 'Test success');
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('SUCCESS'));
    spy.mockRestore();
  });

  it('batches notifications if throttled', () => {
    const spy = jest.spyOn(console, 'info').mockImplementation(() => {});
    service.sendNotification('error', 'First error');
    service.sendNotification('error', 'Second error');
    // Only one should be delivered immediately
    expect(spy).toHaveBeenCalledTimes(1);
    service.flushQueue();
    expect(spy).toHaveBeenCalledTimes(2);
    spy.mockRestore();
  });
}); 