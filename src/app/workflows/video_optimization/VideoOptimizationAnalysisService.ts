import { Injectable } from '@nestjs/common';
import { 
  AnalysisResult, 
  VideoOptimizationAnalysisData, 
  BaseAnalysisRequest,
  TimeRange,
  Platform,
  AudioVirality,
  AudioFeaturesInput // Added for AudioRecommendationEngine
} from '../data_analysis/types/analysis_types';
import { ContentInsightsEngine } from '../data_analysis/engines/ContentInsightsEngine';
import { ViralityEngine } from '../data_analysis/engines/ViralityEngine';
import { SentimentAnalysisEngine } from './engines/SentimentAnalysisEngine'; // Added new engine
import { AudioRecommendationEngine } from './engines/AudioRecommendationEngine'; // Added new engine
import { analyzeHashtags, analyzeHashtagsWithTrends } from '../data_analysis/functions/hashtag_analysis';
import { OptimizedVideoGenerator, ProductLink, OptimizedVideoContent, UserPreferences, OptimizedVideoGeneratorConfig } from './OptimizedVideoGenerator';

type OptimizationMode = 'fast' | 'thorough';

interface GetVideoOptimizationInsightsRequest extends BaseAnalysisRequest {
  audioIds?: string[];
  userId: string;
  platform: Platform;
  timeRange: TimeRange;
  correlationId?: string;
  mode?: OptimizationMode; // Add mode for cost control
}

@Injectable()
export class VideoOptimizationAnalysisService {
  private optimizedVideoGenerator: OptimizedVideoGenerator;

  constructor(
    private readonly openAIApiKey: string, // Moved to the beginning
    private readonly contentInsightsEngine: ContentInsightsEngine = new ContentInsightsEngine(),
    private readonly viralityEngine: ViralityEngine = new ViralityEngine(),
    // Pass openAIApiKey to the new engines
    private readonly sentimentAnalysisEngine: SentimentAnalysisEngine = new SentimentAnalysisEngine(openAIApiKey),
    private readonly audioRecommendationEngine: AudioRecommendationEngine = new AudioRecommendationEngine(openAIApiKey),
    private readonly optimizedVideoGeneratorConfig?: OptimizedVideoGeneratorConfig
  ) {
    if (!openAIApiKey) {
      throw new Error('OpenAI API key is required');
    }
    this.optimizedVideoGenerator = new OptimizedVideoGenerator(openAIApiKey, this.optimizedVideoGeneratorConfig);
  }

