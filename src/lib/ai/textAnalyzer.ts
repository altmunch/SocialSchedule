import { Cache } from '../utils/cache';
import { Platform } from '@/types/platform';
import crypto from 'crypto';
import type { ChatCompletionMessageParam } from 'openai/resources/chat';
import { setTimeout } from 'timers/promises';

// Custom error types for better error handling
export class TextAnalyzerError extends Error {
  constructor(message: string, public readonly code: string, public readonly details?: any) {
    super(message);
    this.name = 'TextAnalyzerError';
    // Maintains proper stack trace for where our error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, TextAnalyzerError);
    }
  }
}

export class ApiError extends TextAnalyzerError {
  constructor(message: string, public readonly statusCode?: number, details?: any) {
    super(message, 'API_ERROR', details);
    this.name = 'ApiError';
  }
}

export class ValidationError extends TextAnalyzerError {
  constructor(message: string, field?: string) {
    super(message, 'VALIDATION_ERROR', { field });
    this.name = 'ValidationError';
  }
}

export class RateLimitError extends ApiError {
  constructor(retryAfter?: number) {
    super('Rate limit exceeded', 429, { retryAfter });
    this.name = 'RateLimitError';
  }
}

// Configuration for retry logic
const DEFAULT_RETRY_CONFIG = {
  maxRetries: 3,
  initialDelayMs: 1000,
  maxDelayMs: 10000,
  factor: 2,
};

type RetryConfig = typeof DEFAULT_RETRY_CONFIG;

// Helper function for exponential backoff
const sleep = (ms: number) => setTimeout(ms);

// Helper function to determine if error is retryable
const isRetryableError = (error: any): boolean => {
  // Network errors, timeouts, and rate limits are retryable
  if (error.code === 'ECONNABORTED' || 
      error.code === 'ETIMEDOUT' || 
      error instanceof RateLimitError) {
    return true;
  }
  
  // 5xx errors are retryable
  if (error.statusCode && error.statusCode >= 500) {
    return true;
  }
  
  return false;
};

// Helper function to implement retry logic
const withRetry = async <T>(
  fn: () => Promise<T>,
  config: RetryConfig = DEFAULT_RETRY_CONFIG
): Promise<T> => {
  let lastError: Error = new Error('Unknown error occurred during retry');
  let attempt = 0;
  
  while (attempt <= config.maxRetries) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      
      if (!isRetryableError(error) || attempt === config.maxRetries) {
        break;
      }
      
      // Calculate delay with exponential backoff and jitter
      const delay = Math.min(
        config.initialDelayMs * Math.pow(config.factor, attempt) * (0.5 + Math.random() * 0.5),
        config.maxDelayMs
      );
      
      console.warn(`Attempt ${attempt + 1} failed. Retrying in ${Math.round(delay)}ms...`, error);
      await sleep(delay);
      
      attempt++;
    }
  }
  
  throw lastError;
};

// Interfaces for text analysis results
export interface TopicModelingResult {
  topics: Array<{
    name: string;
    keywords: string[];
    score: number;  // 0-1 relevance score
  }>;
  dominantTopic: string;
  confidence: number;
  source: 'local' | 'openai' | 'cached';
  processingTimeMs?: number;
}

export interface IntentDetectionResult {
  primaryIntent: string;
  intents: Array<{
    intent: string;
    score: number;  // 0-1 confidence score
  }>;
  confidence: number;
  source: 'local' | 'openai' | 'cached';
  processingTimeMs?: number;
}

export interface ContentSummaryResult {
  shortSummary: string;
  detailedSummary?: string;
  keyPoints: string[];
  sentiment: 'positive' | 'negative' | 'neutral';
  source: 'local' | 'openai' | 'cached';
  processingTimeMs?: number;
}

export interface TextAnalyzerConfig {
  useLocalModel: boolean;
  openaiApiKey?: string;
  confidenceThreshold: number;
  maxCacheSize: number;
  cacheTtlMs: number;
  costTrackingEnabled: boolean;
}

