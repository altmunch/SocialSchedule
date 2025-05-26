// difficult: This file defines the core types and validation for the SCAN phase
import { z } from 'zod';

export const PlatformSchema = z.union([
  z.literal('tiktok'),
  z.literal('instagram'),
  z.literal('youtube')
]);

export type Platform = z.infer<typeof PlatformSchema>;

// Common error types
export type ApiError = {
  code: string;
  message: string;
  status?: number;
  retryAfter?: number;
};

export type ApiResponse<T> = {
  data?: T;
  error?: ApiError;
  meta?: {
    requestId?: string;
    rateLimit?: {
      limit: number;
      remaining: number;
      resetAt: Date;
    };
  };
};

export const PostMetricsSchema = z.object({
  id: z.string().min(1, 'Post ID is required'),
  platform: PlatformSchema,
  views: z.number().int().nonnegative(),
  likes: z.number().int().nonnegative(),
  comments: z.number().int().nonnegative(),
  shares: z.number().int().nonnegative(),
  watchTime: z.number().nonnegative().optional(),
  engagementRate: z.number().min(0).max(100),
  timestamp: z.date(),
  caption: z.string().optional(),
  hashtags: z.array(z.string()).optional(),
  url: z.string().url('Invalid post URL'),
  metadata: z.record(z.unknown()).optional()
    .refine((val) => {
      if (!val) return true;
      const { title, thumbnail, duration, isShort, channelTitle, tags, ...rest } = val as any;
      return (
        (title === undefined || typeof title === 'string') &&
        (thumbnail === undefined || typeof thumbnail === 'string') &&
        (duration === undefined || typeof duration === 'number') &&
        (isShort === undefined || typeof isShort === 'boolean') &&
        (channelTitle === undefined || typeof channelTitle === 'string') &&
        (tags === undefined || (Array.isArray(tags) && tags.every(t => typeof t === 'string')))
      );
    }, 'Invalid metadata structure')
});

export type PostMetrics = z.infer<typeof PostMetricsSchema>;

export const CompetitorSchema = z.object({
  id: z.string().min(1, 'Competitor ID is required'),
  username: z.string().min(1, 'Username is required'),
  platform: PlatformSchema,
  followerCount: z.number().int().nonnegative(),
  lastScraped: z.date().optional()
});

export type Competitor = z.infer<typeof CompetitorSchema>;

export const ScanStatusSchema = z.union([
  z.literal('pending'),
  z.literal('in_progress'),
  z.literal('completed'),
  z.literal('failed')
]);

export type ScanStatus = z.infer<typeof ScanStatusSchema>;

export const ScanMetricsSchema = z.object({
  totalPosts: z.number().int().nonnegative(),
  averageEngagement: z.number().min(0).max(100),
  peakTimes: z.array(z.object({
    hour: z.number().int().min(0).max(23),
    engagementScore: z.number().min(0)
  })),
  topPerformingPosts: z.array(PostMetricsSchema)
});

export const ScanResultSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().min(1, 'User ID is required'),
  platform: PlatformSchema,
  startTime: z.date(),
  endTime: z.date().optional(),
  status: ScanStatusSchema,
  metrics: ScanMetricsSchema.optional(),
  error: z.string().optional()
});

export type ScanResult = z.infer<typeof ScanResultSchema>;

export const ScanOptionsSchema = z.object({
  platforms: z.array(PlatformSchema).nonempty('At least one platform is required'),
  competitors: z.array(z.string().min(1, 'Competitor ID cannot be empty')).optional(),
  lookbackDays: z.number().int().min(1).max(365).default(30),
  includeOwnPosts: z.boolean().default(true)
}).refine(
  (data) => data.platforms.length <= 3,
  'Maximum of 3 platforms can be scanned at once'
);

export type ScanOptions = z.infer<typeof ScanOptionsSchema>;

// Rate limiting types
export type RateLimit = {
  limit: number;
  remaining: number;
  resetAt: Date;
};

export type RateLimitConfig = {
  [key in Platform]: {
    requestsPerMinute: number;
    burstCapacity: number;
  };
};

// Cache types
export type CacheEntry<T> = {
  data: T;
  expiresAt: Date;
};

export type CacheConfig = {
  ttl: number; // in milliseconds
  maxSize: number;
};