  async generateOptimizedContent(
    analysis: VideoOptimizationAnalysisData,
    userPreferences: UserPreferences, // Changed order and type
    productLink?: ProductLink // Made optional as per generator
  ): Promise<AnalysisResult<OptimizedVideoContent>> {
    try {
      if (!analysis || !userPreferences?.userId) { // productLink can be optional
        return {
          success: false,
          error: {
            code: 'INVALID_INPUT',
            message: 'Missing required parameters (analysis or userPreferences) for content generation',
          },
          metadata: {
            generatedAt: new Date(),
            source: 'VideoOptimizationAnalysisService.generateOptimizedContent',
            correlationId: userPreferences?.correlationId,
          },
        };
      }

      const result = await this.optimizedVideoGenerator.generateOptimizedContent(
        analysis,
        userPreferences,
        productLink ? [productLink] : undefined // Pass productLink as an array if present
      );

      return {
        success: true,
        data: result,
        metadata: {
          generatedAt: new Date(),
          source: 'VideoOptimizationAnalysisService.generateOptimizedContent',
          correlationId: userPreferences?.correlationId, // Assuming correlationId might be part of userPreferences
        },
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'GENERATION_ERROR',
          message: error instanceof Error ? error.message : 'Failed to generate optimized content',
          details: error instanceof Error ? error.stack : JSON.stringify(error),
        },
        metadata: {
          generatedAt: new Date(),
          source: 'VideoOptimizationAnalysisService.generateOptimizedContent',
          correlationId: userPreferences?.correlationId, // Assuming correlationId might be part of userPreferences
        },
      };
    }
  }

  async getVideoOptimizationInsights(
    request: GetVideoOptimizationInsightsRequest
  ): Promise<AnalysisResult<VideoOptimizationAnalysisData>> {
    console.log(`VideoOptimizationAnalysisService: Getting insights for userId: ${request.userId}`);

    try {
      const [contentInsightsResult, audioViralityResult, detailedAnalyticsResult] = await Promise.all([
        this.contentInsightsEngine.getTopPerformingContentInsights({
          userId: request.userId,
          platform: request.platform,
          timeRange: request.timeRange
        }),
        this.viralityEngine.analyzeAudioVirality({
          userId: request.userId,
          platform: request.platform,
          timeRange: request.timeRange
        }, request.audioIds),
        this.contentInsightsEngine.getDetailedPlatformAnalytics(request) // Added call for detailed analytics
      ]);

      // Process and combine the results
      const combinedData: VideoOptimizationAnalysisData = {
        topPerformingVideoCaptions: contentInsightsResult.data?.topPerformingVideoCaptions || [],
        trendingHashtags: [], // Will be populated below
        audioViralityAnalysis: audioViralityResult.data || [], // Corrected property name
        // Initialize new fields from enhanced VideoOptimizationAnalysisData type
        realTimeSentiment: undefined,
        audioRecommendations: undefined,
        detailedPlatformAnalytics: detailedAnalyticsResult.success && detailedAnalyticsResult.data ? detailedAnalyticsResult.data : undefined,
      };

      // Extract and analyze hashtags from top performing content, merging with trending
      if (contentInsightsResult.data?.topPerformingVideoCaptions && contentInsightsResult.data.topPerformingVideoCaptions.length > 0) {
        const hashtags = await analyzeHashtagsWithTrends(
          contentInsightsResult.data.topPerformingVideoCaptions,
          request.platform,
          5
        );
        combinedData.trendingHashtags = hashtags.map(tagString => ({ tag: tagString }));
      }

      // Step 2: Perform Sentiment Analysis (if captions exist and mode is not 'fast')
      const mode = request.mode || 'thorough';
      if (mode !== 'fast' && combinedData.topPerformingVideoCaptions.length > 0) {
        const textToAnalyze = combinedData.topPerformingVideoCaptions.join(' \n\n ');
        console.log(`VideoOptimizationAnalysisService: Requesting sentiment analysis for ${textToAnalyze.substring(0,100)}...`);
        const sentimentResult = await this.sentimentAnalysisEngine.analyzeTextSentiment(
          textToAnalyze,
          request.correlationId
        );
        if (sentimentResult.success && sentimentResult.data) {
          combinedData.realTimeSentiment = sentimentResult.data;
          console.log('VideoOptimizationAnalysisService: Sentiment analysis successful.');
        } else {
          console.warn('VideoOptimizationAnalysisService: Sentiment analysis failed or returned no data:', sentimentResult.error);
        }
      }

      // Step 3: Log if detailed analytics failed (optional, could add to warnings)
      if (!detailedAnalyticsResult.success) {
        console.warn('VideoOptimizationAnalysisService: Detailed platform analytics failed or returned no data:', detailedAnalyticsResult.error);
      }

      // Step 4: Perform Audio Recommendation (skip if mode is 'fast')
      if (mode !== 'fast') {
        console.log('VideoOptimizationAnalysisService: Requesting audio recommendations.');
        const audioFeatures: AudioFeaturesInput = {
          videoContentSummary: combinedData.topPerformingVideoCaptions.length > 0 
                               ? combinedData.topPerformingVideoCaptions.join(' \n\n ')
                               : undefined,
          existingAudioContext: combinedData.audioViralityAnalysis,
        };
        const audioRecommendationResult = await this.audioRecommendationEngine.recommendAudio(
          audioFeatures,
          request.correlationId
        );
        if (audioRecommendationResult.success && audioRecommendationResult.data) {
          combinedData.audioRecommendations = audioRecommendationResult.data;
          console.log('VideoOptimizationAnalysisService: Audio recommendation successful.');
        } else {
          console.warn('VideoOptimizationAnalysisService: Audio recommendation failed or returned no data:', audioRecommendationResult.error);
        }
      }

      return {
        success: true,
        data: combinedData,
        metadata: {
          generatedAt: new Date(), // Corrected to Date object
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
          generatedAt: new Date(), // Corrected to Date object
          source: 'VideoOptimizationAnalysisService',
          correlationId: request.correlationId
        }
      };
    }
  }
}