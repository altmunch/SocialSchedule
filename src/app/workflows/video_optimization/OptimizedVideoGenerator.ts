// OptimizedVideoGenerator.ts
// Uses the output of VideoOptimizationAnalysisService and user preferences to generate
// actual captions (with product links), hashtags, and audio suggestions via GPT-4-turbo.
// Designed for cost efficiency and high-quality returns.

import { VideoOptimizationAnalysisData } from '../data_analysis/types/analysis_types';

export interface UserPreferences {
  tone?: 'casual' | 'professional' | 'friendly' | 'authoritative';
  language?: string;
  includeCTA?: boolean;
  maxCaptionLength?: number;
  userId: string;
  platform?: string;
}

interface CacheEntry {
  data: OptimizedVideoContent;
  timestamp: number;
}

interface RateLimitEntry {
  count: number;
  resetAt: number;
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
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${openAIApiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-4-turbo',
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 500,
      temperature: 0.7
    })
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.statusText}`);
  }

  const data = await response.json();
  // The model's response should be a JSON string in the content field
  let content: any;
  try {
    content = JSON.parse(data.choices[0].message.content);
  } catch (err) {
    throw new Error('Failed to parse AI response as JSON');
  }
  return content as OptimizedVideoContent;
}
