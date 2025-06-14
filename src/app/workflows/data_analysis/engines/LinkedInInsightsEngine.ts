/**
 * LinkedIn Insights Engine
 * Provides professional network analysis and B2B content insights
 */

import { BaseAnalysisRequest, AnalysisResult } from '../types/analysis_types';
import { 
  LinkedInEngagementMetrics, 
  LinkedInDemographics, 
  LinkedInContentInsights,
  RawLinkedInPost,
  RawLinkedInProfile,
  RawLinkedInCompany
} from '../../data_collection/types/linkedinTypes';
import { SupabaseClient } from '@supabase/supabase-js';

export interface LinkedInAnalysisRequest extends BaseAnalysisRequest {
  profileId?: string;
  companyId?: string;
  industry?: string;
  includeCompetitorAnalysis?: boolean;
  timeframe?: {
    start: Date;
    end: Date;
  };
}

export interface LinkedInInsightsData {
  engagementMetrics: LinkedInEngagementMetrics;
  audienceDemographics: LinkedInDemographics;
  contentInsights: LinkedInContentInsights;
  professionalGrowth: {
    connectionGrowthRate: number;
    profileViewTrend: 'increasing' | 'decreasing' | 'stable';
    industryPosition: number; // Percentile rank within industry
    thoughtLeadershipScore: number; // 0-100 based on engagement and reach
  };
  competitorComparison?: {
    averageEngagementRate: number;
    industryBenchmark: number;
    topCompetitors: Array<{
      name: string;
      engagementRate: number;
      followerCount: number;
    }>;
  };
  recommendations: Array<{
    type: 'content' | 'posting' | 'engagement' | 'networking';
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    expectedImpact: string;
  }>;
}

export class LinkedInInsightsEngine {
  constructor(private supabase: SupabaseClient) {}

  async analyzeLinkedInPresence(
    request: LinkedInAnalysisRequest
  ): Promise<AnalysisResult<LinkedInInsightsData>> {
    try {
      const startTime = Date.now();

      // Gather data from multiple sources
      const [
        profileData,
        postData,
        companyData,
        industryBenchmarks
      ] = await Promise.all([
        this.getProfileData(request.profileId, request.userId),
        this.getPostData(request.userId, request.timeframe),
        this.getCompanyData(request.companyId),
        this.getIndustryBenchmarks(request.industry)
      ]);

      // Calculate engagement metrics
      const engagementMetrics = this.calculateEngagementMetrics(postData, profileData);

      // Analyze audience demographics
      const audienceDemographics = this.analyzeAudienceDemographics(postData);

      // Generate content insights
      const contentInsights = this.generateContentInsights(postData);

      // Calculate professional growth metrics
      const professionalGrowth = this.calculateProfessionalGrowth(profileData, postData);

      // Generate competitor comparison if requested
      let competitorComparison;
      if (request.includeCompetitorAnalysis && request.industry) {
        competitorComparison = await this.generateCompetitorComparison(
          request.industry,
          engagementMetrics.engagementRate
        );
      }

      // Generate recommendations
      const recommendations = this.generateRecommendations(
        engagementMetrics,
        contentInsights,
        professionalGrowth,
        competitorComparison
      );

      const analysisData: LinkedInInsightsData = {
        engagementMetrics,
        audienceDemographics,
        contentInsights,
        professionalGrowth,
        competitorComparison,
        recommendations
      };

      return {
        success: true,
        data: analysisData,
        metadata: {
          generatedAt: new Date(),
          source: 'LinkedInInsightsEngine',
          cacheStatus: 'miss',
          correlationId: request.correlationId,
          warnings: []
        }
      };

    } catch (error) {
      return {
        success: false,
        error: {
          message: 'Failed to analyze LinkedIn presence',
          code: 'LINKEDIN_ANALYSIS_ERROR',
          details: error
        },
        metadata: {
          generatedAt: new Date(),
          source: 'LinkedInInsightsEngine',
          correlationId: request.correlationId
        }
      };
    }
  }

