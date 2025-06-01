// difficult: Main scanner service that coordinates the scanning process with improved cache handling
import { Platform, ScanResult, ScanOptions, PostMetrics, Competitor, ScanStatus } from './types';
import { TikTokClient } from './platforms/TikTokClient';
import { InstagramClient } from './platforms/InstagramClient';
import { YouTubeClient } from './platforms/YouTubeClient';
import { PostAnalyzer } from './analysis/PostAnalyzer';
import { Cache } from './utils/Cache';
import { EventEmitter } from 'events';

/**
 * @interface CircuitBreakerState
 * @description States for the circuit breaker pattern
 */
enum CircuitBreakerState {
  CLOSED, // Normal operation - requests go through
  OPEN,   // Circuit is open - requests fail fast
  HALF_OPEN // Testing if service is healthy again
}

/**
 * @interface MetricsData
 * @description Performance metrics for monitoring scanner service operations
 */
interface MetricsData {
  operationName: string;
  startTime: number;
  endTime?: number;
  success: boolean;
  errorMessage?: string;
  platform?: Platform;
  userId?: string;
  cacheHit?: boolean;
  postsFetched?: number;
}

interface ScanMetrics {
  totalPosts: number;
  averageEngagement: number;
  peakTimes: Array<{ hour: number; engagementScore: number }>;
  topPerformingPosts: PostMetrics[];
}

export class ScannerService {
  // Cache configuration
  private static readonly CACHE_CONFIG = {
    // 1 hour TTL for post data
    postTtl: 60 * 60 * 1000,
    // Serve stale data for up to 4 hours while revalidating
    staleWhileRevalidate: 4 * 60 * 60 * 1000,
    // Maximum number of cached posts per platform
    maxPostsPerPlatform: 1000,
    // Maximum number of scan results to keep in memory
    maxScanResults: 100
  };

  private readonly platformClients: Map<Platform, TikTokClient | InstagramClient | YouTubeClient> = new Map();
  private readonly scanResults: Map<string, ScanResult> = new Map();
  private readonly SCAN_EXPIRATION_MS = 24 * 60 * 60 * 1000; // 24 hours
  private cleanupInterval?: NodeJS.Timeout;
  private readonly SCAN_TIMEOUT_MS = 5 * 60 * 1000; // 5 minute timeout for scans
  
  // Cache for storing post data with platform-specific namespacing
  private readonly postCache: Cache<string, PostMetrics[]>;
  // Cache for storing user profile data
  private readonly profileCache: Cache<string, Record<string, unknown>>;
  // Cache for storing scan results
  private readonly scanResultCache: Cache<string, ScanResult>;
  
  // Event emitter for metrics and logging
  private readonly eventEmitter = new EventEmitter();
  
  // Circuit breaker configuration
  private readonly circuitBreakers: Map<string, {
    state: CircuitBreakerState;
    failureCount: number;
    successCount: number;
    lastStateChange: number;
    failureThreshold: number;
    successThreshold: number;
    resetTimeout: number;
  }> = new Map();
  
  // Metrics collection
  private metrics: MetricsData[] = [];
  
