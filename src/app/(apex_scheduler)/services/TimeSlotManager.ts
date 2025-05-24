// DIFFICULT: Complex timezone handling and slot optimization logic

import { TimeSlot, PlatformConfig, Post, PlatformType } from '../types';
import { getOptimalTimeWindows, getCurrentUTCDate } from '../utils/timeUtils';

export class TimeSlotManager {
  private platformConfigs: Map<PlatformType, PlatformConfig>;
  private reservedSlots: Map<PlatformType, TimeSlot[]>;
  private lastCleanup: Date;
  private cleanupInterval: NodeJS.Timeout | null;
  private reservationLocks: Map<PlatformType, boolean>;

  constructor() {
    this.platformConfigs = new Map();
    this.reservedSlots = new Map();
    this.reservationLocks = new Map();
    this.lastCleanup = getCurrentUTCDate();
    this.cleanupInterval = null;
    this.initializeDefaultConfigs();
    
    // Setup periodic cleanup of old slots (every hour)
    this.cleanupInterval = setInterval(
      () => this.cleanupOldSlots(), 
      60 * 60 * 1000 // 1 hour
    ).unref(); // Allow process to exit even with this interval
    
    // Ensure cleanup on process exit
    process.on('exit', this.cleanup.bind(this));
    process.on('SIGINT', this.cleanup.bind(this));
    process.on('SIGTERM', this.cleanup.bind(this));
  }

  private initializeDefaultConfigs(): void {
    // Default platform configurations
    const defaultConfigs: PlatformConfig[] = [
      {
        platform: 'instagram',
        maxPostsPerDay: 3,
        minTimeBetweenPosts: 120, // 2 hours
        optimalPostingHours: [
          { start: 9, end: 11 },
          { start: 12, end: 14 },
          { start: 18, end: 21 },
        ],
      },
      {
        platform: 'tiktok',
        maxPostsPerDay: 5,
        minTimeBetweenPosts: 60, // 1 hour
        optimalPostingHours: [
          { start: 7, end: 10 },
          { start: 16, end: 19 },
          { start: 20, end: 23 },
        ],
      },
    ];

    defaultConfigs.forEach(config => 
      this.platformConfigs.set(config.platform, config)
    );
  }

  /**
   * Cleanup old slots that are in the past
   */
  private async withLock<T>(platform: PlatformType, fn: () => Promise<T>): Promise<T> {
    // Wait until the lock is available
    while (this.reservationLocks.get(platform)) {
      await new Promise(resolve => setTimeout(resolve, 10));
    }
    
    try {
      this.reservationLocks.set(platform, true);
      return await fn();
    } finally {
      this.reservationLocks.set(platform, false);
    }
  }

  private cleanupOldSlots(): void {
    const now = getCurrentUTCDate();
    this.lastCleanup = now;
    
    this.reservedSlots.forEach((slots, platform) => {
      const activeSlots = slots.filter((slot: TimeSlot) => {
        // Ensure we're comparing timestamps to avoid timezone issues
        const slotEndTime = new Date(slot.end).getTime();
        const nowTime = now.getTime();
        return slotEndTime > nowTime;
      });
      this.reservedSlots.set(platform, activeSlots);
    });
  }
  
  /**
   * Cleanup resources
   */
  cleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    
    // Remove all listeners
    process.removeListener('exit', this.cleanup.bind(this));
    process.removeListener('SIGINT', this.cleanup.bind(this));
    process.removeListener('SIGTERM', this.cleanup.bind(this));
  }

  async findOptimalSlots(post: Post, lookaheadDays: number = 7): Promise<TimeSlot[]> {
    if (lookaheadDays < 1 || lookaheadDays > 30) {
      throw new Error('lookaheadDays must be between 1 and 30');
    }
    
    const platform = post.platform;
    const config = this.platformConfigs.get(platform);
    
    if (!config) {
      throw new Error(`No configuration found for platform: ${platform}`);
    }
    
    // Cleanup old slots before finding new ones
    this.cleanupOldSlots();
    
    const now = new Date();
    const slots: TimeSlot[] = [];
    
    // Generate optimal time windows for each day
    for (let day = 0; day < lookaheadDays; day++) {
      const targetDate = new Date(now);
      targetDate.setDate(now.getDate() + day);
      
      const optimalWindows = getOptimalTimeWindows(targetDate, config);
      
      // Filter out reserved slots and convert to TimeSlot format
      const availableSlots = optimalWindows
        .filter(window => this.isSlotAvailable(window, platform))
        .map(window => ({
          start: window.start,
          end: window.end,
          platform,
          score: this.calculateSlotScore(window, platform, post)
        }));
      
      slots.push(...availableSlots);
    }
    
    // Sort by score (highest first)
    return slots.sort((a, b) => b.score - a.score);
  }

  public isSlotAvailable(slot: TimeSlot | { start: Date; end: Date }, platform: PlatformType): boolean {
    const reserved = this.reservedSlots.get(platform) || [];
    return !reserved.some(reservedSlot => 
      this.slotsOverlap(slot, reservedSlot)
    );
  }

  async reserveSlot(slot: TimeSlot, platform: PlatformType): Promise<void> {
    if (!this.platformConfigs.has(platform)) {
      throw new Error(`Invalid platform: ${platform}`);
    }
    
    if (slot.start >= slot.end) {
      throw new Error('Slot start time must be before end time');
    }
    
    // Use lock to prevent race conditions
    return this.withLock(platform, async () => {
      if (!this.isSlotAvailable(slot, platform)) {
        throw new Error('Slot is not available');
      }
      
      const reserved = this.reservedSlots.get(platform) || [];
      reserved.push({...slot}); // Create a copy to prevent modification
      reserved.sort((a, b) => a.start.getTime() - b.start.getTime());
      this.reservedSlots.set(platform, reserved);
    });
  }

  private slotsOverlap(slot1: { start: Date; end: Date }, slot2: { start: Date; end: Date }): boolean {
    return (
      slot1.start < slot2.end && 
      slot1.end > slot2.start
    );
  }

  private calculateSlotScore(slot: TimeSlot | { start: Date; end: Date }, platform: PlatformType, post: Post): number {
    // Base score from platform configuration
    let score = 0.5; // Default base score
    
    // Adjust based on time of day (peak hours get higher scores)
    const hour = slot.start.getHours();
    const config = this.platformConfigs.get(platform);
    
    if (config) {
      // Check if current hour falls within any optimal window
      const isOptimal = config.optimalPostingHours.some(
        ({ start, end }) => hour >= start && hour < end
      );
      
      if (isOptimal) {
        score += 0.3; // Bonus for optimal hours
      }
    }
    
    // Adjust for post urgency
    if (post.urgent) {
      const now = new Date();
      const hoursUntilSlot = (slot.start.getTime() - now.getTime()) / (1000 * 60 * 60);
      
      // The sooner the better for urgent posts
      if (hoursUntilSlot < 2) score += 0.2;
      else if (hoursUntilSlot < 12) score += 0.1;
    }
    
    // Ensure score is within [0, 1] range
    return Math.max(0, Math.min(1, score));
  }
}
