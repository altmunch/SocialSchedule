// Utility functions for the Blitz module

import { Platform, Post, PostSchedule, ConflictResolutionResult } from '../types';

/**
 * Calculates the priority score for a post based on various factors
 * @param post The post to calculate the score for
 * @param currentTime The current time (defaults to now)
 * @returns A number between 0 and 1 representing the priority
 */
export function calculatePriorityScore(
  post: Pick<Post, 'metrics' | 'schedule' | 'retryCount'>,
  currentTime: Date = new Date()
): number {
  const { metrics, schedule, retryCount } = post;
  const { viralityScore = 0.5, trendVelocity = 0, engagementRate = 0.5 } = metrics;
  
  // Time decay factor (0-1), decreases as we get closer to the scheduled time
  const timeUntilPost = schedule.scheduledTime.getTime() - currentTime.getTime();
  const hoursUntilPost = timeUntilPost / (1000 * 60 * 60);
  
  // More urgent if it's getting close to the scheduled time
  const timeUrgency = Math.min(1, 1 / (1 + Math.exp(-(24 - hoursUntilPost) / 6)));
  
  // Penalty for retries to prevent infinite retry loops
  const retryPenalty = Math.min(1, retryCount * 0.1);
  
  // Calculate final score with weights
  const score = (
    (viralityScore * 0.5) +
    (trendVelocity * 0.3) +
    (engagementRate * 0.1) +
    (timeUrgency * 0.1) -
    (retryPenalty * 0.2)
  );
  
  // Ensure score is between 0 and 1
  return Math.max(0, Math.min(1, score));
}

/**
 * Finds the next available time slot that doesn't conflict with existing posts
 * @param post The post to schedule
 * @param existingPosts Array of already scheduled posts
 * @param config Scheduler configuration
 * @returns A conflict resolution result
 */
export function findAvailableTimeSlot(
  post: Post,
  existingPosts: Pick<Post, 'id' | 'platform' | 'schedule' | 'metrics'>[],
  config: {
    bufferBetweenPosts: number; // in minutes
    maxRescheduleWindow: number; // in hours
  }
): ConflictResolutionResult {
  const { bufferBetweenPosts, maxRescheduleWindow } = config;
  const bufferMs = bufferBetweenPosts * 60 * 1000; // Convert to milliseconds
  const maxWindowMs = maxRescheduleWindow * 60 * 60 * 1000; // Convert to milliseconds
  
  const scheduledPosts = existingPosts
    .filter(p => p.id !== post.id) // Exclude self
    .sort((a, b) => a.schedule.scheduledTime.getTime() - b.schedule.scheduledTime.getTime());
  
  const originalTime = post.schedule.scheduledTime.getTime();
  const endTime = originalTime + maxWindowMs;
  
  // Check if original time is available
  const originalConflicts = findConflicts(post, scheduledPosts, bufferMs);
  if (originalConflicts.length === 0) {
    return {
      success: true,
      scheduledTime: post.schedule.scheduledTime,
      conflicts: []
    };
  }
  
  // Try to find the next available slot
  let currentTime = originalTime;
  
  while (currentTime < endTime) {
    // Find the next potential slot (after the next conflicting post)
    const nextConflict = scheduledPosts
      .filter(p => {
        const pTime = p.schedule.scheduledTime.getTime();
        return pTime > currentTime && p.platform === post.platform;
      })
      .sort((a, b) => a.schedule.scheduledTime.getTime() - b.schedule.scheduledTime.getTime())[0];
    
    if (!nextConflict) {
      // No more conflicts, we can schedule after the last post
      const newTime = Math.max(
        currentTime,
        ...scheduledPosts
          .filter(p => p.platform === post.platform)
          .map(p => p.schedule.scheduledTime.getTime() + bufferMs)
      );
      
      if (newTime < endTime) {
        return {
          success: true,
          scheduledTime: new Date(newTime),
          conflicts: []
        };
      }
      break;
    }
    
    // Check if we can fit the post before the next conflict
    const nextConflictTime = nextConflict.schedule.scheduledTime.getTime();
    const potentialTime = currentTime + bufferMs;
    
    if (potentialTime + bufferMs <= nextConflictTime) {
      return {
        success: true,
        scheduledTime: new Date(potentialTime),
        conflicts: []
      };
    }
    
    // Move to after the conflicting post
    currentTime = nextConflictTime + bufferMs;
  }
  
  // If we get here, we couldn't find a suitable time
  return {
    success: false,
    conflicts: originalConflicts,
    message: `Could not find an available time slot within the next ${maxRescheduleWindow} hours`
  };
}

/**
 * Finds conflicts between a post and existing posts
 * @private
 */
function findConflicts(
  post: Post,
  existingPosts: Pick<Post, 'id' | 'platform' | 'schedule' | 'metrics'>[],
  bufferMs: number
): string[] {
  const postTime = post.schedule.scheduledTime.getTime();
  const postEndTime = postTime + bufferMs;
  
  return existingPosts
    .filter(p => {
      // Only check conflicts on the same platform
      if (p.platform !== post.platform) return false;
      
      const pTime = p.schedule.scheduledTime.getTime();
      const pEndTime = pTime + bufferMs;
      
      // Check for overlap
      return (
        (postTime >= pTime && postTime < pEndTime) || // Post starts during another post
        (postEndTime > pTime && postEndTime <= pEndTime) || // Post ends during another post
        (postTime <= pTime && postEndTime >= pEndTime) // Post completely contains another post
      );
    })
    .map(p => p.id);
}

