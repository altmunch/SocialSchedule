import { Platform } from '../../../deliverables/types/deliverables_types';
import { ContentNiche, getNicheCharacteristics } from '../../types/niche_types';

export interface DataCollectionTask {
  type: 'optimize_collection' | 'validate_quality' | 'discover_sources' | 'monitor_gaps';
  niche: ContentNiche;
  platform: Platform;
  priority: 'high' | 'medium' | 'low';
  requirements: {
    minSamples: number;
    qualityThreshold: number;
    timeRange: string;
    contentTypes: string[];
  };
  parameters?: Record<string, any>;
}

export interface DataQualityMetrics {
  completeness: number; // 0-1
  accuracy: number; // 0-1
  freshness: number; // 0-1
  uniqueness: number; // 0-1
  consistency: number; // 0-1
  relevance: number; // 0-1
  overallScore: number; // 0-1
}

export interface CollectionStrategy {
  platform: Platform;
  niche: ContentNiche;
  endpoints: string[];
  rateLimitOptimization: {
    requestsPerSecond: number;
    batchSize: number;
    cooldownPeriod: number;
  };
  contentDiscovery: {
    hashtags: string[];
    keywords: string[];
    influencers: string[];
    trendingTopics: boolean;
  };
  qualityFilters: {
    minEngagement: number;
    minFollowers: number;
    contentLength: { min: number; max: number };
    excludeSpam: boolean;
  };
  schedulingStrategy: {
    peakTimes: number[];
    frequency: string; // 'hourly', 'daily', 'weekly'
    priority: number; // 1-10
  };
}

export interface DataGap {
  niche: ContentNiche;
  platform: Platform;
  gapType: 'volume' | 'quality' | 'recency' | 'diversity';
  severity: 'critical' | 'high' | 'medium' | 'low';
  currentSamples: number;
  requiredSamples: number;
  recommendedActions: string[];
}

/**
 * Data Collection Optimization Agent
 * 
 * Specializes in maximizing data quality and volume for ML training.
 * Manages API optimization, content discovery, and quality validation.
 */
export class DataCollectionAgent {
  private isActive: boolean = false;
  private currentTask: DataCollectionTask | null = null;
  private collectionStrategies: Map<string, CollectionStrategy> = new Map();
  private qualityMetrics: Map<string, DataQualityMetrics> = new Map();
  private dataGaps: DataGap[] = [];
  private performanceScore: number = 0.8;
  private taskSuccessCount: number = 0;
  private taskFailureCount: number = 0;
  private totalTasksCompleted: number = 0;
  private resourceConsumptionHistory: number[] = [];

  constructor() {
    this.initializeCollectionStrategies();
    // Simulate initial data quality metrics for some platforms/niches
    this.qualityMetrics.set('instagram_fitness', {
      completeness: 0.85,
      accuracy: 0.92,
      freshness: 0.80,
      uniqueness: 0.95,
      consistency: 0.90,
      relevance: 0.88,
      overallScore: 0.88
    });
  }

  /**
   * Start the data collection agent
   */
  async start(): Promise<void> {
    this.isActive = true;
    console.log(`DataCollectionAgent started.`);
    // Initial analysis of data gaps
    await this.analyzeDataGaps();
    this.startGapMonitoring();
  }

  /**
   * Stop the data collection agent
   */
  async stop(): Promise<void> {
    this.isActive = false;
    this.currentTask = null;
    if (this.gapMonitoringInterval) {
      clearInterval(this.gapMonitoringInterval);
    }
    console.log(`DataCollectionAgent stopped.`);
  }

  /**
   * Execute a data collection task
   */
  async executeTask(task: DataCollectionTask): Promise<void> {
    this.currentTask = task;
    this.totalTasksCompleted++;
    const startTime = process.hrtime.bigint();

    try {
      switch (task.type) {
        case 'optimize_collection':
          await this.optimizeCollection(task);
          break;
        case 'validate_quality':
          await this.validateDataQuality(task);
          break;
        case 'discover_sources':
          await this.discoverDataSources(task);
          break;
        case 'monitor_gaps':
          await this.monitorDataGaps(task);
          break;
        default:
          console.warn(`Unknown task type for DataCollectionAgent: ${task.type}`);
          this.taskFailureCount++;
          break;
      }
      this.taskSuccessCount++;
    } catch (error) {
      console.error(`DataCollectionAgent task failed: ${error}`);
      this.taskFailureCount++;
    } finally {
      const endTime = process.hrtime.bigint();
      const durationMs = Number(endTime - startTime) / 1_000_000;
      this.recordResourceConsumption(durationMs);
      this.updatePerformanceScore();
      this.currentTask = null;
    }
  }

