import { SupabaseClient } from '@supabase/supabase-js';
import { Database, Tables } from '@/types/supabase'; // Import Tables type
import {
  PerformanceTrends,
  EngagementTrends,
  ContentPerformance,
  AudienceGrowth,
  Benchmark,
  TimeRange,
  Recommendation,
  Video,
  EngagementTrendPoint
} from '../types/analysis_types';

// Placeholder for actual Supabase video type if different
// type VideoWithMetrics = definitions['videos']['Row'] & { video_metrics: definitions['video_metrics']['Row'][] };
// For simplicity, assuming Video type includes metrics or they are fetched and combined.
// If video_metrics is a separate related table, you'll need to adjust queries and data handling.

export class HistoricalAnalysisService {
  constructor(private supabase: SupabaseClient) {}

  async analyzePerformanceTrends(userId: string, timeRange: TimeRange): Promise<PerformanceTrends | null> {
    // 1. Fetch user's historical video data within the time range
    // This query assumes 'videos' table has metrics directly or they are joined effectively.
    // If 'video_metrics' is a separate table, a JOIN or multiple queries would be needed.
    const { data: videos, error: videosError } = await this.supabase
      .from('videos')
      .select('*') // Select all fields from the Video type
      .eq('user_id', userId)
      .gte('published_at', timeRange.start)
      .lte('published_at', timeRange.end)
      .order('published_at', { ascending: true }) as { data: Video[] | null; error: any };

    if (videosError || !videos || videos.length === 0) {
      console.error(`Error fetching historical videos for user ${userId}:`, videosError);
      return null; // Or throw new Error('No video data found for this period.');
    }

    // 2. Calculate trends and patterns
    const engagementTrends = this.calculateEngagementTrends(videos);
    const contentPerformance = this.analyzeContentPerformance(videos);
    // const audienceGrowth = this.calculateAudienceGrowth(videos); // Needs follower data source

    // 3. Calculate benchmarks
    const benchmarks = this.calculateBenchmarks(videos, engagementTrends);
    
    // 4. Generate insights and recommendations
    const keyInsights = this.generateKeyInsights(engagementTrends, contentPerformance, benchmarks);
    const actionableRecommendations = this.generateRecommendations(keyInsights, contentPerformance);

    return {
      userId,
      timeRange,
      overallSummary: `Analyzed ${videos.length} videos from ${timeRange.start} to ${timeRange.end}. Key insight: ${keyInsights[0] || 'Performance is stable.'}`,
      engagementTrends,
      contentPerformance,
      // audienceGrowth, // Add if follower data becomes available
      benchmarks,
      keyInsights,
      actionableRecommendations,
    };
  }

  private calculateEngagementTrends(videos: Video[]): EngagementTrends {
    const likesTrend: EngagementTrendPoint[] = [];
    const commentsTrend: EngagementTrendPoint[] = [];
    const viewsTrend: EngagementTrendPoint[] = [];
    const engagementRateTrend: EngagementTrendPoint[] = [];

    videos.forEach(video => {
      const timestamp = video.published_at;
      likesTrend.push({ timestamp, value: video.like_count || 0 });
      commentsTrend.push({ timestamp, value: video.comment_count || 0 });
      viewsTrend.push({ timestamp, value: video.view_count || 0 });
      
      const engagement = (video.like_count || 0) + (video.comment_count || 0) + (video.share_count || 0);
      const rate = (video.view_count || 1) > 0 ? engagement / (video.view_count || 1) : 0;
      engagementRateTrend.push({ timestamp, value: rate });
    });

    return {
      likesTrend,
      commentsTrend,
      viewsTrend,
      engagementRateTrend,
    };
  }

  private analyzeContentPerformance(videos: Video[]): ContentPerformance {
    if (videos.length === 0) return { topPerformingVideos: [], bottomPerformingVideos: [], contentTypePerformance: {} };

    const sortedByEngagementRate = [...videos].sort((a, b) => {
      const engagementA = (a.like_count || 0) + (a.comment_count || 0) + (a.share_count || 0);
      const engagementB = (b.like_count || 0) + (b.comment_count || 0) + (b.share_count || 0);
      const rateA = (a.view_count || 1) > 0 ? engagementA / (a.view_count || 1) : 0;
      const rateB = (b.view_count || 1) > 0 ? engagementB / (b.view_count || 1) : 0;
      return rateB - rateA; // Descending
    });

    const topVideos = sortedByEngagementRate.slice(0, Math.min(5, videos.length));
    const bottomVideos = sortedByEngagementRate.slice(-Math.min(5, videos.length)).reverse(); // ascending, then reverse to show worst first

    // contentTypePerformance would require a 'contentType' field on videos or further analysis
    // Example: Group by video.niche or video.tags if used as content type proxy
    const contentTypePerformance: Record<string, EngagementMetrics> = {}; 
    // Simplified: Calculate overall metrics for now
    const overallMetrics = videos.reduce((acc, v) => {
        acc.totalLikes += v.like_count || 0;
        acc.totalComments += v.comment_count || 0;
        acc.totalShares += v.share_count || 0;
        acc.totalViews += v.view_count || 0;
        return acc;
    }, { totalLikes: 0, totalComments: 0, totalShares: 0, totalViews: 0, count: videos.length });

    if (overallMetrics.count > 0) {
        contentTypePerformance['overall'] = {
            averageLikes: overallMetrics.totalLikes / overallMetrics.count,
            averageComments: overallMetrics.totalComments / overallMetrics.count,
            averageShares: overallMetrics.totalShares / overallMetrics.count,
            averageViews: overallMetrics.totalViews / overallMetrics.count,
            averageEngagementRate: overallMetrics.totalViews > 0 ? (overallMetrics.totalLikes + overallMetrics.totalComments + overallMetrics.totalShares) / overallMetrics.totalViews : 0
        };
    }

    return {
      topPerformingVideos: topVideos,
      bottomPerformingVideos: bottomVideos,
      contentTypePerformance, // Placeholder for more detailed content type breakdown
    };
  }

