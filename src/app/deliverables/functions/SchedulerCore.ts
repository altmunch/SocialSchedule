// src/app/3. blitz/services/SchedulerCore.ts
import { Redis } from 'ioredis';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import { Platform } from '../types/deliverables_types'; // Use canonical Platform type
import { PlatformClient } from './PlatformClient';
import { 
  Post, 
  PostMetrics, 
  PostContent, 
  PostSchedule, 
  PlatformPostResponse 
} from '../types'; // Import types from the types file

/**
 * difficult: This service manages the core scheduling logic with Redis and S3 integration.
 * It handles priority-based queueing and archiving of posts.
 */

// difficult
// Extended interface for internal use with all required properties
export interface InternalPost extends Omit<Post, 'status' | 'metrics' | 'schedule' | 'content'> {
  // Use the status from Post type for external status
  status: Post['status'];
  // Add internal status tracking
  internalStatus: 'queued' | 'publishing' | 'conflict' | 'ready' | 'processing' | 'none';
  metrics: PostMetrics & { 
    priorityScore: number;
    viralityScore: number;
    trendVelocity: number;
    engagementRate: number;
    lastUpdated: Date;
  };
  schedule: {
    scheduledTime: Date;
    timezone: string;
    isRecurring: boolean;
    recurrenceRule?: string;
    endRecurrence?: Date;
  };
  content: PostContent & { 
    text: string; 
    mediaUrls: string[];
  };
  conflictsWith?: string[];
  lastError?: string;
  publishedAt?: Date;
  archivedAt?: string;
  archivedStatus?: string;
  retryCount: number;
  maxRetries: number;
  createdAt: Date;
  updatedAt: Date;
}

export class SchedulerCore {
  private redis: Redis;
  private s3: S3Client;
  private platformClients: Record<string, PlatformClient>;
  private readonly QUEUE_KEY = 'scheduled_posts';
  private readonly ARCHIVE_PREFIX = 'archive:';
  private readonly CONFLICT_WINDOW_MS = 30 * 60 * 1000; // 30 minutes
  private readonly MAX_RETRIES = 3;
  private isProcessing = false;

