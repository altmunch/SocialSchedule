import { SupabaseClient } from '@supabase/supabase-js';
import { Database, Tables } from '@/types/supabase'; // Import Tables type
import {
  CompetitorAnalysis,
  ContentAnalysis,
  EngagementMetrics,
  TopPerformingContent,
  Recommendation,
  Video
} from '../types/analysis_types';
import { EnhancedTextAnalyzer } from '@/lib/ai/enhancedTextAnalyzer'; // Assuming path

// Video type is now imported from analysis_types.ts which uses Tables<'videos'>

export class CompetitorAnalysisService {
  private textAnalyzer: EnhancedTextAnalyzer;

  constructor(private supabase: SupabaseClient) {
    // Initialize EnhancedTextAnalyzer, potentially with config if needed
    this.textAnalyzer = new EnhancedTextAnalyzer({}); 
  }

  async analyzeCompetitor(competitorId: string, niche: string): Promise<CompetitorAnalysis | null> {
    const { data: competitorData, error: competitorError } = await this.supabase
      .from('competitors')
      .select('username, platform') // Add other fields like display_name if available
      .eq('id', competitorId)
      .single();

    if (competitorError || !competitorData) {
      console.error(`Error fetching competitor ${competitorId}:`, competitorError);
      return null;
    }

    // 1. Fetch competitor's recent videos (e.g., last 50)
    // Ensure 'videos' table has 'competitor_id' and 'niche' columns
    const { data: videos, error: videosError } = await this.supabase
      .from('videos')
      .select('*') // Select all fields from the Video type
      .eq('competitor_id', competitorId)
      // .eq('niche', niche) // Optionally filter by niche if videos are pre-categorized
      .order('published_at', { ascending: false })
      .limit(50) as { data: Video[] | null; error: any };

    if (videosError || !videos || videos.length === 0) {
      console.error(`Error fetching videos for competitor ${competitorId}:`, videosError);
      return {
        competitorId,
        competitorName: competitorData.username, // Or display_name
        niche,
        contentAnalysis: {} as ContentAnalysis, // Return empty or default structures
        engagementMetrics: {} as EngagementMetrics,
        topPerformingContent: { videos: [], keySuccessFactors: [] },
        recommendations: [],
        lastAnalyzed: new Date().toISOString(),
      }; // Or throw error
    }

    // 2. Analyze content patterns
    const contentAnalysis = await this.analyzeContentPatterns(videos);
    
    // 3. Calculate engagement metrics
    const engagementMetrics = this.calculateEngagementMetrics(videos);
    
    // 4. Identify top-performing content
    const topPerforming = this.identifyTopPerforming(videos);

    // 5. Generate recommendations
    const recommendations = this.generateRecommendations(contentAnalysis, engagementMetrics, topPerforming, niche);

    return {
      competitorId,
      competitorName: competitorData.username, // Or display_name
      niche,
      contentAnalysis,
      engagementMetrics,
      topPerformingContent: topPerforming,
      recommendations,
      lastAnalyzed: new Date().toISOString(),
    };
  }

  private async analyzeContentPatterns(videos: Video[]): Promise<ContentAnalysis> {
    let allCaptions = '';
    const topicsCount: Record<string, number> = {};
    const hashtagsCount: Record<string, number> = {};
    const sentimentScores = { positive: 0, negative: 0, neutral: 0 };
    let totalProcessingTime = 0;

    for (const video of videos) {
      if (video.caption) {
        allCaptions += video.caption + ' ';
        try {
          // Summarize content to get sentiment and key points (topics)
          const summary = await this.textAnalyzer.summarizeContent(video.caption);
          sentimentScores[summary.sentiment] = (sentimentScores[summary.sentiment] || 0) + 1;
          summary.keyPoints.forEach(topic => {
            topicsCount[topic.toLowerCase()] = (topicsCount[topic.toLowerCase()] || 0) + 1;
          });
          totalProcessingTime += summary.processingTimeMs || 0;
        } catch (e) {
          console.warn(`Failed to analyze caption for video ${video.id}:`, e);
        }
      }
      video.tags?.forEach((tag: string) => {
        hashtagsCount[tag.toLowerCase()] = (hashtagsCount[tag.toLowerCase()] || 0) + 1;
      });
    }

    const popularTopics = Object.entries(topicsCount)
      .sort(([,a],[,b]) => b-a)
      .slice(0, 10)
      .map(([name]) => name);

    const popularHashtags = Object.entries(hashtagsCount)
      .sort(([,a],[,b]) => b-a)
      .slice(0, 10)
      .map(([name]) => name);
      
    const totalSentiments = Object.values(sentimentScores).reduce((a, b) => a + b, 0);
    const sentimentDistribution = totalSentiments > 0 ? {
        positive: sentimentScores.positive / totalSentiments,
        negative: sentimentScores.negative / totalSentiments,
        neutral: sentimentScores.neutral / totalSentiments,
    } : { positive: 0, negative: 0, neutral: 0 };

    return {
      commonTopics: popularTopics,
      popularHashtags: popularHashtags,
      postingFrequency: videos.length / 4, // Assuming 50 videos over ~4 weeks approx
      bestPerformingFormats: [], // Placeholder - requires more data like video type/format
      sentimentDistribution,
    };
  }

