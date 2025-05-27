// difficult: Main scanner service that coordinates the scanning process with improved cache handling
import { Platform, ScanResult, ScanOptions, PostMetrics, Competitor, ScanStatus } from './types';
import { TikTokClient } from './platforms/TikTokClient';
import { InstagramClient } from './platforms/InstagramClient';
import { YouTubeClient } from './platforms/YouTubeClient';
import { PostAnalyzer } from './analysis/PostAnalyzer';
import { Cache } from './utils/Cache';

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

  private async getUserPosts(platform: Platform, userId: string, lookbackDays: number): Promise<PostMetrics[]> {
    const cacheKey = `user_posts_${platform}_${userId}`;
    
    try {
      const posts = await this.postCache.get(cacheKey, async () => {
        const client = this.platformClients.get(platform);
        if (!client) {
          throw new Error(`No client configured for platform: ${platform}`);
        }
        
        const posts = await client.getUserPosts(userId, lookbackDays);
        return Array.isArray(posts) ? posts : [];
      });
      
      return posts || [];
    } catch (error) {
      console.error(`Error fetching user posts for ${userId} on ${platform}:`, error);
      return [];
    }
  }

  private async getCompetitorPosts(platform: Platform, competitorId: string, lookbackDays: number): Promise<PostMetrics[]> {
    const cacheKey = `competitor_posts_${platform}_${competitorId}`;
    
    try {
      const posts = await this.postCache.get(cacheKey, async () => {
        const client = this.platformClients.get(platform);
        if (!client) {
          throw new Error(`No client configured for platform: ${platform}`);
        }
        
        const posts = await client.getCompetitorPosts(competitorId, lookbackDays);
        return Array.isArray(posts) ? posts : [];
      });
      
      return posts || [];
    } catch (error) {
      console.error(`Error fetching competitor posts for ${competitorId} on ${platform}:`, error);
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
  
  // Properly clean up resources when the service is no longer needed
  public async destroy(): Promise<void> {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = undefined;
    }
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