/**
 * TextAnalyzer: Hybrid local/OpenAI text analysis with caching and metrics.
 */
export class TextAnalyzer {
  private config: TextAnalyzerConfig;
  private cache: Cache<string, TopicModelingResult | IntentDetectionResult | ContentSummaryResult>;
  private costTracking = {
    localAnalysisCount: 0,
    openaiAnalysisCount: 0,
    cacheHitCount: 0,
    totalTokensUsed: 0,
    estimatedCost: 0,  // In USD
  };
  private topicKeywords: Record<string, string[]> = {
    technology: ['tech', 'software', 'app', 'digital', 'ai', 'code', 'programming', 'computer', 'device', 'smartphone', 'innovation'],
    lifestyle: ['life', 'living', 'style', 'fashion', 'trends', 'home', 'decor', 'design', 'wellness', 'self-care'],
    business: ['business', 'startup', 'entrepreneur', 'market', 'finance', 'investment', 'money', 'economy', 'profit', 'revenue'],
    health: ['health', 'fitness', 'exercise', 'diet', 'workout', 'nutrition', 'wellness', 'medical', 'body', 'mental'],
    entertainment: ['entertainment', 'movie', 'music', 'show', 'celebrity', 'film', 'tv', 'streaming', 'series', 'artist', 'actor'],
    food: ['food', 'recipe', 'cooking', 'baking', 'meal', 'restaurant', 'cuisine', 'dish', 'chef', 'ingredient', 'delicious'],
    travel: ['travel', 'destination', 'trip', 'vacation', 'hotel', 'flight', 'tourism', 'adventure', 'explore', 'journey'],
    education: ['education', 'learning', 'school', 'student', 'college', 'university', 'study', 'academic', 'knowledge', 'teacher'],
    gaming: ['game', 'gaming', 'player', 'esports', 'console', 'pc', 'mobile', 'multiplayer', 'character', 'level', 'play'],
    sports: ['sports', 'team', 'player', 'match', 'game', 'league', 'championship', 'tournament', 'athlete', 'coach', 'fan'],
  };
  private intentKeywords: Record<string, string[]> = {
    question: ['what', 'how', 'why', 'when', 'where', 'who', 'which', '?'],
    promotion: ['buy', 'sale', 'discount', 'offer', 'deal', 'shop', 'order', 'free', 'save', 'now'],
    engagement: ['like', 'comment', 'share', 'follow', 'subscribe', 'tag', 'mention', 'retweet'],
    informative: ['news', 'update', 'report', 'announce', 'inform', 'learn', 'discover', 'insight'],
    feedback: ['feedback', 'opinion', 'review', 'suggestion', 'rate', 'experience'],
  };

  private retryConfig: RetryConfig;

  constructor(config: TextAnalyzerConfig) {
    // Validate configuration
    this.validateConfig(config);
    
    this.config = {
      useLocalModel: config.useLocalModel ?? true,
      openaiApiKey: config.openaiApiKey,
      confidenceThreshold: config.confidenceThreshold ?? 0.7,
      maxCacheSize: config.maxCacheSize ?? 100,
      cacheTtlMs: config.cacheTtlMs ?? 3600000, // 1 hour
      costTrackingEnabled: config.costTrackingEnabled ?? true,
    };
    
    this.retryConfig = {
      ...DEFAULT_RETRY_CONFIG,
      ...(config as any).retryConfig,
    };
    
    try {
      this.cache = new Cache<string, TopicModelingResult | IntentDetectionResult | ContentSummaryResult>({
        maxSize: this.config.maxCacheSize,
        ttl: this.config.cacheTtlMs,
      });
    } catch (error) {
      throw new TextAnalyzerError(
        'Failed to initialize cache', 
        'CACHE_INIT_ERROR', 
        { originalError: error }
      );
    }
  }

  // --- Utility Methods ---

