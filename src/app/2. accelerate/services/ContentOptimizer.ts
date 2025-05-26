// difficult: AI-powered content optimization engine for generating high-engagement hooks
import { Configuration, OpenAIApi } from 'openai';
import { createClient } from 'redis';
import * as tf from '@tensorflow/tfjs';
import * as use from '@tensorflow-models/universal-sentence-encoder';
import { KeyBERT } from 'keybert-js';

// Types
export interface HookOptions {
  topic: string;
  tone?: 'curiosity' | 'urgency' | 'humor' | 'surprise';
  maxLength?: number;
  numHooks?: number;
}

export interface HookResult {
  hooks: string[];
  keywords: string[];
  viralityScore: number;
}

// Cache interface
interface CacheItem<T> {
  data: T;
  expires: number;
}

export class ContentOptimizer {
  private openai: OpenAIApi;
  private redisClient: ReturnType<typeof createClient>;
  private useModel: use.UniversalSentenceEncoder | null = null;
  private keybert: KeyBERT;
  private cache: Map<string, CacheItem<any>> = new Map();
  private readonly CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

  constructor(openaiApiKey: string, redisUrl: string = 'redis://localhost:6379') {
    const configuration = new Configuration({
      apiKey: openaiApiKey,
    });
    this.openai = new OpenAIApi(configuration);
    
    // Initialize Redis client
    this.redisClient = createClient({ url: redisUrl });
    this.redisClient.on('error', (err) => 
      console.error('Redis Client Error', err)
    );
    
    // Initialize KeyBERT for keyword extraction
    this.keybert = new KeyBERT({
      model: 'all-MiniLM-L6-v2',
    });
  }

  /**
   * Initialize the Universal Sentence Encoder model
   */
  async initialize(): Promise<void> {
    try {
      await this.redisClient.connect();
      this.useModel = await use.load();
      console.log('ContentOptimizer initialized successfully');
    } catch (error) {
      console.error('Failed to initialize ContentOptimizer:', error);
      throw error;
    }
  }

  /**
   * Generate engaging hooks based on topic and options
   */
  async generateHooks(options: HookOptions): Promise<HookResult> {
    const { topic, tone = 'curiosity', maxLength = 150, numHooks = 5 } = options;
    const cacheKey = `hook:${topic}:${tone}:${maxLength}:${numHooks}`;
    
    // Try to get from cache first
    const cached = await this.getFromCache<HookResult>(cacheKey);
    if (cached) {
      return cached;
    }

    // Generate hooks using GPT-4
    const hooks = await this.generateHooksWithGPT4(topic, tone, numHooks, maxLength);
    
    // Extract keywords
    const keywords = await this.extractKeywords(hooks.join(' '));
    
    // Calculate virality score
    const viralityScore = await this.calculateViralityScore(hooks, keywords);
    
    const result: HookResult = {
      hooks,
      keywords,
      viralityScore,
    };

    // Cache the result
    await this.setCache(cacheKey, result);
    
    return result;
  }

  /**
   * Generate hooks using GPT-4
   * @private
   */
  private async generateHooksWithGPT4(
    topic: string,
    tone: string,
    count: number,
    maxLength: number
  ): Promise<string[]> {
    try {
      const prompt = this.buildHookPrompt(topic, tone, count, maxLength);
      
      const response = await this.openai.createChatCompletion({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an expert at creating engaging social media hooks that drive engagement and clicks.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.8,
        max_tokens: maxLength * 2,
        n: 1,
      });

      const content = response.data.choices[0]?.message?.content || '';
      return this.parseHooksFromResponse(content, count);
    } catch (error) {
      console.error('Error generating hooks with GPT-4:', error);
      throw new Error('Failed to generate hooks');
    }
  }

