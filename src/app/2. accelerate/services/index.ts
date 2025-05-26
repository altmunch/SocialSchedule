// Export all services from the Accelerate module
export * from './ContentOptimizer';
export * from './AudioTrendAnalyzer';

// Main Accelerate service that orchestrates content optimization
export class AccelerateService {
  private contentOptimizer: ContentOptimizer;
  private audioAnalyzer: AudioTrendAnalyzer;
  private isInitialized = false;

  constructor(
    private readonly openaiApiKey: string,
    private readonly redisUrl: string = 'redis://localhost:6379'
  ) {
    this.contentOptimizer = new ContentOptimizer(openaiApiKey, redisUrl);
    this.audioAnalyzer = new AudioTrendAnalyzer(redisUrl);
  }

  /**
   * Initialize the Accelerate service and its dependencies
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    
    try {
      await Promise.all([
        this.contentOptimizer.initialize(),
        this.audioAnalyzer.initialize()
      ]);
      
      this.isInitialized = true;
      console.log('AccelerateService initialized successfully');
    } catch (error) {
      console.error('Failed to initialize AccelerateService:', error);
      throw error;
    }
  }

  /**
   * Optimize content with AI-generated hooks and trending audio
   */
  async optimizeContent(
    topic: string,
    options: {
      tone?: 'curiosity' | 'urgency' | 'humor' | 'surprise';
      targetBpm?: number;
      targetMood?: string;
      maxHooks?: number;
      maxAudioSuggestions?: number;
    } = {}
  ): Promise<{
    hooks: string[];
    keywords: string[];
    viralityScore: number;
    audioSuggestions: TrendingAudio[];
  }> {
    if (!this.isInitialized) {
      throw new Error('AccelerateService not initialized. Call initialize() first.');
    }

    // Generate hooks
    const hookResult = await this.contentOptimizer.generateHooks({
      topic,
      tone: options.tone,
      numHooks: options.maxHooks || 5,
    });

    // Find matching audio
    const audioSuggestions = await this.audioAnalyzer.findMatchingAudio(
      hookResult.hooks.join(' '),
      {
        targetBpm: options.targetBpm,
        targetMood: options.targetMood,
        maxResults: options.maxAudioSuggestions || 3,
      }
    );

    return {
      ...hookResult,
      audioSuggestions,
    };
  }

  /**
   * Clean up resources
   */
  async cleanup(): Promise<void> {
    await Promise.all([
      this.contentOptimizer.cleanup(),
      this.audioAnalyzer.cleanup(),
    ]);
    this.isInitialized = false;
  }
}

// Re-export types for convenience
export * from './ContentOptimizer';
export * from './AudioTrendAnalyzer';
