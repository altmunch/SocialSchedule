import { createClient, RedisClientType } from 'redis';
import * as tf from '@tensorflow/tfjs-node';
import * as use from '@tensorflow-models/universal-sentence-encoder';
import { Configuration, OpenAIApi } from 'openai';
import { v4 as uuidv4 } from 'uuid';
import { Logger } from './Logger';
import OpenAI from 'openai';

// Type declarations for external modules
declare module '@tensorflow/tfjs' {
  namespace tf {
    export interface LayersModel {}
  }
}

declare module '@tensorflow-models/universal-sentence-encoder' {
  export class UniversalSentenceEncoder {
    encode(text: string): Promise<tf.Tensor>;
  }
}

type HookGenerationOptions = {
  tone?: 'professional' | 'casual' | 'humorous' | 'provocative';
  length?: 'short' | 'medium' | 'long';
  targetAudience?: string;
  maxRetries?: number;
};

type ViralityScoreFactors = {
  emotionalImpact: number;
  novelty: number;
  relevance: number;
  clarity: number;
  callToAction: number;
};

type CacheEntry = {
  content: string;
  score: number;
  keywords: string[];
  timestamp: number;
};

export class ContentOptimizerError extends Error {
  constructor(
    public type: 'API' | 'CACHE' | 'PROCESSING' | 'VALIDATION',
    message: string,
    public originalError?: unknown
  ) {
    super(message);
    this.name = 'ContentOptimizerError';
  }
}

export class ContentOptimizer {
  private openai: OpenAI;
  private redisClient: RedisClientType;
  private useModel: use.UniversalSentenceEncoder | null = null;
  private keybert: KeyBERT;
  private isInitialized = false;
  private logger: Logger;

  constructor(
    private config: {
      openaiApiKey: string;
      redisUrl: string;
      cacheTtl?: number;
      maxRetries?: number;
      timeout?: number;
    }
  ) {
    this.openai = new OpenAI({ apiKey: config.openaiApiKey });
    this.redisClient = createClient({ url: config.redisUrl });
    this.keybert = new KeyBERT();
    this.logger = new Logger('ContentOptimizer');
    this.config.cacheTtl = config.cacheTtl || 3600; // Default 1 hour
    this.config.maxRetries = config.maxRetries || 3;
    this.config.timeout = config.timeout || 10000;
  }

  /**
   * Initializes the ContentOptimizer by loading models and establishing connections
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      this.logger.warn('ContentOptimizer is already initialized');
      return;
    }

    try {
      this.logger.info('Initializing ContentOptimizer...');
      
      // Load TensorFlow models
      await tf.ready();
      this.useModel = await use.load();
      this.logger.info('Universal Sentence Encoder loaded successfully');

      // Initialize Redis connection
      await this.redisClient.connect();
      this.logger.info('Redis client connected successfully');

      this.isInitialized = true;
      this.logger.info('ContentOptimizer initialized successfully');
    } catch (error) {
      this.logger.error('Initialization failed', error);
      throw new ContentOptimizerError(
        'PROCESSING',
        'Failed to initialize ContentOptimizer',
        error
      );
    }
  }

  /**
   * Generates engaging hooks for social media content
   */
  async generateHooks(
    content: string,
    options: HookGenerationOptions = {}
  ): Promise<{ hooks: string[]; keywords: string[]; viralityScore: number }> {
    this.validateInitialized();
    this.validateContent(content);

    const cacheKey = this.generateCacheKey(content, options);
    try {
      const cached = await this.getFromCache(cacheKey);
      if (cached) {
        this.logger.debug('Returning cached results');
        return cached;
      }
    } catch (error) {
      this.logger.warn('Cache read failed, proceeding without cache', error);
    }

    try {
      const keywords = await this.extractKeywords(content);
      const hooks = await this.generateHooksWithRetry(content, keywords, options);
      const viralityScore = await this.calculateViralityScore(hooks[0], keywords);

      const result = {
        hooks,
        keywords,
        viralityScore,
      };

      try {
        await this.setInCache(cacheKey, result);
      } catch (error) {
        this.logger.warn('Cache write failed, continuing without caching', error);
      }

      return result;
    } catch (error) {
      this.logger.error('Failed to generate hooks', error);
      if (error instanceof ContentOptimizerError) {
        throw error;
      }
      throw new ContentOptimizerError(
        'API',
        'Failed to generate hooks',
        error
      );
    }
  }