  /**
   * Optimize data collection for a specific niche and platform
   */
  private async optimizeCollection(task: DataCollectionTask): Promise<void> {
    const { niche, platform, requirements } = task;
    const strategyKey = `${niche}_${platform}`;
    
    // Get niche characteristics for optimization
    const nicheCharacteristics = getNicheCharacteristics(niche);
    
    // Create optimized collection strategy
    const strategy: CollectionStrategy = {
      platform,
      niche,
      endpoints: this.getOptimalEndpoints(platform),
      rateLimitOptimization: this.optimizeRateLimit(platform, nicheCharacteristics),
      contentDiscovery: this.optimizeContentDiscovery(niche, nicheCharacteristics),
      qualityFilters: this.optimizeQualityFilters(niche, requirements),
      schedulingStrategy: this.optimizeScheduling(niche, nicheCharacteristics),
    };

    // Store and apply the strategy
    this.collectionStrategies.set(strategyKey, strategy);
    
    // Simulate strategy implementation
    await this.implementStrategy(strategy);
    
    console.log(`📈 Collection strategy optimized for ${niche} on ${platform}:`, {
      endpoints: strategy.endpoints.length,
      rateLimit: strategy.rateLimitOptimization.requestsPerSecond,
      contentSources: strategy.contentDiscovery.hashtags.length,
      qualityThreshold: strategy.qualityFilters.minEngagement,
    });
  }

  /**
   * Validate data quality for collected content
   */
  private async validateDataQuality(task: DataCollectionTask): Promise<void> {
    console.log(`Validating data quality for ${task.niche} on ${task.platform}...`);

    // Simulate fetching real data based on requirements
    const collectedData = await this.fetchSimulatedData(task.platform, task.niche, task.requirements);

    // Calculate realistic quality metrics based on collected data and defined thresholds
    const completeness = Math.min(1, collectedData.length / task.requirements.minSamples + 0.1); // Closer to 1 if more data
    const accuracy = 0.90 + (Math.random() * 0.05); // High accuracy baseline with slight variance
    const freshness = Math.max(0.7, 1 - (Date.now() - collectedData[0]?.timestamp) / (1000 * 60 * 60 * 24 * 30)); // Recent data better
    const uniqueness = 0.95 + (Math.random() * 0.03); // High uniqueness baseline
    const consistency = 0.90 + (Math.random() * 0.05);
    const relevance = Math.min(1, completeness * 0.4 + accuracy * 0.3 + (Math.random() * 0.3)); // Weighted by completeness and accuracy

    const overallScore = (completeness + accuracy + freshness + uniqueness + consistency + relevance) / 6;

    const metrics: DataQualityMetrics = {
      completeness,
      accuracy,
      freshness,
      uniqueness,
      consistency,
      relevance,
      overallScore
    };

    const key = `${task.platform}_${task.niche}`;
    this.qualityMetrics.set(key, metrics);
    console.log(`Data quality validation complete for ${key}. Overall score: ${overallScore.toFixed(2)}`);

    // Potentially adjust collection strategy based on quality
    const currentStrategy = this.collectionStrategies.get(key);
    if (currentStrategy && overallScore < task.requirements.qualityThreshold) {
      console.warn(`Low data quality for ${key}. Adjusting collection strategy.`);
      currentStrategy.qualityFilters.minEngagement = Math.max(currentStrategy.qualityFilters.minEngagement, 500); // Increase filter
      this.collectionStrategies.set(key, currentStrategy);
    }
  }

