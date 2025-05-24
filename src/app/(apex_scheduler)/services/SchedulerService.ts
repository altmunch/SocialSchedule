// DIFFICULT: Complex scheduling logic with potential race conditions and edge cases

import { PriorityQueue } from './PriorityQueue';
import { TimeSlotManager } from './TimeSlotManager';
import { PlatformAPIService } from './PlatformAPIService';
import { AnalyticsService } from './AnalyticsService';
import { Post, TimeSlot, ScheduledPost, PlatformType, PostMetadata } from '../types';
import { addMinutes, getNextOccurrence } from '../utils/timeUtils';
// @ts-ignore - No types available for uuid
import { v4 as uuidv4 } from 'uuid';

interface SchedulerConfig {
  maxRetryAttempts?: number;
  retryDelayMs?: number;
  enableAnalytics?: boolean;
  timezone?: string;
}

export class SchedulerService {
  private priorityQueue: PriorityQueue;
  private timeSlotManager: TimeSlotManager;
  public isSlotAvailable(slot: TimeSlot, platform: PlatformType): boolean {
    return this.timeSlotManager.isSlotAvailable(slot, platform);
  }
  private platformService: PlatformAPIService;
  private analyticsService: AnalyticsService;
  private scheduledPosts: Map<string, ScheduledPost>;
  private isProcessing: boolean;
  private config: Required<SchedulerConfig>;
  private retryQueue: Map<string, { attempts: number; nextRetry: Date }>;
  private eventListeners: Map<string, Set<Function>>;

  constructor(config: SchedulerConfig = {}) {
    this.priorityQueue = new PriorityQueue();
    this.timeSlotManager = new TimeSlotManager();
    this.platformService = new PlatformAPIService();
    this.analyticsService = new AnalyticsService();
    this.scheduledPosts = new Map();
    this.retryQueue = new Map();
    this.eventListeners = new Map();
    this.isProcessing = false;
    
    this.config = {
      maxRetryAttempts: 3,
      retryDelayMs: 30000, // 30 seconds
      enableAnalytics: true,
      timezone: 'UTC',
      ...config
    };
    
    // Start the retry processor
    this.startRetryProcessor();
  }

  /**
   * Start the retry processor for failed posts
   */
  private startRetryProcessor(): void {
    setInterval(async () => {
      const now = new Date();
      const toRetry: string[] = [];
      
      // Find posts that are due for a retry
      this.retryQueue.forEach((value, postId) => {
        if (value.nextRetry <= now) {
          toRetry.push(postId);
        }
      });
      
      // Process each retry
      for (const postId of toRetry) {
        const postData = this.scheduledPosts.get(postId);
        if (postData) {
          this.retryQueue.delete(postId);
          await this.schedulePost(postData.post);
        }
      }
    }, 10000); // Check every 10 seconds
  }

  /**
   * Mark a post as failed
   */
  private markAsFailed(postId: string, reason: string): void {
    const post = this.scheduledPosts.get(postId);
    if (post) {
      post.status = 'failed';
      post.metadata = {
        ...post.metadata,
        error: reason,
        failedAt: new Date()
      };
      this.emit('failed', { postId, reason });
    }
  }

