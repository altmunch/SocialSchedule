import { SchedulerService } from '../../(apex_scheduler)/services/SchedulerService';
import { TimeSlotManager } from '../../(apex_scheduler)/services/TimeSlotManager';
import { PlatformAPIService } from '../../(apex_scheduler)/services/PlatformAPIService';
import { Post } from '../../(apex_scheduler)/types';

type PlatformType = 'instagram' | 'tiktok' | 'facebook' | 'linkedin';

class SchedulerIntegrationService {
  private static instance: SchedulerIntegrationService;
  private schedulerService: SchedulerService;
  private timeSlotManager: TimeSlotManager;
  private platformService: PlatformAPIService;

  private constructor() {
    this.timeSlotManager = new TimeSlotManager();
    this.platformService = new PlatformAPIService();
    this.schedulerService = new SchedulerService({
      maxRetryAttempts: 3,
      retryDelayMs: 30000,
      enableAnalytics: true,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    });
  }

  public static getInstance(): SchedulerIntegrationService {
    if (!SchedulerIntegrationService.instance) {
      SchedulerIntegrationService.instance = new SchedulerIntegrationService();
    }
    return SchedulerIntegrationService.instance;
  }

  /**
   * Schedule a post with optimized time slots
   */
  public async schedulePost(post: Omit<Post, 'scheduledTime'>): Promise<{ success: boolean; message: string; scheduledTime?: Date }> {
    try {
      // Find optimal time slots for the post
      const slots = await this.timeSlotManager.findOptimalSlots({
        ...post,
        scheduledTime: new Date(), // Will be overridden by the scheduler
      });

      if (slots.length === 0) {
        return { success: false, message: 'No available time slots found' };
      }

      // Use the best available time slot
      const bestSlot = slots[0];
      const scheduledPost = {
        ...post,
        scheduledTime: bestSlot.start,
      };

      // Schedule the post
      await this.schedulerService.schedulePost(scheduledPost);
      
      return { 
        success: true, 
        message: 'Post scheduled successfully',
        scheduledTime: bestSlot.start
      };
    } catch (error) {
      console.error('Error scheduling post:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to schedule post' 
      };
    }
  }

  /**
   * Get scheduled posts for a specific platform
   */
  public async getScheduledPosts(platform: PlatformType) {
    // Implementation depends on your platform service
    // For now, return an empty array as a placeholder
    return [];
  }

  /**
   * Cancel a scheduled post
   */
  public async cancelPost(postId: string): Promise<boolean> {
    return this.schedulerService.cancelPost(postId);
  }

  /**
   * Get available time slots for a specific platform
   */
  public async getAvailableSlots(platform: PlatformType, lookaheadDays: number = 7) {
    // Create a temporary post with required fields
    const tempPost: Post = {
      id: `temp-${Date.now()}`,
      platform,
      content: '',
      metadata: {}
    };
    
    return this.timeSlotManager.findOptimalSlots(tempPost, lookaheadDays);
  }
}

export const schedulerIntegrationService = SchedulerIntegrationService.getInstance();