  /**
   * Discover new data sources for content collection
   */
  private async discoverDataSources(task: DataCollectionTask): Promise<void> {
    const { niche, platform } = task;
    const nicheCharacteristics = getNicheCharacteristics(niche);
    
    // Discover trending hashtags
    const trendingHashtags = await this.discoverTrendingHashtags(platform, niche);
    
    // Discover influential accounts
    const influencers = await this.discoverInfluencers(platform, niche);
    
    // Discover emerging keywords
    const keywords = await this.discoverKeywords(niche, nicheCharacteristics);
    
    // Update collection strategy with new sources
    const strategyKey = `${niche}_${platform}`;
    const existingStrategy = this.collectionStrategies.get(strategyKey);
    
    if (existingStrategy) {
      existingStrategy.contentDiscovery.hashtags.push(...trendingHashtags);
      existingStrategy.contentDiscovery.influencers.push(...influencers);
      existingStrategy.contentDiscovery.keywords.push(...keywords);
      
      // Remove duplicates
      existingStrategy.contentDiscovery.hashtags = [...new Set(existingStrategy.contentDiscovery.hashtags)];
      existingStrategy.contentDiscovery.influencers = [...new Set(existingStrategy.contentDiscovery.influencers)];
      existingStrategy.contentDiscovery.keywords = [...new Set(existingStrategy.contentDiscovery.keywords)];
    }
    
    console.log(`🔍 New data sources discovered for ${niche} on ${platform}:`, {
      hashtags: trendingHashtags.length,
      influencers: influencers.length,
      keywords: keywords.length,
    });
  }

  /**
   * Monitor and analyze data gaps
   */
  private async monitorDataGaps(task: DataCollectionTask): Promise<void> {
    console.log(`Monitoring data gaps for ${task.niche} on ${task.platform}...`);
    // This task will trigger a re-analysis of data gaps
    await this.analyzeDataGaps();
  }

  /**
   * Analyze data gaps across all niches and platforms
   */
  private async analyzeDataGaps(): Promise<void> {
    this.dataGaps = [];
    
    for (const [key, strategy] of this.collectionStrategies.entries()) {
      const [platform, niche] = key.split('_');
      const qualityMetrics = this.qualityMetrics.get(key);

      // Simulate current sample count based on "collection efforts" or historical data
      const currentSamples = Math.floor(this.totalTasksCompleted * 100 / (Math.random() * 5 + 1)); // More tasks, more samples
      const requiredSamples = strategy.qualityFilters.minEngagement * 10; // A heuristic for required samples

      if (!qualityMetrics || qualityMetrics.overallScore < 0.7 || currentSamples < requiredSamples) {
        const gapPercentage = qualityMetrics ? ((requiredSamples - currentSamples) / requiredSamples) * 100 : 100;
        const gapType = !qualityMetrics || qualityMetrics.overallScore < 0.7 ? 'quality' : 'volume';
        const severity: DataGap['severity'] = gapPercentage > 75 || gapType === 'quality' ? 'critical' : (gapPercentage > 30 ? 'high' : 'medium');

        this.dataGaps.push({
          niche: niche as ContentNiche,
          platform: platform as Platform,
          gapType,
          severity,
          currentSamples,
          requiredSamples,
          recommendedActions: this.generateGapActions(niche as ContentNiche, platform as Platform, gapPercentage)
        });
      }
    }
    console.log(`Identified ${this.dataGaps.length} data gaps.`);
  }

  /**
   * Analyze data gap for specific niche-platform combination
   */
  private async analyzeNichePlatformGap(niche: ContentNiche, platform: Platform): Promise<DataGap | null> {
    const nicheCharacteristics = getNicheCharacteristics(niche);
    const requiredSamples = 10000; // Default required samples for data collection
    
    // Simulate current sample count
    const currentSamples = Math.floor(Math.random() * requiredSamples * 1.5);
    
    if (currentSamples < requiredSamples) {
      const gapPercentage = (requiredSamples - currentSamples) / requiredSamples;
      
      let severity: DataGap['severity'];
      if (gapPercentage > 0.7) severity = 'critical';
      else if (gapPercentage > 0.4) severity = 'high';
      else if (gapPercentage > 0.2) severity = 'medium';
      else severity = 'low';
      
      return {
        niche,
        platform,
        gapType: 'volume',
        severity,
        currentSamples,
        requiredSamples,
        recommendedActions: this.generateGapActions(niche, platform, gapPercentage),
      };
    }
    
    return null;
  }