  /**
   * Process the priority queue and schedule posts with retry logic
   */
  private async processQueue(): Promise<void> {
    // Ensure metadata exists for all scheduled posts
    this.scheduledPosts.forEach((post, postId) => {
      if (!post.metadata) {
        post.metadata = {};
        this.scheduledPosts.set(postId, post);
      }
    });
    if (this.isProcessing) {
      console.log('Queue processing already in progress');
      return;
    }
    
    this.isProcessing = true;
    
    try {
      while (!this.priorityQueue.isEmpty()) {
        const item = this.priorityQueue.dequeue();
        if (!item) break;
        
        const { post, optimalSlots } = item;
        const postId = post.id;
        let scheduled = false;
        
        // Ensure we have a valid post ID
        if (!postId) {
          console.error('Post is missing an ID');
          continue;
        }
        
        // Check if this is a retry
        const retryInfo = this.retryQueue.get(postId);
        const attempt = retryInfo ? retryInfo.attempts + 1 : 1;
        
        // Try each optimal slot until we find an available one
        for (const slot of optimalSlots) {
          if (await this.timeSlotManager.isSlotAvailable(slot, post.platform)) {
            try {
              // Update scheduled post with the selected slot
              const scheduledPost = this.scheduledPosts.get(postId);
              if (scheduledPost) {
                // Get existing metadata or create a new empty object
                const existingMetadata = scheduledPost.metadata || {} as PostMetadata;
                
                // Create updated metadata with new values
                const metadata: PostMetadata = {
                  ...existingMetadata,
                  slotScore: slot.score,
                  scheduledAt: new Date(),
                  optimized: true,
                  attempt,
                  platformPostId: existingMetadata.platformPostId
                };
                
                // Update the scheduled post
                scheduledPost.scheduledTime = slot.start;
                scheduledPost.status = 'scheduled';
                scheduledPost.metadata = metadata;
              }
              
              // Call platform API to schedule the post
              const result = await this.platformService.schedulePost(post, slot);
              
              if (result.success) {
                // Reserve the time slot
                await this.timeSlotManager.reserveSlot(slot, post.platform);
                
                // Update scheduled post with platform ID
                if (scheduledPost) {
                  scheduledPost.metadata.platformPostId = result.platformPostId;
                  scheduledPost.status = 'scheduled';
                  this.emit('scheduled', scheduledPost);
                }
                
                // Remove from retry queue if it was there
                this.retryQueue.delete(postId);
                
                console.log(`Successfully scheduled post ${postId} for ${slot.start}`);
                scheduled = true;
                break;
              } else {
                console.warn(`Attempt ${attempt} failed for post ${postId}:`, result.error);
                // Schedule a retry
                const nextRetry = new Date(Date.now() + (this.config.retryDelayMs * attempt));
                this.retryQueue.set(postId, {
                  attempts: attempt,
                  nextRetry
                });
                this.emit('retry', { postId, attempt, nextRetry, error: result.error });
              }
            } catch (error) {
              console.error(`Error scheduling post ${postId}:`, error);
              // Continue to next slot
            }
          }
        }
        
        if (!scheduled) {
          console.error(`Failed to schedule post ${postId}: No available slots`);
          // Update status to failed
          const failedPost = this.scheduledPosts.get(postId);
          if (failedPost) {
            failedPost.status = 'failed';
            failedPost.metadata = {
              ...failedPost.metadata,
              error: 'No available time slots'
            };
          }
        }
      }
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Get the status of a scheduled post
   */
  getPostStatus(postId: string): ScheduledPost | undefined {
    return this.scheduledPosts.get(postId);
  }

  /**
   * Get all scheduled posts
   */
  getAllScheduledPosts(): ScheduledPost[] {
    return Array.from(this.scheduledPosts.values());
  }

  /**
   * Register an event listener
   */
  on(event: 'scheduled' | 'published' | 'failed' | 'retry' | 'cancelled', callback: (data: unknown) => void): () => void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    const listeners = this.eventListeners.get(event)!;
    listeners.add(callback);
    
    // Return unsubscribe function
    return () => {
      listeners.delete(callback);
    };
  }

  private emit(event: string, data: unknown): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in ${event} listener:`, error);
        }
      });
    }
  }

  /**
   * Schedule a new post or update an existing one
   */
  async schedulePost(post: Post, options: {
    optimizeForEngagement?: boolean;
    targetPlatforms?: PlatformType[];
    scheduleAt?: Date;
  } = {}): Promise<ScheduledPost> {
    // Ensure post has an ID
    if (!post.id) {
      post.id = uuidv4();
    }

    // Set default metadata if not provided
    if (!post.metadata) {
      post.metadata = {};
    }
    
    // Set creation time if not provided
    if (!post.metadata.createdAt) {
      post.metadata.createdAt = new Date();
    }
    
    // If specific time is provided, use it directly
    if (options.scheduleAt) {
      const scheduledPost: ScheduledPost = {
        post,
        scheduledTime: options.scheduleAt,
        platform: post.platform,
        status: 'scheduled',
        metadata: {
          ...post.metadata,
          scheduledAt: new Date(),
          optimized: false
        }
      };
      
      this.scheduledPosts.set(post.id, scheduledPost);
      this.emit('scheduled', scheduledPost);
      return scheduledPost;
    }
    try {
      console.log(`Scheduling post: ${post.id}`);
      
      // Get optimal time slots based on historical data and audience activity
      const optimalSlots = await this.timeSlotManager.findOptimalSlots(post);
      
      if (optimalSlots.length === 0) {
        throw new Error('No optimal time slots available');
      }
      
      // Create scheduled post entry
      const scheduledPost: ScheduledPost = {
        post,
        scheduledTime: optimalSlots[0].start, // Default to best slot
        platform: post.platform,
        status: 'pending',
        metadata: {
          optimalSlots: optimalSlots.map(slot => ({
            start: slot.start,
            end: slot.end,
            score: slot.score
          }))
        }
      };
      
      // Calculate priority and add to queue
      const priority = await this.calculatePriority(post);
      this.priorityQueue.enqueue({
        post,
        priority,
        optimalSlots
      });
      
      // Store the scheduled post
      this.scheduledPosts.set(post.id, scheduledPost);
      
      // Process the queue if not already processing
      if (!this.isProcessing) {
        await this.processQueue();
      }
      
      return scheduledPost;
    } catch (error) {
      console.error('Error scheduling post:', error);
      
      // Update status to failed
      if (this.scheduledPosts.has(post.id)) {
        const failedPost = this.scheduledPosts.get(post.id)!;
        failedPost.status = 'failed';
        failedPost.metadata = {
          ...failedPost.metadata,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
      
      throw error;
    }
  }

  /**
   * Cancel a scheduled post
   */
  async cancelPost(postId: string): Promise<boolean> {
    if (!postId) {
      throw new Error('Post ID is required');
    }
    
    const scheduledPost = this.scheduledPosts.get(postId);
    
    if (!scheduledPost) {
      console.warn(`No scheduled post found with ID: ${postId}`);
      return false;
    }
    
    try {
      // Remove from scheduled posts
      this.scheduledPosts.delete(postId);
      
      // Remove from retry queue if present
      this.retryQueue.delete(postId);
      
      // Cancel on the platform if already scheduled
      const platformPostId = scheduledPost.metadata?.platformPostId;
      if (scheduledPost.status === 'scheduled' && platformPostId) {
        try {
          await this.platformService.cancelScheduledPost(
            scheduledPost.platform,
            platformPostId
          );
        } catch (error) {
          console.error(`Failed to cancel post ${postId} on platform:`, error);
          // Continue with local cancellation even if platform cancellation fails
        }
      }
      
      console.log(`Successfully cancelled post ${postId}`);
      this.emit('cancelled', { 
        postId,
        platform: scheduledPost.platform,
        scheduledTime: scheduledPost.scheduledTime
      });
      
      return true;
    } catch (error) {
      console.error(`Error cancelling post ${postId}:`, error);
      this.emit('error', { 
        postId,
        error: error instanceof Error ? error.message : 'Unknown error',
        action: 'cancel'
      });
      return false;
    }
  }
  
  /**
   * Get analytics for a specific post
   */
  async getPostAnalytics(postId: string) {
    if (!this.config.enableAnalytics) {
      throw new Error('Analytics are disabled in the scheduler configuration');
    }
    return this.analyticsService.getPostPerformance(postId);
  }
  
  /**
   * Get platform-wide analytics
   */
  async getPlatformAnalytics(platform: PlatformType) {
    if (!this.config.enableAnalytics) {
      throw new Error('Analytics are disabled in the scheduler configuration');
    }
    return this.analyticsService.getPlatformPerformance(platform);
  }

  /**
   * Calculate post priority based on various factors
   */
  private async calculatePriority(post: Post): Promise<number> {
    // Base priority
    let priority = 0;
    
    // Priority factors (additive)
    if (post.isTrending) priority += 30;
    if (post.promoted) priority += 20;
    if (post.urgent) priority += 50;
    
    // Time decay (older posts get higher priority)
    const hoursSinceCreation = (Date.now() - new Date(post.metadata?.createdAt || Date.now()).getTime()) / (1000 * 60 * 60);
    priority += Math.min(20, Math.floor(hoursSinceCreation)); // Max +20 for older posts
    
    // If analytics are enabled, adjust based on historical performance
    if (this.config.enableAnalytics && post.platform) {
      try {
        const platformPerf = await this.analyticsService.getPlatformPerformance(post.platform);
        if (platformPerf?.avgEngagement && platformPerf.avgEngagement > 0) {
          // Adjust priority based on platform engagement (0-10% adjustment)
          const engagementAdjustment = platformPerf.avgEngagement * 10;
          priority += Math.round(priority * (engagementAdjustment / 100));
        }
      } catch (error) {
        console.error('Error getting platform performance:', error);
      }
    }
    
    return priority;
  }
}
