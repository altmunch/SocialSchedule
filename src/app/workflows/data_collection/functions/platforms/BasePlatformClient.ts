// difficult: Base class for platform-specific clients
import { PostMetrics, Platform, PaginatedResponse } from '../types';
import { RateLimiter } from '../utils/RateLimiter';
import EventEmitter from 'events';
import { AuthTokenManagerService } from '../AuthTokenManagerService';
import { MonitoringSystem } from '../monitoring/MonitoringSystem';
import { OAuth2Credentials, PlatformCredentials } from '../authTypes';

/**
 * Base class for all social media platform clients.
 * Provides common functionality like rate limiting, error handling, and metric reporting.
 */
export abstract class BasePlatformClient extends EventEmitter {
  protected accessToken: string;
  protected platform: Platform;
  protected rateLimiter: RateLimiter;
  protected authTokenManager: AuthTokenManagerService;
  protected monitoringSystem: MonitoringSystem;
  protected systemUserId?: string;

  protected readonly DEFAULT_RATE_LIMIT_RPM = 500; // Default requests per minute
  protected readonly DEFAULT_BURST_CAPACITY = 10; // Default burst capacity

  constructor(
    accessToken: string,
    platform: Platform,
    authTokenManager: AuthTokenManagerService,
    monitoringSystem: MonitoringSystem,
    systemUserId?: string,
    rateLimiterOptions?: { requestsPerMinute?: number; burstCapacity?: number }
  ) {
    super();
    this.accessToken = accessToken; // This might be a temporary token if refreshed later
    this.platform = platform;
    this.authTokenManager = authTokenManager;
    this.monitoringSystem = monitoringSystem;
    this.systemUserId = systemUserId;

    this.rateLimiter = new RateLimiter({
      requestsPerMinute: rateLimiterOptions?.requestsPerMinute || this.DEFAULT_RATE_LIMIT_RPM,
      burstCapacity: rateLimiterOptions?.burstCapacity || this.DEFAULT_BURST_CAPACITY,
    });
  }

  /**
   * Wraps an API request with rate limiting, error handling, and monitoring.
   * @param fn The function that performs the actual API call.
   * @param operationName A descriptive name for the operation (for monitoring).
   * @returns A promise that resolves with the result of the API call.
   */
  protected async throttleRequest<T>(fn: () => Promise<T>, operationName: string): Promise<T> {
    return this.monitoringSystem.monitor(
      operationName,
      async (span) => {
        // Ensure we have valid credentials before making the request
        const credentials = await this.getCredentials();
        if (!credentials) {
          const errorMessage = `No valid credentials for ${this.platform} (user: ${this.systemUserId || 'N/A'}).`;
          span.recordException(new Error(errorMessage));
          throw new Error(errorMessage);
        }
        
        // Update accessToken if it was refreshed
        this.accessToken = credentials.accessToken;

        await this.rateLimiter.acquire(); // Wait for a token
        span.addEvent('rate_limit_token_acquired');

        try {
          const result = await fn();
          // Simulate parsing rate limit headers from a hypothetical response object
          // In a real scenario, the 'fn' would return a response object from which headers are extracted.
          // For now, we'll manually update the rate limiter with simulated values or rely on its internal refill.
          // this.rateLimiter.updateLimits({ limit: 500, remaining: 499, resetAt: new Date(Date.now() + 60 * 1000) });
          return result;
        } catch (error: any) {
          span.recordException(error);
          this.monitoringSystem.getAlertManager().fireAlert(
            `platform_api_error_${this.platform}`,
            `API call failed for ${operationName} on ${this.platform}: ${error.message}`,
            'error',
            { platform: this.platform, operation: operationName, error: error.message, userId: this.systemUserId }
          );
          throw error; // Re-throw the error after logging/alerting
        }
      },
      {
        recordMetrics: true,
        alertOnError: true,
        errorSeverity: 'error',
        attributes: { platform: this.platform, userId: this.systemUserId }
      }
    );
  }