  /**
   * Build the prompt for hook generation
   * @private
   */
  private buildHookPrompt(topic: string, tone: string, count: number, maxLength: number): string {
    const toneInstructions: Record<string, string> = {
      curiosity: 'Create curiosity by teasing valuable information without giving everything away.',
      urgency: 'Create a sense of urgency with time-sensitive language.',
      humor: 'Use humor and wit to make the content more engaging.',
      surprise: 'Include surprising facts or counterintuitive information.'
    };

    return `
      Generate ${count} engaging social media hooks about "${topic}".
      
      Tone: ${toneInstructions[tone] || toneInstructions.curiosity}
      
      Guidelines:
      - Each hook should be no more than ${maxLength} characters
      - Start with attention-grabbing phrases
      - Use power words that evoke emotion
      - Include numbers when possible (e.g., "5 Ways to...")
      - End with a cliffhanger or call-to-action
      
      Format your response with each hook on a new line, prefixed with "1. ", "2. ", etc.
      
      Example:
      1. Discover the secret to [topic] that experts don't want you to know!
      2. 5 [topic] hacks that will change your life forever!
      
      Now generate ${count} hooks about "${topic}":
    `;
  }

  /**
   * Parse hooks from GPT-4 response
   * @private
   */
  private parseHooksFromResponse(content: string, expectedCount: number): string[] {
    // Extract hooks from numbered list
    const hooks = content
      .split('\n')
      .map(line => line.replace(/^\d+\.\s*/, '').trim())
      .filter(line => line.length > 0);

    // Ensure we have the expected number of hooks
    return hooks.slice(0, expectedCount);
  }

  /**
   * Extract keywords from text using KeyBERT
   * @private
   */
  private async extractKeywords(text: string, topN: number = 5): Promise<string[]> {
    try {
      const keywords = await this.keybert.extractKeywords(text, {
        keyphrase_ngram_range: [1, 2],
        stop_words: 'english',
        top_n: topN,
        use_mmr: true,
        diversity: 0.7
      });
      
      return keywords.map(k => k[0]);
    } catch (error) {
      console.error('Error extracting keywords:', error);
      return [];
    }
  }

  /**
   * Calculate virality score for hooks
   * @private
   */
  private async calculateViralityScore(hooks: string[], keywords: string[]): Promise<number> {
    if (!this.useModel) {
      throw new Error('Universal Sentence Encoder not initialized');
    }

    try {
      // Calculate average hook length (normalized)
      const avgLength = hooks.reduce((sum, hook) => sum + hook.length, 0) / (hooks.length * 150);
      
      // Calculate keyword density
      const content = hooks.join(' ').toLowerCase();
      const keywordDensity = keywords
        .map(k => (content.match(new RegExp(k.toLowerCase(), 'g')) || []).length)
        .reduce((sum, count) => sum + count, 0) / (content.split(/\s+/).length || 1);
      
      // Calculate emotional impact (placeholder - could be enhanced with sentiment analysis)
      const emotionalImpact = 0.5; // Placeholder
      
      // Combine factors with weights
      const score = (
        (avgLength * 0.3) +
        (keywordDensity * 0.4) +
        (emotionalImpact * 0.3)
      );
      
      // Ensure score is between 0 and 1
      return Math.min(Math.max(score, 0), 1);
    } catch (error) {
      console.error('Error calculating virality score:', error);
      return 0.5; // Default score on error
    }
  }

  /**
   * Get value from cache
   * @private
   */
  private async getFromCache<T>(key: string): Promise<T | null> {
    try {
      // Try Redis first
      const cached = await this.redisClient.get(key);
      if (cached) {
        const { data, expires } = JSON.parse(cached) as CacheItem<T>;
        if (expires > Date.now()) {
          return data;
        }
        await this.redisClient.del(key);
      }
      
      // Fallback to in-memory cache
      const inMemory = this.cache.get(key);
      if (inMemory && inMemory.expires > Date.now()) {
        return inMemory.data as T;
      }
      if (inMemory) {
        this.cache.delete(key);
      }
      
      return null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  /**
   * Set value in cache
   * @private
   */
  private async setCache(key: string, data: any): Promise<void> {
    const item: CacheItem<typeof data> = {
      data,
      expires: Date.now() + this.CACHE_TTL_MS
    };
    
    try {
      // Set in Redis
      await this.redisClient.set(
        key,
        JSON.stringify(item),
        { EX: Math.ceil(this.CACHE_TTL_MS / 1000) }
      );
      
      // Also keep in memory for fast access
      this.cache.set(key, item);
    } catch (error) {
      console.error('Cache set error:', error);
      // Fallback to in-memory cache
      this.cache.set(key, item);
    }
  }

  /**
   * Clean up resources
   */
  async cleanup(): Promise<void> {
    try {
      await this.redisClient.quit();
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
    this.cache.clear();
  }
}