  private calculateBenchmarks(videos: Video[], trends: EngagementTrends): Benchmark[] {
    if (videos.length === 0) return [];

    const avgLikes = trends.likesTrend.reduce((sum, p) => sum + p.value, 0) / trends.likesTrend.length;
    const avgComments = trends.commentsTrend.reduce((sum, p) => sum + p.value, 0) / trends.commentsTrend.length;
    const avgViews = trends.viewsTrend.reduce((sum, p) => sum + p.value, 0) / trends.viewsTrend.length;
    const avgEngRate = trends.engagementRateTrend.reduce((sum, p) => sum + p.value, 0) / trends.engagementRateTrend.length;

    // Current could be the latest video or average of last N videos
    const latestVideo = videos[videos.length - 1];
    const currentEngRate = latestVideo ? ((latestVideo.like_count || 0) + (latestVideo.comment_count || 0) + (latestVideo.share_count || 0)) / (latestVideo.view_count || 1) : 0;

    return [
      { metricName: 'Average Likes', currentValue: latestVideo?.like_count || 0, averageValue: avgLikes },
      { metricName: 'Average Comments', currentValue: latestVideo?.comment_count || 0, averageValue: avgComments },
      { metricName: 'Average Views', currentValue: latestVideo?.view_count || 0, averageValue: avgViews },
      { metricName: 'Average Engagement Rate', currentValue: currentEngRate, averageValue: avgEngRate },
    ];
  }

  private generateKeyInsights(
    trends: EngagementTrends,
    contentPerf: ContentPerformance,
    benchmarks: Benchmark[]
  ): string[] {
    const insights: string[] = [];
    const lastEngRatePoint = trends.engagementRateTrend[trends.engagementRateTrend.length - 1];
    const firstEngRatePoint = trends.engagementRateTrend[0];

    if (lastEngRatePoint && firstEngRatePoint) {
        if (lastEngRatePoint.value > firstEngRatePoint.value) {
            insights.push('Engagement rate is trending upwards.');
        } else if (lastEngRatePoint.value < firstEngRatePoint.value) {
            insights.push('Engagement rate is trending downwards.');
        } else {
            insights.push('Engagement rate is stable.');
        }
    }

    const topVideoTopics = new Set(contentPerf.topPerformingVideos.flatMap(v => v.tags || []));
    if (topVideoTopics.size > 0) {
        insights.push(`Top performing videos often cover topics like: ${Array.from(topVideoTopics).slice(0,3).join(', ')}.`);
    }

    const engRateBenchmark = benchmarks.find(b => b.metricName === 'Average Engagement Rate');
    if (engRateBenchmark && engRateBenchmark.currentValue > engRateBenchmark.averageValue) {
        insights.push('Current engagement rate is above average.');
    } else if (engRateBenchmark) {
        insights.push('Current engagement rate is below or at average. Focus on improving engagement.');
    }
    
    return insights.slice(0,3); // Limit insights
  }

  private generateRecommendations(
    insights: string[],
    contentPerf: ContentPerformance
  ): Recommendation[] {
    const recommendations: Recommendation[] = [];

    if (insights.some(insight => insight.includes('downwards') || insight.includes('below or at average'))) {
      recommendations.push({
        type: 'strategy',
        description: 'Focus on strategies to boost engagement. Analyze top performing content for inspiration.',
        actionableSteps: ['Experiment with different call-to-actions.', 'Engage with comments promptly.'],
        priority: 'high',
      });
    }

    const topPerformingTopics = Array.from(new Set(contentPerf.topPerformingVideos.flatMap(v => v.tags || [])));
    if (topPerformingTopics.length > 0) {
      recommendations.push({
        type: 'content',
        description: `Create more content around successful topics: ${topPerformingTopics.slice(0,3).join(', ')}. `,
        priority: 'high',
      });
    }
    
    const bottomPerformingTopics = Array.from(new Set(contentPerf.bottomPerformingVideos.flatMap(v => v.tags || [])));
    if (bottomPerformingTopics.length > 0 && !topPerformingTopics.some(t => bottomPerformingTopics.includes(t))){
        recommendations.push({
            type: 'content',
            description: `Re-evaluate or pause content on topics like: ${bottomPerformingTopics.slice(0,2).join(', ')}, which are currently underperforming.`,
            priority: 'medium'
        });
    }

    recommendations.push({
        type: 'strategy',
        description: 'Regularly review performance trends to adapt your content strategy.',
        priority: 'low'
    });

    return recommendations.slice(0,3); // Limit recommendations
  }
}
