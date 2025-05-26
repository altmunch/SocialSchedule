// difficult: Main scanner service that coordinates the scanning process
import { Platform, ScanResult, ScanOptions, PostMetrics, Competitor } from './types';
import { TikTokClient } from './platforms/TikTokClient';
import { InstagramClient } from './platforms/InstagramClient';
import { YouTubeClient } from './platforms/YouTubeClient';
import { PostAnalyzer } from './analysis/PostAnalyzer';

export class ScannerService {
  private platformClients: Map<Platform, any> = new Map();
  private scanResults: Map<string, ScanResult> = new Map();
  private readonly SCAN_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

  constructor() {
    this.cleanupExpiredScans();
  }

  /**
   * Initialize platform clients with access tokens
   */
  async initializePlatforms(platforms: { platform: Platform; accessToken: string }[]) {
    for (const { platform, accessToken } of platforms) {
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
      // Add other platform clients here
        default:
          console.warn(`Unsupported platform: ${platform}`);
      }
    }
  }

  /**
   * Start a new scan
   */
  async startScan(userId: string, options: ScanOptions): Promise<string> {
    const scanId = `scan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const scanResult: ScanResult = {
      id: scanId,
      userId,
      platform: options.platforms[0], // For now, handle one platform at a time
      startTime: new Date(),
      status: 'pending',
    };

    this.scanResults.set(scanId, scanResult);

    // Process scan in background
    this.processScan(scanId, options).catch(error => {
      console.error(`Scan ${scanId} failed:`, error);
      const scan = this.scanResults.get(scanId);
      if (scan) {
        scan.status = 'failed';
        scan.error = error.message;
      }
    });

    return scanId;
  }

  /**
   * Get scan status or results
   */
  getScanResult(scanId: string): ScanResult | undefined {
    return this.scanResults.get(scanId);
  }

  private async processScan(scanId: string, options: ScanOptions) {
    const scan = this.scanResults.get(scanId);
    if (!scan) throw new Error('Scan not found');

    try {
      scan.status = 'in_progress';
      
      // 1. Collect posts from all sources
      const allPosts: PostMetrics[] = [];
      
      for (const platform of options.platforms) {
        const client = this.platformClients.get(platform);
        if (!client) continue;

        // Get user's own posts
        if (options.includeOwnPosts !== false) {
          const userPosts = await client.getUserPosts('me', options.lookbackDays);
          allPosts.push(...userPosts);
        }

        // Get competitor posts
        if (options.competitors?.length) {
          for (const competitor of options.competitors) {
            try {
              const competitorPosts = await client.getCompetitorPosts(
                competitor, 
                options.lookbackDays
              );
              allPosts.push(...competitorPosts);
            } catch (error) {
              console.error(`Failed to fetch posts for ${competitor}:`, error);
            }
          }
        }
      }

      // 2. Analyze the collected data
      const analyzer = new PostAnalyzer(allPosts);
      
      scan.metrics = {
        totalPosts: allPosts.length,
        averageEngagement: analyzer.calculateAverageEngagement(),
        peakTimes: analyzer.findPeakTimes(),
        topPerformingPosts: analyzer.findTopPerformingPosts(10),
      };

      // 3. Mark as completed
      scan.status = 'completed';
      scan.endTime = new Date();
      
    } catch (error) {
      scan.status = 'failed';
      scan.error = error instanceof Error ? error.message : 'Unknown error';
      throw error;
    }
  }

  private cleanupExpiredScans() {
    const now = Date.now();
    // Convert Map.entries() to array for safe iteration
    Array.from(this.scanResults.entries()).forEach(([id, scan]) => {
      if (now - scan.startTime.getTime() > this.SCAN_EXPIRY_MS) {
        this.scanResults.delete(id);
      }
    });
    
    // Run cleanup every hour
    setTimeout(() => this.cleanupExpiredScans(), 60 * 60 * 1000);
  }
}
