// OptimizedVideoGenerator.ts
// Uses the output of VideoOptimizationAnalysisService and user preferences to generate
// actual captions (with product links), hashtags, and audio suggestions via GPT-4-turbo.
// Designed for cost efficiency and high-quality returns.

import { VideoOptimizationAnalysisData, TrendingHashtag, AudioVirality } from '../data_analysis/types/analysis_types';
import OpenAI, { APIError } from 'openai';
import { z } from 'zod';

export interface UserPreferences {
  tone?: 'casual' | 'professional' | 'friendly' | 'authoritative';
  language?: string;
  includeCTA?: boolean;
  maxCaptionLength?: number;
  userId: string;
  platform?: string;
  correlationId?: string; // Added for tracing
}

export interface ProductLink {
  name: string;
  url: string;
  description?: string;
}

const OptimizedVideoContentSchema = z.object({
  captions: z.object({
    main: z.string(),
    alternatives: z.array(z.string()),
  }),
  hashtags: z.array(z.string()),
  audio: z.object({
    suggestion: z.string(),
    reason: z.string(),
  }),
});

export type OptimizedVideoContent = z.infer<typeof OptimizedVideoContentSchema>;

interface CacheEntry {
  data: OptimizedVideoContent;
  timestamp: number;
}

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

/**
 * Configuration for the OptimizedVideoGenerator.
 */
export interface OptimizedVideoGeneratorConfig {
  /** Cache Time-To-Live in milliseconds. Defaults to 6 hours. */
  cacheTTL?: number;
  /** Rate limit window in milliseconds. Defaults to 1 minute. */
  rateLimitWindow?: number;
  /** Maximum requests allowed per user within the rateLimitWindow. Defaults to 20. */
  maxRequestsPerMinute?: number;
  /** OpenAI model to use for content generation. Defaults to 'gpt-4-turbo-preview'. */
  openAIModel?: string;
}

export class OptimizedVideoGenerator {
  private openai: OpenAI;
  private cache = new Map<string, CacheEntry>();
  private rateLimits = new Map<string, RateLimitEntry>();
  private readonly cacheTTL: number;
  private readonly rateLimitWindow: number;
  private readonly maxRequestsPerMinute: number;
  private readonly openAIModel: string;
  private readonly MAX_RETRIES = 3;
  private readonly INITIAL_RETRY_DELAY_MS = 1000;

  /**
   * Creates an instance of OptimizedVideoGenerator.
   * @param apiKey The OpenAI API key.
   * @param config Optional configuration for cache, rate limiting, and OpenAI model.
   * @throws Error if API key is not provided.
   */
  constructor(private apiKey: string, config?: OptimizedVideoGeneratorConfig) {
    this.cacheTTL = config?.cacheTTL ?? 6 * 60 * 60 * 1000; // Default 6 hours
    this.rateLimitWindow = config?.rateLimitWindow ?? 60 * 1000; // Default 1 minute
    this.maxRequestsPerMinute = config?.maxRequestsPerMinute ?? 20; // Default 20 RPM
    this.openAIModel = config?.openAIModel ?? 'gpt-4-turbo-preview'; // Default model
    if (!apiKey) {
      throw new Error('API key is required for OptimizedVideoGenerator');
    }
    this.openai = new OpenAI({ apiKey: this.apiKey });
  }

