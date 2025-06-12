import { PostScheduler } from '../../scheduling';
import { createTestConfig } from '@/lib/ai/testUtils/index';

describe('PostScheduler', () => {
  let scheduler: PostScheduler;
  
  beforeEach(() => {
    const config = createTestConfig({
      useLocalModel: true,
      costTrackingEnabled: true,
    });
    
    scheduler = new PostScheduler(config);
  });

  describe('schedulePost', () => {
    it('schedules a post for the future', async () => {
      const post = {
        content: 'Scheduled post content',
        platforms: ['twitter', 'linkedin'],
        scheduledTime: new Date(Date.now() + 3600000) // 1 hour from now
      };
      
      const result = await scheduler.schedulePost(post);
      
      expect(result).toHaveProperty('success', true);
      expect(result).toHaveProperty('scheduledTime');
      expect(result.scheduledTime).toBeInstanceOf(Date);
    });

    it('rejects scheduling in the past', async () => {
      const post = {
        content: 'Past post',
        platforms: ['twitter'],
        scheduledTime: new Date(Date.now() - 1000) // 1 second ago
      };
      
      await expect(scheduler.schedulePost(post))
        .rejects
        .toThrow('Cannot schedule post in the past');
    });
  });

  describe('getOptimalSchedule', () => {
    it('returns optimal schedule for posts', async () => {
      const posts = [
        { content: 'First post', priority: 'high' },
        { content: 'Second post', priority: 'medium' }
      ];
      
      const schedule = await scheduler.getOptimalSchedule(posts, {
        startDate: new Date(),
        endDate: new Date(Date.now() + 86400000), // 24 hours
        platform: 'twitter'
      });
      
      expect(Array.isArray(schedule)).toBe(true);
      expect(schedule.length).toBe(posts.length);
      schedule.forEach(slot => {
        expect(slot).toHaveProperty('post');
        expect(slot).toHaveProperty('scheduledTime');
        expect(slot.scheduledTime).toBeInstanceOf(Date);
      });
    });
  });
});
