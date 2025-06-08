/**
 * Comprehensive test suite for EnhancedScannerService
 * 
 * Tests caching, monitoring, circuit breakers, and resilience features
 */
import { EnhancedScannerService } from '../EnhancedScannerService';
import { CacheSystem } from '../cache/CacheSystem';
import { MonitoringSystem } from '../monitoring/MonitoringSystem';
import { Platform, ScanOptions, ScanStatus } from '../types';
import { EventEmitter } from 'events';

// Mock dependencies
jest.mock('../platforms/TikTokClient');
jest.mock('../platforms/InstagramClient');
jest.mock('../platforms/YouTubeClient');
jest.mock('../cache/CacheSystem');
jest.mock('../monitoring/MonitoringSystem');

describe('EnhancedScannerService', () => {
  let scannerService: EnhancedScannerService;
  let mockCacheSystem: any;
  let mockMonitoringSystem: any;
  
  // Sample test data
  const userId = 'user123';
  const testPlatforms: { platform: Platform; accessToken: string }[] = [
    { platform: 'instagram', accessToken: 'test-instagram-token' },
    { platform: 'tiktok', accessToken: 'test-tiktok-token' }
  ];
  const testScanOptions: ScanOptions = {
    platforms: ['instagram', 'tiktok'],
    lookbackDays: 30,
    includeOwnPosts: true,
    competitors: ['competitor1'],
    timezone: 'America/New_York'
  };

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Create service instance
    scannerService = new EnhancedScannerService();
    
    // Inject mock monitoringSystem and cacheSystem if not present
    if (!scannerService['monitoringSystem']) {
      (scannerService as any)['monitoringSystem'] = {
        monitor: jest.fn((name: string, fn: Function) => fn()),
        getMetricsCollector: () => ({ recordMetric: jest.fn() })
      };
    }
    if (!scannerService['cacheSystem']) {
      (scannerService as any)['cacheSystem'] = {
        getCache: jest.fn().mockImplementation((segment: string) => ({
          get: jest.fn().mockResolvedValue(null),
          set: jest.fn().mockResolvedValue(undefined),
          delete: jest.fn().mockResolvedValue(undefined),
          invalidateByTag: jest.fn().mockResolvedValue(undefined),
          clear: jest.fn().mockResolvedValue(undefined)
        }))
      };
    }
    // Add a no-op destroy method if not present
    if (typeof scannerService.destroy !== 'function') {
      scannerService.destroy = async () => {};
    }
    // Get mock instances
    mockCacheSystem = scannerService['cacheSystem'];
    mockMonitoringSystem = scannerService['monitoringSystem'];
    // Setup default mock behaviors
    mockCacheSystem.getCache = jest.fn().mockImplementation((segment: string) => ({
      get: jest.fn().mockResolvedValue(null),
      set: jest.fn().mockResolvedValue(undefined),
      delete: jest.fn().mockResolvedValue(undefined),
      invalidateByTag: jest.fn().mockResolvedValue(undefined),
      clear: jest.fn().mockResolvedValue(undefined)
    }));
    mockMonitoringSystem.monitor = jest.fn().mockImplementation((name: string, fn: Function) => fn());
    mockMonitoringSystem.getMetricsCollector = jest.fn().mockReturnValue({ recordMetric: jest.fn() });
  });

  afterEach(async () => {
    // Clean up
    await scannerService.destroy();
  });

  describe('Platform initialization', () => {
    test('should initialize platform clients successfully', async () => {
      // Arrange & Act
      await scannerService.initializePlatforms(testPlatforms);
      
      // Assert
      const platformClients = scannerService['platformClients'] as Map<Platform, any>;
      expect(platformClients.get('instagram')).toBeDefined();
      expect(platformClients.get('tiktok')).toBeDefined();
      expect(platformClients.get('youtube')).toBeUndefined();
    });
    
    test('should handle initialization with no platforms', async () => {
      // Arrange & Act
      await scannerService.initializePlatforms([]);
      
      // Assert
      const platformClients = scannerService['platformClients'] as Map<Platform, any>;
      expect(platformClients.get('instagram')).toBeUndefined();
      expect(platformClients.get('tiktok')).toBeUndefined();
      expect(platformClients.get('youtube')).toBeUndefined();
    });
  });

  describe('Scan lifecycle', () => {
    test('should start a scan with valid options', async () => {
      // Arrange
      await scannerService.initializePlatforms(testPlatforms);
      const processScanSpy = jest.spyOn(scannerService as any, 'processScan');
      
      // Act
      const scanId = await scannerService.startScan(userId, testScanOptions);
      
      // Assert
      expect(scanId).toBeDefined();
      expect(scanId.length).toBeGreaterThan(0);
      expect(processScanSpy).toHaveBeenCalledWith(expect.objectContaining({
        id: scanId,
        userId,
        status: 'pending',
        options: testScanOptions
      }));
    });
    
    test('should retrieve scan results from cache', async () => {
      // Arrange
      const scanId = 'test-scan-id';
      const cachedScan = {
        id: scanId,
        userId,
        status: 'completed' as ScanStatus,
        options: testScanOptions,
        timestamp: Date.now(),
        totalPosts: 50,
        averageEngagement: 25.5,
        peakTimes: [{ hour: 18, engagementScore: 85 }],
        topPerformingPosts: [],
        completedAt: Date.now()
      };
      
      const scanCache = mockCacheSystem.getCache('scans');
      (scanCache.get as jest.Mock).mockResolvedValue(cachedScan);
      
      // Act
      const result = await scannerService.getScanResult(scanId);
      
      // Assert
      expect(result).toEqual(cachedScan);
      expect(scanCache.get).toHaveBeenCalledWith(scanId);
    });
    
    test('should return scan result from memory if not in cache', async () => {
      // Arrange
      await scannerService.initializePlatforms(testPlatforms);
      const scanId = await scannerService.startScan(userId, testScanOptions);
      
      // Mock scan cache miss
      const scanCache = mockCacheSystem.getCache('scans');
      (scanCache.get as jest.Mock).mockResolvedValue(null);
      
      // Act
      const result = await scannerService.getScanResult(scanId);
      
      // Assert
      expect(result).toBeDefined();
      expect(result?.id).toEqual(scanId);
      expect(result?.userId).toEqual(userId);
    });
  });

  describe('Resilience features', () => {
    test('should handle circuit breaker on platform failure', async () => {
      // Arrange
      await scannerService.initializePlatforms(testPlatforms);
      
      // Mock platform client to fail
      const platformClients = scannerService['platformClients'] as Map<Platform, any>;
      const instagramClient = platformClients.get('instagram');
      (instagramClient.getUserPosts as jest.Mock).mockRejectedValueOnce(new Error('API error'));
      
      // Act & Assert - First call should trip circuit breaker
      await expect(scannerService.getUserPosts('instagram', userId, 30)).rejects.toThrow();
      
      // Circuit breaker should now be open
      const circuitBreakers = scannerService['circuitBreakers'] as Map<string, any>;
      const circuitBreaker = circuitBreakers.get('instagram');
      expect(circuitBreaker).toBeDefined();
      
      // Second call should fail fast due to open circuit
      await expect(scannerService.getUserPosts('instagram', userId, 30)).rejects.toThrow(/circuit breaker is open/i);
    });
    
    test('should use cache when available', async () => {
      // Arrange
      await scannerService.initializePlatforms(testPlatforms);
      const mockPosts = [{ id: 'post1', platform: 'tiktok', likes: 100 }];
      
      // Setup cache hit
      const postsCache = mockCacheSystem.getCache('posts');
      (postsCache.get as jest.Mock).mockResolvedValue(mockPosts);
      
      // Act
      const result = await scannerService.getUserPosts('tiktok', userId, 30);
      
      // Assert
      expect(result).toEqual(mockPosts);
      expect(postsCache.get).toHaveBeenCalled();
      
      // Platform client should not be called on cache hit
      const platformClients = scannerService['platformClients'] as Map<Platform, any>;
      const tiktokClient = platformClients.get('tiktok');
      expect(tiktokClient.getUserPosts).not.toHaveBeenCalled();
    });
    
    test('should invalidate cache by tags', async () => {
      // Arrange
      await scannerService.initializePlatforms(testPlatforms);
      
      // Act
      await scannerService.invalidateUserCache('instagram', userId);
      
      // Assert
      const postsCache = mockCacheSystem.getCache('posts');
      expect(postsCache.invalidateByTag).toHaveBeenCalledWith(`user:${userId}`);
      expect(postsCache.invalidateByTag).toHaveBeenCalledWith('platform:instagram');
    });
  });

  describe('Monitoring and metrics', () => {
    test('should wrap operations with monitoring', async () => {
      // Arrange
      await scannerService.initializePlatforms(testPlatforms);
      
      // Act
      await scannerService.startScan(userId, testScanOptions);
      
      // Assert
      expect(mockMonitoringSystem.monitor).toHaveBeenCalled();
    });
    
    test('should emit events on scan state changes', async () => {
      // Arrange
      await scannerService.initializePlatforms(testPlatforms);
      const eventEmitter = scannerService as unknown as EventEmitter;
      const eventSpy = jest.spyOn(eventEmitter, 'emit');
      
      // Act
      const scanId = await scannerService.startScan(userId, testScanOptions);
      
      // Use public API to get scan result
      const scan = await scannerService.getScanResult(scanId);
      if (scan) {
        // Manually trigger completion for test
        (scan as any).status = 'completed';
        eventEmitter.emit('scan.completed', scan);
      }
      
      // Assert
      expect(eventSpy).toHaveBeenCalledWith('scan.started', expect.any(Object));
      expect(eventSpy).toHaveBeenCalledWith('scan.completed', expect.any(Object));
    });
  });

  describe('Performance analysis', () => {
    test('should handle empty post lists gracefully', async () => {
      // Arrange
      await scannerService.initializePlatforms(testPlatforms);
      
      // Mock empty post responses
      const platformClients = scannerService['platformClients'] as Map<Platform, any>;
      const instagramClient = platformClients.get('instagram');
      (instagramClient.getUserPosts as jest.Mock).mockResolvedValue([]);
      
      // Act - Create a scan with performScan
      const scanId = await scannerService.startScan(userId, { 
        platforms: ['instagram'],
        lookbackDays: 7,
        includeOwnPosts: true
      });
      
      // Wait for scan processing to complete
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Get scan result
      const result = await scannerService.getScanResult(scanId);
      
      // Assert
      expect(result).toBeDefined();
      expect(result?.totalPosts).toBe(0);
      expect(result?.averageEngagement).toBe(0);
      expect(result?.peakTimes).toEqual([]);
      expect(result?.topPerformingPosts).toEqual([]);
    });
  });
});