  private hashContent(content: string): string {
    return crypto.createHash('sha256').update(content).digest('hex');
  }

  private normalizeText(text: string): string {
    return text.toLowerCase().replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim();
  }

  private updateMetrics(type: 'local' | 'openai' | 'cache', tokensUsed = 0, cost = 0) {
    if (!this.config.costTrackingEnabled) return;
    if (type === 'local') this.costTracking.localAnalysisCount++;
    if (type === 'openai') {
      this.costTracking.openaiAnalysisCount++;
      this.costTracking.totalTokensUsed += tokensUsed;
      this.costTracking.estimatedCost += cost;
    }
    if (type === 'cache') this.costTracking.cacheHitCount++;
  }

  public getMetrics() {
    return { ...this.costTracking };
  }
  public resetMetrics() {
    this.costTracking = {
      localAnalysisCount: 0,
      openaiAnalysisCount: 0,
      cacheHitCount: 0,
      totalTokensUsed: 0,
      estimatedCost: 0,
    };
  }

  // --- Topic Modeling ---

  private modelTopicsLocally(text: string): TopicModelingResult {
    this.updateMetrics('local');
    const scores: Record<string, number> = {};
    const normalized = this.normalizeText(text);
    Object.entries(this.topicKeywords).forEach(([topic, keywords]) => {
      scores[topic] = keywords.reduce((sum, keyword) => sum + (normalized.includes(keyword) ? 1 : 0), 0);
    });
    const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
    const dominantTopic = sorted[0]?.[0] || 'other';
    const total = sorted.reduce((acc, [, v]) => acc + v, 0) || 1;
    const topics = sorted.map(([name, score]) => ({
      name,
      keywords: this.topicKeywords[name] || [],
      score: score / total,
    }));
    return {
      topics,
      dominantTopic,
      confidence: Math.min(1, sorted[0]?.[1] / (total || 1)),
      source: 'local',
    };
  }

  private validateConfig(config: Partial<TextAnalyzerConfig>): void {
    if (config.confidenceThreshold !== undefined && (config.confidenceThreshold < 0 || config.confidenceThreshold > 1)) {
      throw new ValidationError('Confidence threshold must be between 0 and 1', 'confidenceThreshold');
    }
    
    if (config.maxCacheSize !== undefined && config.maxCacheSize < 1) {
      throw new ValidationError('Max cache size must be at least 1', 'maxCacheSize');
    }
    
    if (config.cacheTtlMs !== undefined && config.cacheTtlMs < 0) {
      throw new ValidationError('Cache TTL must be a positive number', 'cacheTtlMs');
    }
  }

  private async withApiErrorHandling<T>(
    operation: string,
    fn: () => Promise<T>,
    fallback?: () => T
  ): Promise<T> {
    try {
      return await withRetry(fn, this.retryConfig);
    } catch (error: any) {
      // Handle rate limits specifically
      if (error.status === 429) {
        const retryAfter = error.response?.headers?.['retry-after'];
        throw new RateLimitError(Number(retryAfter));
      }
      
      // Handle API errors
      if (error.status) {
        throw new ApiError(
          `API error during ${operation}: ${error.message}`,
          error.status,
          { 
            code: error.code,
            details: error.response?.data 
          }
        );
      }
      
      // If we have a fallback, use it
      if (fallback) {
        console.warn(`Falling back to alternative implementation after error: ${error.message}`);
        return fallback();
      }
      
      // Otherwise, rethrow with more context
      throw new TextAnalyzerError(
        `Error during ${operation}: ${error.message}`,
        'ANALYSIS_ERROR',
        { originalError: error }
      );
    }
  }

