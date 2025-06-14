/**
 * LinkedIn Repository
 * Handles CRUD operations for LinkedIn data (posts, profiles, companies)
 */

import { BaseRepository, PaginationOptions, SortingOptions } from './baseRepository';
import {
  RawLinkedInPost,
  CreateRawLinkedInPostDto,
  UpdateRawLinkedInPostDto,
  RawLinkedInProfile,
  CreateRawLinkedInProfileDto,
  UpdateRawLinkedInProfileDto,
  RawLinkedInCompany,
  CreateRawLinkedInCompanyDto,
  UpdateRawLinkedInCompanyDto
} from '../../types/linkedinTypes';

/**
 * Repository for LinkedIn Posts
 */
export class LinkedInPostRepository extends BaseRepository<
  RawLinkedInPost,
  CreateRawLinkedInPostDto,
  UpdateRawLinkedInPostDto
> {

  constructor() {
    super('raw_linkedin_posts');
  }

  /**
   * Find a LinkedIn post by its platform post ID
   */
  async findByPlatformPostId(platformPostId: string): Promise<RawLinkedInPost | null> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('post_id', platformPostId)
        .single();

      if (error) {
        console.error('Error finding LinkedIn post by platform post ID:', error);
        return null;
      }

      return data as RawLinkedInPost;
    } catch (error) {
      console.error('Unexpected error finding LinkedIn post by platform post ID:', error);
      return null;
    }
  }

  /**
   * Find LinkedIn posts by platform user ID (author)
   */
  async findPostsByPlatformUserId(platformUserId: string, options?: PaginationOptions & SortingOptions<RawLinkedInPost>): Promise<RawLinkedInPost[]> {
    try {
      let query = this.supabase
        .from(this.tableName)
        .select('*')
        .eq('platform_user_id', platformUserId);

      // Apply sorting
      if (options?.sortBy && options?.sortOrder) {
        query = query.order(options.sortBy as string, { ascending: options.sortOrder === 'asc' });
      } else {
        // Default sort by timestamp descending (newest first)
        query = query.order('timestamp', { ascending: false });
      }

      // Apply pagination
      if (options?.page && options?.pageSize) {
        const from = (options.page - 1) * options.pageSize;
        const to = from + options.pageSize - 1;
        query = query.range(from, to);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error finding LinkedIn posts by platform user ID:', error);
        return [];
      }

      return data as RawLinkedInPost[];
    } catch (error) {
      console.error('Unexpected error finding LinkedIn posts by platform user ID:', error);
      return [];
    }
  }

  /**
   * Find LinkedIn posts by system user ID
   */
  async findPostsBySystemUserId(systemUserId: string, options?: PaginationOptions & SortingOptions<RawLinkedInPost>): Promise<RawLinkedInPost[]> {
    try {
      let query = this.supabase
        .from(this.tableName)
        .select('*')
        .eq('user_id', systemUserId);

      // Apply sorting
      if (options?.sortBy && options?.sortOrder) {
        query = query.order(options.sortBy as string, { ascending: options.sortOrder === 'asc' });
      } else {
        query = query.order('timestamp', { ascending: false });
      }

      // Apply pagination
      if (options?.page && options?.pageSize) {
        const from = (options.page - 1) * options.pageSize;
        const to = from + options.pageSize - 1;
        query = query.range(from, to);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error finding LinkedIn posts by system user ID:', error);
        return [];
      }

      return data as RawLinkedInPost[];
    } catch (error) {
      console.error('Unexpected error finding LinkedIn posts by system user ID:', error);
      return [];
    }
  }

  /**
   * Find top performing LinkedIn posts by engagement metrics
   */
  async findTopPerformingPosts(limit: number = 10, timeframe?: { start: Date; end: Date }): Promise<RawLinkedInPost[]> {
    try {
      let query = this.supabase
        .from(this.tableName)
        .select('*');

      // Apply timeframe filter if provided
      if (timeframe) {
        query = query
          .gte('timestamp', timeframe.start.toISOString())
          .lte('timestamp', timeframe.end.toISOString());
      }

      // Order by engagement (likes + comments + shares) descending
      const { data, error } = await query
        .order('likes_count', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error finding top performing LinkedIn posts:', error);
        return [];
      }

      return data as RawLinkedInPost[];
    } catch (error) {
      console.error('Unexpected error finding top performing LinkedIn posts:', error);
      return [];
    }
  }
}

/**
 * Repository for LinkedIn Profiles
 */
export class LinkedInProfileRepository extends BaseRepository<
  RawLinkedInProfile,
  CreateRawLinkedInProfileDto,
  UpdateRawLinkedInProfileDto
