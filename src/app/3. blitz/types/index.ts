// Core types for the Blitz module

export type Platform = 'tiktok' | 'instagram' | 'youtube' | 'twitter' | 'facebook';

export interface PostContent {
  text?: string;
  mediaUrls?: string[];
  videoUrl?: string;
  thumbnailUrl?: string;
  link?: string;
  hashtags?: string[];
  mentions?: string[];
}

export interface PostSchedule {
  scheduledTime: Date;
  timezone: string;
  isRecurring?: boolean;
  recurrenceRule?: string; // iCal RRULE format
  endRecurrence?: Date;
}

export interface PostMetrics {
  priorityScore: number; // 0-1
  viralityScore: number; // 0-1
  engagementRate?: number; // 0-1
  trendVelocity?: number; // 0-1
  lastUpdated: Date;
}

export interface Post {
  id: string;
  platform: Platform;
  content: PostContent;
  schedule: PostSchedule;
  metrics: PostMetrics;
  status: 'draft' | 'scheduled' | 'published' | 'failed' | 'retrying';
  retryCount: number;
  maxRetries: number;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface PlatformConfig {
  apiKey: string;
  apiSecret: string;
  accessToken?: string;
  refreshToken?: string;
  tokenExpiresAt?: Date;
  rateLimit?: {
    limit: number;
    remaining: number;
    resetAt: Date;
  };
}

export interface SchedulerConfig {
  defaultTimezone: string;
  maxConcurrentPosts: number;
  retryDelays: number[]; // in milliseconds
  bufferBetweenPosts: number; // in minutes
  enableTrendAdjustment: boolean;
  trendAdjustmentThreshold: number; // percentage
  maxRescheduleWindow: number; // in hours
}

export interface ConflictResolutionResult {
  success: boolean;
  scheduledTime?: Date;
  conflicts: string[]; // IDs of conflicting posts
  message?: string;
}

export interface PublishResult {
  success: boolean;
  postId: string;
  platformPostId?: string;
  scheduledTime: Date;
  publishedAt?: Date;
  error?: Error;
  retryIn?: number; // in milliseconds
}

export interface TrendAlert {
  id: string;
  platform: Platform;
  trendId: string;
  trendName: string;
  velocityIncrease: number; // percentage
  currentVelocity: number; // 0-1
  relatedHashtags: string[];
  relatedPosts: string[]; // post IDs
  detectedAt: Date;
  expiresAt: Date;
}

export interface AuditLog {
  id: string;
  timestamp: Date;
  action: string;
  resourceType: string;
  resourceId: string;
  userId?: string;
  metadata?: Record<string, any>;
  status: 'success' | 'failed' | 'pending';
  error?: string;
  durationMs?: number;
}

// Platform-specific response types
export interface PlatformPostResponse {
  id: string;
  url: string;
  publishedAt: Date;
  platform: Platform;
  metadata: Record<string, any>;
}

// Queue message types
export interface QueueMessage<T = any> {
  id: string;
  type: string;
  payload: T;
  timestamp: Date;
  retryCount: number;
  maxRetries: number;
  scheduledFor?: Date;
}

// Event types
export interface PostScheduledEvent {
  postId: string;
  platform: Platform;
  scheduledTime: Date;
  userId: string;
}

export interface PostPublishedEvent extends PostScheduledEvent {
  publishedAt: Date;
  platformPostId: string;
  url: string;
}

export interface PostFailedEvent extends PostScheduledEvent {
  error: string;
  retryCount: number;
  willRetry: boolean;
  retryAt?: Date;
}

// Type guards
export function isPostScheduledEvent(event: any): event is PostScheduledEvent {
  return (
    event &&
    typeof event.postId === 'string' &&
    typeof event.platform === 'string' &&
    event.scheduledTime instanceof Date
  );
}

export function isPostPublishedEvent(event: any): event is PostPublishedEvent {
  return (
    isPostScheduledEvent(event) &&
    event.publishedAt instanceof Date &&
    typeof event.platformPostId === 'string' &&
    typeof event.url === 'string'
  );
}

export function isPostFailedEvent(event: any): event is PostFailedEvent {
  return (
    isPostScheduledEvent(event) &&
    typeof event.error === 'string' &&
    typeof event.retryCount === 'number' &&
    typeof event.willRetry === 'boolean'
  );
}