  /**
   * Generate recommended actions for addressing data gaps
   */
  private generateGapActions(niche: ContentNiche, platform: Platform, gapPercentage: number): string[] {
    const actions = [];
    
    if (gapPercentage > 0.5) {
      actions.push('Increase data collection frequency to 2x normal rate');
      actions.push('Expand hashtag discovery to include trending variations');
      actions.push('Add influencer content monitoring');
    }
    
    if (gapPercentage > 0.3) {
      actions.push('Optimize API rate limit usage');
      actions.push('Implement parallel collection streams');
    }
    
    actions.push('Review and update content filters');
    actions.push('Monitor competitor content patterns');
    
    return actions;
  }

  /**
   * Address a specific data gap
   */
  private async addressDataGap(gap: DataGap): Promise<void> {
    console.log(`Addressing data gap for ${gap.niche} on ${gap.platform} (Severity: ${gap.severity})`);
    for (const action of gap.recommendedActions) {
      console.log(`Executing action: ${action}`);
      await this.executeGapAction(action, gap);
    }
    // After addressing, re-analyze to see if gap is resolved
    await this.analyzeDataGaps();
  }

  /**
   * Execute a specific gap action
   */
  private async executeGapAction(action: string, gap: DataGap): Promise<void> {
    // Simulate execution of actions, e.g., increasing rate limits, adjusting filters
    switch (action) {
      case 'Increase collection frequency':
        const currentStrategy = this.collectionStrategies.get(`${gap.platform}_${gap.niche}`);
        if (currentStrategy) {
          currentStrategy.schedulingStrategy.frequency = 'daily'; // From hourly to daily, or daily to multiple times a day
          currentStrategy.schedulingStrategy.priority = Math.min(10, currentStrategy.schedulingStrategy.priority + 2);
          this.collectionStrategies.set(`${gap.platform}_${gap.niche}`, currentStrategy);
        }
        break;
      case 'Adjust quality filters':
        // This is handled in validateDataQuality for now
        break;
      case 'Discover new sources':
        console.log(`Simulating discovery of new sources for ${gap.niche} on ${gap.platform}`);
        // This would involve calling external services or internal functions
        await this.discoverTrendingHashtags(gap.platform, gap.niche);
        await this.discoverInfluencers(gap.platform, gap.niche);
        break;
      // Add more cases for other actions
      default:
        console.warn(`Unknown gap action: ${action}`);
    }
    // Simulate some resource consumption for each action
    this.recordResourceConsumption(Math.random() * 200 + 50); // 50-250ms per action
  }

  /**
   * Initialize collection strategies for all niche-platform combinations
   */
  private initializeCollectionStrategies(): void {
    // Add default strategies for common platforms/niches
    const niches: ContentNiche[] = [ContentNiche.FITNESS, ContentNiche.BUSINESS, ContentNiche.ENTERTAINMENT];
    const platforms: Platform[] = ['instagram', 'tiktok', 'youtube'];

    niches.forEach(niche => {
      platforms.forEach(platform => {
        const key = `${platform}_${niche}`;
        this.collectionStrategies.set(key, {
          platform,
          niche,
          endpoints: this.getOptimalEndpoints(platform),
          rateLimitOptimization: this.optimizeRateLimit(platform, {}), // Pass relevant niche characteristics
          contentDiscovery: this.optimizeContentDiscovery(niche, {}),
          qualityFilters: this.optimizeQualityFilters(niche, { minEngagement: 100 }),
          schedulingStrategy: this.optimizeScheduling(niche, {})
        });
      });
    });
  }

  /**
   * Get optimal API endpoints for a platform
   */
  private getOptimalEndpoints(platform: Platform): string[] {
    const endpointMap: Record<Platform, string[]> = {
      [Platform.TIKTOK]: [
        '/research/video/query/',
        '/research/user/info/',
        '/research/hashtag/videos/',
        '/research/trending/'
      ],
      [Platform.INSTAGRAM]: [
        '/media',
        '/insights',
        '/hashtag/recent_media',
        '/business_discovery'
      ],
      [Platform.YOUTUBE]: [
        '/videos',
        '/search',
        '/channels',
        '/playlistItems'
      ],
      [Platform.FACEBOOK]: [
        '/posts',
        '/insights',
        '/page_insights'
      ],
      [Platform.TWITTER]: [
        '/tweets/search/recent',
        '/users/by/username',
        '/tweets/counts/recent'
      ],
      [Platform.LINKEDIN]: [
        '/shares',
        '/posts',
        '/ugcPosts'
      ],
    };
    
    return endpointMap[platform] || [];
  }

