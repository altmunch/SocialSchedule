export interface Post {
  id: string;
  content: string;
  scheduledTime: Date;
  platform: 'instagram' | 'tiktok' | 'facebook' | 'linkedin';
  status: 'draft' | 'scheduled' | 'published' | 'failed';
  metadata?: Record<string, any>;
}

export interface TimeSlot {
  start: Date;
  end: Date;
  available: boolean;
  score?: number;
}

export interface ScheduleOptions {
  maxRetryAttempts?: number;
  retryDelayMs?: number;
  timezone?: string;
}

export interface PlatformPost {
  id: string;
  platform: 'instagram' | 'tiktok' | 'facebook' | 'linkedin';
  content: string;
  scheduledTime: Date;
  metadata?: Record<string, any>;
}
