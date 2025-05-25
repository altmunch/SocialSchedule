// Base types for platform API integration
export interface ApiConfig {
  baseUrl: string;
  version: string;
  rateLimit: {
    requests: number;
    perSeconds: number;
  };
}

export interface ApiCredentials {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
}

export interface ApiResponse<T> {
  data?: T;
  error?: {
    code: number;
    message: string;
    details?: unknown;
  };
  rateLimit?: {
    limit: number;
    remaining: number;
    reset: number;
  };
}

export interface PlatformPostMetrics {
  id: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  avgWatchTime?: number;
  engagementRate?: number;
  timestamp: string;
}

export interface PlatformUserActivity {
  followerCount: number;
  followingCount: number;
  postCount: number;
  lastUpdated: string;
}

// Platform specific types
export enum Platform {
  TIKTOK = 'tiktok',
  INSTAGRAM = 'instagram',
  YOUTUBE = 'youtube'
}

export interface PlatformClient {
  getPostMetrics(postId: string): Promise<ApiResponse<PlatformPostMetrics>>;
  getUserActivity(): Promise<ApiResponse<PlatformUserActivity>>;
  // Add other platform-specific methods as needed
}