  /**
   * Optimize rate limiting for platform and niche
   */
  private optimizeRateLimit(platform: Platform, nicheCharacteristics: any): CollectionStrategy['rateLimitOptimization'] {
    const baseRates: Record<Platform, number> = {
      [Platform.TIKTOK]: 100,
      [Platform.INSTAGRAM]: 200,
      [Platform.YOUTUBE]: 10000,
      [Platform.FACEBOOK]: 200,
      [Platform.TWITTER]: 300,
      [Platform.LINKEDIN]: 100,
    };
    
    const platformRate = baseRates[platform] || 100;
    const competitionMultiplier = nicheCharacteristics.competitionLevel === 'extremely_high' ? 0.7 : 1.0;
    
    return {
      requestsPerSecond: Math.floor(platformRate * competitionMultiplier),
      batchSize: Math.min(50, Math.floor(platformRate / 10)),
      cooldownPeriod: nicheCharacteristics.competitionLevel === 'extremely_high' ? 2000 : 1000,
    };
  }

  /**
   * Optimize content discovery for niche
   */
  private optimizeContentDiscovery(niche: ContentNiche, nicheCharacteristics: any): CollectionStrategy['contentDiscovery'] {
    return {
      hashtags: nicheCharacteristics.commonHashtags || [],
      keywords: nicheCharacteristics.keyTopics || [],
      influencers: [], // Will be populated by discovery
      trendingTopics: true,
    };
  }

  /**
   * Optimize quality filters for niche and requirements
   */
  private optimizeQualityFilters(niche: ContentNiche, requirements: any): CollectionStrategy['qualityFilters'] {
    const nicheCharacteristics = getNicheCharacteristics(niche);
    
    return {
      minEngagement: nicheCharacteristics.averageEngagementRate * 0.5, // 50% of average
      minFollowers: nicheCharacteristics.competitionLevel === 'extremely_high' ? 10000 : 1000,
      contentLength: { min: 10, max: 2200 }, // Character limits
      excludeSpam: true,
    };
  }

  /**
   * Optimize scheduling strategy for niche
   */
  private optimizeScheduling(niche: ContentNiche, nicheCharacteristics: any): CollectionStrategy['schedulingStrategy'] {
    return {
      peakTimes: nicheCharacteristics.engagementPatterns?.peakHours || [9, 12, 18, 21],
      frequency: nicheCharacteristics.engagementPatterns?.seasonality === 'high' ? 'hourly' : 'daily',
      priority: nicheCharacteristics.competitionLevel === 'extremely_high' ? 9 : 7,
    };
  }

  /**
   * Implement a collection strategy
   */
  private async implementStrategy(strategy: CollectionStrategy): Promise<void> {
    console.log(`Implementing collection strategy for ${strategy.niche} on ${strategy.platform}`);
    // This is where the agent would interact with actual data collection services
    // For now, we simulate resource consumption
    this.recordResourceConsumption(Math.random() * 500 + 100); // 100-600ms for implementing a strategy
  }

  /**
   * Generate quality improvement recommendations
   */
  private generateQualityRecommendations(metrics: DataQualityMetrics): string[] {
    const recommendations = [];
    
    if (metrics.completeness < 0.9) {
      recommendations.push('Improve data completeness by expanding collection sources');
    }
    
    if (metrics.accuracy < 0.95) {
      recommendations.push('Enhance accuracy validation algorithms');
    }
    
    if (metrics.freshness < 0.8) {
      recommendations.push('Increase collection frequency for real-time data');
    }
    
    if (metrics.uniqueness < 0.85) {
      recommendations.push('Implement better duplicate detection and removal');
    }
    
    if (metrics.relevance < 0.8) {
      recommendations.push('Refine content filtering and relevance scoring');
    }
    
    return recommendations;
  }

  /**
   * Discover trending hashtags for platform and niche
   */
  private async discoverTrendingHashtags(platform: Platform, niche: ContentNiche): Promise<string[]> {
    console.log(`Discovering trending hashtags for ${niche} on ${platform}`);
    // Simulate fetching trending hashtags
    return [`#${niche}trends`, `#${platform}viral`, `#new${niche}content`, `#explore${platform}`];
  }

