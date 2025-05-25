// src/app/3. blitz/__tests__/SchedulerCore.test.ts
import { SchedulerCore } from '../services/SchedulerCore';

describe('SchedulerCore', () => {
  let scheduler: SchedulerCore;

  beforeAll(() => {
    scheduler = new SchedulerCore();
  });

  afterAll(async () => {
    await scheduler.close();
  });

  it('should schedule and retrieve a post', async () => {
    const post = {
      content: 'Test post',
      platform: 'instagram' as const,
      scheduledTime: new Date(Date.now() + 3600000), // 1 hour from now
      viralityScore: 0.8,
      trendVelocity: 0.6,
    };

    const postId = await scheduler.schedulePost(post);
    expect(postId).toBeDefined();

    const nextPost = await scheduler.getNextScheduledPost();
    expect(nextPost).toMatchObject({
      content: 'Test post',
      platform: 'instagram',
      status: 'queued'
    });
  });
});