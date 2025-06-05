/**
 * Represents the structure of a raw Instagram post stored in the database.
 */
export interface RawInstagramPost {
  id: string; // UUID, primary key in the database
  post_id: string; // Instagram's ID for the post (unique)
  user_id: string; // Internal system user ID who initiated the data fetch
  platform_user_id: string; // Instagram user ID of the post's author
  caption?: string | null;
  media_type: string; // e.g., IMAGE, VIDEO, CAROUSEL_ALBUM
  media_url?: string | null;
  permalink?: string | null;
  thumbnail_url?: string | null;
  timestamp: string; // ISO 8601 date string
  likes_count: number;
  comments_count: number;
  raw_data: any; // The full, raw API response from Instagram for this post
  created_at: string; // ISO 8601 date string, when the record was created in DB
  updated_at: string; // ISO 8601 date string, when the record was last updated in DB
}

/**
 * Data Transfer Object for creating a new raw Instagram post record.
 */
export type CreateRawInstagramPostDto = Omit<RawInstagramPost, 'id' | 'created_at' | 'updated_at'>;

/**
 * Data Transfer Object for updating an existing raw Instagram post record.
 * All fields are optional except for the ones essential for an update.
 */
export type UpdateRawInstagramPostDto = Partial<Omit<RawInstagramPost, 'id' | 'post_id' | 'user_id' | 'platform_user_id' | 'created_at' | 'updated_at'>> & {
  raw_data: any; // raw_data should be updated if other fields are
  // Add other fields that might be updated, e.g., likes_count, comments_count
};

/**
 * Represents the structure of a raw Instagram user profile stored in the database.
 */
export interface RawInstagramUser {
  id: string; // UUID, primary key in the database
  platform_user_id: string; // Instagram's user ID (unique)
  username: string;
  full_name?: string | null;
  profile_picture_url?: string | null;
  bio?: string | null;
  website?: string | null;
  followers_count: number;
  following_count: number;
  media_count: number;
  raw_data: any; // The full, raw API response from Instagram for this user
  last_fetched_at: string; // ISO 8601 date string
  created_at: string; // ISO 8601 date string
  updated_at: string; // ISO 8601 date string
}

/**
 * Data Transfer Object for creating a new raw Instagram user record.
 */
export type CreateRawInstagramUserDto = Omit<RawInstagramUser, 'id' | 'created_at' | 'updated_at'>;

/**
 * Data Transfer Object for updating an existing raw Instagram user record.
 */
export type UpdateRawInstagramUserDto = Partial<Omit<RawInstagramUser, 'id' | 'platform_user_id' | 'username' | 'created_at' | 'updated_at'>> & {
  raw_data: any;
  last_fetched_at: string;
};

// Types from Instagram Graph API (subset, expand as needed)
// Refer to: https://developers.facebook.com/docs/instagram-graph-api/reference/media
// And: https://developers.facebook.com/docs/instagram-graph-api/reference/user

export interface InstagramApiMediaNode {
  id: string; // This is platform_post_id
  caption?: string;
  media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM';
  media_url?: string;
  permalink?: string;
  thumbnail_url?: string; // For VIDEO
  timestamp: string; // ISO 8601
  username: string; // Username of the owner of the media object
  children?: { data: InstagramApiMediaNode[] }; // For CAROUSEL_ALBUM
  comments_count?: number;
  like_count?: number;
  owner?: { id: string }; // User who owns the media - this is platform_user_id
}

export interface InstagramApiUserNode {
  id: string; // This is platform_user_id
  username: string;
  account_type?: 'BUSINESS' | 'MEDIA_CREATOR' | 'PERSONAL';
  followers_count?: number;
  follows_count?: number; // This is 'following_count'
  media_count?: number;
  name?: string; // This is 'full_name'
  profile_picture_url?: string;
  website?: string;
  biography?: string; // This is 'bio'
}
