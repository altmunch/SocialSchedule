import { VideoOptimizationAnalysisData } from '../data_analysis/types/analysis_types';

export interface UserPreferences {
  tone?: 'casual' | 'professional' | 'friendly' | 'authoritative';
  language?: string;
  includeCTA?: boolean;
  maxCaptionLength?: number;
  userId: string;
  platform?: string;
}

export interface ProductLink {
  name: string;
  url: string;
  description?: string;
}

export interface OptimizedVideoContent {
  captions: {
    main: string;
    alternatives: string[];
  };
  hashtags: string[];
  audio: {
    suggestion: string;
    reason: string;
  };
}

interface CacheEntry {
  data: OptimizedVideoContent;
  timestamp: number;
}

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

export class OptimizedVideoGenerator {
  private cache = new Map<string, CacheEntry>();
  private rateLimits = new Map<string, RateLimitEntry>();
  private readonly CACHE_TTL = 6 * 60 * 60 * 1000; // 6 hours
  private readonly RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
  private readonly MAX_REQUESTS_PER_MINUTE = 20;

  constructor(private apiKey: string) {
    if (!apiKey) {
      throw new Error('API key is required');
    }
  }

  private getCacheKey(analysis: VideoOptimizationAnalysisData, productLink: ProductLink, prefs: UserPreferences): string {
    return JSON.stringify({
      captions: analysis.topPerformingVideoCaptions.slice(0, 3),
      hashtags: analysis.trendingHashtags.slice(0, 5).map(h => h.tag),
      audioIds: analysis.audioViralityAnalysis?.slice(0, 2).map(a => 'audioId' in a ? a.audioId : ''),
      product: productLink.url,
      prefs: {
        tone: prefs.tone,
        language: prefs.language,
        includeCTA: prefs.includeCTA,
        maxCaptionLength: prefs.maxCaptionLength
      }
    });
  }

  private validateInput(analysis: VideoOptimizationAnalysisData, userId: string): void {
    if (!analysis?.topPerformingVideoCaptions?.length) {
      throw new Error('No video captions available for analysis');
    }
    if (!analysis.trendingHashtags?.length) {
      console.warn('No trending hashtags found');
    }
    if (!userId) {
      throw new Error('User ID is required for rate limiting');
    }
  }

  private checkRateLimit(userId: string): void {
    const now = Date.now();
    let userLimit = this.rateLimits.get(userId);
    
    if (!userLimit || now > userLimit.resetAt) {
      userLimit = { count: 0, resetAt: now + this.RATE_LIMIT_WINDOW };
    }
    
    if (++userLimit.count > this.MAX_REQUESTS_PER_MINUTE) {
      throw new Error(`Rate limit exceeded. Please try again in ${Math.ceil((userLimit.resetAt - now) / 1000)} seconds.`);
    }
    
    this.rateLimits.set(userId, userLimit);
  }

  private buildPrompt(
    analysis: VideoOptimizationAnalysisData,
    productLink: ProductLink,
    userPreferences: UserPreferences
  ): string {
    const captions = analysis.topPerformingVideoCaptions.slice(0, 3);
    const hashtags = analysis.trendingHashtags.slice(0, 5).map(h => h.tag);
    const audioTrends = analysis.audioViralityAnalysis?.slice(0, 2) || [];
    const tone = userPreferences.tone || 'casual';
    const language = userPreferences.language || 'English';
    const includeCTA = userPreferences.includeCTA !== false;
    const maxCaptionLength = userPreferences.maxCaptionLength || 180;
  
    return [
      `You are an expert social media copywriter and strategist.`,
      `Generate a JSON object for a viral short-form video post.`,
      `Requirements:`,
      `- Language: ${language}`,
      `- Tone: ${tone}`,
      `- Caption: 1 main caption (max ${maxCaptionLength} chars) + 2 alternatives.`,
      `- Include this product: ${productLink.name} (${productLink.url})${productLink.description ? ' - ' + productLink.description : ''}`,
      includeCTA ? `- End with a strong call-to-action.` : '',
      `- Use up to 5 relevant hashtags: ${hashtags.join(', ')}`,
      `- Suggest an audio track (from these trending: ${audioTrends.map(a => 'title' in a ? a.title : 'untitled').filter(Boolean).join(', ') || 'any trending audio'}).`,
      `- Avoid generic phrases, be concise and creative.`,
      `- Do NOT include any metadata or explanations.`,
      `- Output format:`,
      '{\n  "captions": {\n    "main": "...",\n    "alternatives": ["...", "..."]\n  },\n  "hashtags": ["...", "..."],\n  "audio": {\n    "suggestion": "...",\n    "reason": "..."\n  }\n}',
      '',
      `Context for this video:`,
      `Top performing captions: ${captions.join(' | ')}`,
      `Trending hashtags: ${hashtags.join(', ')}`,
      audioTrends.length ? `Trending audios: ${audioTrends.map(a => 'title' in a ? a.title : 'untitled').join(', ')}` : '',
      '',
      `Product link to include: ${productLink.url}`
    ].filter(Boolean).join('\n');
  }

  private async callAI(prompt: string): Promise<OptimizedVideoContent> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo-preview',
        messages: [
          { role: 'system', content: 'You are a helpful assistant that generates optimized social media content.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 500,
        temperature: 0.7,
        response_format: { type: 'json_object' }
      })
    });
  
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(`AI API error: ${error.error?.message || 'Unknown error'}`);
    }
  
    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    
    try {
      return JSON.parse(content) as OptimizedVideoContent;
    } catch (e) {
      console.error('Failed to parse AI response:', content);
      throw new Error('Failed to parse AI response');
    }
  }

  async generateOptimizedContent(
    analysis: VideoOptimizationAnalysisData,
    productLink: ProductLink,
    userPreferences: UserPreferences
  ): Promise<{ data?: OptimizedVideoContent; error?: string }> {
    try {
      this.validateInput(analysis, userPreferences.userId);
      this.checkRateLimit(userPreferences.userId);
      
      const cacheKey = this.getCacheKey(analysis, productLink, userPreferences);
      const cached = this.cache.get(cacheKey);
      
      if (cached && (Date.now() - cached.timestamp < this.CACHE_TTL)) {
        return { data: cached.data };
      }

      const prompt = this.buildPrompt(analysis, productLink, userPreferences);
      const content = await this.callAI(prompt);
      
      this.cache.set(cacheKey, { data: content, timestamp: Date.now() });
      return { data: content };
      
    } catch (error) {
      console.error('Error generating optimized content:', error);
      return { 
        error: error instanceof Error ? error.message : 'An unknown error occurred' 
      };
    }
  }
}