  private async getProfileData(profileId?: string, userId?: string): Promise<RawLinkedInProfile | null> {
    if (!profileId && !userId) return null;

    try {
      let query = this.supabase
        .from('raw_linkedin_profiles')
        .select('*');

      if (profileId) {
        query = query.eq('platform_user_id', profileId);
      } else if (userId) {
        // Get the most recent profile for this user
        query = query.eq('user_id', userId).order('last_fetched_at', { ascending: false }).limit(1);
      }

      const { data, error } = await query.single();

      if (error || !data) {
        console.warn('No LinkedIn profile data found:', error);
        return null;
      }

      return data as RawLinkedInProfile;
    } catch (error) {
      console.error('Error fetching LinkedIn profile data:', error);
      return null;
    }
  }

  private async getPostData(userId?: string, timeframe?: { start: Date; end: Date }): Promise<RawLinkedInPost[]> {
    if (!userId) return [];

    try {
      let query = this.supabase
        .from('raw_linkedin_posts')
        .select('*')
        .eq('user_id', userId);

      if (timeframe) {
        query = query
          .gte('timestamp', timeframe.start.toISOString())
          .lte('timestamp', timeframe.end.toISOString());
      } else {
        // Default to last 90 days
        const nineDaysAgo = new Date();
        nineDaysAgo.setDate(nineDaysAgo.getDate() - 90);
        query = query.gte('timestamp', nineDaysAgo.toISOString());
      }

      query = query.order('timestamp', { ascending: false });

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching LinkedIn posts:', error);
        return [];
      }

      return data as RawLinkedInPost[];
    } catch (error) {
      console.error('Error fetching LinkedIn post data:', error);
      return [];
    }
  }

  private async getCompanyData(companyId?: string): Promise<RawLinkedInCompany | null> {
    if (!companyId) return null;

    try {
      const { data, error } = await this.supabase
        .from('raw_linkedin_companies')
        .select('*')
        .eq('company_id', companyId)
        .single();

      if (error || !data) {
        console.warn('No LinkedIn company data found:', error);
        return null;
      }

      return data as RawLinkedInCompany;
    } catch (error) {
      console.error('Error fetching LinkedIn company data:', error);
      return null;
    }
  }

  private async getIndustryBenchmarks(industry?: string): Promise<{ avgEngagement: number; avgConnections: number } | null> {
    if (!industry) return null;

    try {
      // Calculate industry averages from our data
      const { data, error } = await this.supabase
        .from('raw_linkedin_profiles')
        .select('connections_count, profile_views_count')
        .eq('industry', industry);

      if (error || !data || data.length === 0) {
        return null;
      }

      const avgConnections = data.reduce((sum, profile) => sum + (profile.connections_count || 0), 0) / data.length;
      
      // For engagement, we'd need to join with posts, but for now return a mock value
      const avgEngagement = 3.5; // Mock industry average engagement rate

      return {
        avgEngagement,
        avgConnections
      };
    } catch (error) {
      console.error('Error fetching industry benchmarks:', error);
      return null;
    }
  }

  private calculateEngagementMetrics(posts: RawLinkedInPost[], profile?: RawLinkedInProfile | null): LinkedInEngagementMetrics {
    if (posts.length === 0) {
      return {
        profileViews: profile?.profile_views_count || 0,
        searchAppearances: profile?.search_appearances_count || 0,
        postViews: 0,
        postClicks: 0,
        postLikes: 0,
        postComments: 0,
        postShares: 0,
        connectionRequests: 0,
        messageReplies: 0,
        followerGrowth: 0,
        engagementRate: 0,
        clickThroughRate: 0,
        connectionAcceptanceRate: 0
      };
    }

    const totalViews = posts.reduce((sum, post) => sum + (post.views_count || 0), 0);
    const totalLikes = posts.reduce((sum, post) => sum + (post.likes_count || 0), 0);
    const totalComments = posts.reduce((sum, post) => sum + (post.comments_count || 0), 0);
    const totalShares = posts.reduce((sum, post) => sum + (post.shares_count || 0), 0);
    const totalClicks = posts.reduce((sum, post) => sum + (post.clicks_count || 0), 0);

    const engagementRate = totalViews > 0 ? ((totalLikes + totalComments + totalShares) / totalViews) * 100 : 0;
    const clickThroughRate = totalViews > 0 ? (totalClicks / totalViews) * 100 : 0;

    return {
      profileViews: profile?.profile_views_count || 0,
      searchAppearances: profile?.search_appearances_count || 0,
      postViews: Math.round(totalViews / posts.length),
      postClicks: Math.round(totalClicks / posts.length),
      postLikes: Math.round(totalLikes / posts.length),
      postComments: Math.round(totalComments / posts.length),
      postShares: Math.round(totalShares / posts.length),
      connectionRequests: 0, // Would need additional API data
      messageReplies: 0, // Would need additional API data
      followerGrowth: 0, // Would need historical data
      engagementRate: Math.round(engagementRate * 100) / 100,
      clickThroughRate: Math.round(clickThroughRate * 100) / 100,
      connectionAcceptanceRate: 0 // Would need additional API data
    };
  }

  private analyzeAudienceDemographics(posts: RawLinkedInPost[]): LinkedInDemographics {
    // Analyze the professional context data from posts
    const industries: Record<string, number> = {};
    const seniority: Record<string, number> = {};
    const companySize: Record<string, number> = {};
    const jobFunction: Record<string, number> = {};

    posts.forEach(post => {
      if (post.industry) {
        industries[post.industry] = (industries[post.industry] || 0) + 1;
      }
      if (post.seniority_level) {
        seniority[post.seniority_level] = (seniority[post.seniority_level] || 0) + 1;
      }
      if (post.company_size) {
        companySize[post.company_size] = (companySize[post.company_size] || 0) + 1;
      }
      if (post.job_function) {
        jobFunction[post.job_function] = (jobFunction[post.job_function] || 0) + 1;
      }
    });

    // Convert counts to percentages
    const total = posts.length;
    const toPercentages = (obj: Record<string, number>) => {
      const result: Record<string, number> = {};
      Object.entries(obj).forEach(([key, value]) => {
        result[key] = Math.round((value / total) * 100);
      });
      return result;
    };

    return {
      seniority: toPercentages(seniority),
      industry: toPercentages(industries),
      geography: { 'US': 60, 'EU': 25, 'APAC': 15 }, // Mock data - would need geo analysis
      companySize: toPercentages(companySize),
      jobFunction: toPercentages(jobFunction)
    };
  }

  private generateContentInsights(posts: RawLinkedInPost[]): LinkedInContentInsights {
    // Analyze posting patterns
    const postTimes = posts.map(post => {
      const date = new Date(post.timestamp);
      return {
        dayOfWeek: date.toLocaleDateString('en-US', { weekday: 'long' }),
        hour: date.getHours()
      };
    });

    // Calculate optimal posting times
    const timePerformance: Record<string, { count: number; totalEngagement: number }> = {};
    
    posts.forEach(post => {
      const date = new Date(post.timestamp);
      const timeKey = `${date.toLocaleDateString('en-US', { weekday: 'long' })}-${date.getHours()}`;
      const engagement = (post.likes_count || 0) + (post.comments_count || 0) + (post.shares_count || 0);
      
      if (!timePerformance[timeKey]) {
        timePerformance[timeKey] = { count: 0, totalEngagement: 0 };
      }
      timePerformance[timeKey].count++;
      timePerformance[timeKey].totalEngagement += engagement;
    });

    const optimalPostTimes = Object.entries(timePerformance)
      .map(([timeKey, data]) => {
        const [dayOfWeek, hour] = timeKey.split('-');
        return {
          dayOfWeek,
          hour: parseInt(hour),
          engagementScore: data.totalEngagement / data.count
        };
      })
      .sort((a, b) => b.engagementScore - a.engagementScore)
      .slice(0, 5);

    // Analyze content types
    const contentTypes: Record<string, { count: number; totalEngagement: number }> = {};
    
    posts.forEach(post => {
      const type = post.post_type || 'TEXT';
      const engagement = (post.likes_count || 0) + (post.comments_count || 0) + (post.shares_count || 0);
      
      if (!contentTypes[type]) {
        contentTypes[type] = { count: 0, totalEngagement: 0 };
      }
      contentTypes[type].count++;
      contentTypes[type].totalEngagement += engagement;
    });

    const topPerformingContentTypes = Object.entries(contentTypes)
      .map(([type, data]) => ({
        type,
        averageEngagement: data.totalEngagement / data.count,
        recommendedFrequency: data.count > 5 ? 'Weekly' : 'Monthly'
      }))
      .sort((a, b) => b.averageEngagement - a.averageEngagement);

    return {
      optimalPostTimes,
      topPerformingContentTypes,
      audienceInsights: {
        mostActiveRegions: ['United States', 'United Kingdom', 'Canada'],
        topIndustries: ['Technology', 'Finance', 'Healthcare'],
        preferredContentLength: {
          min: 50,
          max: 300,
          optimal: 150
        }
      },
      hashtagRecommendations: [
        { hashtag: '#leadership', relevanceScore: 85, usageCount: 12 },
        { hashtag: '#innovation', relevanceScore: 78, usageCount: 8 },
        { hashtag: '#technology', relevanceScore: 72, usageCount: 15 }
      ]
    };
  }

  private calculateProfessionalGrowth(
    profile: RawLinkedInProfile | null, 
    posts: RawLinkedInPost[]
  ): LinkedInInsightsData['professionalGrowth'] {
    // Mock calculations - would need historical data for real trends
    return {
      connectionGrowthRate: 5.2, // Mock: 5.2% monthly growth
      profileViewTrend: 'increasing',
      industryPosition: 75, // Mock: 75th percentile
      thoughtLeadershipScore: 68 // Mock: calculated from engagement and reach
    };
  }

  private async generateCompetitorComparison(
    industry: string,
    userEngagementRate: number
  ): Promise<LinkedInInsightsData['competitorComparison']> {
    // This would need real competitor data - returning mock for now
    return {
      averageEngagementRate: 3.2,
      industryBenchmark: 2.8,
      topCompetitors: [
        { name: 'Industry Leader A', engagementRate: 4.5, followerCount: 15000 },
        { name: 'Industry Leader B', engagementRate: 4.1, followerCount: 12000 },
        { name: 'Industry Leader C', engagementRate: 3.8, followerCount: 18000 }
      ]
    };
  }

  private generateRecommendations(
    engagement: LinkedInEngagementMetrics,
    content: LinkedInContentInsights,
    growth: LinkedInInsightsData['professionalGrowth'],
    competitor?: LinkedInInsightsData['competitorComparison']
  ): LinkedInInsightsData['recommendations'] {
    const recommendations: LinkedInInsightsData['recommendations'] = [];

    // Engagement-based recommendations
    if (engagement.engagementRate < 2.0) {
      recommendations.push({
        type: 'engagement',
        title: 'Improve Post Engagement',
        description: 'Your engagement rate is below industry average. Consider posting more interactive content and engaging with your audience.',
        priority: 'high',
        expectedImpact: 'Could increase engagement rate by 50-80%'
      });
    }

    // Content timing recommendations
    if (content.optimalPostTimes.length > 0) {
      const bestTime = content.optimalPostTimes[0];
      recommendations.push({
        type: 'posting',
        title: 'Optimize Posting Schedule',
        description: `Post on ${bestTime.dayOfWeek}s at ${bestTime.hour}:00 for maximum engagement.`,
        priority: 'medium',
        expectedImpact: 'Could increase visibility by 25-40%'
      });
    }

    // Content type recommendations
    if (content.topPerformingContentTypes.length > 0) {
      const bestType = content.topPerformingContentTypes[0];
      recommendations.push({
        type: 'content',
        title: 'Focus on High-Performing Content',
        description: `${bestType.type} content performs best for your audience. Consider creating more of this type.`,
        priority: 'medium',
        expectedImpact: 'Could increase average engagement by 30-50%'
      });
    }

    // Professional growth recommendations
    if (growth.thoughtLeadershipScore < 70) {
      recommendations.push({
        type: 'content',
        title: 'Build Thought Leadership',
        description: 'Share industry insights and original thoughts to establish yourself as a thought leader.',
        priority: 'high',
        expectedImpact: 'Could improve professional visibility and networking opportunities'
      });
    }

    return recommendations;
  }
}

export default LinkedInInsightsEngine; 