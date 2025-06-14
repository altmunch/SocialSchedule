/**
 * LinkedIn-specific type definitions for data collection
 * Covers LinkedIn posts, profiles, companies, and API responses
 */

// Raw LinkedIn Post data structure for database storage
export interface RawLinkedInPost {
  id: string; // UUID, primary key in the database
  post_id: string; // LinkedIn's URN for the post (unique)
  user_id: string; // Internal system user ID who initiated the data fetch
  platform_user_id: string; // LinkedIn member ID or organization ID of the post's author
  urn: string; // LinkedIn URN (Uniform Resource Name)
  /**
   * The text content of the LinkedIn post
   */
  text?: string | null;
  post_type: string; // 'ARTICLE', 'IMAGE', 'VIDEO', 'CAROUSEL', 'TEXT', 'POLL'
  media_url?: string | null;
  permalink?: string | null;
  thumbnail_url?: string | null;
  timestamp: string; // ISO 8601 date string
  likes_count: number;
  comments_count: number;
  shares_count: number;
  views_count: number;
  clicks_count: number;
  // LinkedIn-specific metrics
  profile_views_count?: number | null;
  connection_requests_count?: number | null;
  // Professional context
  industry?: string | null;
  seniority_level?: string | null;
  company_size?: string | null;
  job_function?: string | null;
  raw_data: any; // The full, raw API response from LinkedIn for this post
  created_at: string; // ISO 8601 date string, when the record was created in DB
  updated_at: string; // ISO 8601 date string, when the record was last updated in DB
}

// Data Transfer Objects for LinkedIn Posts
export type CreateRawLinkedInPostDto = Omit<RawLinkedInPost, 'id' | 'created_at' | 'updated_at'>;

export type UpdateRawLinkedInPostDto = Partial<Omit<RawLinkedInPost, 'id' | 'post_id' | 'user_id' | 'platform_user_id' | 'created_at' | 'updated_at'>> & {
  raw_data: any;
};

// Raw LinkedIn Profile data structure
export interface RawLinkedInProfile {
  id: string; // UUID, primary key in the database
  platform_user_id: string; // LinkedIn member ID (unique)
  first_name?: string | null;
  last_name?: string | null;
  headline?: string | null;
  profile_picture_url?: string | null;
  summary?: string | null;
  industry?: string | null;
  location?: string | null;
  connections_count: number;
  followers_count: number;
  posts_count: number;
  // Professional details
  current_position?: string | null;
  current_company?: string | null;
  experience_years?: number | null;
  education?: string | null;
  skills?: string[] | null;
  certifications?: string[] | null;
  languages?: string[] | null;
  // Engagement metrics
  profile_views_count: number;
  search_appearances_count: number;
  post_impressions_count: number;
  raw_data: any; // The full, raw API response from LinkedIn for this profile
  last_fetched_at: string; // ISO 8601 date string
  created_at: string; // ISO 8601 date string
  updated_at: string; // ISO 8601 date string
}

// Data Transfer Objects for LinkedIn Profiles
export type CreateRawLinkedInProfileDto = Omit<RawLinkedInProfile, 'id' | 'created_at' | 'updated_at'>;

export type UpdateRawLinkedInProfileDto = Partial<Omit<RawLinkedInProfile, 'id' | 'platform_user_id' | 'created_at' | 'updated_at'>> & {
  raw_data: any;
  last_fetched_at: string;
};

// Raw LinkedIn Company data structure
export interface RawLinkedInCompany {
  id: string; // UUID, primary key in the database
  company_id: string; // LinkedIn organization ID (unique)
  user_id: string; // Internal system user ID who initiated the data fetch
  name: string;
  description?: string | null;
  website?: string | null;
  industry?: string | null;
  company_size?: string | null;
  headquarters?: string | null;
  founded_year?: number | null;
  logo_url?: string | null;
  cover_image_url?: string | null;
  followers_count: number;
  employees_count: number;
  // Page metrics
  page_views_count: number;
  unique_page_views_count: number;
  clicks_count: number;
  // Content metrics
  posts_count: number;
  average_engagement_rate: number;
  top_performing_post_id?: string | null;
  raw_data: any; // The full, raw API response from LinkedIn for this company
  last_fetched_at: string; // ISO 8601 date string
  created_at: string; // ISO 8601 date string
  updated_at: string; // ISO 8601 date string
}

// Data Transfer Objects for LinkedIn Companies
export type CreateRawLinkedInCompanyDto = Omit<RawLinkedInCompany, 'id' | 'created_at' | 'updated_at'>;

export type UpdateRawLinkedInCompanyDto = Partial<Omit<RawLinkedInCompany, 'id' | 'company_id' | 'user_id' | 'created_at' | 'updated_at'>> & {
  raw_data: any;
  last_fetched_at: string;
};

// LinkedIn API response node interfaces
export interface LinkedInApiPostNode {
  id: string; // LinkedIn URN
  text?: string;
  author: string; // URN of the author
  created?: {
    time: number; // Unix timestamp
  };
  lastModified?: {
    time: number;
  };
  commentary?: string;
  content?: {
    contentEntities?: Array<{
      entityLocation?: string;
      thumbnails?: Array<{
        resolvedUrl?: string;
      }>;
    }>;
    title?: string;
    landingPage?: string;
  };
  targetAudience?: {
    targetedEntities?: Array<{
      locations?: string[];
      staffCountRanges?: string[];
      industries?: string[];
    }>;
  };
  lifecycleState?: string;
  visibility?: {
    'com.linkedin.ugc.MemberNetworkVisibility'?: string;
  };
  [key: string]: any; // For additional LinkedIn-specific fields
}

