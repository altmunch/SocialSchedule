import { generateOptimalSchedule, ScheduleInput } from '../ScheduleOptimizer';

describe('generateOptimalSchedule', () => {
  it('returns empty array for empty activity', () => {
    const input: ScheduleInput = {
      platform: 'tiktok',
      audienceData: { timezone: 'UTC', activityHours: [], peakDays: [] },
      contentType: 'video',
    };
    expect(generateOptimalSchedule(input)).toEqual([]);
  });

  it('generates slots for active hours and peak days', () => {
    const input: ScheduleInput = {
      platform: 'instagram',
      audienceData: { timezone: 'UTC', activityHours: [9, 18], peakDays: [1, 3] },
      contentType: 'image',
      historicalPerformance: {
        bestTimes: [
          { hour: 9, engagementRate: 0.8 },
          { hour: 18, engagementRate: 0.9 },
        ],
      },
    };
    const slots = generateOptimalSchedule(input);
    expect(slots.length).toBeGreaterThan(0);
    slots.forEach(slot => {
      expect(['instagram']).toContain(slot.platform);
      expect(['image']).toContain(slot.contentType);
      expect(typeof slot.expectedEngagement).toBe('number');
    });
  });
}); 