> {

  constructor() {
    super('raw_linkedin_profiles');
  }

  /**
   * Find a LinkedIn profile by platform user ID
   */
  async findByPlatformUserId(platformUserId: string): Promise<RawLinkedInProfile | null> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('platform_user_id', platformUserId)
        .single();

      if (error) {
        console.error('Error finding LinkedIn profile by platform user ID:', error);
        return null;
      }

      return data as RawLinkedInProfile;
    } catch (error) {
      console.error('Unexpected error finding LinkedIn profile by platform user ID:', error);
      return null;
    }
  }

  /**
   * Find LinkedIn profiles by industry
   */
  async findByIndustry(industry: string, options?: PaginationOptions & SortingOptions<RawLinkedInProfile>): Promise<RawLinkedInProfile[]> {
    try {
      let query = this.supabase
        .from(this.tableName)
        .select('*')
        .eq('industry', industry);

      // Apply sorting
      if (options?.sortBy && options?.sortOrder) {
        query = query.order(options.sortBy as string, { ascending: options.sortOrder === 'asc' });
      } else {
        query = query.order('last_fetched_at', { ascending: false });
      }

      // Apply pagination
      if (options?.page && options?.pageSize) {
        const from = (options.page - 1) * options.pageSize;
        const to = from + options.pageSize - 1;
        query = query.range(from, to);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error finding LinkedIn profiles by industry:', error);
        return [];
      }

      return data as RawLinkedInProfile[];
    } catch (error) {
      console.error('Unexpected error finding LinkedIn profiles by industry:', error);
      return [];
    }
  }

  /**
   * Find profiles with most connections
   */
  async findTopConnectedProfiles(limit: number = 10): Promise<RawLinkedInProfile[]> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .order('connections_count', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error finding top connected LinkedIn profiles:', error);
        return [];
      }

      return data as RawLinkedInProfile[];
    } catch (error) {
      console.error('Unexpected error finding top connected LinkedIn profiles:', error);
      return [];
    }
  }
}

/**
 * Repository for LinkedIn Companies
 */
export class LinkedInCompanyRepository extends BaseRepository<
  RawLinkedInCompany,
  CreateRawLinkedInCompanyDto,
  UpdateRawLinkedInCompanyDto
> {

  constructor() {
    super('raw_linkedin_companies');
  }

  /**
   * Find a LinkedIn company by company ID
   */
  async findByCompanyId(companyId: string): Promise<RawLinkedInCompany | null> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('company_id', companyId)
        .single();

      if (error) {
        console.error('Error finding LinkedIn company by company ID:', error);
        return null;
      }

      return data as RawLinkedInCompany;
    } catch (error) {
      console.error('Unexpected error finding LinkedIn company by company ID:', error);
      return null;
    }
  }

  /**
   * Find LinkedIn companies by industry
   */
  async findByIndustry(industry: string, options?: PaginationOptions & SortingOptions<RawLinkedInCompany>): Promise<RawLinkedInCompany[]> {
    try {
      let query = this.supabase
        .from(this.tableName)
        .select('*')
        .eq('industry', industry);

      // Apply sorting
      if (options?.sortBy && options?.sortOrder) {
        query = query.order(options.sortBy as string, { ascending: options.sortOrder === 'asc' });
      } else {
        query = query.order('followers_count', { ascending: false });
      }

      // Apply pagination
      if (options?.page && options?.pageSize) {
        const from = (options.page - 1) * options.pageSize;
        const to = from + options.pageSize - 1;
        query = query.range(from, to);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error finding LinkedIn companies by industry:', error);
        return [];
      }

      return data as RawLinkedInCompany[];
    } catch (error) {
      console.error('Unexpected error finding LinkedIn companies by industry:', error);
      return [];
    }
  }

  /**
   * Find companies by size range
   */
  async findByCompanySize(companySize: string, options?: PaginationOptions & SortingOptions<RawLinkedInCompany>): Promise<RawLinkedInCompany[]> {
    try {
      let query = this.supabase
        .from(this.tableName)
        .select('*')
        .eq('company_size', companySize);

      // Apply sorting
      if (options?.sortBy && options?.sortOrder) {
        query = query.order(options.sortBy as string, { ascending: options.sortOrder === 'asc' });
      } else {
        query = query.order('average_engagement_rate', { ascending: false });
      }

      // Apply pagination
      if (options?.page && options?.pageSize) {
        const from = (options.page - 1) * options.pageSize;
        const to = from + options.pageSize - 1;
        query = query.range(from, to);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error finding LinkedIn companies by size:', error);
        return [];
      }

      return data as RawLinkedInCompany[];
    } catch (error) {
      console.error('Unexpected error finding LinkedIn companies by size:', error);
      return [];
    }
  }

  /**
   * Find top performing companies by engagement rate
   */
  async findTopPerformingCompanies(limit: number = 10): Promise<RawLinkedInCompany[]> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .order('average_engagement_rate', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error finding top performing LinkedIn companies:', error);
        return [];
      }

      return data as RawLinkedInCompany[];
    } catch (error) {
      console.error('Unexpected error finding top performing LinkedIn companies:', error);
      return [];
    }
  }
} 