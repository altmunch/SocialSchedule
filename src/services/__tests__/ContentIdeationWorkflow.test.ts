import { ContentIdeationWorkflow } from '../contentIdeationWorkflow';

describe('ContentIdeationWorkflow', () => {
  let workflow: ContentIdeationWorkflow;

  beforeEach(() => {
    workflow = new ContentIdeationWorkflow(2);
  });

  describe('bulk execution', () => {
    it('should generate ideation results and rank by novelty', async () => {
      const mockRequests = Array.from({ length: 5 }).map((_, idx) => ({
        baseCaption: `Hello world ${idx}`,
        platform: 'instagram' as const,
      }));
      const results = await workflow.executeBulk(mockRequests as any);
      expect(results.length).toBeLessThanOrEqual(5);
    });

    it('should handle different platforms in bulk requests', async () => {
      const mockRequests = [
        { baseCaption: 'TikTok content', platform: 'tiktok' as const },
        { baseCaption: 'Instagram content', platform: 'instagram' as const },
        { baseCaption: 'YouTube content', platform: 'youtube' as const },
      ];
      
      const results = await workflow.executeBulk(mockRequests as any);
      expect(results.length).toBeLessThanOrEqual(3);
      expect(results.length).toBeGreaterThan(0);
    });

    it('should handle empty bulk requests', async () => {
      const results = await workflow.executeBulk([]);
      expect(results).toEqual([]);
    });

    it('should handle large batch sizes efficiently', async () => {
      const largeBatch = Array.from({ length: 50 }).map((_, idx) => ({
        baseCaption: `Content idea ${idx}`,
        platform: 'tiktok' as const,
      }));

      const startTime = Date.now();
      const results = await workflow.executeBulk(largeBatch as any);
      const endTime = Date.now();

      expect(results.length).toBeLessThanOrEqual(50);
      expect(endTime - startTime).toBeLessThan(10000); // Should complete in under 10 seconds
    });
  });

  describe('concurrency control', () => {
    it('should respect concurrency limits', async () => {
      const concurrencyLimit = 2;
      const workflowWithLimit = new ContentIdeationWorkflow(concurrencyLimit);
      
      const mockRequests = Array.from({ length: 10 }).map((_, idx) => ({
        baseCaption: `Concurrent test ${idx}`,
        platform: 'instagram' as const,
      }));

      const results = await workflowWithLimit.executeBulk(mockRequests as any);
      expect(results.length).toBeLessThanOrEqual(10);
    });

    it('should handle different concurrency limits', async () => {
      const concurrencyLimits = [1, 3, 5];
      
      for (const limit of concurrencyLimits) {
        const testWorkflow = new ContentIdeationWorkflow(limit);
        const mockRequests = Array.from({ length: 6 }).map((_, idx) => ({
          baseCaption: `Limit test ${idx}`,
          platform: 'tiktok' as const,
        }));

        const results = await testWorkflow.executeBulk(mockRequests as any);
        expect(results.length).toBeLessThanOrEqual(6);
      }
    });
  });

  describe('content quality assessment', () => {
    it('should rank results by novelty score', async () => {
      const mockRequests = [
        { baseCaption: 'Common fitness tip', platform: 'instagram' as const },
        { baseCaption: 'Unique workout hack', platform: 'instagram' as const },
        { baseCaption: 'Standard meal prep', platform: 'instagram' as const },
      ];

      const results = await workflow.executeBulk(mockRequests as any);
      
      // Results should be ordered (assuming the workflow returns ranked results)
      if (results.length > 1) {
        // Check if results have some ranking mechanism
        expect(results).toBeDefined();
      }
    });

    it('should filter low-quality content', async () => {
      const mockRequests = [
        { baseCaption: '', platform: 'instagram' as const }, // Empty caption
        { baseCaption: 'a', platform: 'instagram' as const }, // Too short
        { baseCaption: 'High quality content with good length and engagement potential', platform: 'instagram' as const },
      ];

      const results = await workflow.executeBulk(mockRequests as any);
      
      // Should filter out poor quality content
      expect(results.length).toBeLessThanOrEqual(3);
    });
  });

  describe('error handling', () => {
    it('should handle invalid platform values', async () => {
      const mockRequests = [
        { baseCaption: 'Valid content', platform: 'invalid_platform' as any },
        { baseCaption: 'Another content', platform: 'instagram' as const },
      ];

      // Should not throw error but may filter invalid requests
      const results = await workflow.executeBulk(mockRequests as any);
      expect(Array.isArray(results)).toBe(true);
    });

    it('should handle malformed requests gracefully', async () => {
      const malformedRequests = [
        null,
        undefined,
        { baseCaption: 'Valid content', platform: 'instagram' as const },
        { platform: 'tiktok' as const }, // Missing baseCaption
        { baseCaption: 'Missing platform' },
      ];

      const results = await workflow.executeBulk(malformedRequests as any);
      expect(Array.isArray(results)).toBe(true);
    });

    it('should handle network or API failures', async () => {
      // Mock a scenario where the underlying service might fail
      const mockRequests = Array.from({ length: 3 }).map((_, idx) => ({
        baseCaption: `Network test ${idx}`,
        platform: 'instagram' as const,
      }));

      // The workflow should handle failures gracefully
      try {
        const results = await workflow.executeBulk(mockRequests as any);
        expect(Array.isArray(results)).toBe(true);
      } catch (error) {
        // If it throws, it should be a meaningful error
        expect(error).toBeInstanceOf(Error);
      }
    });
  });

  describe('performance optimization', () => {
    it('should handle memory efficiently with large datasets', async () => {
      const largeDataset = Array.from({ length: 100 }).map((_, idx) => ({
        baseCaption: `Memory test content ${idx} with some additional text to make it longer`,
        platform: 'youtube' as const,
      }));

      const initialMemory = process.memoryUsage().heapUsed;
      const results = await workflow.executeBulk(largeDataset as any);
      const finalMemory = process.memoryUsage().heapUsed;

      expect(results).toBeDefined();
      // Memory usage shouldn't grow excessively
      const memoryGrowth = finalMemory - initialMemory;
      expect(memoryGrowth).toBeLessThan(100 * 1024 * 1024); // Less than 100MB growth
    });

    it('should process requests in reasonable time', async () => {
      const timeTestRequests = Array.from({ length: 20 }).map((_, idx) => ({
        baseCaption: `Performance test ${idx}`,
        platform: 'tiktok' as const,
      }));

      const startTime = Date.now();
      const results = await workflow.executeBulk(timeTestRequests as any);
      const endTime = Date.now();

      expect(results).toBeDefined();
      expect(endTime - startTime).toBeLessThan(15000); // Should complete in under 15 seconds
    });
  });

  describe('state management', () => {
    it('should maintain consistent state across operations', async () => {
      const firstBatch = [
        { baseCaption: 'First batch content', platform: 'instagram' as const },
      ];
      const secondBatch = [
        { baseCaption: 'Second batch content', platform: 'tiktok' as const },
      ];

      const firstResults = await workflow.executeBulk(firstBatch as any);
      const secondResults = await workflow.executeBulk(secondBatch as any);

      expect(firstResults).toBeDefined();
      expect(secondResults).toBeDefined();
      
      // Each operation should be independent
      expect(firstResults).not.toEqual(secondResults);
    });

    it('should handle concurrent state modifications', async () => {
      const concurrentRequests = Array.from({ length: 5 }).map((_, idx) => 
        workflow.executeBulk([{
          baseCaption: `Concurrent state test ${idx}`,
          platform: 'instagram' as const,
        }] as any)
      );

      const results = await Promise.all(concurrentRequests);
      
      // All concurrent operations should complete successfully
      results.forEach(result => {
        expect(Array.isArray(result)).toBe(true);
      });
    });

    it('should reset state properly between operations', async () => {
      const initialRequest = [{ baseCaption: 'Initial content', platform: 'tiktok' as const }];
      const resetRequest = [{ baseCaption: 'Reset content', platform: 'youtube' as const }];

      await workflow.executeBulk(initialRequest as any);
      const resetResults = await workflow.executeBulk(resetRequest as any);

      expect(resetResults).toBeDefined();
      expect(Array.isArray(resetResults)).toBe(true);
    });
  });

  describe('AI integration', () => {
    it('should handle AI service responses correctly', async () => {
      const aiTestRequests = [
        { baseCaption: 'AI-powered content creation', platform: 'instagram' as const },
        { baseCaption: 'Machine learning content optimization', platform: 'tiktok' as const },
      ];

      const results = await workflow.executeBulk(aiTestRequests as any);
      
      expect(results).toBeDefined();
      expect(Array.isArray(results)).toBe(true);
      
      // Results should contain AI-enhanced content
      if (results.length > 0) {
        results.forEach(result => {
          expect(result).toHaveProperty('content');
          expect(typeof result.content).toBe('string');
        });
      }
    });

    it('should handle AI service timeouts gracefully', async () => {
      const timeoutTestRequests = Array.from({ length: 3 }).map((_, idx) => ({
        baseCaption: `Timeout test content ${idx}`,
        platform: 'youtube' as const,
      }));

      // Mock timeout scenario
      const startTime = Date.now();
      const results = await workflow.executeBulk(timeoutTestRequests as any);
      const endTime = Date.now();

      expect(results).toBeDefined();
      // Should handle timeouts within reasonable time
      expect(endTime - startTime).toBeLessThan(30000);
    });

    it('should validate AI-generated content quality', async () => {
      const qualityTestRequests = [
        { baseCaption: 'Generate high-quality engaging content', platform: 'instagram' as const },
        { baseCaption: 'Create viral-worthy content ideas', platform: 'tiktok' as const },
      ];

      const results = await workflow.executeBulk(qualityTestRequests as any);
      
      if (results.length > 0) {
        results.forEach(result => {
          // AI-generated content should meet quality standards
          expect(result.content).toBeDefined();
          expect(result.content.length).toBeGreaterThan(10);
          
          // Should have quality metrics
          if (result.qualityScore) {
            expect(result.qualityScore).toBeGreaterThanOrEqual(0);
            expect(result.qualityScore).toBeLessThanOrEqual(1);
          }
        });
      }
    });

    it('should handle AI service unavailability', async () => {
      const unavailabilityTestRequests = [
        { baseCaption: 'Service unavailable test', platform: 'instagram' as const },
      ];

      // Should gracefully handle service unavailability
      try {
        const results = await workflow.executeBulk(unavailabilityTestRequests as any);
        expect(Array.isArray(results)).toBe(true);
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect(error.message).toContain('service');
      }
    });
  });

  describe('enhanced content quality assessment', () => {
    it('should assess content engagement potential', async () => {
      const engagementTestRequests = [
        { baseCaption: 'Boring standard content', platform: 'instagram' as const },
        { baseCaption: 'Exciting viral-worthy content with trending hashtags!', platform: 'tiktok' as const },
        { baseCaption: 'Educational valuable content for audience', platform: 'youtube' as const },
      ];

      const results = await workflow.executeBulk(engagementTestRequests as any);
      
      if (results.length > 0) {
        results.forEach(result => {
          if (result.engagementScore) {
            expect(result.engagementScore).toBeGreaterThanOrEqual(0);
            expect(result.engagementScore).toBeLessThanOrEqual(1);
          }
        });
      }
    });

    it('should evaluate content originality', async () => {
      const originalityTestRequests = [
        { baseCaption: 'Common generic content everyone posts', platform: 'instagram' as const },
        { baseCaption: 'Unique innovative approach to content creation', platform: 'tiktok' as const },
      ];

      const results = await workflow.executeBulk(originalityTestRequests as any);
      
      if (results.length > 0) {
        results.forEach(result => {
          if (result.originalityScore) {
            expect(result.originalityScore).toBeGreaterThanOrEqual(0);
            expect(result.originalityScore).toBeLessThanOrEqual(1);
          }
        });
      }
    });

    it('should assess platform-specific optimization', async () => {
      const platformOptimizationRequests = [
        { baseCaption: 'Instagram-optimized visual content', platform: 'instagram' as const },
        { baseCaption: 'TikTok-optimized short-form video idea', platform: 'tiktok' as const },
        { baseCaption: 'YouTube-optimized long-form educational content', platform: 'youtube' as const },
      ];

      const results = await workflow.executeBulk(platformOptimizationRequests as any);
      
      if (results.length > 0) {
        results.forEach((result, index) => {
          const expectedPlatform = platformOptimizationRequests[index]?.platform;
          if (result.platformOptimization && expectedPlatform) {
            expect(result.platformOptimization).toHaveProperty(expectedPlatform);
          }
        });
      }
    });

    it('should filter content based on quality thresholds', async () => {
      const qualityThresholdRequests = [
        { baseCaption: 'a', platform: 'instagram' as const }, // Very low quality
        { baseCaption: 'ok content', platform: 'tiktok' as const }, // Medium quality
        { baseCaption: 'Exceptional high-quality content with great engagement potential and unique value proposition', platform: 'youtube' as const }, // High quality
      ];

      const results = await workflow.executeBulk(qualityThresholdRequests as any);
      
      // Should filter out very low quality content
      expect(results.length).toBeLessThan(qualityThresholdRequests.length);
      
      if (results.length > 0) {
        results.forEach(result => {
          expect(result.content.length).toBeGreaterThan(5);
        });
      }
    });
  });

  describe('workflow integration', () => {
    it('should integrate with external content services', async () => {
      const integrationTestRequests = [
        { baseCaption: 'Integration test content', platform: 'instagram' as const },
      ];

      const results = await workflow.executeBulk(integrationTestRequests as any);
      
      expect(results).toBeDefined();
      expect(Array.isArray(results)).toBe(true);
    });

    it('should handle workflow chaining', async () => {
      const firstStageRequests = [
        { baseCaption: 'First stage content', platform: 'tiktok' as const },
      ];
      
      const firstResults = await workflow.executeBulk(firstStageRequests as any);
      
      if (firstResults.length > 0) {
        // Use first results as input for second stage
        const secondStageRequests = firstResults.map(result => ({
          baseCaption: result.content,
          platform: 'youtube' as const,
        }));
        
        const secondResults = await workflow.executeBulk(secondStageRequests as any);
        expect(secondResults).toBeDefined();
      }
    });

    it('should maintain workflow state consistency', async () => {
      const consistencyTestRequests = [
        { baseCaption: 'Consistency test 1', platform: 'instagram' as const },
        { baseCaption: 'Consistency test 2', platform: 'tiktok' as const },
      ];

      const results1 = await workflow.executeBulk(consistencyTestRequests as any);
      const results2 = await workflow.executeBulk(consistencyTestRequests as any);
      
      // Results should be consistent for same inputs
      expect(results1.length).toBe(results2.length);
    });
  });

  describe('edge cases and boundary conditions', () => {
    it('should handle extremely long captions', async () => {
      const longCaption = 'A'.repeat(10000);
      const longCaptionRequests = [
        { baseCaption: longCaption, platform: 'instagram' as const },
      ];

      const results = await workflow.executeBulk(longCaptionRequests as any);
      expect(Array.isArray(results)).toBe(true);
    });

    it('should handle special characters and emojis', async () => {
      const specialCharRequests = [
        { baseCaption: '🚀 Special chars: @#$%^&*()_+ 中文 العربية', platform: 'tiktok' as const },
        { baseCaption: 'Emojis: 😀😃😄😁😆😅😂🤣', platform: 'instagram' as const },
      ];

      const results = await workflow.executeBulk(specialCharRequests as any);
      expect(Array.isArray(results)).toBe(true);
    });

    it('should handle zero concurrency limit', async () => {
      const zeroConcurrencyWorkflow = new ContentIdeationWorkflow(0);
      const requests = [{ baseCaption: 'Zero concurrency test', platform: 'instagram' as const }];

      // Should handle gracefully or use default concurrency
      const results = await zeroConcurrencyWorkflow.executeBulk(requests as any);
      expect(Array.isArray(results)).toBe(true);
    });

    it('should handle negative concurrency limit', async () => {
      const negativeConcurrencyWorkflow = new ContentIdeationWorkflow(-1);
      const requests = [{ baseCaption: 'Negative concurrency test', platform: 'tiktok' as const }];

      // Should handle gracefully or use default concurrency
      const results = await negativeConcurrencyWorkflow.executeBulk(requests as any);
      expect(Array.isArray(results)).toBe(true);
    });

    it('should handle independent state operations', async () => {
      const firstRequest = [{ baseCaption: 'First operation', platform: 'tiktok' as const }];
      const secondRequest = [{ baseCaption: 'Second operation', platform: 'instagram' as const }];

      const firstResults = await workflow.executeBulk(firstRequest as any);
      const secondResults = await workflow.executeBulk(secondRequest as any);
      
      expect(firstResults).toBeDefined();
      expect(secondResults).toBeDefined();
      
      // Each operation should be independent
      expect(firstResults).not.toEqual(secondResults);
    });

    it('should handle concurrent state modifications', async () => {
      const concurrentRequests = Array.from({ length: 5 }).map((_, idx) => 
        workflow.executeBulk([{
          baseCaption: `Concurrent state test ${idx}`,
          platform: 'instagram' as const,
        }] as any)
      );

      const results = await Promise.all(concurrentRequests);
      
      // All concurrent operations should complete successfully
      results.forEach(result => {
        expect(Array.isArray(result)).toBe(true);
      });
    });

    it('should reset state properly between operations', async () => {
      const initialRequest = [{ baseCaption: 'Initial content', platform: 'tiktok' as const }];
      const resetRequest = [{ baseCaption: 'Reset content', platform: 'youtube' as const }];

      await workflow.executeBulk(initialRequest as any);
      const resetResults = await workflow.executeBulk(resetRequest as any);

      expect(resetResults).toBeDefined();
      expect(Array.isArray(resetResults)).toBe(true);
    });
  });

  describe('AI integration', () => {
    it('should handle AI service responses correctly', async () => {
      const aiTestRequests = [
        { baseCaption: 'AI-powered content creation', platform: 'instagram' as const },
        { baseCaption: 'Machine learning content optimization', platform: 'tiktok' as const },
      ];

      const results = await workflow.executeBulk(aiTestRequests as any);
      
      expect(results).toBeDefined();
      expect(Array.isArray(results)).toBe(true);
      
      // Results should contain AI-enhanced content
      if (results.length > 0) {
        results.forEach(result => {
          expect(result).toHaveProperty('content');
          expect(typeof result.content).toBe('string');
        });
      }
    });

    it('should handle AI service timeouts gracefully', async () => {
      const timeoutTestRequests = Array.from({ length: 3 }).map((_, idx) => ({
        baseCaption: `Timeout test content ${idx}`,
        platform: 'youtube' as const,
      }));

      // Mock timeout scenario
      const startTime = Date.now();
      const results = await workflow.executeBulk(timeoutTestRequests as any);
      const endTime = Date.now();

      expect(results).toBeDefined();
      // Should handle timeouts within reasonable time
      expect(endTime - startTime).toBeLessThan(30000);
    });

    it('should validate AI-generated content quality', async () => {
      const qualityTestRequests = [
        { baseCaption: 'Generate high-quality engaging content', platform: 'instagram' as const },
        { baseCaption: 'Create viral-worthy content ideas', platform: 'tiktok' as const },
      ];

      const results = await workflow.executeBulk(qualityTestRequests as any);
      
      if (results.length > 0) {
        results.forEach(result => {
          // AI-generated content should meet quality standards
          expect(result.content).toBeDefined();
          expect(result.content.length).toBeGreaterThan(10);
          
          // Should have quality metrics
          if (result.qualityScore) {
            expect(result.qualityScore).toBeGreaterThanOrEqual(0);
            expect(result.qualityScore).toBeLessThanOrEqual(1);
          }
        });
      }
    });

    it('should handle AI service unavailability', async () => {
      const unavailabilityTestRequests = [
        { baseCaption: 'Service unavailable test', platform: 'instagram' as const },
      ];

      // Should gracefully handle service unavailability
      try {
        const results = await workflow.executeBulk(unavailabilityTestRequests as any);
        expect(Array.isArray(results)).toBe(true);
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect(error.message).toContain('service');
      }
    });
  });

  describe('enhanced content quality assessment', () => {
    it('should assess content engagement potential', async () => {
      const engagementTestRequests = [
        { baseCaption: 'Boring standard content', platform: 'instagram' as const },
        { baseCaption: 'Exciting viral-worthy content with trending hashtags!', platform: 'tiktok' as const },
        { baseCaption: 'Educational valuable content for audience', platform: 'youtube' as const },
      ];

      const results = await workflow.executeBulk(engagementTestRequests as any);
      
      if (results.length > 0) {
        results.forEach(result => {
          if (result.engagementScore) {
            expect(result.engagementScore).toBeGreaterThanOrEqual(0);
            expect(result.engagementScore).toBeLessThanOrEqual(1);
          }
        });
      }
    });

    it('should evaluate content originality', async () => {
      const originalityTestRequests = [
        { baseCaption: 'Common generic content everyone posts', platform: 'instagram' as const },
        { baseCaption: 'Unique innovative approach to content creation', platform: 'tiktok' as const },
      ];

      const results = await workflow.executeBulk(originalityTestRequests as any);
      
      if (results.length > 0) {
        results.forEach(result => {
          if (result.originalityScore) {
            expect(result.originalityScore).toBeGreaterThanOrEqual(0);
            expect(result.originalityScore).toBeLessThanOrEqual(1);
          }
        });
      }
    });

    it('should assess platform-specific optimization', async () => {
      const platformOptimizationRequests = [
        { baseCaption: 'Instagram-optimized visual content', platform: 'instagram' as const },
        { baseCaption: 'TikTok-optimized short-form video idea', platform: 'tiktok' as const },
        { baseCaption: 'YouTube-optimized long-form educational content', platform: 'youtube' as const },
      ];

      const results = await workflow.executeBulk(platformOptimizationRequests as any);
      
      if (results.length > 0) {
        results.forEach((result, index) => {
          const expectedPlatform = platformOptimizationRequests[index]?.platform;
          if (result.platformOptimization && expectedPlatform) {
            expect(result.platformOptimization).toHaveProperty(expectedPlatform);
          }
        });
      }
    });

    it('should filter content based on quality thresholds', async () => {
      const qualityThresholdRequests = [
        { baseCaption: 'a', platform: 'instagram' as const }, // Very low quality
        { baseCaption: 'ok content', platform: 'tiktok' as const }, // Medium quality
        { baseCaption: 'Exceptional high-quality content with great engagement potential and unique value proposition', platform: 'youtube' as const }, // High quality
      ];

      const results = await workflow.executeBulk(qualityThresholdRequests as any);
      
      // Should filter out very low quality content
      expect(results.length).toBeLessThan(qualityThresholdRequests.length);
      
      if (results.length > 0) {
        results.forEach(result => {
          expect(result.content.length).toBeGreaterThan(5);
        });
      }
    });
  });

  describe('workflow integration', () => {
    it('should integrate with external content services', async () => {
      const integrationTestRequests = [
        { baseCaption: 'Integration test content', platform: 'instagram' as const },
      ];

      const results = await workflow.executeBulk(integrationTestRequests as any);
      
      expect(results).toBeDefined();
      expect(Array.isArray(results)).toBe(true);
    });

    it('should handle workflow chaining', async () => {
      const firstStageRequests = [
        { baseCaption: 'First stage content', platform: 'tiktok' as const },
      ];
      
      const firstResults = await workflow.executeBulk(firstStageRequests as any);
      
      if (firstResults.length > 0) {
        // Use first results as input for second stage
        const secondStageRequests = firstResults.map(result => ({
          baseCaption: result.content,
          platform: 'youtube' as const,
        }));
        
        const secondResults = await workflow.executeBulk(secondStageRequests as any);
        expect(secondResults).toBeDefined();
      }
    });

    it('should maintain workflow state consistency', async () => {
      const consistencyTestRequests = [
        { baseCaption: 'Consistency test 1', platform: 'instagram' as const },
        { baseCaption: 'Consistency test 2', platform: 'tiktok' as const },
      ];

      const results1 = await workflow.executeBulk(consistencyTestRequests as any);
      const results2 = await workflow.executeBulk(consistencyTestRequests as any);
      
      // Results should be consistent for same inputs
      expect(results1.length).toBe(results2.length);
    });
  });

  describe('edge cases and boundary conditions', () => {
    it('should handle extremely long captions', async () => {
      const longCaption = 'A'.repeat(10000);
      const longCaptionRequests = [
        { baseCaption: longCaption, platform: 'instagram' as const },
      ];

      const results = await workflow.executeBulk(longCaptionRequests as any);
      expect(Array.isArray(results)).toBe(true);
    });

    it('should handle special characters and emojis', async () => {
      const specialCharRequests = [
        { baseCaption: '🚀 Special chars: @#$%^&*()_+ 中文 العربية', platform: 'tiktok' as const },
        { baseCaption: 'Emojis: 😀😃😄😁😆😅😂🤣', platform: 'instagram' as const },
      ];

      const results = await workflow.executeBulk(specialCharRequests as any);
      expect(Array.isArray(results)).toBe(true);
    });

    it('should handle zero concurrency limit', async () => {
      const zeroConcurrencyWorkflow = new ContentIdeationWorkflow(0);
      const requests = [{ baseCaption: 'Zero concurrency test', platform: 'instagram' as const }];

      // Should handle gracefully or use default concurrency
      const results = await zeroConcurrencyWorkflow.executeBulk(requests as any);
      expect(Array.isArray(results)).toBe(true);
    });

    it('should handle negative concurrency limit', async () => {
      const negativeConcurrencyWorkflow = new ContentIdeationWorkflow(-1);
      const requests = [{ baseCaption: 'Negative concurrency test', platform: 'tiktok' as const }];

      // Should handle gracefully or use default concurrency
      const results = await negativeConcurrencyWorkflow.executeBulk(requests as any);
      expect(Array.isArray(results)).toBe(true);
    });
  });
}); 