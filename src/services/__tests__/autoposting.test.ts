import { AutopostingService } from '../autoposting';

describe('AutopostingService', () => {
  let service: AutopostingService;

  beforeEach(() => {
    service = new AutopostingService();
  });

  describe('social media integration', () => {
    it('should post to TikTok successfully', async () => {
      const request = {
        platform: 'tiktok' as const,
        content: { videoUrl: 'test.mp4', caption: 'Test post' },
        userId: 'user123',
      };

      const mockResponse = {
        success: true,
        postId: 'tiktok_123',
        platform: 'tiktok',
        status: 'published',
      };

      jest.spyOn(service, 'publishPost').mockResolvedValue(mockResponse);
      const result = await service.publishPost(request);

      expect(result.success).toBe(true);
      expect(result.postId).toBeDefined();
      expect(result.platform).toBe('tiktok');
    });

    it('should handle Instagram posts', async () => {
      const request = {
        platform: 'instagram' as const,
        content: { imageUrl: 'test.jpg', caption: 'Instagram test' },
        userId: 'user456',
      };

      const mockResponse = {
        success: true,
        postId: 'instagram_456',
        platform: 'instagram',
        status: 'published',
      };

      jest.spyOn(service, 'publishPost').mockResolvedValue(mockResponse);
      const result = await service.publishPost(request);

      expect(result.success).toBe(true);
      expect(result.platform).toBe('instagram');
    });

    it('should successfully post to YouTube', async () => {
      const postRequest = {
        platform: 'youtube' as const,
        content: {
          videoUrl: 'https://example.com/youtube-video.mp4',
          title: 'Amazing Tutorial - How to Code',
          description: 'Learn coding with this comprehensive tutorial...',
          tags: ['coding', 'tutorial', 'programming'],
          thumbnail: 'https://example.com/thumbnail.jpg',
          category: 'Education',
          privacy: 'public',
        },
        userId: 'user789',
        scheduledTime: new Date(Date.now() + 7200000), // 2 hours from now
      };

      const mockResponse = {
        success: true,
        postId: 'youtube_video_789',
        platform: 'youtube',
        scheduledFor: postRequest.scheduledTime,
        status: 'scheduled',
        videoProcessing: {
          status: 'processing',
          estimatedTime: '5-10 minutes',
        },
      };

      jest.spyOn(service, 'schedulePost').mockResolvedValue(mockResponse);

      const result = await service.schedulePost(postRequest);

      expect(result.success).toBe(true);
      expect(result.postId).toBeDefined();
      expect(result.platform).toBe('youtube');
      expect(result.videoProcessing).toBeDefined();
    });

    it('should handle cross-platform posting', async () => {
      const crossPlatformRequest = {
        platforms: ['tiktok', 'instagram', 'youtube'] as const,
        content: {
          videoUrl: 'https://example.com/cross-platform-video.mp4',
          caption: 'Cross-platform content #viral',
          platformSpecific: {
            tiktok: { hashtags: ['#fyp', '#viral'] },
            instagram: { location: 'New York' },
            youtube: { category: 'Entertainment' },
          },
        },
        userId: 'user_cross',
        scheduledTime: new Date(Date.now() + 3600000),
      };

      const mockCrossResponse = {
        success: true,
        results: [
          { platform: 'tiktok', postId: 'tiktok_cross_1', status: 'scheduled' },
          { platform: 'instagram', postId: 'instagram_cross_1', status: 'scheduled' },
          { platform: 'youtube', postId: 'youtube_cross_1', status: 'scheduled' },
        ],
        scheduledFor: crossPlatformRequest.scheduledTime,
      };

      jest.spyOn(service, 'scheduleCrossPlatformPost').mockResolvedValue(mockCrossResponse);

      const result = await service.scheduleCrossPlatformPost(crossPlatformRequest);

      expect(result.success).toBe(true);
      expect(result.results).toHaveLength(3);
      expect(result.results.every(r => r.status === 'scheduled')).toBe(true);
    });
  });

  describe('rate limiting', () => {
    it('should handle rate limits gracefully', async () => {
      const rateLimitCheck = {
        allowed: false,
        retryAfter: 3600,
        remainingQuota: 0,
      };

      jest.spyOn(service, 'checkRateLimit').mockResolvedValue(rateLimitCheck);
      const result = await service.checkRateLimit('tiktok', 'user123');

      expect(result.allowed).toBe(false);
      expect(result.retryAfter).toBeGreaterThan(0);
    });

    it('should queue posts when rate limited', async () => {
      const queueResponse = {
        success: true,
        queued: true,
        queuePosition: 5,
        estimatedPostTime: new Date(Date.now() + 3600000),
      };

      jest.spyOn(service, 'queuePost').mockResolvedValue(queueResponse);
      const result = await service.queuePost({
        platform: 'tiktok' as const,
        content: { videoUrl: 'test.mp4', caption: 'Queued post' },
        userId: 'user123',
      });

      expect(result.queued).toBe(true);
      expect(result.queuePosition).toBeGreaterThan(0);
    });
  });

  describe('error handling', () => {
    it('should handle authentication errors', async () => {
      const authError = new Error('Authentication failed');
      jest.spyOn(service, 'publishPost').mockRejectedValue(authError);

      await expect(service.publishPost({
        platform: 'instagram' as const,
        content: { imageUrl: 'test.jpg', caption: 'Auth test' },
        userId: 'user123',
      })).rejects.toThrow('Authentication failed');
    });

    it('should handle network errors', async () => {
      const networkError = new Error('Network connection failed');
      jest.spyOn(service, 'publishPost').mockRejectedValue(networkError);

      await expect(service.publishPost({
        platform: 'youtube' as const,
        content: { videoUrl: 'test.mp4', title: 'Network test' },
        userId: 'user123',
      })).rejects.toThrow('Network connection failed');
    });

    it('should handle content policy violations', async () => {
      const policyViolationRequest = {
        platform: 'tiktok' as const,
        content: {
          videoUrl: 'https://example.com/policy-violation.mp4',
          caption: 'Content that violates platform policies',
        },
        userId: 'user_policy',
      };

      const mockPolicyResponse = {
        success: false,
        error: 'Content policy violation',
        violationType: 'inappropriate_content',
        suggestions: [
          'Review community guidelines',
          'Modify content to comply with policies',
          'Appeal the decision if you believe it\'s incorrect',
        ],
        appealProcess: {
          available: true,
          deadline: new Date(Date.now() + 604800000), // 7 days
          appealUrl: 'https://platform.com/appeal',
        },
      };

      jest.spyOn(service, 'publishPost').mockResolvedValue(mockPolicyResponse);

      const result = await service.publishPost(policyViolationRequest);

      expect(result.success).toBe(false);
      expect(result.error).toContain('policy violation');
      expect(result.suggestions).toBeInstanceOf(Array);
      expect(result.appealProcess).toBeDefined();
    });

    it('should handle file upload failures', async () => {
      const uploadFailRequest = {
        platform: 'instagram' as const,
        content: {
          imageUrl: 'https://example.com/corrupted-image.jpg',
          caption: 'Upload failure test',
        },
        userId: 'user_upload_fail',
      };

      const mockUploadFailResponse = {
        success: false,
        error: 'File upload failed',
        uploadError: {
          type: 'file_corrupted',
          details: 'Image file appears to be corrupted or in unsupported format',
          supportedFormats: ['jpg', 'png', 'gif', 'webp'],
          maxFileSize: '10MB',
        },
        suggestions: [
          'Check file integrity',
          'Convert to supported format',
          'Reduce file size if too large',
        ],
      };

      jest.spyOn(service, 'publishPost').mockResolvedValue(mockUploadFailResponse);

      const result = await service.publishPost(uploadFailRequest);

      expect(result.success).toBe(false);
      expect(result.uploadError).toBeDefined();
      expect(result.uploadError.supportedFormats).toBeInstanceOf(Array);
      expect(result.suggestions).toBeInstanceOf(Array);
    });

    it('should handle platform-specific errors', async () => {
      const platformErrors = [
        {
          platform: 'tiktok' as const,
          error: 'Video duration exceeds platform limit',
          errorCode: 'DURATION_LIMIT_EXCEEDED',
        },
        {
          platform: 'instagram' as const,
          error: 'Hashtag limit exceeded',
          errorCode: 'HASHTAG_LIMIT_EXCEEDED',
        },
        {
          platform: 'youtube' as const,
          error: 'Video processing failed',
          errorCode: 'VIDEO_PROCESSING_FAILED',
        },
      ];

      for (const errorCase of platformErrors) {
        const errorRequest = {
          platform: errorCase.platform,
          content: {
            videoUrl: 'https://example.com/error-test.mp4',
            caption: 'Platform error test',
          },
          userId: 'user_platform_error',
        };

        const mockErrorResponse = {
          success: false,
          error: errorCase.error,
          errorCode: errorCase.errorCode,
          platform: errorCase.platform,
        };

        jest.spyOn(service, 'publishPost').mockResolvedValue(mockErrorResponse);

        const result = await service.publishPost(errorRequest);

        expect(result.success).toBe(false);
        expect(result.error).toBe(errorCase.error);
        expect(result.errorCode).toBe(errorCase.errorCode);
      }
    });
  });

  describe('scheduling and automation features', () => {
    it('should schedule posts for optimal engagement times', async () => {
      const optimalTimeRequest = {
        platform: 'instagram' as const,
        content: {
          imageUrl: 'https://example.com/optimal-time.jpg',
          caption: 'Posted at optimal time for engagement',
        },
        userId: 'user_optimal',
        useOptimalTiming: true,
      };

      const mockOptimalResponse = {
        success: true,
        postId: 'optimal_post_123',
        scheduledFor: new Date(Date.now() + 18000000), // 5 hours from now
        optimalTiming: {
          recommendedTime: new Date(Date.now() + 18000000),
          reason: 'Peak audience activity based on historical data',
          expectedEngagement: 0.08,
          confidenceScore: 0.85,
        },
      };

      jest.spyOn(service, 'scheduleOptimalPost').mockResolvedValue(mockOptimalResponse);

      const result = await service.scheduleOptimalPost(optimalTimeRequest);

      expect(result.success).toBe(true);
      expect(result.optimalTiming).toBeDefined();
      expect(result.optimalTiming.confidenceScore).toBeGreaterThan(0);
      expect(result.scheduledFor).toBeInstanceOf(Date);
    });

    it('should handle recurring post schedules', async () => {
      const recurringRequest = {
        platform: 'tiktok' as const,
        content: {
          videoUrl: 'https://example.com/recurring-content.mp4',
          caption: 'Daily recurring content #daily',
        },
        userId: 'user_recurring',
        recurringSchedule: {
          frequency: 'daily',
          time: '18:00',
          timezone: 'UTC',
          endDate: new Date(Date.now() + 2592000000), // 30 days
        },
      };

      const mockRecurringResponse = {
        success: true,
        scheduleId: 'recurring_schedule_456',
        upcomingPosts: [
          { date: new Date(Date.now() + 86400000), postId: 'future_post_1' },
          { date: new Date(Date.now() + 172800000), postId: 'future_post_2' },
          { date: new Date(Date.now() + 259200000), postId: 'future_post_3' },
        ],
        totalScheduledPosts: 30,
      };

      jest.spyOn(service, 'createRecurringSchedule').mockResolvedValue(mockRecurringResponse);

      const result = await service.createRecurringSchedule(recurringRequest);

      expect(result.success).toBe(true);
      expect(result.scheduleId).toBeDefined();
      expect(result.upcomingPosts).toBeInstanceOf(Array);
      expect(result.totalScheduledPosts).toBeGreaterThan(0);
    });

    it('should manage bulk post scheduling', async () => {
      const bulkRequests = Array.from({ length: 20 }).map((_, idx) => ({
        platform: 'instagram' as const,
        content: {
          imageUrl: `https://example.com/bulk-image-${idx}.jpg`,
          caption: `Bulk post ${idx + 1} #bulk #content`,
        },
        userId: 'user_bulk',
        scheduledTime: new Date(Date.now() + (idx + 1) * 3600000), // Staggered hourly
      }));

      const mockBulkResponse = {
        success: true,
        totalScheduled: 20,
        scheduledPosts: bulkRequests.map((req, idx) => ({
          postId: `bulk_post_${idx + 1}`,
          scheduledFor: req.scheduledTime,
          status: 'scheduled',
        })),
        bulkScheduleId: 'bulk_schedule_789',
      };

      jest.spyOn(service, 'scheduleBulkPosts').mockResolvedValue(mockBulkResponse);

      const result = await service.scheduleBulkPosts(bulkRequests);

      expect(result.success).toBe(true);
      expect(result.totalScheduled).toBe(20);
      expect(result.scheduledPosts).toHaveLength(20);
      expect(result.bulkScheduleId).toBeDefined();
    });
  });

  describe('analytics and monitoring', () => {
    it('should track post performance metrics', async () => {
      const postId = 'tracked_post_123';
      const platform = 'tiktok';

      const mockMetrics = {
        postId,
        platform,
        metrics: {
          views: 15000,
          likes: 1200,
          comments: 85,
          shares: 45,
          engagementRate: 0.089,
          reach: 12500,
          impressions: 18000,
        },
        demographics: {
          ageGroups: { '18-24': 0.4, '25-34': 0.35, '35-44': 0.15, '45+': 0.1 },
          genders: { male: 0.45, female: 0.55 },
          topCountries: ['US', 'UK', 'CA', 'AU'],
        },
        timeSeriesData: {
          hourlyViews: Array.from({ length: 24 }, (_, i) => ({ hour: i, views: Math.random() * 1000 })),
          dailyEngagement: Array.from({ length: 7 }, (_, i) => ({ day: i, engagement: Math.random() * 0.1 })),
        },
      };

      jest.spyOn(service, 'getPostMetrics').mockResolvedValue(mockMetrics);

      const result = await service.getPostMetrics(postId, platform);

      expect(result.postId).toBe(postId);
      expect(result.metrics).toBeDefined();
      expect(result.demographics).toBeDefined();
      expect(result.timeSeriesData).toBeDefined();
      expect(result.metrics.engagementRate).toBeGreaterThan(0);
    });

    it('should provide posting analytics dashboard', async () => {
      const userId = 'user_analytics';
      const timeRange = {
        start: new Date(Date.now() - 2592000000), // 30 days ago
        end: new Date(),
      };

      const mockDashboard = {
        userId,
        timeRange,
        summary: {
          totalPosts: 45,
          totalEngagement: 125000,
          averageEngagementRate: 0.067,
          topPerformingPost: 'post_best_123',
          platformBreakdown: {
            tiktok: { posts: 20, avgEngagement: 0.08 },
            instagram: { posts: 15, avgEngagement: 0.06 },
            youtube: { posts: 10, avgEngagement: 0.12 },
          },
        },
        trends: {
          engagementTrend: 'increasing',
          bestPostingTimes: ['18:00', '20:00', '22:00'],
          topHashtags: ['#viral', '#trending', '#content'],
          audienceGrowth: 0.15,
        },
        recommendations: [
          'Post more content during peak hours (18:00-22:00)',
          'Increase TikTok posting frequency for better engagement',
          'Use trending hashtags more consistently',
        ],
      };

      jest.spyOn(service, 'getAnalyticsDashboard').mockResolvedValue(mockDashboard);

      const result = await service.getAnalyticsDashboard(userId, timeRange);

      expect(result.userId).toBe(userId);
      expect(result.summary).toBeDefined();
      expect(result.trends).toBeDefined();
      expect(result.recommendations).toBeInstanceOf(Array);
      expect(result.summary.totalPosts).toBeGreaterThan(0);
    });
  });
}); 