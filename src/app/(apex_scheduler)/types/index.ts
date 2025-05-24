export interface Post {
  id: string;
  content: string;
  platform: 'instagram' | 'tiktok' | 'facebook' | 'linkedin';
  scheduledTime?: Date;
  isTrending?: boolean;
  promoted?: boolean;
  urgent?: boolean;
  metadata?: Record<string, any>;
}

export interface TimeSlot {
  start: Date;
  end: Date;
  platform: PlatformType;
  score: number; // 0-1 score of how optimal this time is
}

export interface ScheduledPost {
  post: Post;
  scheduledTime: Date;
  platform: PlatformType;
  status: 'pending' | 'scheduled' | 'published' | 'failed';
  metadata: PostMetadata;
}

export type PlatformType = 'twitter' | 'facebook' | 'instagram' | 'tiktok' | 'linkedin' | 'youtube' | 'pinterest' | 'other';

export interface PostMetadata {
  createdAt?: Date;
  updatedAt?: Date;
  scheduledAt?: Date;
  publishedAt?: Date;
  failedAt?: Date;
  error?: string;
  platformPostId?: string;
  slotScore?: number;
  optimized?: boolean;
  attempt?: number;
  [key: string]: any;
}

export interface PlatformConfig {
  platform: PlatformType;
  maxPostsPerDay: number;
  minTimeBetweenPosts: number; // in minutes
  optimalPostingHours: {
    start: number; // 0-23
    end: number;   // 0-23
  }[];
}

export interface PriorityItem {
  post: Post;
  priority: number;
  optimalSlots: TimeSlot[];
}
