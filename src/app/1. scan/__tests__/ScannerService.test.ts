// difficult: Tests for ScannerService
import { ScannerService } from '../services/ScannerService';
import { generateMockPostMetrics, generateMockScanResult, defaultScanOptions } from './testHelpers';

// Mock platform clients
jest.mock('../services/platforms/TikTokClient', () => ({
  TikTokClient: jest.fn().mockImplementation(() => ({
    getUserPosts: jest.fn().mockResolvedValue([generateMockPostMetrics()]),
    getCompetitorPosts: jest.fn().mockResolvedValue([generateMockPostMetrics()]),
  })),
}));

jest.mock('../services/platforms/InstagramClient', () => ({
  InstagramClient: jest.fn().mockImplementation(() => ({
    getUserPosts: jest.fn().mockResolvedValue([generateMockPostMetrics()]),
    getCompetitorPosts: jest.fn().mockResolvedValue([generateMockPostMetrics()]),
  })),
}));

jest.mock('../services/platforms/YouTubeClient', () => ({
  YouTubeClient: jest.fn().mockImplementation(() => ({
    getUserPosts: jest.fn().mockResolvedValue([generateMockPostMetrics()]),
    getCompetitorPosts: jest.fn().mockResolvedValue([generateMockPostMetrics()]),
  })),
}));

describe('ScannerService', () => {
  let scannerService: ScannerService;
  
  const mockUserId = 'user123';
  const mockCompetitorIds = ['comp1', 'comp2'];

  beforeEach(() => {
    scannerService = new ScannerService();
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('startScan', () => {
    it('should start a new scan with default options', async () => {
      const scanId = await scannerService.startScan(mockUserId, defaultScanOptions);
      
      expect(scanId).toBeDefined();
      
      // Verify scan was added to the cache
      const scanResult = (scannerService as any).scanResultCache.get(scanId);
      expect(scanResult).toBeDefined();
      expect(scanResult.userId).toBe(mockUserId);
      expect(scanResult.status).toMatch(/pending|completed/);
    });

    it('should include competitor posts when specified', async () => {
      const scanId = await scannerService.startScan(mockUserId, {
        ...defaultScanOptions,
        competitors: mockCompetitorIds,
      });
      
      // Verify scan was created with competitors
      const scanResult = (scannerService as any).scanResultCache.get(scanId);
      expect(scanResult).toBeDefined();
      expect(scanResult.status).not.toBe('failed');
    });
  });

  describe('getScanStatus', () => {
    it('should return the status of a scan', async () => {
      // Create a mock scan result
      const mockScan = generateMockScanResult({ status: 'in_progress' });
      (scannerService as any).scanResultCache.set(mockScan.id, mockScan);
      
      const status = await (scannerService as any).getScanStatus(mockScan.id);
      
      expect(status).toHaveProperty('id', mockScan.id);
      expect(status).toHaveProperty('status', 'in_progress');
    });

    it('should throw an error for non-existent scan', async () => {
      await expect((scannerService as any).getScanStatus('non-existent-id'))
        .rejects
        .toThrow('Scan not found');
    });
  });

  describe('getScanResult', () => {
    it('should return scan results when completed', async () => {
      // Create a mock completed scan
      const mockResult = generateMockScanResult({ 
        status: 'completed',
        metrics: {
          totalPosts: 10,
          averageEngagement: 5.5,
          peakTimes: [{ hour: 12, engagementScore: 10 }],
          topPerformingPosts: [generateMockPostMetrics()]
        }
      });
      
      // Add to cache
      (scannerService as any).scanResultCache.set(mockResult.id, mockResult);
      
      const result = await (scannerService as any).getScanResult(mockResult.id);
      
      expect(result).toHaveProperty('id', mockResult.id);
      expect(result).toHaveProperty('status', 'completed');
      expect(result).toHaveProperty('metrics');
    });

    it('should throw an error if scan is not completed', async () => {
      // Create an in-progress scan
      const scanId = 'in-progress-scan';
      (scannerService as any).scanResultCache.set(scanId, {
        id: scanId,
        userId: mockUserId,
        status: 'in_progress',
        startTime: new Date(),
        options: defaultScanOptions,
      });
      
      await expect((scannerService as any).getScanResult(scanId))
        .rejects
        .toThrow('Scan is not yet completed');
    });
  });

  describe('listUserScans', () => {
    it('should return all scans for a user', async () => {
      // Create multiple scans for the same user
      const scan1 = await scannerService.startScan(mockUserId, defaultScanOptions);
      const scan2 = await scannerService.startScan(mockUserId, {
        ...defaultScanOptions,
        platforms: ['instagram'],
      });
      
      // Add a scan for a different user
      await scannerService.startScan('other-user', defaultScanOptions);
      
      // Get scans for our test user
      const scans = await (scannerService as any).listUserScans(mockUserId);
      
      // Should only return scans for the specified user
      expect(scans.length).toBeGreaterThanOrEqual(2);
      expect(scans.every((scan: any) => scan.userId === mockUserId)).toBe(true);
      expect(scans.some((scan: any) => scan.id === scan1)).toBe(true);
      expect(scans.some((scan: any) => scan.id === scan2)).toBe(true);
    });

    it('should return empty array for user with no scans', async () => {
      const scans = await (scannerService as any).listUserScans('non-existent-user');
      expect(scans).toEqual([]);
    });
  });

  describe('cleanupExpiredScans', () => {
    it('should remove scans older than the expiry time', async () => {
      // Create an old scan
      const oldScanId = 'old-scan';
      (scannerService as any).scanResultCache.set(oldScanId, {
        id: oldScanId,
        userId: mockUserId,
        status: 'completed',
        startTime: new Date(Date.now() - 25 * 60 * 60 * 1000), // 25 hours ago
        endTime: new Date(Date.now() - 24 * 60 * 60 * 1000), // 24 hours ago
        options: defaultScanOptions,
        metrics: {
          totalPosts: 10,
          averageEngagement: 5.5,
          peakTimes: [],
          topPerformingPosts: []
        }
      });
      
      // Create a recent scan
      const recentScanId = 'recent-scan';
      (scannerService as any).scanResultCache.set(recentScanId, {
        id: recentScanId,
        userId: mockUserId,
        status: 'completed',
        startTime: new Date(),
        endTime: new Date(),
        options: defaultScanOptions,
        metrics: {
          totalPosts: 5,
          averageEngagement: 7.5,
          peakTimes: [],
          topPerformingPosts: []
        }
      });
      
      // Run cleanup
      (scannerService as any).cleanupExpiredScans();
      
      // Verify old scan was removed, recent scan remains
      expect((scannerService as any).scanResultCache.get(oldScanId)).toBeUndefined();
      expect((scannerService as any).scanResultCache.get(recentScanId)).toBeDefined();
    });
  });
});