  /**
   * Calculates virality score for a given piece of content
   */
  async calculateViralityScore(
    content: string,
    keywords: string[]
  ): Promise<number> {
    this.validateInitialized();
    this.validateContent(content);

    try {
      // Get embeddings for the content
      const embeddings = await this.useModel!.embed(content);
      const embeddingArray = await embeddings.array();

      // Simple scoring based on various factors
      const factors: ViralityScoreFactors = {
        emotionalImpact: this.calculateEmotionalImpact(content),
        novelty: this.calculateNoveltyScore(content, keywords),
        relevance: this.calculateRelevanceScore(content, keywords),
        clarity: this.calculateClarityScore(content),
        callToAction: this.calculateCallToActionScore(content),
      };

      // Calculate weighted score
      const weights = {
        emotionalImpact: 0.3,
        novelty: 0.25,
        relevance: 0.2,
        clarity: 0.15,
        callToAction: 0.1,
      };

      const score =
        factors.emotionalImpact * weights.emotionalImpact +
        factors.novelty * weights.novelty +
        factors.relevance * weights.relevance +
        factors.clarity * weights.clarity +
        factors.callToAction * weights.callToAction;

      return Math.min(Math.max(score, 0), 10); // Ensure score is between 0-10
    } catch (error) {
      this.logger.error('Failed to calculate virality score', error);
      throw new ContentOptimizerError(
        'PROCESSING',
        'Failed to calculate virality score',
        error
      );
    }
  }

  /**
   * Extracts keywords from content using OpenAI's API
   */
  private async extractKeywords(content: string): Promise<string[]> {
    this.validateInitialized();
    this.validateContent(content);

    try {
      const prompt = `Extract 5 most important keywords from this text:
      ${content}
      
      Only respond with a comma-separated list of keywords.`;
      
      const response = await this.openai.createChatCompletion({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 50,
      });

      const keywordsText = response.data.choices[0].message.content;
      return keywordsText.split(',').map(kw => kw.trim());
    } catch (error) {
      this.logger.error('Failed to extract keywords', error);
      throw new ContentOptimizerError(
        'API',
        'Failed to extract keywords',
        error
      );
    }
  }

  /**
   * Generates hooks with retry mechanism
   */
  private async generateHooksWithRetry(
    content: string,
    keywords: string[],
    options: HookGenerationOptions,
    attempt = 1
  ): Promise<string[]> {
    try {
      const prompt = this.buildHookGenerationPrompt(content, keywords, options);
      
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a social media expert specializing in creating high-engagement hooks.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 100,
        n: 5, // Generate 5 hooks
      });

      const hooks = response.choices
        .map((choice) => choice.message.content?.trim() || '')
        .filter((hook) => hook.length > 0);

      if (hooks.length === 0) {
        throw new Error('No hooks generated');
      }