  private calculateEngagementMetrics(videos: Video[]): EngagementMetrics {
    if (videos.length === 0) return {
        averageLikes: 0, averageComments: 0, averageShares: 0, averageViews: 0, averageEngagementRate: 0
    };

    let totalLikes = 0, totalComments = 0, totalShares = 0, totalViews = 0;
    videos.forEach(v => {
      totalLikes += v.like_count || 0;
      totalComments += v.comment_count || 0;
      totalShares += v.share_count || 0;
      totalViews += v.view_count || 0;
    });

    const numVideos = videos.length;
    const avgLikes = totalLikes / numVideos;
    const avgComments = totalComments / numVideos;
    const avgShares = totalShares / numVideos;
    const avgViews = totalViews / numVideos;
    // Engagement Rate: (Likes + Comments + Shares) / Views. Handle division by zero.
    const avgEngagementRate = avgViews > 0 ? (avgLikes + avgComments + avgShares) / avgViews : 0;

    return {
      averageLikes: avgLikes,
      averageComments: avgComments,
      averageShares: avgShares,
      averageViews: avgViews,
      averageEngagementRate: avgEngagementRate,
    };
  }

  private identifyTopPerforming(videos: Video[]): TopPerformingContent {
    if (videos.length === 0) return { videos: [], keySuccessFactors: [] };

    // Sort by engagement rate (likes + comments + shares / views)
    // or a composite score if views are not always available or reliable
    const sortedVideos = [...videos].sort((a, b) => {
      const engagementA = (a.like_count || 0) + (a.comment_count || 0) + (a.share_count || 0);
      const engagementB = (b.like_count || 0) + (b.comment_count || 0) + (b.share_count || 0);
      const rateA = (a.view_count || 1) > 0 ? engagementA / (a.view_count || 1) : 0; // Avoid division by zero
      const rateB = (b.view_count || 1) > 0 ? engagementB / (b.view_count || 1) : 0;
      return rateB - rateA; // Descending order
    });

    const topVideos = sortedVideos.slice(0, Math.min(5, videos.length)); // Top 5 or fewer
    
    // Basic success factor identification (can be improved with more sophisticated analysis)
    const successFactors: string[] = [];
    const commonTopicsInTop: Record<string, number> = {};
    topVideos.forEach(v => {
        v.tags?.forEach((tag: string) => { commonTopicsInTop[tag] = (commonTopicsInTop[tag] || 0) + 1});
    });
    Object.entries(commonTopicsInTop).filter(([,count]) => count > 1).forEach(([topic]) => successFactors.push(`Common topic: ${topic}`));
    if (topVideos.some(v => (v.caption || '').includes('?'))) successFactors.push('Use of questions in caption');

    return {
      videos: topVideos,
      keySuccessFactors: successFactors.length > 0 ? successFactors : ['General high engagement'],
    };
  }

  private generateRecommendations(
    content: ContentAnalysis,
    metrics: EngagementMetrics,
    topPerforming: TopPerformingContent,
    niche: string
  ): Recommendation[] {
    const recommendations: Recommendation[] = [];

    recommendations.push({
      type: 'content',
      description: `Focus on topics like: ${content.commonTopics.slice(0,3).join(', ')} which are popular in the ${niche} niche for this competitor.`,
      priority: 'high',
    });
    recommendations.push({
      type: 'content',
      description: `Utilize hashtags such as: ${content.popularHashtags.slice(0,3).join(', ')}.`,
      priority: 'medium',
    });
    
    if (metrics.averageEngagementRate > 0.05) { // Example threshold
         recommendations.push({
            type: 'strategy',
            description: `Competitor has a strong engagement rate (${(metrics.averageEngagementRate * 100).toFixed(2)}%). Analyze their top content for patterns.`,
            actionableSteps: topPerforming.keySuccessFactors,
            priority: 'high',
        });
    }

    if (topPerforming.keySuccessFactors.length > 0) {
        recommendations.push({
            type: 'content',
            description: `Emulate success factors from top performing content: ${topPerforming.keySuccessFactors.join(', ')}. `,
            priority: 'high'
        });
    }

    recommendations.push({
        type: 'strategy',
        description: `Consider posting frequency similar to competitor's (${content.postingFrequency.toFixed(1)} posts/week).`,
        priority: 'low'
    });

    return recommendations.slice(0, 5); // Limit to 5 recommendations
  }
}