  private async _callOpenAIWithRetries(
    prompt: string,
    userId: string,
    correlationId?: string
  ): Promise<OpenAI.Chat.Completions.ChatCompletion> {
    for (let attempt = 0; attempt < this.MAX_RETRIES; attempt++) {
      try {
        const completion = await this.openai.chat.completions.create({
          model: this.openAIModel,
          messages: [
            { role: 'system', content: 'You are an expert social media content strategist. Generate engaging and optimized video content in JSON format based on the provided data and user preferences.' },
            { role: 'user', content: prompt }
          ],
          response_format: { type: 'json_object' },
        });
        return completion;
      } catch (error) {
        const isRetryable = error instanceof APIError && (error.status === 429 || (error.status && error.status >= 500 && error.status <= 504));
        if (isRetryable && attempt < this.MAX_RETRIES - 1) {
          const delay = this.INITIAL_RETRY_DELAY_MS * Math.pow(2, attempt) + Math.random() * 1000; // Exponential backoff with jitter
          console.warn(`[${correlationId}] User: ${userId} - OpenAI API error (status ${error instanceof APIError ? error.status : 'unknown'}). Retrying attempt ${attempt + 1}/${this.MAX_RETRIES} in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        } else {
          console.error(`[${correlationId}] User: ${userId} - OpenAI API error (status ${error instanceof APIError ? error.status : 'unknown'}). All retries failed or error is not retryable.`, error);
          throw error; // Re-throw the error to be caught by the caller
        }
      }
    }
    // Should not be reached if MAX_RETRIES > 0, but satisfies TypeScript compiler
    throw new Error('Exhausted all retries for OpenAI API call.');
  }

  private checkRateLimit(userId: string): boolean {
    const now = Date.now();
    let entry = this.rateLimits.get(userId);

    if (!entry || entry.resetAt < now) {
      entry = { count: 0, resetAt: now + this.rateLimitWindow };
    }

    entry.count++;
    this.rateLimits.set(userId, entry);

    return entry.count <= this.maxRequestsPerMinute;
  }

  private generatePrompt(
    analysisData: VideoOptimizationAnalysisData,
    preferences: UserPreferences,
    productLinks?: ProductLink[]
  ): string {
    let prompt = `Generate optimized video content based on the following analysis and preferences:\n\n`;
    prompt += `Platform: ${preferences.platform || 'Not specified'}\n`;
    prompt += `User ID: ${preferences.userId}\n`;
    prompt += `Tone: ${preferences.tone || 'casual'}\n`;
    prompt += `Language: ${preferences.language || 'English'}\n`;
    if (preferences.includeCTA) {
      prompt += `Include a Call to Action.\n`;
    }
    if (preferences.maxCaptionLength) {
      prompt += `Maximum caption length: ${preferences.maxCaptionLength} characters.\n`;
    }

    prompt += "\n--- Video Analysis Data ---\n";
    prompt += `Top Performing Video Captions (for inspiration):\n`;
    analysisData.topPerformingVideoCaptions?.forEach((caption: string, index: number) => {
      prompt += `${index + 1}. ${caption}\n`;
    });

    prompt += `\nTrending Hashtags (for inspiration):\n`;
    analysisData.trendingHashtags?.forEach((hashtag: TrendingHashtag, index: number) => {
      prompt += `${index + 1}. #${hashtag.tag}\n`;
    });

    prompt += `\nAudio Virality (for inspiration):\n`;
    analysisData.audioViralityAnalysis?.forEach((audio: AudioVirality, index: number) => {
      prompt += `${index + 1}. Audio ID: ${audio.audioId}, Virality Score: ${audio.viralityScore}\n`;
    });

    // --- Add Real-time Sentiment Analysis ---
    if (analysisData.realTimeSentiment) {
      prompt += `\n--- Real-time Sentiment Analysis ---\n`;
      prompt += `Overall Sentiment: ${analysisData.realTimeSentiment.overallSentiment}\n`;
      if (analysisData.realTimeSentiment.dominantEmotion) {
        prompt += `Dominant Emotion: ${analysisData.realTimeSentiment.dominantEmotion}\n`;
      }
      if (analysisData.realTimeSentiment.segments && analysisData.realTimeSentiment.segments.length > 0 && analysisData.realTimeSentiment.segments[0].keyPhrases) {
        prompt += `Key Phrases: ${analysisData.realTimeSentiment.segments[0].keyPhrases.join(', ')}\n`;
      }
    }

    // --- Add ML-based Audio Recommendations ---
    if (analysisData.audioRecommendations && analysisData.audioRecommendations.recommendations.length > 0) {
      prompt += `\n--- ML-based Audio Recommendations ---\n`;
      analysisData.audioRecommendations.recommendations.forEach((track, index) => {
        prompt += `${index + 1}. Title: ${track.title}\n`;
        prompt += `   Artist: ${track.artist || 'N/A'}\n`;
        prompt += `   Genre(s): ${track.genre?.join(', ') || 'N/A'}\n`;
        prompt += `   Mood(s): ${track.mood?.join(', ') || 'N/A'}\n`;
        if (track.reasoning) {
          prompt += `   Reasoning: ${track.reasoning}\n`;
        }
      });
      if (analysisData.audioRecommendations.diversificationSuggestions && analysisData.audioRecommendations.diversificationSuggestions.length > 0) {
        prompt += `Diversification Suggestions: ${analysisData.audioRecommendations.diversificationSuggestions.join(', ')}\n`;
      }
    }

    // --- Add Detailed Platform Analytics ---
    if (analysisData.detailedPlatformAnalytics) {
      prompt += `\n--- Detailed Platform Analytics ---\n`;
      if (analysisData.detailedPlatformAnalytics.audienceDemographics) {
        prompt += `Audience Demographics:\n`;
        const demo = analysisData.detailedPlatformAnalytics.audienceDemographics;
        if (demo.ageGroups) prompt += `  Age Groups: ${JSON.stringify(demo.ageGroups)}\n`;
        if (demo.genderDistribution) prompt += `  Gender Distribution: ${JSON.stringify(demo.genderDistribution)}\n`;
        if (demo.topCountries) prompt += `  Top Countries: ${JSON.stringify(demo.topCountries)}\n`;
        if (demo.topCities) prompt += `  Top Cities: ${JSON.stringify(demo.topCities)}\n`;
      }
      if (analysisData.detailedPlatformAnalytics.peakEngagementTimes && analysisData.detailedPlatformAnalytics.peakEngagementTimes.length > 0) {
        prompt += `Peak Engagement Times:\n`;
        analysisData.detailedPlatformAnalytics.peakEngagementTimes.forEach(time => {
          prompt += `  - Day: ${time.dayOfWeek}, Hour: ${time.hourOfDay}, Score: ${time.engagementScore}\n`;
        });
      }
      if (analysisData.detailedPlatformAnalytics.contentFormatPerformance && analysisData.detailedPlatformAnalytics.contentFormatPerformance.length > 0) {
        prompt += `Content Format Performance:\n`;
        analysisData.detailedPlatformAnalytics.contentFormatPerformance.forEach(format => {
          prompt += `  - Format: ${format.formatName}\n`;
          if (format.averageViews) prompt += `    Avg Views: ${format.averageViews}\n`;
          if (format.averageLikes) prompt += `    Avg Likes: ${format.averageLikes}\n`;
          if (format.averageEngagementRate) prompt += `    Avg Engagement Rate: ${format.averageEngagementRate}\n`;
          if (format.totalPosts) prompt += `    Total Posts: ${format.totalPosts}\n`;
        });
      }
    }
    
    if (productLinks && productLinks.length > 0) {
      prompt += "\n--- Product Links to Incorporate ---\n";
      productLinks.forEach(link => {
        prompt += `Product: ${link.name} (${link.url})${link.description ? ' - ' + link.description : ''}\n`;
      });
    }

    prompt += `\n--- Output Format (JSON) ---\n`;
    prompt += `Provide your response as a JSON object with the following structure:
    {
      "captions": {
        "main": "Main caption text...",
        "alternatives": ["Alternative caption 1...", "Alternative caption 2..."]
      },
      "hashtags": ["hashtag1", "hashtag2", "hashtag3"],
      "audio": {
        "suggestion": "Suggested audio track/style...",
        "reason": "Reason for audio suggestion..."
      }
    }`;
    
    return prompt;
  }

  async generateOptimizedContent(
    analysisData: VideoOptimizationAnalysisData,
    userPreferences: UserPreferences,
    productLinks?: ProductLink[]
  ): Promise<OptimizedVideoContent> {
    if (!analysisData) {
      console.error(`[${userPreferences?.correlationId || 'N/A'}] User: ${userPreferences?.userId || 'N/A'} - Invalid input: analysisData is required.`);
      throw new Error('Invalid input: analysisData is required.');
    }
    if (!userPreferences) {
      console.error(`[N/A] User: N/A - Invalid input: userPreferences are required.`);
      throw new Error('Invalid input: userPreferences are required.');
    }
    const { userId, correlationId } = userPreferences; 
    if (!userId || typeof userId !== 'string' || userId.trim() === '') {
      console.error(`[${correlationId || 'N/A'}] User: ${userId || 'N/A'} - Invalid input: userPreferences.userId is required and must be a non-empty string.`);
      throw new Error('Invalid input: userPreferences.userId is required and must be a non-empty string.');
    }

    console.log(`[${correlationId}] User: ${userId} - Starting optimized content generation.`);

    const cacheKey = JSON.stringify({ analysisData, userPreferences, productLinks });
    const cached = this.cache.get(cacheKey);
    if (cached && cached.timestamp + this.cacheTTL > Date.now()) {
      console.log(`[${correlationId}] User: ${userId} - Returning cached optimized content.`);
      return cached.data;
    }

    if (!this.checkRateLimit(userId)) {
      console.warn(`[${correlationId}] User: ${userId} - Rate limit exceeded.`);
      throw new Error(`Rate limit exceeded for user ${userId}. Please try again later.`);
    }

    const prompt = this.generatePrompt(analysisData, userPreferences, productLinks);
    try {
      const completion = await this._callOpenAIWithRetries(prompt, userId, correlationId);

      const content = completion.choices[0]?.message?.content;
      if (!content) {
        console.error(`[${correlationId}] User: ${userId} - OpenAI API response content is empty or undefined after successful call with retries.`);
        throw new Error('OpenAI API response content is empty.');
      }
      
      if (typeof content !== 'string') {
         console.error(`[${correlationId}] User: ${userId} - OpenAI API response content is not a string. Type: ${typeof content}. Content: ${JSON.stringify(content)}`);
         throw new Error('OpenAI API response content is not a string.');
      }

      let parsedContentJson;
      try {
        parsedContentJson = JSON.parse(content);
      } catch (jsonError) {
        console.error(`[${correlationId}] User: ${userId} - Failed to parse OpenAI response as JSON. Content: ${content}`, jsonError);
        const errorMessage = jsonError instanceof Error ? jsonError.message : String(jsonError);
        throw new Error(`Failed to parse OpenAI response as JSON. Error: ${errorMessage}`);
      }

      try {
        const validatedContent = OptimizedVideoContentSchema.parse(parsedContentJson);
        this.cache.set(cacheKey, { data: validatedContent, timestamp: Date.now() });
        console.log(`[${correlationId}] User: ${userId} - Successfully generated, validated, and cached optimized content.`);
        return validatedContent;
      } catch (zodError) {
        console.error(`[${correlationId}] User: ${userId} - Failed to validate OpenAI response JSON with Zod. Parsed JSON: ${JSON.stringify(parsedContentJson)}`, zodError);
        if (zodError instanceof z.ZodError) {
          const errorDetails = zodError.errors.map(e => `${e.path.join('.')}: ${e.message}`).join('; ');
          throw new Error(`Failed to validate OpenAI response JSON. Details: ${errorDetails}`);
        }
        throw new Error('Failed to validate OpenAI response JSON due to an unknown Zod error.');
      }
    } catch (error) {
      console.error(`[${correlationId}] User: ${userId} - Error during optimized content generation pipeline:`, error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(`An unexpected error occurred: ${String(error)}`);
    }
  }
}