  private async modelTopicsWithOpenAI(text: string): Promise<TopicModelingResult> {
    if (!this.config.openaiApiKey) {
      throw new ValidationError('OpenAI API key is required for AI analysis');
    }

    return this.withApiErrorHandling<TopicModelingResult>(
      'topic modeling',
      async () => {
        this.updateMetrics('openai');
        const { OpenAI } = await import('openai');
        const openai = new OpenAI({ 
          apiKey: this.config.openaiApiKey,
          timeout: 10000, // 10 second timeout
        });
        
        const truncated = text.slice(0, 2000);
        const prompt: ChatCompletionMessageParam[] = [
          { 
            role: 'system', 
            content: 'You are an expert social media content analyst.' 
          },
          { 
            role: 'user', 
            content: `Analyze the following content and extract up to 3 main topics, keywords, and a confidence score (0-1). Respond as JSON: { topics: [{ name, keywords, score }], dominantTopic, confidence }\n\nContent: """${truncated}"""`
          }
        ];

        const response = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: prompt,
          temperature: 0.2,
          max_tokens: 256,
        });

        if (!response.choices?.[0]?.message?.content) {
          throw new Error('No content in OpenAI response');
        }

        try {
          const json = JSON.parse(response.choices[0].message.content);
          return {
            ...json,
            source: 'openai',
          };
        } catch (parseError) {
          throw new TextAnalyzerError(
            'Failed to parse OpenAI response',
            'PARSE_ERROR',
            { response: response.choices[0].message.content }
          );
        }
      },
      // Fallback to local processing if OpenAI fails
      () => this.modelTopicsLocally(text)
    );
  }

  public async modelTopics(text: string, forceAI = false): Promise<TopicModelingResult> {
    const normalized = this.normalizeText(text);
    const cacheKey = `topics_${this.hashContent(normalized)}`;
    const cached = this.cache.get(cacheKey);
    if (cached) {
      this.updateMetrics('cache');
      return { ...cached as TopicModelingResult, source: 'cached' };
    }
    let result = this.config.useLocalModel && !forceAI
      ? this.modelTopicsLocally(normalized)
      : undefined;
    if (!result || result.confidence < this.config.confidenceThreshold || forceAI) {
      try {
        result = await this.modelTopicsWithOpenAI(text);
      } catch (e) {
        if (!result) throw e;
      }
    }
    this.cache.set(cacheKey, result);
    return result;
  }

  // --- Intent Detection ---

  private detectIntentLocally(text: string): IntentDetectionResult {
    this.updateMetrics('local');
    const normalized = this.normalizeText(text);
    const scores: Record<string, number> = {};
    Object.entries(this.intentKeywords).forEach(([intent, keywords]) => {
      scores[intent] = keywords.reduce((sum, keyword) => sum + (normalized.includes(keyword) ? 1 : 0), 0);
    });
    const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
    const primaryIntent = sorted[0]?.[0] || 'other';
    const total = sorted.reduce((acc, [, v]) => acc + v, 0) || 1;
    const intents = sorted.map(([intent, score]) => ({ intent, score: score / total }));
    return {
      primaryIntent,
      intents,
      confidence: Math.min(1, sorted[0]?.[1] / (total || 1)),
      source: 'local',
    };
  }

  private async detectIntentWithOpenAI(text: string): Promise<IntentDetectionResult> {
    this.updateMetrics('openai');
    if (!this.config.openaiApiKey) throw new Error('OpenAI API key required');
    const { OpenAI } = await import('openai');
    const openai = new OpenAI({ apiKey: this.config.openaiApiKey });
    const truncated = text.slice(0, 2000);
    const prompt: ChatCompletionMessageParam[] = [
      { role: 'system', content: 'You are an expert at social media intent detection.' },
      { role: 'user', content: `Identify the primary intent and all possible intents in the following content, with confidence scores (0-1). Respond as JSON: { primaryIntent, intents: [{ intent, score }], confidence }\n\nContent: """${truncated}"""` }
    ];
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: prompt,
      temperature: 0.2,
      max_tokens: 256,
    });
    const json = JSON.parse(response.choices[0].message.content || '{}');
    return {
      ...json,
      source: 'openai',
    };
  }

  public async detectIntent(text: string, forceAI = false): Promise<IntentDetectionResult> {
    const normalized = this.normalizeText(text);
    const cacheKey = `intent_${this.hashContent(normalized)}`;
    const cached = this.cache.get(cacheKey);
    if (cached) {
      this.updateMetrics('cache');
      return { ...cached as IntentDetectionResult, source: 'cached' };
    }
    let result = this.config.useLocalModel && !forceAI
      ? this.detectIntentLocally(normalized)
      : undefined;
    if (!result || result.confidence < this.config.confidenceThreshold || forceAI) {
      try {
        result = await this.detectIntentWithOpenAI(text);
      } catch (e) {
        if (!result) throw e;
      }
    }
    this.cache.set(cacheKey, result);
    return result;
  }

  // --- Content Summarization ---

  private summarizeContentLocally(text: string): ContentSummaryResult {
    this.updateMetrics('local');
    const normalized = this.normalizeText(text);
    // Simple summary: first sentence, key words, basic sentiment
    const shortSummary = text.split(/[.!?]/)[0] || text.slice(0, 100);
    const keyPoints = Array.from(new Set(normalized.split(' '))).slice(0, 5);
    let sentiment: 'positive' | 'negative' | 'neutral' = 'neutral';
    if (/good|great|excellent|love|happy|success/.test(normalized)) sentiment = 'positive';
    if (/bad|poor|hate|fail|sad|problem/.test(normalized)) sentiment = 'negative';
    return {
      shortSummary,
      keyPoints,
      sentiment,
      source: 'local',
    };
  }

  private async summarizeContentWithOpenAI(text: string): Promise<ContentSummaryResult> {
    this.updateMetrics('openai');
    if (!this.config.openaiApiKey) throw new Error('OpenAI API key required');
    const { OpenAI } = await import('openai');
    const openai = new OpenAI({ apiKey: this.config.openaiApiKey });
    const truncated = text.slice(0, 2000);
    const prompt: ChatCompletionMessageParam[] = [
      { role: 'system', content: 'You are an expert social media content summarizer.' },
      { role: 'user', content: `Summarize the following content. Provide a short summary, key points, and sentiment (positive/negative/neutral) as JSON: { shortSummary, keyPoints, sentiment }\n\nContent: """${truncated}"""` }
    ];
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: prompt,
      temperature: 0.2,
      max_tokens: 256,
    });
    const json = JSON.parse(response.choices[0].message.content || '{}');
    return {
      ...json,
      source: 'openai',
    };
  }

  public async summarizeContent(text: string, forceAI = false): Promise<ContentSummaryResult> {
    const normalized = this.normalizeText(text);
    const cacheKey = `summary_${this.hashContent(normalized)}`;
    const cached = this.cache.get(cacheKey);
    if (cached) {
      this.updateMetrics('cache');
      return { ...cached as ContentSummaryResult, source: 'cached' };
    }
    let result = this.config.useLocalModel && !forceAI
      ? this.summarizeContentLocally(text)
      : undefined;
    if (!result || forceAI) {
      try {
        result = await this.summarizeContentWithOpenAI(text);
      } catch (e) {
        if (!result) throw e;
      }
    }
    this.cache.set(cacheKey, result);
    return result;
  }

  // --- Hashtag Recommendation ---

  public getRelevantHashtags(topic: string, platform: Platform): string[] {
    const hashtags: Record<string, Record<string, string[]>> = {
      instagram: {
        technology: ['#tech', '#innovation', '#digital'],
        lifestyle: ['#lifestyle', '#fashion', '#wellness'],
        business: ['#business', '#startup', '#entrepreneur'],
        // ...
      },
      twitter: {
        technology: ['#tech', '#AI', '#programming'],
        lifestyle: ['#lifestyle', '#trending', '#health'],
        business: ['#business', '#finance', '#startups'],
        // ...
      },
    };
    return hashtags[platform]?.[topic] || ['#social', '#trending'];
  }
}
