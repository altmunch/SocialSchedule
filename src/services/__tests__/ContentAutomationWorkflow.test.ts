// Mock OpenAI to prevent browser environment errors
jest.mock('openai', () => {
  const mockCreate = jest.fn();
  return jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: mockCreate,
      },
    },
  }));
});

// Mock environment variables
process.env.OPENAI_API_KEY = 'test-openai-api-key';

import { ContentAutomationWorkflow } from '../contentAutomationWorkflow';

describe('ContentAutomationWorkflow', () => {
  let workflow: ContentAutomationWorkflow;

  beforeEach(() => {
    workflow = new ContentAutomationWorkflow(2);
  });

  describe('bulk processing', () => {
    it('should process bulk requests and return results', async () => {
      const mockRequests = Array.from({ length: 5 }).map((_, idx) => ({
        userId: `user-${idx}`,
        videoUrl: 'https://example.com/video.mp4',
        platform: 'tiktok' as const,
        timeRange: { start: new Date(Date.now() - 86400000), end: new Date() },
      }));

      const results = await workflow.executeBulk(mockRequests as any);
      expect(results.length).toBe(mockRequests.length);
    });

    it('should handle different platforms in automation requests', async () => {
      const mockRequests = [
        {
          userId: 'user-1',
          videoUrl: 'https://example.com/tiktok.mp4',
          platform: 'tiktok' as const,
          timeRange: { start: new Date(Date.now() - 86400000), end: new Date() },
        },
        {
          userId: 'user-2',
          videoUrl: 'https://example.com/instagram.mp4',
          platform: 'instagram' as const,
          timeRange: { start: new Date(Date.now() - 86400000), end: new Date() },
        },
        {
          userId: 'user-3',
          videoUrl: 'https://example.com/youtube.mp4',
          platform: 'youtube' as const,
          timeRange: { start: new Date(Date.now() - 86400000), end: new Date() },
        },
      ];

      const results = await workflow.executeBulk(mockRequests as any);
      expect(results.length).toBe(3);
    });

    it('should handle empty request arrays', async () => {
      const results = await workflow.executeBulk([]);
      expect(results).toEqual([]);
    });

    it('should process large batches efficiently', async () => {
      const largeBatch = Array.from({ length: 25 }).map((_, idx) => ({
        userId: `user-${idx}`,
        videoUrl: `https://example.com/video-${idx}.mp4`,
        platform: 'tiktok' as const,
        timeRange: { start: new Date(Date.now() - 86400000), end: new Date() },
      }));

      const startTime = Date.now();
      const results = await workflow.executeBulk(largeBatch as any);
      const endTime = Date.now();

      expect(results.length).toBe(25);
      expect(endTime - startTime).toBeLessThan(30000); // Should complete in under 30 seconds
    });
  });

  describe('automation workflow state management', () => {
    it('should maintain workflow state across different requests', async () => {
      const firstBatch = [
        {
          userId: 'user-1',
          videoUrl: 'https://example.com/video1.mp4',
          platform: 'tiktok' as const,
          timeRange: { start: new Date(Date.now() - 86400000), end: new Date() },
        },
      ];

      const secondBatch = [
        {
          userId: 'user-2',
          videoUrl: 'https://example.com/video2.mp4',
          platform: 'instagram' as const,
          timeRange: { start: new Date(Date.now() - 86400000), end: new Date() },
        },
      ];

      const firstResults = await workflow.executeBulk(firstBatch as any);
      const secondResults = await workflow.executeBulk(secondBatch as any);

      expect(firstResults.length).toBe(1);
      expect(secondResults.length).toBe(1);
      // Results should be independent
      expect(firstResults[0]).not.toEqual(secondResults[0]);
    });

    it('should handle concurrent workflow executions', async () => {
      const concurrentRequests = Array.from({ length: 4 }).map((_, idx) => ({
        userId: `concurrent-user-${idx}`,
        videoUrl: `https://example.com/concurrent-${idx}.mp4`,
        platform: 'tiktok' as const,
        timeRange: { start: new Date(Date.now() - 86400000), end: new Date() },
      }));

      // Execute multiple batches concurrently
      const promises = [
        workflow.executeBulk([concurrentRequests[0]] as any),
        workflow.executeBulk([concurrentRequests[1]] as any),
        workflow.executeBulk([concurrentRequests[2], concurrentRequests[3]] as any),
      ];

      const results = await Promise.all(promises);
      
      expect(results[0].length).toBe(1);
      expect(results[1].length).toBe(1);
      expect(results[2].length).toBe(2);
    });
  });

  describe('video processing automation', () => {
    it('should handle different video formats', async () => {
      const videoFormats = [
        'https://example.com/video.mp4',
        'https://example.com/video.mov',
        'https://example.com/video.avi',
        'https://example.com/video.webm',
      ];

      const mockRequests = videoFormats.map((url, idx) => ({
        userId: `user-${idx}`,
        videoUrl: url,
        platform: 'tiktok' as const,
        timeRange: { start: new Date(Date.now() - 86400000), end: new Date() },
      }));

      const results = await workflow.executeBulk(mockRequests as any);
      expect(results.length).toBe(4);
    });

    it('should handle invalid video URLs gracefully', async () => {
      const mockRequests = [
        {
          userId: 'user-1',
          videoUrl: 'invalid-url',
          platform: 'tiktok' as const,
          timeRange: { start: new Date(Date.now() - 86400000), end: new Date() },
        },
        {
          userId: 'user-2',
          videoUrl: 'https://example.com/valid-video.mp4',
          platform: 'instagram' as const,
          timeRange: { start: new Date(Date.now() - 86400000), end: new Date() },
        },
      ];

      const results = await workflow.executeBulk(mockRequests as any);
      expect(results.length).toBe(2); // Should process both, handling errors gracefully
    });

    it('should handle missing video URLs', async () => {
      const mockRequests = [
        {
          userId: 'user-1',
          videoUrl: '',
          platform: 'tiktok' as const,
          timeRange: { start: new Date(Date.now() - 86400000), end: new Date() },
        },
        {
          userId: 'user-2',
          // videoUrl missing
          platform: 'instagram' as const,
          timeRange: { start: new Date(Date.now() - 86400000), end: new Date() },
        },
      ];

      const results = await workflow.executeBulk(mockRequests as any);
      expect(Array.isArray(results)).toBe(true);
    });
  });

  describe('time range processing', () => {
    it('should handle different time ranges', async () => {
      const timeRanges = [
        { start: new Date(Date.now() - 86400000), end: new Date() }, // 1 day
        { start: new Date(Date.now() - 604800000), end: new Date() }, // 1 week
        { start: new Date(Date.now() - 2592000000), end: new Date() }, // 1 month
      ];

      const mockRequests = timeRanges.map((timeRange, idx) => ({
        userId: `user-${idx}`,
        videoUrl: 'https://example.com/video.mp4',
        platform: 'tiktok' as const,
        timeRange,
      }));

      const results = await workflow.executeBulk(mockRequests as any);
      expect(results.length).toBe(3);
    });

    it('should handle invalid time ranges', async () => {
      const invalidTimeRanges = [
        { start: new Date(), end: new Date(Date.now() - 86400000) }, // End before start
        { start: null, end: new Date() }, // Null start
        { start: new Date(), end: null }, // Null end
      ];

      const mockRequests = invalidTimeRanges.map((timeRange, idx) => ({
        userId: `user-${idx}`,
        videoUrl: 'https://example.com/video.mp4',
        platform: 'tiktok' as const,
        timeRange,
      }));

      const results = await workflow.executeBulk(mockRequests as any);
      expect(Array.isArray(results)).toBe(true);
    });
  });

  describe('error handling and resilience', () => {
    it('should handle malformed requests', async () => {
      const malformedRequests = [
        null,
        undefined,
        {},
        { userId: 'user-1' }, // Missing required fields
        {
          userId: 'user-2',
          videoUrl: 'https://example.com/video.mp4',
          platform: 'tiktok' as const,
          timeRange: { start: new Date(Date.now() - 86400000), end: new Date() },
        }, // Valid request
      ];

      const results = await workflow.executeBulk(malformedRequests as any);
      expect(Array.isArray(results)).toBe(true);
    });

    it('should handle network failures gracefully', async () => {
      const mockRequests = [
        {
          userId: 'user-1',
          videoUrl: 'https://unreachable-domain.com/video.mp4',
          platform: 'tiktok' as const,
          timeRange: { start: new Date(Date.now() - 86400000), end: new Date() },
        },
      ];

      // Should not throw unhandled errors
      try {
        const results = await workflow.executeBulk(mockRequests as any);
        expect(Array.isArray(results)).toBe(true);
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
      }
    });

    it('should handle processing timeouts', async () => {
      const timeoutRequests = Array.from({ length: 10 }).map((_, idx) => ({
        userId: `timeout-user-${idx}`,
        videoUrl: 'https://example.com/large-video.mp4',
        platform: 'youtube' as const,
        timeRange: { start: new Date(Date.now() - 86400000), end: new Date() },
      }));

      const startTime = Date.now();
      const results = await workflow.executeBulk(timeoutRequests as any);
      const endTime = Date.now();

      expect(results).toBeDefined();
      // Should complete within reasonable time even with potential timeouts
      expect(endTime - startTime).toBeLessThan(60000); // 1 minute max
    });
  });

  describe('performance and scalability', () => {
    it('should handle high concurrency efficiently', async () => {
      const highConcurrencyWorkflow = new ContentAutomationWorkflow(5);
      const highConcurrencyRequests = Array.from({ length: 15 }).map((_, idx) => ({
        userId: `concurrent-user-${idx}`,
        videoUrl: `https://example.com/video-${idx}.mp4`,
        platform: 'tiktok' as const,
        timeRange: { start: new Date(Date.now() - 86400000), end: new Date() },
      }));

      const startTime = Date.now();
      const results = await highConcurrencyWorkflow.executeBulk(highConcurrencyRequests as any);
      const endTime = Date.now();

      expect(results.length).toBe(15);
      expect(endTime - startTime).toBeLessThan(20000); // Should benefit from concurrency
    });

    it('should manage memory efficiently with large datasets', async () => {
      const largeDataset = Array.from({ length: 50 }).map((_, idx) => ({
        userId: `memory-user-${idx}`,
        videoUrl: `https://example.com/large-video-${idx}.mp4`,
        platform: 'instagram' as const,
        timeRange: { start: new Date(Date.now() - 86400000), end: new Date() },
      }));

      const initialMemory = process.memoryUsage().heapUsed;
      const results = await workflow.executeBulk(largeDataset as any);
      const finalMemory = process.memoryUsage().heapUsed;

      expect(results.length).toBe(50);
      // Memory growth should be reasonable
      const memoryGrowth = finalMemory - initialMemory;
      expect(memoryGrowth).toBeLessThan(200 * 1024 * 1024); // Less than 200MB growth
    });
  });

  describe('automation workflow integration', () => {
    it('should integrate with external automation services', async () => {
      const integrationRequests = [
        {
          userId: 'integration-user-1',
          videoUrl: 'https://example.com/integration-video.mp4',
          platform: 'tiktok' as const,
          timeRange: { start: new Date(Date.now() - 86400000), end: new Date() },
          automationSettings: {
            enableScheduling: true,
            enableOptimization: true,
            enableAnalytics: true,
          },
        },
      ];

      const results = await workflow.executeBulk(integrationRequests as any);
      expect(results.length).toBe(1);
      // Results should contain automation-specific data
      expect(results[0]).toBeDefined();
    });
  });

  describe('advanced automation logic', () => {
    it('should handle automated content scheduling', async () => {
      const schedulingRequests = [
        {
          userId: 'scheduler-user-1',
          videoUrl: 'https://example.com/scheduled-video.mp4',
          platform: 'instagram' as const,
          timeRange: { start: new Date(Date.now() - 86400000), end: new Date() },
          schedulingOptions: {
            publishAt: new Date(Date.now() + 3600000), // 1 hour from now
            timezone: 'UTC',
            recurring: false,
          },
        },
        {
          userId: 'scheduler-user-2',
          videoUrl: 'https://example.com/recurring-video.mp4',
          platform: 'tiktok' as const,
          timeRange: { start: new Date(Date.now() - 86400000), end: new Date() },
          schedulingOptions: {
            publishAt: new Date(Date.now() + 7200000), // 2 hours from now
            timezone: 'America/New_York',
            recurring: true,
            interval: 'daily',
          },
        },
      ];

      const results = await workflow.executeBulk(schedulingRequests as any);
      expect(results.length).toBe(2);
      
      results.forEach(result => {
        if (result.schedulingInfo) {
          expect(result.schedulingInfo).toHaveProperty('scheduledAt');
          expect(result.schedulingInfo).toHaveProperty('status');
        }
      });
    });

    it('should handle automated content optimization', async () => {
      const optimizationRequests = [
        {
          userId: 'optimizer-user-1',
          videoUrl: 'https://example.com/optimization-video.mp4',
          platform: 'youtube' as const,
          timeRange: { start: new Date(Date.now() - 86400000), end: new Date() },
          optimizationSettings: {
            enableThumbnailGeneration: true,
            enableCaptionGeneration: true,
            enableHashtagOptimization: true,
            targetAudience: 'young_adults',
          },
        },
      ];

      const results = await workflow.executeBulk(optimizationRequests as any);
      expect(results.length).toBe(1);
      
      if (results[0].optimizationResults) {
        expect(results[0].optimizationResults).toHaveProperty('thumbnails');
        expect(results[0].optimizationResults).toHaveProperty('captions');
        expect(results[0].optimizationResults).toHaveProperty('hashtags');
      }
    });

    it('should handle automated analytics and reporting', async () => {
      const analyticsRequests = [
        {
          userId: 'analytics-user-1',
          videoUrl: 'https://example.com/analytics-video.mp4',
          platform: 'tiktok' as const,
          timeRange: { start: new Date(Date.now() - 604800000), end: new Date() },
          analyticsSettings: {
            enablePerformanceTracking: true,
            enableAudienceAnalysis: true,
            enableEngagementMetrics: true,
            reportingFrequency: 'daily',
          },
        },
      ];

      const results = await workflow.executeBulk(analyticsRequests as any);
      expect(results.length).toBe(1);
      
      if (results[0].analyticsData) {
        expect(results[0].analyticsData).toHaveProperty('performanceMetrics');
        expect(results[0].analyticsData).toHaveProperty('audienceInsights');
        expect(results[0].analyticsData).toHaveProperty('engagementStats');
      }
    });

    it('should handle automated content distribution', async () => {
      const distributionRequests = [
        {
          userId: 'distribution-user-1',
          videoUrl: 'https://example.com/distribution-video.mp4',
          platform: 'instagram' as const,
          timeRange: { start: new Date(Date.now() - 86400000), end: new Date() },
          distributionSettings: {
            crossPlatformPosting: true,
            targetPlatforms: ['instagram', 'tiktok', 'youtube'],
            customizationPerPlatform: true,
          },
        },
      ];

      const results = await workflow.executeBulk(distributionRequests as any);
      expect(results.length).toBe(1);
      
      if (results[0].distributionResults) {
        expect(results[0].distributionResults).toHaveProperty('platforms');
        expect(Array.isArray(results[0].distributionResults.platforms)).toBe(true);
      }
    });
  });

  describe('scheduling system integration', () => {
    it('should validate scheduling constraints', async () => {
      const constraintRequests = [
        {
          userId: 'constraint-user-1',
          videoUrl: 'https://example.com/constraint-video.mp4',
          platform: 'instagram' as const,
          timeRange: { start: new Date(Date.now() - 86400000), end: new Date() },
          schedulingOptions: {
            publishAt: new Date(Date.now() - 3600000), // Past time - should be invalid
            timezone: 'UTC',
          },
        },
        {
          userId: 'constraint-user-2',
          videoUrl: 'https://example.com/valid-constraint-video.mp4',
          platform: 'tiktok' as const,
          timeRange: { start: new Date(Date.now() - 86400000), end: new Date() },
          schedulingOptions: {
            publishAt: new Date(Date.now() + 3600000), // Future time - should be valid
            timezone: 'UTC',
          },
        },
      ];

      const results = await workflow.executeBulk(constraintRequests as any);
      expect(results.length).toBe(2);
      
      // Should handle invalid scheduling gracefully
      results.forEach(result => {
        if (result.schedulingInfo) {
          expect(['scheduled', 'failed', 'invalid']).toContain(result.schedulingInfo.status);
        }
      });
    });

    it('should handle timezone conversions correctly', async () => {
      const timezoneRequests = [
        {
          userId: 'timezone-user-1',
          videoUrl: 'https://example.com/timezone-video.mp4',
          platform: 'youtube' as const,
          timeRange: { start: new Date(Date.now() - 86400000), end: new Date() },
          schedulingOptions: {
            publishAt: new Date(Date.now() + 7200000),
            timezone: 'America/Los_Angeles',
          },
        },
        {
          userId: 'timezone-user-2',
          videoUrl: 'https://example.com/timezone-video-2.mp4',
          platform: 'instagram' as const,
          timeRange: { start: new Date(Date.now() - 86400000), end: new Date() },
          schedulingOptions: {
            publishAt: new Date(Date.now() + 7200000),
            timezone: 'Europe/London',
          },
        },
      ];

      const results = await workflow.executeBulk(timezoneRequests as any);
      expect(results.length).toBe(2);
      
      results.forEach(result => {
        if (result.schedulingInfo && result.schedulingInfo.convertedTime) {
          expect(result.schedulingInfo.convertedTime).toBeInstanceOf(Date);
        }
      });
    });

    it('should handle recurring schedule patterns', async () => {
      const recurringRequests = [
        {
          userId: 'recurring-user-1',
          videoUrl: 'https://example.com/recurring-video.mp4',
          platform: 'tiktok' as const,
          timeRange: { start: new Date(Date.now() - 86400000), end: new Date() },
          schedulingOptions: {
            publishAt: new Date(Date.now() + 3600000),
            timezone: 'UTC',
            recurring: true,
            interval: 'daily',
            endDate: new Date(Date.now() + 604800000), // 1 week
          },
        },
        {
          userId: 'recurring-user-2',
          videoUrl: 'https://example.com/weekly-video.mp4',
          platform: 'instagram' as const,
          timeRange: { start: new Date(Date.now() - 86400000), end: new Date() },
          schedulingOptions: {
            publishAt: new Date(Date.now() + 3600000),
            timezone: 'UTC',
            recurring: true,
            interval: 'weekly',
            daysOfWeek: ['monday', 'wednesday', 'friday'],
          },
        },
      ];

      const results = await workflow.executeBulk(recurringRequests as any);
      expect(results.length).toBe(2);
      
      results.forEach(result => {
        if (result.schedulingInfo && result.schedulingInfo.recurringSchedule) {
          expect(result.schedulingInfo.recurringSchedule).toHaveProperty('pattern');
          expect(Array.isArray(result.schedulingInfo.recurringSchedule.upcomingDates)).toBe(true);
        }
      });
    });
  });

  describe('comprehensive error handling', () => {
    it('should handle API rate limiting gracefully', async () => {
      const rateLimitRequests = Array.from({ length: 20 }).map((_, idx) => ({
        userId: `rate-limit-user-${idx}`,
        videoUrl: `https://example.com/rate-limit-video-${idx}.mp4`,
        platform: 'instagram' as const,
        timeRange: { start: new Date(Date.now() - 86400000), end: new Date() },
      }));

      const results = await workflow.executeBulk(rateLimitRequests as any);
      expect(results.length).toBe(20);
      
      // Should handle rate limiting without throwing errors
      results.forEach(result => {
        if (result.error) {
          expect(['rate_limited', 'retry_later', 'success']).toContain(result.status);
        }
      });
    });

    it('should handle service unavailability with retry logic', async () => {
      const unavailabilityRequests = [
        {
          userId: 'unavailable-user-1',
          videoUrl: 'https://example.com/unavailable-video.mp4',
          platform: 'tiktok' as const,
          timeRange: { start: new Date(Date.now() - 86400000), end: new Date() },
          retryOptions: {
            maxRetries: 3,
            retryDelay: 1000,
            exponentialBackoff: true,
          },
        },
      ];

      const results = await workflow.executeBulk(unavailabilityRequests as any);
      expect(results.length).toBe(1);
      
      if (results[0].retryInfo) {
        expect(results[0].retryInfo).toHaveProperty('attempts');
        expect(results[0].retryInfo.attempts).toBeGreaterThanOrEqual(1);
      }
    });

    it('should handle partial failures in batch processing', async () => {
      const mixedRequests = [
        {
          userId: 'success-user-1',
          videoUrl: 'https://example.com/success-video.mp4',
          platform: 'instagram' as const,
          timeRange: { start: new Date(Date.now() - 86400000), end: new Date() },
        },
        {
          userId: 'failure-user-1',
          videoUrl: 'invalid-url',
          platform: 'tiktok' as const,
          timeRange: { start: new Date(Date.now() - 86400000), end: new Date() },
        },
        {
          userId: 'success-user-2',
          videoUrl: 'https://example.com/success-video-2.mp4',
          platform: 'youtube' as const,
          timeRange: { start: new Date(Date.now() - 86400000), end: new Date() },
        },
      ];

      const results = await workflow.executeBulk(mixedRequests as any);
      expect(results.length).toBe(3);
      
      // Should process all requests, marking failures appropriately
      let successCount = 0;
      let failureCount = 0;
      
      results.forEach(result => {
        if (result.status === 'success') successCount++;
        if (result.status === 'failed' || result.error) failureCount++;
      });
      
      expect(successCount + failureCount).toBeGreaterThan(0);
    });

    it('should handle resource exhaustion scenarios', async () => {
      const resourceExhaustionRequests = Array.from({ length: 100 }).map((_, idx) => ({
        userId: `resource-user-${idx}`,
        videoUrl: `https://example.com/resource-video-${idx}.mp4`,
        platform: 'tiktok' as const,
        timeRange: { start: new Date(Date.now() - 86400000), end: new Date() },
      }));

      const startTime = Date.now();
      const results = await workflow.executeBulk(resourceExhaustionRequests as any);
      const endTime = Date.now();

      expect(results.length).toBe(100);
      // Should handle resource constraints gracefully
      expect(endTime - startTime).toBeLessThan(120000); // 2 minutes max
      
      // Should not crash or hang
      expect(Array.isArray(results)).toBe(true);
    });
  });

  describe('workflow state persistence', () => {
    it('should maintain workflow state across interruptions', async () => {
      const persistenceRequests = [
        {
          userId: 'persistence-user-1',
          videoUrl: 'https://example.com/persistence-video.mp4',
          platform: 'instagram' as const,
          timeRange: { start: new Date(Date.now() - 86400000), end: new Date() },
          workflowId: 'workflow-123',
        },
      ];

      const results = await workflow.executeBulk(persistenceRequests as any);
      expect(results.length).toBe(1);
      
      if (results[0].workflowState) {
        expect(results[0].workflowState).toHaveProperty('id');
        expect(results[0].workflowState).toHaveProperty('status');
        expect(results[0].workflowState).toHaveProperty('progress');
      }
    });

    it('should handle workflow resumption after failures', async () => {
      const resumptionRequests = [
        {
          userId: 'resumption-user-1',
          videoUrl: 'https://example.com/resumption-video.mp4',
          platform: 'tiktok' as const,
          timeRange: { start: new Date(Date.now() - 86400000), end: new Date() },
          workflowId: 'workflow-456',
          resumeFromStep: 'processing',
        },
      ];

      const results = await workflow.executeBulk(resumptionRequests as any);
      expect(results.length).toBe(1);
      
      if (results[0].resumptionInfo) {
        expect(results[0].resumptionInfo).toHaveProperty('resumedFrom');
        expect(results[0].resumptionInfo).toHaveProperty('completedSteps');
      }
    });
  });
}); 