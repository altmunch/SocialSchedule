/**
 * Represents the structure of a raw TikTok video stored in the database.
 */
export interface RawTikTokVideo {
  id: string; // UUID, primary key in the database
  video_id: string; // TikTok's ID for the video (unique)
  user_id: string; // Internal system user ID who initiated the data fetch
  platform_user_id: string; // TikTok user ID of the video's author
  description?: string | null;
  video_url?: string | null; // URL to the video file
  cover_image_url?: string | null;
  share_url?: string | null; // URL to share the video
  timestamp: string; // ISO 8601 date string of video creation/publication
  likes_count: number;
  comments_count: number;
  shares_count: number;
  views_count: number;
  duration_seconds?: number | null;
  music_info?: { id: string; title: string; author: string; } | null; // Example structure
  hashtags?: string[] | null;
  raw_data: any; // The full, raw API response from TikTok for this video
  created_at: string; // ISO 8601 date string, when the record was created in DB
  updated_at: string; // ISO 8601 date string, when the record was last updated in DB
}

/**
 * Data Transfer Object for creating a new raw TikTok video record.
 */
export type CreateRawTikTokVideoDto = Omit<RawTikTokVideo, 'id' | 'created_at' | 'updated_at'>;

/**
 * Data Transfer Object for updating an existing raw TikTok video record.
 */
export type UpdateRawTikTokVideoDto = Partial<Omit<RawTikTokVideo, 'id' | 'video_id' | 'user_id' | 'platform_user_id' | 'created_at' | 'updated_at'>> & {
  raw_data: any;
};

/**
 * Represents the structure of a raw TikTok user profile stored in the database.
 */
export interface RawTikTokUser {
  id: string; // UUID, primary key in the database
  platform_user_id: string; // TikTok's user ID (unique)
  unique_id: string; // TikTok's unique username (e.g., @username)
  nickname?: string | null; // Display name
  avatar_url?: string | null;
  signature?: string | null; // Bio
  verified: boolean;
  followers_count: number;
  following_count: number;
  heart_count: number; // Total likes received by the user
  video_count: number;
  raw_data: any; // The full, raw API response from TikTok for this user
  last_fetched_at: string; // ISO 8601 date string
  created_at: string; // ISO 8601 date string
  updated_at: string; // ISO 8601 date string
}

/**
 * Data Transfer Object for creating a new raw TikTok user record.
 */
export type CreateRawTikTokUserDto = Omit<RawTikTokUser, 'id' | 'created_at' | 'updated_at'>;

/**
 * Data Transfer Object for updating an existing raw TikTok user record.
 */
export type UpdateRawTikTokUserDto = Partial<Omit<RawTikTokUser, 'id' | 'platform_user_id' | 'unique_id' | 'created_at' | 'updated_at'>> & {
  raw_data: any;
  last_fetched_at: string;
};

// Example Types from a hypothetical TikTok API (subset, expand as needed)
// These would depend on the actual TikTok API you're using (e.g., TikTok API for Developers, unofficial APIs)

export interface TikTokApiVideoNode {
  id: string; // platform_video_id
  desc?: string; // description
  create_time: number; // Unix timestamp, convert to ISO string
  video: {
    play_addr?: { url_list: string[] };
    cover?: { url_list: string[] };
    height?: number;
    width?: number;
    duration?: number; // in seconds
  };
  author: {
    id: string; // platform_user_id
    unique_id: string; // username
    nickname?: string;
    avatar_thumb?: { url_list: string[] };
  };
  music?: {
    id: string;
    title: string;
    authorName: string;
  };
  stats: {
    digg_count: number; // likes
    comment_count: number;
    share_count: number;
    play_count: number; // views
  };
  challenges?: { id: string; title: string; }[]; // hashtags
  // ... other fields
  [key: string]: any; // For any other raw data
}

export interface TikTokApiUserNode {
  user: {
    id: string; // platform_user_id
    unique_id: string; // username
    nickname?: string;
    avatar_thumb?: { url_list: string[] };
    signature?: string; // bio
    verified: boolean;
    // ... other fields
  };
  stats: {
    follower_count: number;
    following_count: number;
    heart_count: number; // total likes received
    video_count: number;
    // ... other fields
  };
  [key: string]: any; // For any other raw data
}