/**
 * Formats a date for display in the UI
 * @param date The date to format
 * @param timezone The timezone to use (defaults to UTC)
 * @returns A formatted date string
 */
export function formatScheduleDate(date: Date, timezone: string = 'UTC'): string {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZoneName: 'short'
  }).format(date);
}

/**
 * Calculates the delay until the next retry based on the retry count
 * @param retryCount The number of retry attempts so far
 * @param baseDelayMs The base delay in milliseconds (default: 1 minute)
 * @param maxDelayMs The maximum delay in milliseconds (default: 1 hour)
 * @returns The delay in milliseconds
 */
export function calculateRetryDelay(
  retryCount: number,
  baseDelayMs: number = 60 * 1000,
  maxDelayMs: number = 60 * 60 * 1000
): number {
  // Exponential backoff with jitter
  const delay = Math.min(
    baseDelayMs * Math.pow(2, retryCount - 1),
    maxDelayMs
  );
  
  // Add jitter (±20% of delay)
  const jitter = delay * 0.2 * (Math.random() * 2 - 1);
  
  return Math.max(1000, Math.floor(delay + jitter)); // Ensure at least 1 second
}

/**
 * Validates a post before scheduling
 * @param post The post to validate
 * @returns An array of validation errors, or an empty array if valid
 */
export function validatePost(post: Post): string[] {
  const errors: string[] = [];
  
  if (!post.content.text && !post.content.mediaUrls?.length && !post.content.videoUrl) {
    errors.push('Post must have text, media, or video content');
  }
  
  if (post.content.text && post.content.text.length > 280) {
    errors.push('Post text exceeds maximum length of 280 characters');
  }
  
  if (post.content.mediaUrls && post.content.mediaUrls.length > 10) {
    errors.push('Maximum of 10 media items allowed per post');
  }
  
  if (post.schedule.scheduledTime < new Date()) {
    errors.push('Scheduled time must be in the future');
  }
  
  if (post.retryCount > post.maxRetries) {
    errors.push(`Maximum retry count (${post.maxRetries}) exceeded`);
  }
  
  return errors;
}

/**
 * Groups posts by platform
 * @param posts The posts to group
 * @returns A record mapping platforms to arrays of posts
 */
export function groupPostsByPlatform(
  posts: Post[]
): Record<Platform, Post[]> {
  const result: Record<string, Post[]> = {};
  
  for (const post of posts) {
    if (!result[post.platform]) {
      result[post.platform] = [];
    }
    result[post.platform].push(post);
  }
  
  return result as Record<Platform, Post[]>;
}

/**
 * Calculates the optimal time to post based on historical engagement data
 * @param platform The platform to optimize for
 * @param historicalData Historical engagement data
 * @returns The optimal time to post
 */
export function calculateOptimalPostTime(
  platform: Platform,
  historicalData: {
    hour: number;
    dayOfWeek: number;
    engagementRate: number;
  }[]
): { hour: number; dayOfWeek: number } {
  // Group by hour and day of week
  const engagementByHourAndDay: Record<number, Record<number, { count: number; total: number }>> = {};
  
  for (const data of historicalData) {
    const { hour, dayOfWeek, engagementRate } = data;
    
    if (!engagementByHourAndDay[hour]) {
      engagementByHourAndDay[hour] = {};
    }
    
    if (!engagementByHourAndDay[hour][dayOfWeek]) {
      engagementByHourAndDay[hour][dayOfWeek] = { count: 0, total: 0 };
    }
    
    engagementByHourAndDay[hour][dayOfWeek].count++;
    engagementByHourAndDay[hour][dayOfWeek].total += engagementRate;
  }
  
  // Calculate average engagement rate for each hour and day
  let bestHour = 0;
  let bestDay = 0;
  let bestEngagement = 0;
  
  for (const [hourStr, days] of Object.entries(engagementByHourAndDay)) {
    const hour = parseInt(hourStr, 10);
    
    for (const [dayStr, data] of Object.entries(days)) {
      const day = parseInt(dayStr, 10);
      const avgEngagement = data.total / data.count;
      
      if (avgEngagement > bestEngagement) {
        bestEngagement = avgEngagement;
        bestHour = hour;
        bestDay = day;
      }
    }
  }
  
  return { hour: bestHour, dayOfWeek: bestDay };
}

/**
 * Formats a duration in milliseconds to a human-readable string
 * @param ms Duration in milliseconds
 * @returns A human-readable duration string (e.g., "2h 30m")
 */
export function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  const parts: string[] = [];
  
  if (days > 0) parts.push(`${days}d`);
  if (hours % 24 > 0) parts.push(`${hours % 24}h`);
  if (minutes % 60 > 0 && days === 0) parts.push(`${minutes % 60}m`);
  if (seconds % 60 > 0 && hours === 0 && days === 0) parts.push(`${seconds % 60}s`);
  
  return parts.length > 0 ? parts.join(' ') : '0s';
}