      return hooks;
    } catch (error) {
      if (attempt >= (options.maxRetries || this.config.maxRetries!)) {
        throw error;
      }

      const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
      await new Promise((resolve) => setTimeout(resolve, delay));

      this.logger.warn(`Retrying hook generation (attempt ${attempt + 1})`);
      return this.generateHooksWithRetry(content, keywords, options, attempt + 1);
    }
  }

  /**
   * Builds the prompt for hook generation
   */
  private buildHookGenerationPrompt(
    content: string,
    keywords: string[],
    options: HookGenerationOptions
  ): string {
    const toneInstruction = options.tone
      ? `Use a ${options.tone} tone. `
      : '';
    const lengthInstruction = options.length
      ? `Keep it ${options.length} in length. `
      : '';
    const audienceInstruction = options.targetAudience
      ? `Target audience: ${options.targetAudience}. `
      : '';

    return `
      Generate 5 highly engaging social media hooks based on the following content and keywords.
      ${toneInstruction}${lengthInstruction}${audienceInstruction}
      Make them attention-grabbing and likely to drive engagement.
      
      Content:
      ${content}
      
      Keywords:
      ${keywords.join(', ')}
      
      Respond with just the hooks, each on a new line, without any numbering or additional text.
    `;
  }

  /**
   * Gets cached results if available
   */
  private async getFromCache(
    key: string
  ): Promise<{ hooks: string[]; keywords: string[]; viralityScore: number } | null> {
    try {
      const cached = await this.redisClient.get(key);
      if (!cached) return null;

      const parsed: CacheEntry = JSON.parse(cached);
      // Check if cache entry is still valid
      const now = Date.now();
      if (now - parsed.timestamp > (this.config.cacheTtl! * 1000)) {
        return null;
      }

      return {
        hooks: [parsed.content], // Cache stores single hook, we'll return it as array
        keywords: parsed.keywords,
        viralityScore: parsed.score,
      };
    } catch (error) {
      throw new ContentOptimizerError(
        'CACHE',
        'Failed to read from cache',
        error
      );
    }
  }

  /**
   * Sets results in cache
   */
  private async setInCache(
    key: string,
    value: { hooks: string[]; keywords: string[]; viralityScore: number }
  ): Promise<void> {
    try {
      const cacheEntry: CacheEntry = {
        content: value.hooks[0], // Store the first hook as representative
        score: value.viralityScore,
        keywords: value.keywords,
        timestamp: Date.now(),
      };

      await this.redisClient.set(
        key,
        JSON.stringify(cacheEntry),
        { EX: this.config.cacheTtl }
      );
    } catch (error) {
      throw new ContentOptimizerError(
        'CACHE',
        'Failed to write to cache',
        error
      );
    }
  }

  /**
   * Generates a cache key based on content and options
   */
  private generateCacheKey(
    content: string,
    options: HookGenerationOptions
  ): string {
    const optionsHash = Object.entries(options)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}:${v}`)
      .join('|');

    return `content_opt:${uuidv4()}:${this.simpleHash(content)}:${this.simpleHash(optionsHash)}`;
  }

  /**
   * Simple hash function for cache keys
   */
  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString(36);
  }

  /**
   * Validates that the content is not empty
   */
  private validateContent(content: string): void {
    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      throw new ContentOptimizerError(
        'VALIDATION',
        'Content cannot be empty'
      );
    }
  }

  /**
   * Validates that the optimizer is initialized
   */
  private validateInitialized(): void {
    if (!this.isInitialized) {
      throw new ContentOptimizerError(
        'VALIDATION',
        'ContentOptimizer must be initialized before use'
      );
    }
  }

  // Helper methods for virality score calculation
  private calculateEmotionalImpact(content: string): number {
    // Simple heuristic - count emotional words
    const emotionalWords = [
      'amazing', 'shocking', 'heartbreaking', 'incredible', 'unbelievable',
      'must-see', 'warning', 'alert', 'urgent', 'important'
    ];
    const matches = emotionalWords.filter(word => 
      content.toLowerCase().includes(word)
    ).length;
    return Math.min(matches / 2, 1) * 10; // Normalize to 0-10
  }

  private calculateNoveltyScore(content: string, keywords: string[]): number {
    // Placeholder - in a real implementation, this would compare against known content
    const uniqueKeywords = new Set(keywords).size;
    return Math.min(uniqueKeywords / 2, 1) * 10;
  }

  private calculateRelevanceScore(content: string, keywords: string[]): number {
    // Placeholder - would analyze how well keywords match content
    const keywordDensity = keywords.reduce((sum, keyword) => {
      const regex = new RegExp(keyword, 'gi');
      return sum + (content.match(regex)?.length || 0);
    }, 0) / content.length;
    return Math.min(keywordDensity * 100, 10);
  }

  private calculateClarityScore(content: string): number {
    // Simple heuristic based on sentence length and complexity
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    if (sentences.length === 0) return 0;
    
    const avgLength = sentences.reduce((sum, s) => sum + s.length, 0) / sentences.length;
    // Score higher for medium-length sentences (neither too short nor too long)
    const lengthScore = 1 - Math.abs(avgLength - 120) / 120;
    return lengthScore * 10;
  }

  private calculateCallToActionScore(content: string): number {
    // Check for common CTA phrases
    const ctaPhrases = [
      'check out', 'click here', 'learn more', 'find out', 'don\'t miss',
      'share this', 'comment below', 'let me know', 'tag someone'
    ];
    const hasCTA = ctaPhrases.some(phrase => 
      content.toLowerCase().includes(phrase)
    );
    return hasCTA ? 8 : 3; // Basic scoring
  }

  /**
   * Cleanup resources
   */
  async shutdown(): Promise<void> {
    try {
      if (this.redisClient) {
        await this.redisClient.quit();
      }
      this.isInitialized = false;
      this.logger.info('ContentOptimizer shutdown successfully');
    } catch (error) {
      this.logger.error('Error during shutdown', error);
      throw new ContentOptimizerError(
        'PROCESSING',
        'Failed to shutdown ContentOptimizer',
        error
      );
    }
  }
}