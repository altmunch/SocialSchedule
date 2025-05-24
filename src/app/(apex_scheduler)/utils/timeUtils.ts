import { PlatformConfig, TimeSlot } from '../types';

/**
 * Gets the current date in UTC
 */
export function getCurrentUTCDate(): Date {
  const now = new Date();
  return new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
    now.getUTCHours(),
    now.getUTCMinutes(),
    now.getUTCSeconds()
  ));
}

interface TimeWindow {
  start: Date;
  end: Date;
}

/**
 * Generates optimal time windows for posting based on platform configuration
 */
export function getOptimalTimeWindows(date: Date, config: PlatformConfig): TimeWindow[] {
  const windows: TimeWindow[] = [];
  const targetDate = new Date(date);
  
  // Set time to beginning of day
  targetDate.setHours(0, 0, 0, 0);
  
  // For each optimal time range in the config
  config.optimalPostingHours.forEach(({ start, end }) => {
    const windowStart = new Date(targetDate);
    windowStart.setHours(start, 0, 0, 0);
    
    const windowEnd = new Date(targetDate);
    windowEnd.setHours(end, 0, 0, 0);
    
    // Split into smaller windows based on min time between posts
    const windowDuration = (end - start) * 60 * 60 * 1000; // hours to ms
    const numSlots = Math.ceil(windowDuration / (config.minTimeBetweenPosts * 60 * 1000));
    
    if (numSlots <= 1) {
      windows.push({ start: windowStart, end: windowEnd });
    } else {
      const slotDuration = windowDuration / numSlots;
      
      for (let i = 0; i < numSlots; i++) {
        const slotStart = new Date(windowStart.getTime() + (i * slotDuration));
        const slotEnd = new Date(slotStart.getTime() + slotDuration);
        windows.push({ start: slotStart, end: slotEnd });
      }
    }
  });
  
  return windows;
}

/**
 * Formats a date to a time string in the format HH:MM AM/PM
 */
export function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
}

/**
 * Checks if a date is within business hours (9 AM - 5 PM by default)
 */
export function isBusinessHours(
  date: Date, 
  startHour: number = 9, 
  endHour: number = 17
): boolean {
  const hour = date.getHours();
  const day = date.getDay();
  
  // Check if it's a weekday (0 = Sunday, 6 = Saturday)
  const isWeekday = day > 0 && day < 6;
  
  return isWeekday && hour >= startHour && hour < endHour;
}

/**
 * Gets the next occurrence of a specific day and time
 * @param dayOfWeek 0-6 (Sunday-Saturday)
 * @param hour 0-23
 * @param minute 0-59
 */
export function getNextOccurrence(dayOfWeek: number, hour: number, minute: number = 0): Date {
  const now = new Date();
  const result = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + ((7 + dayOfWeek - now.getDay()) % 7),
    hour,
    minute,
    0,
    0
  );
  
  // If the time has already passed today, go to next week
  if (result < now) {
    result.setDate(result.getDate() + 7);
  }
  
  return result;
}

/**
 * Adds minutes to a date
 */
export function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60000);
}

/**
 * Checks if two date ranges overlap
 */
export function dateRangesOverlap(
  start1: Date,
  end1: Date,
  start2: Date,
  end2: Date
): boolean {
  return start1 < end2 && start2 < end1;
}