  /**
   * Discover influential accounts for platform and niche
   */
  private async discoverInfluencers(platform: Platform, niche: ContentNiche): Promise<string[]> {
    console.log(`Discovering influencers for ${niche} on ${platform}`);
    // Simulate fetching influencers
    return [`@${platform}influencer1`, `@${niche}master${Math.floor(Math.random() * 100)}`];
  }

  /**
   * Discover emerging keywords for niche
   */
  private async discoverKeywords(niche: ContentNiche, nicheCharacteristics: any): Promise<string[]> {
    console.log(`Discovering keywords for ${niche}`);
    // Simulate fetching keywords
    return [`${niche} tips`, `${niche} strategy`, `${niche} growth`];
  }

  // Agent status methods
  
  async getStatus(): Promise<'active' | 'idle' | 'error'> {
    if (!this.isActive) return 'idle';
    if (this.performanceScore < 0.3) return 'error';
    return this.currentTask ? 'active' : 'idle';
  }

  async getPerformance(): Promise<number> {
    return this.performanceScore;
  }

  async getResourceUtilization(): Promise<number> {
    if (this.resourceConsumptionHistory.length === 0) return 0;
    const sum = this.resourceConsumptionHistory.reduce((acc, val) => acc + val, 0);
    const average = sum / this.resourceConsumptionHistory.length;
    return Math.min(1, average / 1000); // Normalize to 0-1 scale, assuming 1000ms is max utilization
  }

  async getCurrentTask(): Promise<string | undefined> {
    return this.currentTask ? `${this.currentTask.type} - ${this.currentTask.niche} on ${this.currentTask.platform}` : undefined;
  }

  /**
   * Get current data gaps
   */
  getDataGaps(): DataGap[] {
    return this.dataGaps;
  }

  /**
   * Get collection strategies
   */
  getCollectionStrategies(): Map<string, CollectionStrategy> {
    return this.collectionStrategies;
  }

  /**
   * Get quality metrics
   */
  getQualityMetrics(): Map<string, DataQualityMetrics> {
    return this.qualityMetrics;
  }

  private recordResourceConsumption(durationMs: number): void {
    this.resourceConsumptionHistory.push(durationMs);
    if (this.resourceConsumptionHistory.length > 100) {
      this.resourceConsumptionHistory.shift();
    }
  }

  private updatePerformanceScore(): void {
    if (this.totalTasksCompleted === 0) {
      this.performanceScore = 0.8;
      return;
    }
    const successRate = this.taskSuccessCount / this.totalTasksCompleted;
    this.performanceScore = 0.5 * successRate + 0.3 * (1 - this.getResourceUtilization()) + 0.2 * this.performanceScore;
    this.performanceScore = Math.max(0.1, Math.min(1.0, this.performanceScore));
  }

  private gapMonitoringInterval?: NodeJS.Timeout;

  private startGapMonitoring(): void {
    this.gapMonitoringInterval = setInterval(async () => {
      console.log('Running scheduled data gap monitoring...');
      await this.analyzeDataGaps();
      // Potentially trigger actions if critical gaps are found
      for (const gap of this.dataGaps) {
        if (gap.severity === 'critical') {
          console.warn(`Critical data gap detected: ${gap.description}. Attempting to address.`);
          await this.addressDataGap(gap);
        }
      }
    }, 60 * 60 * 1000); // Run every hour
  }

  private async fetchSimulatedData(platform: Platform, niche: ContentNiche, requirements: DataCollectionTask['requirements']): Promise<any[]> {
    // This is a placeholder for actual data fetching from platform APIs/DB
    console.log(`Simulating data fetch for ${niche} on ${platform} with requirements:`, requirements);
    const numRecords = requirements.minSamples + Math.floor(Math.random() * requirements.minSamples * 0.5); // Simulate variable data
    const data = [];
    for (let i = 0; i < numRecords; i++) {
      data.push({
        id: `post-${platform}-${niche}-${i}`,
        timestamp: Date.now() - Math.floor(Math.random() * (requirements.timeRange === '30d' ? 30 : 7) * 24 * 60 * 60 * 1000), // Simulate recent
        engagement: Math.floor(Math.random() * 1000) + requirements.minEngagement,
        contentType: requirements.contentTypes[Math.floor(Math.random() * requirements.contentTypes.length)],
        // Add more realistic data fields as needed
      });
    }
    return data.filter(d => d.engagement >= requirements.minEngagement);
  }
} 