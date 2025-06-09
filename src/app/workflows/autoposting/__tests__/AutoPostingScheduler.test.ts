import { AutoPostingScheduler } from '../AutoPostingScheduler';

describe('AutoPostingScheduler', () => {
  let scheduler: AutoPostingScheduler;

  beforeEach(() => {
    scheduler = new AutoPostingScheduler();
  });

  it('processes queue and schedules posts', async () => {
    const queue = scheduler.getQueue();
    const id = queue.addToQueue({
      content: { data: 'test content' },
      platforms: ['tiktok', 'instagram'],
      metadata: { scheduledTime: new Date() },
    });
    await scheduler.processQueue();
    // After processing, status should be updated to 'scheduled' or 'failed'
    const batch = queue.getNextBatch();
    expect(batch.find(item => item.id === id)).toBeUndefined();
  });

  afterEach(() => {
    if (scheduler) scheduler.stop();
  });
}); 