  public updateRateLimit(options: Partial<{ requestsPerMinute: number; burstCapacity: number }>) {
    this.rateLimiter.updateOptions(options);
  }

  protected log(level: string, message: string, context: Record<string, any> = {}) {
    this.monitoringSystem.getMetricsCollector().recordMetric({
      name: 'platform_client_log',
      type: 'info',
      labels: { level, platform: this.platform, userId: this.systemUserId || 'N/A' },
      value: 1,
      timestamp: new Date(),
      attributes: { message, ...context }
    });
  }

  /**
   * Retrieves valid credentials for the platform, refreshing if necessary.
   */
  protected async getCredentials(): Promise<OAuth2Credentials | null> {
    if (!this.systemUserId) {
      this.log('error', 'Attempted to get credentials without systemUserId');
      return null;
    }
    const credentials = await this.authTokenManager.getValidCredentials(this.platform, this.systemUserId);
    if (!credentials || credentials.strategy !== 'oauth2') {
      this.monitoringSystem.getAlertManager().fireAlert(
        'platform_auth_critical',
        `No valid OAuth2 credentials found for ${this.platform} and user ${this.systemUserId}`,
        'critical',
        { userId: this.systemUserId, platform: this.platform }
      );
      return null;
    }
    return credentials as OAuth2Credentials;
  }

  // Abstract methods that must be implemented by platform-specific clients
  abstract getPostMetrics(postId: string): Promise<PostMetrics>;
  
  /**
   * Fetches a user's posts with pagination support
   * @param userId The user ID
   * @param lookbackDays Number of days to look back for posts (default: 30)
   * @param maxPages Maximum number of pages to fetch (default: 10)
   * @param maxResultsPerPage Maximum number of results per page (default: 20)
   * @returns Promise with paginated response containing posts and pagination info
   */
  abstract getUserPosts(
    userId: string, 
    lookbackDays?: number,
    maxPages?: number,
    maxResultsPerPage?: number
  ): Promise<PaginatedResponse<PostMetrics>>;
  
  /**
   * Fetches posts from a competitor's profile with pagination support
   * @param username The username of the competitor
   * @param lookbackDays Number of days to look back for posts (default: 30)
   * @param maxPages Maximum number of pages to fetch (default: 10)
   * @param maxResultsPerPage Maximum number of results per page (default: 20)
   * @returns Promise with paginated response containing posts and pagination info
   */
  abstract getCompetitorPosts(
    username: string, 
    lookbackDays?: number,
    maxPages?: number,
    maxResultsPerPage?: number
  ): Promise<PaginatedResponse<PostMetrics>>;
  
  protected async processInBatches<T_Input, T_Output>(
    items: T_Input[],
    batchSize: number,
    processItemFn: (item: T_Input) => Promise<T_Output>,
    delayBetweenBatchesMs: number = 0 // Optional delay between batches
  ): Promise<T_Output[]> {
    const results: T_Output[] = [];
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      const batchPromises = batch.map(item => processItemFn(item));
      try {
        results.push(...await Promise.all(batchPromises));
      } catch (error) {
        this.log('error', `Batch processing failed for ${this.platform}`, { batchSize, error: error.message });
        // Depending on desired behavior, rethrow, return partial, or handle gracefully
        throw error;
      }
      if (delayBetweenBatchesMs > 0 && i + batchSize < items.length) {
        await new Promise(resolve => setTimeout(resolve, delayBetweenBatchesMs));
      }
    }
    return results;
  }

  // Common method to calculate engagement rate
  protected calculateEngagementRate(metrics: {
    likes: number;
    comments: number;
    shares: number;
    views?: number;
    followerCount: number;
  }): number {
    const totalEngagement = metrics.likes + metrics.comments + metrics.shares;
    if (metrics.views !== undefined && metrics.views > 0) {
      return totalEngagement / metrics.views;
    } else if (metrics.followerCount > 0) {
      return totalEngagement / metrics.followerCount;
    }
    return 0; // No views or followers to calculate rate
  }
}