  // Helper methods for retry, circuit breaker, and metrics
  /**
   * Execute a function with retry logic
   * @param fn Function to execute
   * @param maxRetries Maximum number of retries
   * @param baseDelay Base delay between retries in ms (default: 1000)
   * @param maxDelay Maximum delay between retries in ms (default: 10000)
   * @returns Result of the function
   */
  private async withRetry<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000,
    maxDelay: number = 10000
  ): Promise<T> {
    let lastError: Error | unknown;
    let retryCount = 0;
    
    while (retryCount <= maxRetries) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        retryCount++;
        
        if (retryCount > maxRetries) {
          break;
        }
        
        // Exponential backoff with jitter
        const delay = Math.min(
          maxDelay,
          Math.floor(baseDelay * Math.pow(1.5, retryCount) * (0.9 + Math.random() * 0.2))
        );
        
        this.logStructured('warn', `Operation failed, retrying in ${delay}ms (${retryCount}/${maxRetries})`, {
          error: error instanceof Error ? error.message : 'Unknown error'
        });
        
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw lastError;
  }

  /**
   * Initialize a circuit breaker for a specific service
   * @param key Unique key for the service
   * @param options Circuit breaker configuration
   */
  private initCircuitBreaker(
    key: string,
    options: {
      failureThreshold: number;
      successThreshold: number;
      resetTimeout: number;
    }
  ): void {
    this.circuitBreakers.set(key, {
      state: CircuitBreakerState.CLOSED,
      failureCount: 0,
      successCount: 0,
      lastStateChange: Date.now(),
      failureThreshold: options.failureThreshold,
      successThreshold: options.successThreshold,
      resetTimeout: options.resetTimeout
    });
  }

  /**
   * Check if an operation can be performed based on circuit breaker state
   * @param key Circuit breaker key
   * @returns True if operation can be performed
   */
  private canPerformOperation(key: string): boolean {
    const breaker = this.circuitBreakers.get(key);
    if (!breaker) return true;

    const now = Date.now();
    
    // If circuit is open, check if we should move to half-open
    if (breaker.state === CircuitBreakerState.OPEN) {
      if (now - breaker.lastStateChange > breaker.resetTimeout) {
        // Transition to half-open
        breaker.state = CircuitBreakerState.HALF_OPEN;
        breaker.lastStateChange = now;
        breaker.successCount = 0;
        this.logStructured('info', `Circuit breaker ${key} transitioning from OPEN to HALF_OPEN`);
        return true;
      }
      return false;
    }
    
    return true;
  }

  /**
   * Record a successful operation in the circuit breaker
   * @param key Circuit breaker key
   */
  private recordSuccess(key: string): void {
    const breaker = this.circuitBreakers.get(key);
    if (!breaker) return;
    
    breaker.failureCount = 0;
    
    if (breaker.state === CircuitBreakerState.HALF_OPEN) {
      breaker.successCount++;
      
      if (breaker.successCount >= breaker.successThreshold) {
        breaker.state = CircuitBreakerState.CLOSED;
        breaker.lastStateChange = Date.now();
        this.logStructured('info', `Circuit breaker ${key} transitioning from HALF_OPEN to CLOSED`);
      }
    }
  }

  /**
   * Record a failed operation in the circuit breaker
   * @param key Circuit breaker key
   */
  private recordFailure(key: string): void {
    const breaker = this.circuitBreakers.get(key);
    if (!breaker) return;
    
    if (breaker.state === CircuitBreakerState.HALF_OPEN) {
      // Immediate transition back to open on any failure in half-open state
      breaker.state = CircuitBreakerState.OPEN;
      breaker.lastStateChange = Date.now();
      this.logStructured('warn', `Circuit breaker ${key} transitioning from HALF_OPEN to OPEN`);
      return;
    }
    
    if (breaker.state === CircuitBreakerState.CLOSED) {
      breaker.failureCount++;
      
      if (breaker.failureCount >= breaker.failureThreshold) {
        breaker.state = CircuitBreakerState.OPEN;
        breaker.lastStateChange = Date.now();
        this.logStructured('warn', `Circuit breaker ${key} transitioning from CLOSED to OPEN after ${breaker.failureCount} failures`);
      }
    }
  }

  /**
   * Structured logging with different log levels
   * @param level Log level
   * @param message Message to log
   * @param context Additional context
   */
  private logStructured(
    level: 'info' | 'warn' | 'error' | 'debug',
    message: string,
    context: Record<string, any> = {}
  ): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context: {
        service: 'ScannerService',
        ...context
      }
    };
    
    // Emit event for log handlers
    this.eventEmitter.emit('log', logEntry);
    
    // Also log to console for now
    switch (level) {
      case 'error':
        console.error(JSON.stringify(logEntry));
        break;
      case 'warn':
        console.warn(JSON.stringify(logEntry));
        break;
      case 'debug':
        console.debug(JSON.stringify(logEntry));
        break;
      default:
        console.log(JSON.stringify(logEntry));
        break;
    }
  }

  /**
   * Setup metrics reporting at regular intervals
   */
  private setupMetricsReporting(): void {
    // Report metrics every 5 minutes
    setInterval(() => {
      this.reportMetrics();
    }, 5 * 60 * 1000);
  }

  /**
   * Record a metric for later reporting
   * @param metric Metric data
   */
  private recordMetric(metric: MetricsData): void {
    this.metrics.push(metric);
    
    // Keep last 1000 metrics
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000);
    }
  }

  /**
   * Report collected metrics
   */
  private reportMetrics(): void {
    if (this.metrics.length === 0) return;
    
    // Calculate statistics
    const now = Date.now();
    const lastHourMetrics = this.metrics.filter(m => m.startTime > now - 60 * 60 * 1000);
    
    const statistics = {
      totalOperations: lastHourMetrics.length,
      successRate: lastHourMetrics.filter(m => m.success).length / lastHourMetrics.length,
      averageDuration: lastHourMetrics.reduce((sum, m) => sum + ((m.endTime || m.startTime) - m.startTime), 0) / lastHourMetrics.length,
      cacheHitRate: lastHourMetrics.filter(m => m.cacheHit).length / lastHourMetrics.length,
      operationCounts: {} as Record<string, number>,
      platformCounts: {} as Record<string, number>,
      errors: lastHourMetrics.filter(m => !m.success).length,
      timestamp: new Date().toISOString()
    };
    
    // Count by operation type
    lastHourMetrics.forEach(m => {
      statistics.operationCounts[m.operationName] = (statistics.operationCounts[m.operationName] || 0) + 1;
      if (m.platform) {
        statistics.platformCounts[m.platform] = (statistics.platformCounts[m.platform] || 0) + 1;
      }
    });
    
    // Emit metrics event
    this.eventEmitter.emit('metrics', statistics);
    
    // Log metrics summary
    this.logStructured('info', 'Metrics report', { statistics });
  }

  /**
   * Creates a new instance of ScannerService
   * @constructor
   */
  constructor() {
    // Initialize caches
    this.postCache = new Cache({
      ttl: ScannerService.CACHE_CONFIG.postTtl,
      maxSize: ScannerService.CACHE_CONFIG.maxPostsPerPlatform * 3, // For 3 platforms
      staleWhileRevalidate: ScannerService.CACHE_CONFIG.staleWhileRevalidate,
      version: 'v1' // Bump version to invalidate all cached data
    });
    
    this.profileCache = new Cache({
      ttl: ScannerService.CACHE_CONFIG.postTtl * 2, // Longer TTL for profiles
      maxSize: 1000, // Reasonable limit for profiles
      version: 'v1'
    });
    
    this.scanResultCache = new Cache({
      ttl: this.SCAN_EXPIRATION_MS,
      maxSize: ScannerService.CACHE_CONFIG.maxScanResults,
      version: 'v1'
    });
    
    // Initialize circuit breakers for each platform
    for (const platform of ['tiktok', 'instagram', 'youtube'] as Platform[]) {
      this.initCircuitBreaker(`${platform}_api`, {
        failureThreshold: 5,
        successThreshold: 2,
        resetTimeout: 60000 // 1 minute
      });
    }
    
    // Setup metrics reporting
    this.setupMetricsReporting();
    
    // Schedule periodic cleanup
    this.scheduleCleanup();
  }

  private scheduleCleanup(): void {
    // Clear any existing interval to prevent duplicates
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    
    // Initial cleanup
    this.cleanupExpiredScans().catch(error => 
      console.error('Error during initial cleanup:', error)
    );
    
    // Schedule periodic cleanup every hour
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpiredScans().catch(error =>
        console.error('Error during scheduled cleanup:', error)
      );
    }, 60 * 60 * 1000);
  }

  /**
   * Initialize platform clients with access tokens
   */
  async initializePlatforms(platforms: { platform: Platform; accessToken: string }[]): Promise<void> {
    await Promise.all(
      platforms.map(async ({ platform, accessToken }) => {
        try {
          switch (platform) {
            case 'tiktok':
              this.platformClients.set(platform, new TikTokClient(accessToken));
              break;
            case 'instagram':
              this.platformClients.set(platform, new InstagramClient(accessToken));
              break;
            case 'youtube':
              this.platformClients.set(platform, new YouTubeClient(accessToken));
              break;
            default:
              console.warn(`Unsupported platform: ${platform}`);
          }
        } catch (error) {
          console.error(`Failed to initialize ${platform} client:`, error);
          throw new Error(`Failed to initialize ${platform} client: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      })
    );
  }

  /**
   * Start a new scan
   */
  async startScan(userId: string, options: ScanOptions): Promise<string> {
    const scanId = `scan_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    
    const scanResult: Omit<ScanResult, 'endTime' | 'error'> & { status: 'pending' } = {
      id: scanId,
      userId,
      platform: options.platforms[0], // For now, handle one platform at a time
      startTime: new Date(),
      status: 'pending' as const,
      metrics: undefined
    };

    this.scanResults.set(scanId, scanResult);
    this.scanResultCache.set(scanId, scanResult);

    // Process scan in background
    this.processScan(scanId, options).catch((error: unknown) => {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`Scan ${scanId} failed:`, errorMessage, error);
      
      const scan = this.scanResults.get(scanId);
      if (scan) {
        scan.status = 'failed';
        scan.error = errorMessage;
        this.scanResultCache.set(scanId, scan, { ttl: 5 * 60 * 1000 }); // Cache failed scans for 5 minutes
      }
    });

    return scanId;
  }

  /**
   * Get posts for a specific user with retry and circuit breaker logic
   * @param platform The platform to fetch posts from
   * @param userId The user ID to fetch posts for
   * @param lookbackDays Number of days to look back
   * @returns Array of post metrics
   */
  private async getUserPosts(platform: Platform, userId: string, lookbackDays: number): Promise<PostMetrics[]> {
    const cacheKey = `user_posts_${platform}_${userId}`;
    const circuitBreakerKey = `${platform}_api`;
    const metric: MetricsData = {
      operationName: 'getUserPosts',
      startTime: Date.now(),
      success: false,
      platform,
      userId
    };
    
    try {
      // Check circuit breaker first
      if (!this.canPerformOperation(circuitBreakerKey)) {
        this.logStructured('warn', `Circuit breaker open for ${platform} API, skipping user posts fetch for ${userId}`);
        metric.errorMessage = 'Circuit breaker open';
        metric.endTime = Date.now();
        this.recordMetric(metric);
        return [];
      }
      
      // Try to get from cache first
      const cachedResult = await this.postCache.has(cacheKey);
      metric.cacheHit = !!cachedResult;
      
      const posts = await this.withRetry(async () => {
        return this.postCache.get(cacheKey, async () => {
          const client = this.platformClients.get(platform);
          if (!client) {
            throw new Error(`No client configured for platform: ${platform}`);
          }
          
          this.logStructured('info', `Fetching posts for user ${userId} on ${platform}`);
          const posts = await client.getUserPosts(userId, lookbackDays);
          
          // Record success in circuit breaker
          this.recordSuccess(circuitBreakerKey);
          
          return Array.isArray(posts) ? posts : [];
        });
      }, 3);
      
      metric.success = true;
      metric.postsFetched = posts?.length || 0;
      metric.endTime = Date.now();
      this.recordMetric(metric);
      
      return posts || [];
    } catch (error) {
      // Record failure in circuit breaker
      this.recordFailure(circuitBreakerKey);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logStructured('error', `Error fetching user posts for ${userId} on ${platform}:`, { error: errorMessage });
      
      metric.success = false;
      metric.errorMessage = errorMessage;
      metric.endTime = Date.now();
      this.recordMetric(metric);
      
      return [];
    }
  }

  /**
   * Get posts for a specific competitor with retry and circuit breaker logic
   * @param platform The platform to fetch posts from
   * @param competitorId The competitor ID to fetch posts for
   * @param lookbackDays Number of days to look back
   * @returns Array of post metrics
   */
  private async getCompetitorPosts(platform: Platform, competitorId: string, lookbackDays: number): Promise<PostMetrics[]> {
    const cacheKey = `competitor_posts_${platform}_${competitorId}`;
    const circuitBreakerKey = `${platform}_api`;
    const metric: MetricsData = {
      operationName: 'getCompetitorPosts',
      startTime: Date.now(),
      success: false,
      platform,
      userId: competitorId
    };
    
    try {
      // Check circuit breaker first
      if (!this.canPerformOperation(circuitBreakerKey)) {
        this.logStructured('warn', `Circuit breaker open for ${platform} API, skipping competitor posts fetch for ${competitorId}`);
        metric.errorMessage = 'Circuit breaker open';
        metric.endTime = Date.now();
        this.recordMetric(metric);
        return [];
      }
      
      const cachedResult = await this.postCache.has(cacheKey);
      metric.cacheHit = !!cachedResult;
      
      const posts = await this.withRetry(async () => {
        return this.postCache.get(cacheKey, async () => {
          const client = this.platformClients.get(platform);
          if (!client) {
            throw new Error(`No client configured for platform: ${platform}`);
          }
          
          this.logStructured('info', `Fetching posts for competitor ${competitorId} on ${platform}`);
          const posts = await client.getCompetitorPosts(competitorId, lookbackDays);
          
          // Record success in circuit breaker
          this.recordSuccess(circuitBreakerKey);
          
          return Array.isArray(posts) ? posts : [];
        });
      }, 3);
      
      metric.success = true;
      metric.postsFetched = posts?.length || 0;
      metric.endTime = Date.now();
      this.recordMetric(metric);
      
      return posts || [];
    } catch (error) {
      // Record failure in circuit breaker
      this.recordFailure(circuitBreakerKey);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logStructured('error', `Error fetching competitor posts for ${competitorId} on ${platform}:`, { error: errorMessage });
      
      metric.success = false;
      metric.errorMessage = errorMessage;
      metric.endTime = Date.now();
      this.recordMetric(metric);
      
      return [];
    }
  }

  private async performScan(scan: ScanResult, options: ScanOptions): Promise<{
    totalPosts: number;
    averageEngagement: number;
    peakTimes: Array<{ hour: number; engagementScore: number }>;
    topPerformingPosts: PostMetrics[];
  }> {
    // 1. Collect posts from all sources
    const allPosts: PostMetrics[] = [];
    
    // Get posts for each platform
    for (const platform of options.platforms) {
      const client = this.platformClients.get(platform);
      if (!client) {
        throw new Error(`No client configured for platform: ${platform}`);
      }

      // Get user's posts
      if (options.includeOwnPosts) {
        const userPosts = await this.getUserPosts(platform, scan.userId, options.lookbackDays);
        allPosts.push(...userPosts);
      }

      // Get competitor posts
      if (options.competitors?.length) {
        await Promise.all(
          options.competitors.map(async (competitorId) => {
            try {
              const competitorPosts = await this.getCompetitorPosts(platform, competitorId, options.lookbackDays);
              allPosts.push(...competitorPosts);
            } catch (error) {
              console.error(`Failed to fetch posts for competitor ${competitorId}:`, error);
              // Continue with other competitors even if one fails
            }
          })
        );
      }
    }

    // 2. Analyze the collected data
    const analyzer = new PostAnalyzer(allPosts);
    
    // Calculate metrics with error handling
    return {
      totalPosts: allPosts.length,
      averageEngagement: analyzer.calculateAverageEngagement(),
      peakTimes: analyzer.findPeakTimes(),
      topPerformingPosts: analyzer.findTopPerformingPosts(10),
    };
  }

  private async processScan(scanId: string, options: ScanOptions): Promise<void> {
    const scan = this.scanResults.get(scanId);
    if (!scan) {
      throw new Error(`Scan ${scanId} not found`);
    }

    try {
      // Update scan status to in progress
      scan.status = 'in_progress';
      await this.scanResultCache.set(scanId, scan);
      
      // Set up timeout for the scan with proper cleanup
      const timeoutPromise = new Promise<never>((_, reject) => {
        const timer = setTimeout(() => {
          reject(new Error(`Scan ${scanId} timed out after ${this.SCAN_TIMEOUT_MS}ms`));
        }, this.SCAN_TIMEOUT_MS);
        
        // Clean up the timeout if the promise resolves/rejects
        return () => clearTimeout(timer);
      });
      
      // Run the scan with timeout
      const metrics = await Promise.race([
        this.performScan(scan, options),
        timeoutPromise
      ]);
      
      // Update scan result with metrics
      scan.metrics = metrics;
      scan.status = 'completed';
      scan.endTime = new Date();
      
      // Update cache with the completed scan
      await this.scanResultCache.set(scanId, scan);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`Scan ${scanId} failed:`, errorMessage, error);
      
      // Update scan with error
      scan.status = 'failed';
      scan.error = errorMessage;
      scan.endTime = new Date();
      await this.scanResultCache.set(scanId, scan);
      
      // Re-throw to allow caller to handle the error
      throw error;
    }
  }

  private async cleanupExpiredScans(): Promise<void> {
    try {
      const now = new Date();
      const expiredScanIds: string[] = [];

      // Find expired scans
      for (const [id, scan] of this.scanResults.entries()) {
        const scanAge = now.getTime() - scan.startTime.getTime();
        if (scanAge > this.SCAN_EXPIRATION_MS) {
          expiredScanIds.push(id);
        }
      }

      // Remove expired scans
      await Promise.all(
        expiredScanIds.map(async (id) => {
          this.scanResults.delete(id);
          await this.scanResultCache.delete(id);
        })
      );
    } catch (error) {
      console.error('Error during cleanup:', error);
      throw error; // Re-throw to be handled by the caller
    }
  }
  
  /**
   * Destroy the service and cleanup resources
   */
  async destroy(): Promise<void> {
    // Clear the cleanup interval
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = undefined;
    }

    // Clear caches
    this.postCache.clear();
    this.profileCache.clear();
    this.scanResultCache.clear();
    
    // Clear in-memory results
    this.scanResults.clear();
    
    // Remove all event listeners
    this.eventEmitter.removeAllListeners();
  }
  
  /**
   * Subscribe to scanner events
   * @param event Event name
   * @param handler Event handler
   */
  public on(event: 'log' | 'metrics', handler: (data: any) => void): void {
    this.eventEmitter.on(event, handler);
  }
  
  /**
   * Get a scan result, trying cache first
   */
  async getScanResult(scanId: string): Promise<ScanResult | undefined> {
    try {
      // Try to get from cache first
      const cachedResult = await this.scanResultCache.get(scanId);
      if (cachedResult) {
        // If we have a cached result but it's not in memory, update our in-memory map
        if (!this.scanResults.has(scanId)) {
          this.scanResults.set(scanId, cachedResult);
        }
        return cachedResult;
      }
      
      // Fall back to in-memory map
      const inMemoryResult = this.scanResults.get(scanId);
      if (inMemoryResult) {
        // Update cache if we found it in memory but not in cache
        await this.scanResultCache.set(scanId, inMemoryResult);
      }
      
      return inMemoryResult;
    } catch (error) {
      console.error(`Error getting scan result for ${scanId}:`, error);
      // Fall back to in-memory map if cache fails
      return this.scanResults.get(scanId);
    }
  }
  
  /**
   * Invalidate cache entries for a specific platform and user
   * @param platform The platform to invalidate
   * @param userId The user ID to invalidate
   */
  invalidateUserCache(platform: Platform, userId: string): void {
    const userCacheKey = `${platform}:user:${userId}`;
    
    // Invalidate all cache entries for this user
    this.postCache.invalidateMatching((key) => 
      key.startsWith(userCacheKey)
    );
    
    // Also invalidate profile cache
    this.profileCache.delete(`${platform}:profile:${userId}`);
  }
}
