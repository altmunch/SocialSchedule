// src/app/3. blitz/services/SchedulerCore.ts
import { Redis } from 'ioredis';
import { S3Client } from '@aws-sdk/client-s3';

/**
 * difficult: This service manages the core scheduling logic with Redis and S3 integration.
 * It handles priority-based queueing and archiving of posts.
 */
export interface Post {
  id: string;
  content: string;
  platform: 'tiktok' | 'instagram' | 'youtube';
  scheduledTime: Date;
  viralityScore: number;
  trendVelocity: number;
  status: 'queued' | 'scheduled' | 'published' | 'failed';
  metadata?: Record<string, any>;
}

export class SchedulerCore {
  private redis: Redis;
  private s3: S3Client;
  private readonly QUEUE_KEY = 'scheduled_posts';
  private readonly ARCHIVE_PREFIX = 'archive:';

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
  }

  private calculatePriorityScore(post: Omit<Post, 'priorityScore'>): number {
    return (post.viralityScore * 0.7) + (post.trendVelocity * 0.3);
  }

  async schedulePost(post: Omit<Post, 'id' | 'status'>): Promise<string> {
    const postId = `post_${Date.now()}`;
    // Ensure all required fields are present
    const completePost: Post = {
      ...post,
      id: postId,
      status: 'queued',
      scheduledTime: post.scheduledTime || new Date(),
      viralityScore: post.viralityScore || 0,
      trendVelocity: post.trendVelocity || 0,
      platform: post.platform, // This is required by the Post interface
    };
    
    const priorityScore = this.calculatePriorityScore(completePost);

    await this.redis.zadd(
      this.QUEUE_KEY,
      priorityScore.toString(),
      JSON.stringify(completePost)
    );

    return postId;
  }

  async getNextScheduledPost(): Promise<Post | null> {
    const result = await this.redis.zrange(this.QUEUE_KEY, 0, 0, 'WITHSCORES');
    if (!result.length) return null;

    const [postJson] = result;
    return JSON.parse(postJson) as Post;
  }

  async archivePost(postId: string): Promise<void> {
    const post = await this.getPost(postId);
    if (!post) return;

    const archiveKey = `${this.ARCHIVE_PREFIX}${postId}`;
    await this.redis.set(archiveKey, JSON.stringify(post));
    await this.redis.zrem(this.QUEUE_KEY, JSON.stringify(post));
  }

  private async getPost(postId: string): Promise<Post | null> {
    const allPosts = await this.redis.zrange(this.QUEUE_KEY, 0, -1);
    for (const postJson of allPosts) {
      const post = JSON.parse(postJson) as Post;
      if (post.id === postId) return post;
    }
    return null;
  }

  async close(): Promise<void> {
    await this.redis.quit();
  }
}