  constructor() {
    if (!process.env.REDIS_URL) {
      throw new Error('REDIS_URL environment variable is required');
    }
    this.redis = new Redis(process.env.REDIS_URL);
    
    this.s3 = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });

    // Initialize platform clients
    this.platformClients = {};
  }

  private calculatePriorityScore(post: InternalPost): number {
    // Base score (0-100) based on virality and trend velocity
    const baseScore = (post.metrics.viralityScore * 0.7) + (post.metrics.trendVelocity * 0.3);
    
    // Apply time decay for older posts (1% per hour)
    const hoursOld = (Date.now() - post.schedule.scheduledTime.getTime()) / (1000 * 60 * 60);
    const decayFactor = Math.max(0.9, 1 - (hoursOld * 0.01));
    
    // Apply boost for trending content
    const trendBoost = post.metrics.trendVelocity > 0.7 ? 1.2 : 1; // 0.7 is 70% of max trend velocity
    
    return baseScore * decayFactor * trendBoost;
  }

  /**
   * Schedules a new post. Accepts only user-facing fields; all internal fields are set inside.
   */
  async schedulePost(postData: {
    content: string;
    platform: Platform; // Now uses the imported Platform type
    scheduledTime: Date;
    viralityScore?: number;
    trendVelocity?: number;
    mediaUrls?: string[];
    metadata?: Record<string, any>;
  }): Promise<{ postId: string; conflicts: string[] }> {
    const postId = `post_${uuidv4()}`;
    
    // Ensure all required fields are present
    const now = new Date();
    const post: InternalPost = {
      id: postId,
      platform: postData.platform,
      status: 'scheduled',
      internalStatus: 'queued',
      content: {
        text: postData.content,
        mediaUrls: postData.mediaUrls || [],
        videoUrl: undefined,
        thumbnailUrl: undefined,
        link: undefined,
        hashtags: [],
        mentions: []
      },
      schedule: {
        scheduledTime: postData.scheduledTime,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        isRecurring: false
      },
      metrics: {
        priorityScore: 0, // Will be calculated below
        viralityScore: postData.viralityScore ?? 0,
        trendVelocity: postData.trendVelocity ?? 0,
        engagementRate: 0,
        lastUpdated: now,
      },
      retryCount: 0,
      maxRetries: this.MAX_RETRIES,
      createdAt: now,
      updatedAt: now,
      conflictsWith: [],
      metadata: postData.metadata || {}
    };
    
    // Set initial priority score
    post.metrics.priorityScore = this.calculatePriorityScore(post);

    // Check for conflicts
    const conflicts = await this.checkForConflicts(post);
    
    // If there are conflicts, mark the post and store conflict info
    if (conflicts.length > 0) {
      post.internalStatus = 'conflict';
      post.conflictsWith = conflicts;
      await this.updatePostInQueue(post);
      return { postId, conflicts };
    }
    
    // Calculate priority score and save the post
    post.metrics.priorityScore = this.calculatePriorityScore(post);
    await this.redis.zadd(
      this.QUEUE_KEY,
      post.metrics.priorityScore.toString(),
      JSON.stringify(post)
    );

    return { postId, conflicts: [] };
  }

  async getNextScheduledPost(): Promise<InternalPost | null> {
    if (this.isProcessing) return null;
    
    this.isProcessing = true;
    
    try {
      // Get the highest priority post that's ready to be published
      const now = Date.now();
      const result = await this.redis.zrevrangebyscore(
        this.QUEUE_KEY,
        '+inf',
        now,
        'WITHSCORES',
        'LIMIT',
        0,
        1
      );

      if (!result.length) return null;

      const [postJson, score] = result;
      const post = JSON.parse(postJson) as InternalPost;
      
      // If the post is scheduled for the future, sleep until it's time
      const scheduledTime = post.schedule.scheduledTime.getTime();
      if (scheduledTime > now) {
        await new Promise(resolve => setTimeout(resolve, scheduledTime - now));
      }
      
      return post;
    } finally {
      this.isProcessing = false;
    }
  }

  async archivePost(post: InternalPost): Promise<void> {
    if (!post) return;

    try {
      const archiveKey = `${this.ARCHIVE_PREFIX}${post.id}`;
      const archiveData = {
        ...post,
        archivedAt: new Date().toISOString(),
        archivedStatus: post.status
      };
      
      // Upload to S3 for long-term storage
      const params = {
        Bucket: process.env.S3_BUCKET_NAME || 'social-schedule-archive',
        Key: `posts/${post.platform}/${post.id}.json`,
        Body: JSON.stringify(archiveData),
        ContentType: 'application/json'
      };
      
      await this.s3.send(new PutObjectCommand(params));
      
      // Remove from Redis queue
      await this.redis.zrem(this.QUEUE_KEY, JSON.stringify(post));
      
      console.log(`Archived post ${post.id} to S3`);
    } catch (error) {
      console.error('Failed to archive post:', error);
      // Don't rethrow to prevent blocking the main flow
    }
  }

  private async getPost(postId: string): Promise<InternalPost | null> {
    const posts = await this.redis.zrangebyscore(
      this.QUEUE_KEY,
      `(${postId}`,
      `(${postId}\xff`
    );

    if (!posts.length) return null;
    
    const post = JSON.parse(posts[0]);
    // Ensure the post has all required InternalPost properties
    return {
      ...post,
      schedule: {
        ...post.schedule,
        scheduledTime: new Date(post.schedule.scheduledTime)
      },
      metrics: {
        ...post.metrics,
        lastUpdated: new Date(post.metrics.lastUpdated)
      },
      createdAt: new Date(post.createdAt),
      updatedAt: new Date(post.updatedAt)
    } as InternalPost;
    return null;
  }
  
  private async checkForConflicts(newPost: InternalPost): Promise<string[]> {
    const conflicts: string[] = [];
    const newPostTime = newPost.schedule?.scheduledTime?.getTime();
    
    if (!newPostTime) {
      throw new Error('Invalid scheduled time for post');
    }
    
    const platformPosts = await this.getPlatformPosts(newPost.platform);
    
    for (const existingPost of platformPosts) {
      if (existingPost.id === newPost.id) continue;
      
      const existingTime = existingPost.schedule?.scheduledTime?.getTime();
      if (!existingTime) continue;
      
      const timeDiff = Math.abs(newPostTime - existingTime);
      
      if (timeDiff < this.CONFLICT_WINDOW_MS) {
        conflicts.push(existingPost.id);
      }
    }
    
    return conflicts;
  }
  
  private async getPlatformPosts(platform: Platform): Promise<InternalPost[]> {
    const allPosts = await this.redis.zrange(this.QUEUE_KEY, 0, -1);
    return allPosts
      .map(postJson => {
        try {
          const post = JSON.parse(postJson);
          // Convert to InternalPost and ensure all required fields are present
          return {
            ...post,
            status: post.status as InternalPost['status'],
            schedule: {
              ...post.schedule,
              scheduledTime: new Date(post.schedule.scheduledTime)
            },
            metrics: {
              ...post.metrics,
              priorityScore: post.metrics?.priorityScore || 0,
              lastUpdated: new Date(post.metrics?.lastUpdated || Date.now())
            },
            createdAt: new Date(post.createdAt),
            updatedAt: new Date(post.updatedAt)
          } as InternalPost;
        } catch (error) {
          console.error('Error parsing post:', error);
          return null;
        }
      })
      .filter((post): post is InternalPost => post !== null && post.platform === platform);
  }
  
  async processQueue(): Promise<void> {
    while (true) {
      try {
        const post = await this.getNextScheduledPost();
        if (!post) {
          await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5s before checking again
          continue;
        }
        
        await this.publishPost(post);
      } catch (error) {
        console.error('Error in processQueue:', error);
        await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10s on error
      }
    }
  }
  
  private async publishPost(post: InternalPost): Promise<void> {
    try {
      // Update post status to publishing
      post.status = 'scheduled';
      post.internalStatus = 'publishing';
      post.updatedAt = new Date();
      await this.updatePostInQueue(post);
      
      // Get the platform client
      const platformClient = this.platformClients[post.platform];
      if (!platformClient) {
        throw new Error(`No client available for platform: ${post.platform}`);
      }
      
      // Publish the post
      await platformClient.publish(post);
      
      // Update status on success
      post.status = 'published';
      post.internalStatus = 'none';
      post.publishedAt = new Date();
      post.updatedAt = new Date();
      await this.updatePostInQueue(post);
      
      // Archive the post after successful publishing
      await this.archivePost(post);
      
    } catch (error: any) {
      console.error(`Failed to publish post ${post.id}:`, error);
      
      // Handle retries
      post.retryCount = (post.retryCount || 0) + 1;
      post.lastError = error instanceof Error ? error.message : String(error);
      post.updatedAt = new Date();
      
      if (post.retryCount >= post.maxRetries) {
        // Max retries reached, mark as failed
        post.status = 'failed';
        post.internalStatus = 'none';
        await this.updatePostInQueue(post);
        await this.archivePost(post);
      } else {
        // Schedule a retry with exponential backoff
        const backoffMs = 5 * 60 * 1000 * Math.pow(2, post.retryCount - 1);
        post.schedule.scheduledTime = new Date(Date.now() + backoffMs);
        post.status = 'scheduled';
        post.internalStatus = 'queued';
        await this.updatePostInQueue(post);
      }
    }
  }
  
  private async updatePostInQueue(updatedPost: InternalPost): Promise<void> {
    // Update timestamp
    updatedPost.updatedAt = new Date();
    
    // Remove the old version
    await this.redis.zremrangebyscore(
      this.QUEUE_KEY,
      `(${updatedPost.id}`,
      `(${updatedPost.id}\xff`
    );
    
    // Add the updated version if it's not in a terminal state
    if (updatedPost.status !== 'published' && updatedPost.status !== 'failed') {
      updatedPost.metrics.priorityScore = this.calculatePriorityScore(updatedPost);
      await this.redis.zadd(
        this.QUEUE_KEY,
        updatedPost.metrics.priorityScore.toString(),
        JSON.stringify(updatedPost)
      );
    }
  }
  
  async adjustForTrends(postId: string, trendData: { trendVelocity: number }): Promise<void> {
    const post = await this.getPost(postId);
    if (!post) throw new Error(`Post ${postId} not found`);
    
    // Adjust post based on trend data
    if (trendData.trendVelocity > 0) {
      // If trend is increasing, boost priority
      post.metrics.viralityScore = Math.min(1, post.metrics.viralityScore * 1.2);
      post.metrics.trendVelocity = trendData.trendVelocity;
      post.metrics.priorityScore = this.calculatePriorityScore(post);
      post.metrics.lastUpdated = new Date();
      await this.updatePostInQueue(post);
    }
  }
  
  async resolveConflicts(postId: string, action: 'reschedule' | 'override'): Promise<void> {
    const post = await this.getPost(postId);
    if (!post) throw new Error(`Post ${postId} not found`);
    
    if (action === 'reschedule') {
      // Find next available time slot
      const newTime = await this.findNextAvailableSlot(post.platform, post.schedule.scheduledTime);
      post.schedule.scheduledTime = newTime;
      post.status = 'scheduled';
      post.internalStatus = 'ready';
      delete post.conflictsWith;
      
      // Recalculate priority score
      post.metrics.priorityScore = this.calculatePriorityScore(post);
      post.metrics.lastUpdated = new Date();
      await this.updatePostInQueue(post);
    } else if (action === 'override') {
      // Mark as ready for publishing
      post.status = 'scheduled' as InternalPost['status'];
      post.internalStatus = 'ready';
      delete post.conflictsWith;
      await this.updatePostInQueue(post);
    }
  }

  private async findNextAvailableSlot(platform: Platform, after: Date): Promise<Date> {
    const platformPosts = await this.getPlatformPosts(platform);
    const sortedPosts = platformPosts
      .filter((p: InternalPost) => p.status === 'scheduled' || p.internalStatus === 'queued')
      .sort((a: InternalPost, b: InternalPost) => 
        a.schedule.scheduledTime.getTime() - b.schedule.scheduledTime.getTime()
      );
    
    // Find the first available slot after the given time
    let currentTime = new Date(after);
    
    for (const post of sortedPosts) {
      const postTime = post.schedule.scheduledTime;
      const timeDiff = postTime.getTime() - currentTime.getTime();
      
      if (timeDiff > this.CONFLICT_WINDOW_MS) {
        // Found a gap large enough
        return new Date(currentTime.getTime() + this.CONFLICT_WINDOW_MS);
      }
      
      // Move current time to the end of this post's conflict window
      currentTime = new Date(postTime.getTime() + this.CONFLICT_WINDOW_MS);
    }
    
    // If no conflicts found, return the original time
    return new Date(after);
  }

  async close(): Promise<void> {
    try {
      // Clean up platform clients
      await Promise.all(
        Object.values(this.platformClients).map(client => 
          client.cleanup ? client.cleanup() : Promise.resolve()
        )
      );
      
      // Close Redis connection
      await this.redis.quit();
    } catch (error) {
      console.error('Error during cleanup:', error);
      throw error;
    }
  }
}