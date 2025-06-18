import { BaseAnalysisRequest, VideoOptimizationAnalysisData, AnalysisResult } from '../types';
import { DetailedPlatformMetrics, AudienceDemographics, PeakEngagementTime, ContentFormatPerformance } from '../types';
import { ScannerService } from '../../data_collection/functions/ScannerService';
import { CacheSystem } from '../../data_collection/functions/cache/CacheSystem';
import { MonitoringSystem } from '../../data_collection/functions/monitoring/MonitoringSystem';
import { Platform } from '../../../deliverables/types/deliverables_types';

export class ContentInsightsEngine {
  private scannerService: ScannerService;

  constructor(cacheSystem?: CacheSystem, monitoringSystem?: MonitoringSystem) {
    this.scannerService = new ScannerService(cacheSystem, monitoringSystem);
  }

  async getTopPerformingContentInsights(
    request: BaseAnalysisRequest
  ): Promise<AnalysisResult<Pick<VideoOptimizationAnalysisData, 'topPerformingVideoCaptions' | 'trendingHashtags'>>> {
    console.log(`ContentInsightsEngine: Analyzing content for userId: ${request.userId}`);

    const captions: string[] = [];
    const hashtags: { [key: string]: number } = {};

    try {
      const userPostsResult = await this.scannerService.getUserPosts(request.platform, request.userId, 30); // Last 30 days
      if (userPostsResult.data && userPostsResult.data.length > 0) {
        userPostsResult.data.forEach(post => {
          if (post.caption) {
            captions.push(post.caption);
            const foundHashtags = post.caption.match(/#\w+/g);
            if (foundHashtags) {
              foundHashtags.forEach(tag => {
                const lowerCaseTag = tag.toLowerCase();
                hashtags[lowerCaseTag] = (hashtags[lowerCaseTag] || 0) + 1;
              });
            }
          }
        });
      }

      // Simple sorting for trending hashtags by frequency
      const sortedHashtags = Object.entries(hashtags)
        .sort(([, countA], [, countB]) => countB - countA)
        .map(([tag]) => ({ tag, rank: 0, estimatedReach: 0 })) // Placeholder rank/reach
        .slice(0, 10); // Top 10 hashtags

      return {
        success: true,
        data: {
          topPerformingVideoCaptions: captions.length > 0 ? captions : ['No top performing captions found.'],
          trendingHashtags: sortedHashtags,
        },
        metadata: {
          generatedAt: new Date(),
          source: 'ContentInsightsEngine',
          warnings: captions.length === 0 ? ['No user posts found for analysis.'] : [],
          correlationId: request.correlationId,
        },
      };

    } catch (error) {
      console.error(`Error in getTopPerformingContentInsights: ${error.message}`, error);
      return {
        success: false,
        error: {
          code: 'DATA_FETCH_ERROR',
          message: `Failed to fetch or process content insights: ${error.message}`,
          details: error,
        },
        metadata: {
          generatedAt: new Date(),
          source: 'ContentInsightsEngine',
          correlationId: request.correlationId,
        },
      };
    }
  }

  async getDetailedPlatformAnalytics(
    request: BaseAnalysisRequest
  ): Promise<AnalysisResult<DetailedPlatformMetrics>> {
    console.log(`ContentInsightsEngine: Fetching detailed platform analytics for userId: ${request.userId}, platform: ${request.platform}`);

    // TODO (PRIORITY 2 - Audience Data): Integrate with platform-specific APIs for actual Audience Demographics.
    // This currently uses mock data and needs real implementation from platforms like Facebook/Instagram Graph API (for audience insights).
    const audienceDemographics: AudienceDemographics = {
      ageGroups: { '18-24': 0.35, '25-34': 0.40, '35-44': 0.15, '45+': 0.10 },
      genderDistribution: { 'female': 0.6, 'male': 0.38, 'other': 0.02 },
      topCountries: { 'US': 0.7, 'CA': 0.1, 'UK': 0.05, 'AU': 0.03 },
    };

    // TODO (PRIORITY 2 - Engagement Data): Integrate with platform-specific APIs for actual Peak Engagement Times.
    // This currently uses mock data and requires detailed per-hour/per-day engagement data from platforms.
    const peakEngagementTimes: PeakEngagementTime[] = [
      { dayOfWeek: 'Monday', hourOfDay: 9, engagementScore: 900 },
      { dayOfWeek: 'Tuesday', hourOfDay: 14, engagementScore: 1100 },
      { dayOfWeek: 'Wednesday', hourOfDay: 12, engagementScore: 950 },
      { dayOfWeek: 'Thursday', hourOfDay: 17, engagementScore: 1300 },
      { dayOfWeek: 'Friday', hourOfDay: 18, engagementScore: 1200 },
      { dayOfWeek: 'Saturday', hourOfDay: 15, engagementScore: 1500 },
      { dayOfWeek: 'Sunday', hourOfDay: 10, engagementScore: 800 },
    ];

    const contentFormatPerformance: ContentFormatPerformance[] = [];
    const warnings: string[] = [];

    try {
      const userPostsResult = await this.scannerService.getUserPosts(request.platform, request.userId, 90); // Last 90 days for better data

      if (userPostsResult.data && userPostsResult.data.length > 0) {
        const formatMap: { [key: string]: { totalViews: number; totalLikes: number; totalEngagementRate: number; count: number } } = {};

        userPostsResult.data.forEach(post => {
          const format = post.mediaType || 'Unknown'; // Assuming mediaType exists or default to Unknown
          if (!formatMap[format]) {
            formatMap[format] = { totalViews: 0, totalLikes: 0, totalEngagementRate: 0, count: 0 };
          }
          formatMap[format].totalViews += (post.views || 0);
          formatMap[format].totalLikes += (post.likes || 0);
          formatMap[format].totalEngagementRate += (post.engagementScore || 0);
          formatMap[format].count++;
        });

        for (const formatName in formatMap) {
          const data = formatMap[formatName];
          contentFormatPerformance.push({
            formatName,
            averageViews: data.count > 0 ? data.totalViews / data.count : 0,
            averageLikes: data.count > 0 ? data.totalLikes / data.count : 0,
            averageEngagementRate: data.count > 0 ? data.totalEngagementRate / data.count : 0,
            totalPosts: data.count,
          });
        }
      } else {
        warnings.push(`No user posts found for ${request.platform} to analyze content format performance.`);
      }
    } catch (error) {
      console.error(`Error fetching user posts for detailed analytics: ${error.message}`, error);
      warnings.push(`Failed to fetch user posts for content format performance: ${error.message}`);
    }

    const detailedPlatformMetrics: DetailedPlatformMetrics = {
      audienceDemographics,
      peakEngagementTimes,
      contentFormatPerformance,
    };

    if (warnings.length > 0) {
      warnings.push('Audience Demographics and Peak Engagement Times are currently mock data.');
    }

    return {
      success: true,
      data: detailedPlatformMetrics,
      metadata: {
        generatedAt: new Date(),
        source: 'ContentInsightsEngine.getDetailedPlatformAnalytics',
        warnings: warnings,
        correlationId: request.correlationId,
      },
    };
  }
}