export interface LinkedInApiProfileNode {
  id: string; // LinkedIn member ID
  firstName?: {
    localized?: Record<string, string>;
    preferredLocale?: {
      country?: string;
      language?: string;
    };
  };
  lastName?: {
    localized?: Record<string, string>;
    preferredLocale?: {
      country?: string;
      language?: string;
    };
  };
  headline?: {
    localized?: Record<string, string>;
  };
  profilePicture?: {
    'displayImage~'?: {
      elements?: Array<{
        identifiers?: Array<{
          identifier?: string;
        }>;
      }>;
    };
  };
  industry?: string;
  location?: {
    name?: string;
    country?: {
      code?: string;
    };
  };
  [key: string]: any; // For additional LinkedIn-specific fields
}

export interface LinkedInApiCompanyNode {
  id: string; // LinkedIn organization ID
  name?: {
    localized?: Record<string, string>;
    preferredLocale?: {
      country?: string;
      language?: string;
    };
  };
  description?: {
    localized?: Record<string, string>;
  };
  website?: {
    localized?: Record<string, string>;
  };
  industries?: string[];
  staffCount?: number;
  founded?: {
    year?: number;
  };
  headquarter?: {
    country?: string;
    geographicArea?: string;
    city?: string;
  };
  logo?: {
    'cropInfo~'?: {
      elements?: Array<{
        identifiers?: Array<{
          identifier?: string;
        }>;
      }>;
    };
  };
  coverPhoto?: {
    'cropInfo~'?: {
      elements?: Array<{
        identifiers?: Array<{
          identifier?: string;
        }>;
      }>;
    };
  };
  [key: string]: any; // For additional LinkedIn-specific fields
}

// LinkedIn Analytics API response interfaces
export interface LinkedInAnalyticsNode {
  elements?: Array<{
    totalShareStatistics?: {
      shareCount?: number;
      likeCount?: number;
      commentCount?: number;
      clickCount?: number;
      impressionCount?: number;
      uniqueImpressionsCount?: number;
    };
    organizationalEntity?: string;
    timeRange?: {
      start?: number;
      end?: number;
    };
  }>;
  [key: string]: any;
}

// Professional demographic data
export interface LinkedInDemographics {
  seniority?: Record<string, number>; // e.g., { "ENTRY": 25, "MID": 45, "SENIOR": 30 }
  industry?: Record<string, number>; // e.g., { "TECHNOLOGY": 60, "FINANCE": 25, "HEALTHCARE": 15 }
  geography?: Record<string, number>; // e.g., { "US": 70, "UK": 15, "CA": 10, "OTHER": 5 }
  companySize?: Record<string, number>; // e.g., { "1-10": 20, "11-50": 30, "51-200": 25, "201+": 25 }
  jobFunction?: Record<string, number>; // e.g., { "MARKETING": 40, "SALES": 30, "ENGINEERING": 20, "OTHER": 10 }
}

// LinkedIn-specific engagement metrics
export interface LinkedInEngagementMetrics {
  profileViews: number;
  searchAppearances: number;
  postViews: number;
  postClicks: number;
  postLikes: number;
  postComments: number;
  postShares: number;
  connectionRequests: number;
  messageReplies: number;
  followerGrowth: number;
  engagementRate: number; // Calculated: (likes + comments + shares) / impressions
  clickThroughRate: number; // Calculated: clicks / impressions
  connectionAcceptanceRate: number; // Calculated: accepted connections / sent requests
}

// LinkedIn content optimization insights
export interface LinkedInContentInsights {
  optimalPostTimes: Array<{
    dayOfWeek: string;
    hour: number;
    engagementScore: number;
  }>;
  topPerformingContentTypes: Array<{
    type: string; // 'TEXT', 'IMAGE', 'VIDEO', 'ARTICLE', 'POLL'
    averageEngagement: number;
    recommendedFrequency: string;
  }>;
  audienceInsights: {
    mostActiveRegions: string[];
    topIndustries: string[];
    preferredContentLength: {
      min: number;
      max: number;
      optimal: number;
    };
  };
  hashtagRecommendations: Array<{
    hashtag: string;
    relevanceScore: number;
    usageCount: number;
  }>;
}

// Error handling for LinkedIn API
export interface LinkedInApiError {
  status: number;
  code?: string;
  message: string;
  requestId?: string;
  timestamp?: number;
  details?: any;
}

// LinkedIn API response wrapper
export type LinkedInApiResponse<T> = {
  data?: T;
  error?: LinkedInApiError;
  paging?: {
    start?: number;
    count?: number;
    total?: number;
    links?: Array<{
      rel?: string;
      href?: string;
    }>;
  };
};

// Export all types for easy importing
export type {
  LinkedInApiPostNode as LinkedInPost,
  LinkedInApiProfileNode as LinkedInProfile,
  LinkedInApiCompanyNode as LinkedInCompany,
}; 