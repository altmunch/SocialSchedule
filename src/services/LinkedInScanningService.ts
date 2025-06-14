/**
 * LinkedIn Scanning Service
 * Handles LinkedIn data collection, rate limiting, and synchronization
 */

import { LinkedInClient } from '@/app/workflows/data_collection/lib/platforms/LinkedInClient';
import { LinkedInPostRepository, LinkedInProfileRepository, LinkedInCompanyRepository } from '@/app/workflows/data_collection/lib/storage/repositories/linkedinRepository';
import { RawLinkedInPost, RawLinkedInProfile, RawLinkedInCompany } from '@/app/workflows/data_collection/types/linkedinTypes';
import { SupabaseClient } from '@supabase/supabase-js';

interface LinkedInScanRequest {
  userId: string;
  platformAccountId: string;
  scanType: 'profile' | 'posts' | 'company' | 'full';
  timeframe?: {
    start: Date;
    end: Date;
  };
  includeCompanyData?: boolean;
  priority?: 'high' | 'medium' | 'low';
}

interface LinkedInScanResult {
  success: boolean;
  data?: {
    profilesScanned: number;
    postsScanned: number;
    companiesScanned: number;
    errors: string[];
  };
  error?: {
    code: string;
    message: string;
    retryAfter?: number;
  };
  nextScanTime?: Date;
}

interface RateLimitStatus {
  remaining: number;
  resetTime: Date;
  dailyLimit: number;
  currentUsage: number;
}

export class LinkedInScanningService {
  private client: LinkedInClient;
  private postRepository: LinkedInPostRepository;
  private profileRepository: LinkedInProfileRepository;
  private companyRepository: LinkedInCompanyRepository;
  
  // Rate limiting constants
  private static readonly DAILY_LIMIT = 100;
  private static readonly RATE_LIMIT_WINDOW = 24 * 60 * 60 * 1000; // 24 hours
  private static readonly BATCH_SIZE = 10;
  private static readonly MIN_DELAY_BETWEEN_REQUESTS = 1000; // 1 second

  constructor(supabase: SupabaseClient) {
    this.client = new LinkedInClient();
    this.postRepository = new LinkedInPostRepository(supabase);
    this.profileRepository = new LinkedInProfileRepository(supabase);
    this.companyRepository = new LinkedInCompanyRepository(supabase);
  }

