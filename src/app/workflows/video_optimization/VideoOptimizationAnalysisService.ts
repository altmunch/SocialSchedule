import { Injectable } from '@nestjs/common';
import { 
  AnalysisResult, 
  VideoOptimizationAnalysisData, 
  BaseAnalysisRequest,
  TimeRange,
  Platform,
  AudioVirality
} from '../data_analysis/types/analysis_types';

interface AnalysisError {
  code: string;
  message: string;
  details?: any;
}

interface VideoOptimizationResult {
  success: boolean;
  data?: VideoOptimizationAnalysisData;
  error?: AnalysisError;
  metadata?: {
    generatedAt: string;
    source: string;
    cacheStatus?: 'hit' | 'miss';
    warnings?: string[];
    correlationId?: string;
  };
}

import { ContentInsightsEngine } from '../data_analysis/engines/ContentInsightsEngine';
import { ViralityEngine } from '../data_analysis/engines/ViralityEngine';
import { analyzeHashtags } from '../data_analysis/functions/hashtag_analysis';
import { OptimizedVideoGenerator, ProductLink } from './OptimizedVideoGenerator';

interface GetVideoOptimizationInsightsRequest extends BaseAnalysisRequest {
  audioIds?: string[];
  userId: string;
  platform: Platform;
  timeRange: TimeRange;
  correlationId?: string;
}

@Injectable()
export class VideoOptimizationAnalysisService {
  private optimizedVideoGenerator: OptimizedVideoGenerator;

  constructor(
    private readonly contentInsightsEngine: ContentInsightsEngine = new ContentInsightsEngine(),
    private readonly viralityEngine: ViralityEngine = new ViralityEngine(),
    private readonly openAIApiKey: string
  ) {
    if (!openAIApiKey) {
      throw new Error('OpenAI API key is required');
    }
    this.optimizedVideoGenerator = new OptimizedVideoGenerator(openAIApiKey);
  }

  async generateOptimizedContent(
    analysis: VideoOptimizationAnalysisData,
    productLink: ProductLink,
    userPreferences: { userId: string; [key: string]: any }
  ): Promise<VideoOptimizationResult> {
    try {
      if (!analysis || !productLink || !userPreferences?.userId) {
        return {
          success: false,
          error: {
            code: 'INVALID_INPUT',
            message: 'Missing required parameters for content generation'
          }
        };
      }

      const result = await this.optimizedVideoGenerator.generateOptimizedContent(
        analysis,
        productLink,
        userPreferences
      );

      return {
        success: true,
        data: result
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'GENERATION_ERROR',
          message: error instanceof Error ? error.message : 'Failed to generate optimized content',
          details: error
        }
      };
    }
  }

  async getVideoOptimizationInsights(
    request: GetVideoOptimizationInsightsRequest
  ): Promise<AnalysisResult<VideoOptimizationAnalysisData>> {
    console.log(`VideoOptimizationAnalysisService: Getting insights for userId: ${request.userId}`);

    try {
      const [contentInsightsResult, audioViralityResult] = await Promise.all([
        this.contentInsightsEngine.getTopPerformingContentInsights({
          userId: request.userId,
          platform: request.platform,
          timeRange: request.timeRange
        }),
        this.viralityEngine.analyzeAudioVirality({
          userId: request.userId,
          platform: request.platform,
          timeRange: request.timeRange
        }, request.audioIds)
      ]);

      // Process and combine the results
      const combinedData: VideoOptimizationAnalysisData = {
        topPerformingVideoCaptions: contentInsightsResult.data?.topPerformingVideoCaptions || [],
        trendingHashtags: [],
        audioVirality: audioViralityResult.data || [],
        generatedAt: new Date()
      };

      // Extract and analyze hashtags from top performing content
      if (contentInsightsResult.data?.topPerformingVideoCaptions) {
        const allCaptions = contentInsightsResult.data.topPerformingVideoCaptions
          .map((content: { caption?: string }) => content.caption || '')
          .join(' ');
        combinedData.trendingHashtags = analyzeHashtags(allCaptions);
      }

      return {
        success: true,
        data: combinedData,
        metadata: {
          generatedAt: new Date().toISOString(),
          source: 'VideoOptimizationAnalysisService',
          correlationId: request.correlationId
        }
      };
    } catch (error) {
      console.error('Error getting video optimization insights:', error);
      return {
        success: false,
        error: {
          code: 'ANALYSIS_ERROR',
          message: error instanceof Error ? error.message : 'Failed to analyze video optimization data',
          details: error
        },
        metadata: {
          generatedAt: new Date().toISOString(),
          source: 'VideoOptimizationAnalysisService',
          correlationId: request.correlationId
        }
      };
    }
      }),
      this.viralityEngine.analyzeAudioVirality(
        {
          userId: request.userId,
          platform: request.platform,
          timeRange: request.timeRange, // Time range might be relevant for trending audio discovery
        },
        request.audioIds
      ),
    ]);

    const errors: Array<{ engine: string; message?: string; details?: any }> = [];
    const warnings: string[] = [];

    if (contentInsightsResult.metadata?.warnings) {
      warnings.push(...contentInsightsResult.metadata.warnings);
    }
    if (audioViralityResult.metadata?.warnings) {
      warnings.push(...audioViralityResult.metadata.warnings);
    }

    if (!contentInsightsResult.success) {
      errors.push({ 
        engine: 'ContentInsightsEngine', 
        message: contentInsightsResult.error?.message || 'Content insights retrieval failed.',
        details: contentInsightsResult.error?.details
      });
    }

    if (!audioViralityResult.success) {
      errors.push({ 
        engine: 'ViralityEngine', 
        message: audioViralityResult.error?.message || 'Audio virality analysis failed.',
        details: audioViralityResult.error?.details
      });
    }

    if (errors.length > 0) {
      return {
        success: false,
        error: {
          message: 'Video optimization analysis failed or partially failed.',
          details: errors,
        },
        metadata: {
          generatedAt: new Date(),
          source: 'VideoOptimizationAnalysisService',
          correlationId: request.correlationId,
          warnings: warnings.length > 0 ? warnings : undefined,
        },
      };
    }

    // If we reach here, both results were successful
    // Extract hashtags from top-performing captions (if available)
    const captions = contentInsightsResult.data?.topPerformingVideoCaptions || [];
    const analyzedHashtags = analyzeHashtags(captions, 5);

    const combinedData: VideoOptimizationAnalysisData = {
      topPerformingVideoCaptions: captions,
      trendingHashtags: analyzedHashtags.length > 0
        ? analyzedHashtags.map(tag => ({ tag }))
        : contentInsightsResult.data!.trendingHashtags,
      audioViralityAnalysis: audioViralityResult.data!,
    };

    return {
      success: true,
      data: combinedData,
      metadata: {
        generatedAt: new Date(),
        source: 'VideoOptimizationAnalysisService (via ContentInsightsEngine, ViralityEngine, HashtagAnalysis)',
        correlationId: request.correlationId,
        warnings: warnings.length > 0 ? warnings : undefined,
      },
    };
  }
}