  /**
   * Main scanning orchestrator
   */
  async scanLinkedInData(request: LinkedInScanRequest): Promise<LinkedInScanResult> {
    try {
      // Check rate limits before proceeding
      const rateLimitStatus = await this.checkRateLimit(request.userId);
      if (rateLimitStatus.remaining <= 0) {
        return {
          success: false,
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: 'LinkedIn API rate limit exceeded',
            retryAfter: Math.ceil((rateLimitStatus.resetTime.getTime() - Date.now()) / 1000)
          },
          nextScanTime: rateLimitStatus.resetTime
        };
      }

      let profilesScanned = 0;
      let postsScanned = 0;
      let companiesScanned = 0;
      const errors: string[] = [];

      // Execute scan based on type
      switch (request.scanType) {
        case 'profile':
          profilesScanned = await this.scanProfile(request);
          break;
        case 'posts':
          postsScanned = await this.scanPosts(request);
          break;
        case 'company':
          companiesScanned = await this.scanCompany(request);
          break;
        case 'full':
          profilesScanned = await this.scanProfile(request);
          await this.delay(LinkedInScanningService.MIN_DELAY_BETWEEN_REQUESTS);
          postsScanned = await this.scanPosts(request);
          if (request.includeCompanyData) {
            await this.delay(LinkedInScanningService.MIN_DELAY_BETWEEN_REQUESTS);
            companiesScanned = await this.scanCompany(request);
          }
          break;
      }

      // Update rate limit usage
      await this.updateRateLimitUsage(request.userId, 1);

      return {
        success: true,
        data: {
          profilesScanned,
          postsScanned,
          companiesScanned,
          errors
        },
        nextScanTime: this.calculateNextScanTime(request.priority || 'medium')
      };

    } catch (error) {
      return {
        success: false,
        error: {
          code: 'SCAN_ERROR',
          message: error instanceof Error ? error.message : 'Unknown scanning error'
        }
      };
    }
  }

  /**
   * Scan LinkedIn profile data
   */
  private async scanProfile(request: LinkedInScanRequest): Promise<number> {
    try {
      const profileData = await this.client.getProfile(request.platformAccountId);
      if (!profileData) return 0;

      // Transform and store profile data
      const rawProfile: RawLinkedInProfile = {
        platform_user_id: request.platformAccountId,
        user_id: request.userId,
        display_name: profileData.localizedFirstName + ' ' + profileData.localizedLastName,
        headline: profileData.localizedHeadline || '',
        summary: profileData.summary || '',
        location: profileData.geoLocation?.name || '',
        industry: profileData.industryName || '',
        connections_count: profileData.numConnections || 0,
        followers_count: profileData.numFollowers || 0,
        profile_views: 0, // Not available in basic profile data
        skills: [], // Would need additional API call
        experience: [], // Would need additional API call
        education: [], // Would need additional API call
        certifications: [], // Would need additional API call
        languages: [], // Would need additional API call
        profile_url: `https://linkedin.com/in/${profileData.vanityName || request.platformAccountId}`,
        profile_picture_url: profileData.profilePicture?.displayImage || '',
        background_image_url: profileData.backgroundImage?.displayImage || '',
        is_premium: false, // Not available in basic API
        premium_features: [],
        last_fetched_at: new Date(),
        raw_data: profileData
      };

      await this.profileRepository.create(rawProfile);
      return 1;

    } catch (error) {
      console.error('Error scanning LinkedIn profile:', error);
      return 0;
    }
  }

  /**
   * Scan LinkedIn posts data
   */
  private async scanPosts(request: LinkedInScanRequest): Promise<number> {
    try {
      const timeframe = request.timeframe || {
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
        end: new Date()
      };

      const postsData = await this.client.getPosts(
        request.platformAccountId,
        timeframe.start,
        timeframe.end
      );

      if (!postsData || postsData.length === 0) return 0;

      let savedCount = 0;

      // Process posts in batches
      for (let i = 0; i < postsData.length; i += LinkedInScanningService.BATCH_SIZE) {
        const batch = postsData.slice(i, i + LinkedInScanningService.BATCH_SIZE);
        
        for (const post of batch) {
          try {
            const rawPost: RawLinkedInPost = {
              platform_post_id: post.id,
              user_id: request.userId,
              platform_user_id: request.platformAccountId,
              post_type: this.getPostType(post),
              content: post.commentary || '',
              media_urls: this.extractMediaUrls(post),
              timestamp: new Date(post.createdAt),
              likes_count: post.socialDetail?.totalSocialActivityCounts?.numLikes || 0,
              comments_count: post.socialDetail?.totalSocialActivityCounts?.numComments || 0,
              shares_count: post.socialDetail?.totalSocialActivityCounts?.numShares || 0,
              clicks_count: 0, // Not available in basic API
              impressions_count: 0, // Not available in basic API
              reach_count: 0, // Not available in basic API
              engagement_rate: this.calculateEngagementRate(post),
              hashtags: this.extractHashtags(post.commentary || ''),
              mentions: this.extractMentions(post.commentary || ''),
              post_url: `https://linkedin.com/feed/update/${post.id}`,
              is_promoted: false, // Not available in basic API
              industry: '', // Would need profile context
              seniority_level: '', // Would need audience insights
              company_size: '', // Would need audience insights
              job_function: '', // Would need audience insights
              last_fetched_at: new Date(),
              raw_data: post
            };

            await this.postRepository.create(rawPost);
            savedCount++;

          } catch (error) {
            console.error(`Error saving LinkedIn post ${post.id}:`, error);
          }
        }

        // Add delay between batches to respect rate limits
        if (i + LinkedInScanningService.BATCH_SIZE < postsData.length) {
          await this.delay(LinkedInScanningService.MIN_DELAY_BETWEEN_REQUESTS);
        }
      }

      return savedCount;

    } catch (error) {
      console.error('Error scanning LinkedIn posts:', error);
      return 0;
    }
  }

  /**
   * Scan LinkedIn company data
   */
  private async scanCompany(request: LinkedInScanRequest): Promise<number> {
    try {
      // First get the user's current company from their profile
      const profile = await this.profileRepository.findByPlatformUserId(request.platformAccountId);
      if (!profile || !profile.raw_data?.positions?.length) return 0;

      const currentPosition = profile.raw_data.positions[0];
      if (!currentPosition.companyUrn) return 0;

      const companyId = currentPosition.companyUrn.split(':').pop();
      const companyData = await this.client.getCompany(companyId);
      
      if (!companyData) return 0;

      const rawCompany: RawLinkedInCompany = {
        platform_company_id: companyId,
        user_id: request.userId,
        company_name: companyData.localizedName || '',
        company_size: companyData.staffCountRange?.start ? `${companyData.staffCountRange.start}-${companyData.staffCountRange.end}` : '',
        industry: companyData.localizedSpecialties?.join(', ') || '',
        website_url: companyData.websiteUrl || '',
        logo_url: companyData.logoV2?.original || '',
        banner_image_url: companyData.coverPhotoV2?.original || '',
        tagline: companyData.tagline || '',
        description: companyData.description || '',
        location: companyData.headquarter ? `${companyData.headquarter.city}, ${companyData.headquarter.country}` : '',
        follower_count: companyData.followersCount || 0,
        employee_count: companyData.staffCount || 0,
        page_views: 0, // Not available in basic API
        unique_visitors: 0, // Not available in basic API
        engagement_rate: 0, // Would need to calculate from posts
        content_metrics: {
          totalPosts: 0,
          avgEngagement: 0,
          topContentTypes: []
        },
        company_url: `https://linkedin.com/company/${companyData.vanityName || companyId}`,
        last_fetched_at: new Date(),
        raw_data: companyData
      };

      await this.companyRepository.create(rawCompany);
      return 1;

    } catch (error) {
      console.error('Error scanning LinkedIn company:', error);
      return 0;
    }
  }

  /**
   * Check current rate limit status
   */
  private async checkRateLimit(userId: string): Promise<RateLimitStatus> {
    // This would typically query a rate limit tracking table
    // For now, returning a mock implementation
    return {
      remaining: 95,
      resetTime: new Date(Date.now() + LinkedInScanningService.RATE_LIMIT_WINDOW),
      dailyLimit: LinkedInScanningService.DAILY_LIMIT,
      currentUsage: 5
    };
  }

  /**
   * Update rate limit usage tracking
   */
  private async updateRateLimitUsage(userId: string, requests: number): Promise<void> {
    // This would update the rate limit tracking table
    // Implementation would depend on your database schema
    console.log(`Updated rate limit usage for user ${userId}: +${requests} requests`);
  }

  /**
   * Calculate next scan time based on priority
   */
  private calculateNextScanTime(priority: 'high' | 'medium' | 'low'): Date {
    const now = new Date();
    switch (priority) {
      case 'high':
        return new Date(now.getTime() + 4 * 60 * 60 * 1000); // 4 hours
      case 'medium':
        return new Date(now.getTime() + 12 * 60 * 60 * 1000); // 12 hours
      case 'low':
        return new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours
      default:
        return new Date(now.getTime() + 12 * 60 * 60 * 1000);
    }
  }

  /**
   * Helper methods
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private getPostType(post: any): string {
    if (post.content?.media?.length > 0) {
      const mediaType = post.content.media[0].mediaType;
      if (mediaType === 'IMAGE') return 'IMAGE';
      if (mediaType === 'VIDEO') return 'VIDEO';
      if (mediaType === 'DOCUMENT') return 'DOCUMENT';
    }
    if (post.content?.article) return 'ARTICLE';
    return 'TEXT';
  }

  private extractMediaUrls(post: any): string[] {
    if (!post.content?.media) return [];
    return post.content.media.map((media: any) => media.originalUrl || '').filter(Boolean);
  }

  private calculateEngagementRate(post: any): number {
    const totalEngagement = (post.socialDetail?.totalSocialActivityCounts?.numLikes || 0) +
                           (post.socialDetail?.totalSocialActivityCounts?.numComments || 0) +
                           (post.socialDetail?.totalSocialActivityCounts?.numShares || 0);
    const impressions = post.socialDetail?.totalSocialActivityCounts?.numViews || 1;
    return (totalEngagement / impressions) * 100;
  }

  private extractHashtags(content: string): string[] {
    const hashtagRegex = /#[a-zA-Z0-9_]+/g;
    return content.match(hashtagRegex) || [];
  }

  private extractMentions(content: string): string[] {
    const mentionRegex = /@[a-zA-Z0-9_]+/g;
    return content.match(mentionRegex) || [];
  }
}

export default LinkedInScanningService; 