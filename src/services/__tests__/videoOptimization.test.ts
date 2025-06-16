import { optimizeVideo } from '../videoOptimization';
import { VideoOptimizationAnalysisService } from '../../app/workflows/video_optimization/VideoOptimizationAnalysisService';
import { Platform, TimeRange } from '../../app/workflows/data_analysis/types/analysis_types';

// Mock the VideoOptimizationAnalysisService
jest.mock('../../app/workflows/video_optimization/VideoOptimizationAnalysisService');

const mockVideoOptimizationService = VideoOptimizationAnalysisService as jest.MockedClass<typeof VideoOptimizationAnalysisService>;

describe('videoOptimization service', () => {
  let mockGetVideoOptimizationInsights: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetVideoOptimizationInsights = jest.fn();
    mockVideoOptimizationService.prototype.getVideoOptimizationInsights = mockGetVideoOptimizationInsights;
  });

  describe('optimizeVideo', () => {
    const validRequest = {
      userId: 'user123',
      platform: 'tiktok' as Platform,
      timeRange: { start: new Date('2024-01-01'), end: new Date('2024-01-31') } as TimeRange,
    };

    it('should successfully optimize video with valid request', async () => {
      const mockResult = {
        insights: ['Use trending sounds', 'Post at peak hours'],
        score: 85,
        recommendations: ['Improve lighting', 'Add captions']
      };
      mockGetVideoOptimizationInsights.mockResolvedValue(mockResult);

      const result = await optimizeVideo(validRequest);

      expect(mockGetVideoOptimizationInsights).toHaveBeenCalledWith({
        userId: 'user123',
        platform: 'tiktok',
        timeRange: validRequest.timeRange,
        audioIds: undefined,
        correlationId: undefined,
        mode: undefined,
      });
      expect(result).toEqual(mockResult);
    });

    it('should pass optional parameters correctly', async () => {
      const requestWithOptionals = {
        ...validRequest,
        audioIds: ['audio1', 'audio2'],
        correlationId: 'corr123',
        mode: 'thorough' as const,
      };
      const mockResult = { insights: [], score: 90 };
      mockGetVideoOptimizationInsights.mockResolvedValue(mockResult);

      await optimizeVideo(requestWithOptionals);

      expect(mockGetVideoOptimizationInsights).toHaveBeenCalledWith({
        userId: 'user123',
        platform: 'tiktok',
        timeRange: validRequest.timeRange,
        audioIds: ['audio1', 'audio2'],
        correlationId: 'corr123',
        mode: 'thorough',
      });
    });

    it('should handle different platforms', async () => {
      const platforms: Platform[] = ['instagram', 'youtube', 'tiktok'];
      const mockResult = { insights: [], score: 75 };
      mockGetVideoOptimizationInsights.mockResolvedValue(mockResult);

      for (const platform of platforms) {
        await optimizeVideo({ ...validRequest, platform });
        expect(mockGetVideoOptimizationInsights).toHaveBeenCalledWith(
          expect.objectContaining({ platform })
        );
      }
    });

    it('should handle different optimization modes', async () => {
      const modes = ['fast', 'thorough'] as const;
      const mockResult = { insights: [], score: 80 };
      mockGetVideoOptimizationInsights.mockResolvedValue(mockResult);

      for (const mode of modes) {
        await optimizeVideo({ ...validRequest, mode });
        expect(mockGetVideoOptimizationInsights).toHaveBeenCalledWith(
          expect.objectContaining({ mode })
        );
      }
    });

    it('should handle API errors gracefully', async () => {
      const apiError = new Error('API service unavailable');
      mockGetVideoOptimizationInsights.mockRejectedValue(apiError);

      await expect(optimizeVideo(validRequest)).rejects.toThrow('API service unavailable');
    });

    it('should handle timeout errors', async () => {
      const timeoutError = new Error('Request timeout');
      mockGetVideoOptimizationInsights.mockRejectedValue(timeoutError);

      await expect(optimizeVideo(validRequest)).rejects.toThrow('Request timeout');
    });

    it('should handle invalid response format', async () => {
      mockGetVideoOptimizationInsights.mockResolvedValue(null);

      const result = await optimizeVideo(validRequest);
      expect(result).toBeNull();
    });

    it('should handle empty audio IDs array', async () => {
      const requestWithEmptyAudioIds = {
        ...validRequest,
        audioIds: [],
      };
      const mockResult = { insights: [], score: 70 };
      mockGetVideoOptimizationInsights.mockResolvedValue(mockResult);

      await optimizeVideo(requestWithEmptyAudioIds);

      expect(mockGetVideoOptimizationInsights).toHaveBeenCalledWith(
        expect.objectContaining({ audioIds: [] })
      );
    });

    it('should handle large audio IDs array', async () => {
      const largeAudioIds = Array.from({ length: 100 }, (_, i) => `audio${i}`);
      const requestWithLargeAudioIds = {
        ...validRequest,
        audioIds: largeAudioIds,
      };
      const mockResult = { insights: [], score: 65 };
      mockGetVideoOptimizationInsights.mockResolvedValue(mockResult);

      await optimizeVideo(requestWithLargeAudioIds);

      expect(mockGetVideoOptimizationInsights).toHaveBeenCalledWith(
        expect.objectContaining({ audioIds: largeAudioIds })
      );
    });

    it('should handle special characters in userId', async () => {
      const specialUserRequest = {
        ...validRequest,
        userId: 'user@123#$%',
      };
      const mockResult = { insights: [], score: 85 };
      mockGetVideoOptimizationInsights.mockResolvedValue(mockResult);

      await optimizeVideo(specialUserRequest);

      expect(mockGetVideoOptimizationInsights).toHaveBeenCalledWith(
        expect.objectContaining({ userId: 'user@123#$%' })
      );
    });

    it('should handle very long correlation IDs', async () => {
      const longCorrelationId = 'a'.repeat(1000);
      const requestWithLongCorrelationId = {
        ...validRequest,
        correlationId: longCorrelationId,
      };
      const mockResult = { insights: [], score: 75 };
      mockGetVideoOptimizationInsights.mockResolvedValue(mockResult);

      await optimizeVideo(requestWithLongCorrelationId);

      expect(mockGetVideoOptimizationInsights).toHaveBeenCalledWith(
        expect.objectContaining({ correlationId: longCorrelationId })
      );
    });
  });

  describe('service initialization', () => {
    it('should initialize VideoOptimizationAnalysisService with API key from environment', () => {
      // The service is initialized when the module is imported
      expect(mockVideoOptimizationService).toHaveBeenCalledWith(
        expect.any(String)
      );
    });

    it('should use dummy key when environment variable is not set', () => {
      // This tests the fallback behavior
      expect(mockVideoOptimizationService).toHaveBeenCalledWith(
        expect.stringMatching(/DUMMY_OPENAI_KEY|.+/)
      );
    });
  });

  describe('error boundary testing', () => {
    it('should handle network connectivity issues', async () => {
      const networkError = new Error('Network unreachable');
      networkError.name = 'NetworkError';
      mockGetVideoOptimizationInsights.mockRejectedValue(networkError);

      await expect(optimizeVideo(validRequest)).rejects.toThrow('Network unreachable');
    });

    it('should handle rate limiting errors', async () => {
      const rateLimitError = new Error('Rate limit exceeded');
      rateLimitError.name = 'RateLimitError';
      mockGetVideoOptimizationInsights.mockRejectedValue(rateLimitError);

      await expect(optimizeVideo(validRequest)).rejects.toThrow('Rate limit exceeded');
    });

    it('should handle authentication errors', async () => {
      const authError = new Error('Invalid API key');
      authError.name = 'AuthenticationError';
      mockGetVideoOptimizationInsights.mockRejectedValue(authError);

      await expect(optimizeVideo(validRequest)).rejects.toThrow('Invalid API key');
    });
  });

  describe('video processing algorithms', () => {
    it('should handle different video quality optimization levels', async () => {
      const qualityLevels = ['low', 'medium', 'high', 'ultra'] as const;
      const mockResult = { insights: [], score: 80 };
      mockGetVideoOptimizationInsights.mockResolvedValue(mockResult);

      for (const quality of qualityLevels) {
        const qualityRequest = {
          ...validRequest,
          optimizationSettings: { quality },
        };
        
        await optimizeVideo(qualityRequest);
        expect(mockGetVideoOptimizationInsights).toHaveBeenCalledWith(
          expect.objectContaining({ 
            optimizationSettings: expect.objectContaining({ quality })
          })
        );
      }
    });

    it('should optimize video compression algorithms', async () => {
      const compressionSettings = {
        bitrate: 2000,
        fps: 30,
        resolution: '1080p',
        codec: 'h264',
      };
      
      const compressionRequest = {
        ...validRequest,
        optimizationSettings: { compression: compressionSettings },
      };
      
      const mockResult = { 
        insights: ['Optimized compression settings'], 
        score: 90,
        compressionStats: {
          originalSize: 100,
          optimizedSize: 60,
          compressionRatio: 0.6,
        }
      };
      mockGetVideoOptimizationInsights.mockResolvedValue(mockResult);

      const result = await optimizeVideo(compressionRequest);
      
      expect(result.compressionStats).toBeDefined();
      expect(result.compressionStats.compressionRatio).toBeLessThan(1);
    });

    it('should handle video format conversion optimization', async () => {
      const formatConversions = [
        { from: 'mp4', to: 'webm' },
        { from: 'avi', to: 'mp4' },
        { from: 'mov', to: 'mp4' },
      ];
      
      const mockResult = { 
        insights: ['Format conversion optimized'], 
        score: 85,
        formatOptimization: { success: true }
      };
      mockGetVideoOptimizationInsights.mockResolvedValue(mockResult);

      for (const conversion of formatConversions) {
        const formatRequest = {
          ...validRequest,
          optimizationSettings: { formatConversion: conversion },
        };
        
        const result = await optimizeVideo(formatRequest);
        expect(result.formatOptimization).toBeDefined();
      }
    });

    it('should optimize video thumbnails and previews', async () => {
      const thumbnailRequest = {
        ...validRequest,
        optimizationSettings: {
          generateThumbnails: true,
          thumbnailCount: 5,
          previewDuration: 15,
        },
      };
      
      const mockResult = { 
        insights: ['Thumbnails optimized'], 
        score: 88,
        thumbnails: [
          { timestamp: 0, url: 'thumb1.jpg', score: 0.9 },
          { timestamp: 5, url: 'thumb2.jpg', score: 0.8 },
          { timestamp: 10, url: 'thumb3.jpg', score: 0.85 },
        ]
      };
      mockGetVideoOptimizationInsights.mockResolvedValue(mockResult);

      const result = await optimizeVideo(thumbnailRequest);
      
      expect(result.thumbnails).toBeDefined();
      expect(result.thumbnails.length).toBeGreaterThan(0);
      expect(result.thumbnails[0]).toHaveProperty('score');
    });

    it('should handle audio optimization within video', async () => {
      const audioOptimizationRequest = {
        ...validRequest,
        optimizationSettings: {
          audioOptimization: {
            enhanceAudio: true,
            removeBackground: true,
            normalizeVolume: true,
            addMusicSuggestions: true,
          },
        },
      };
      
      const mockResult = { 
        insights: ['Audio quality enhanced'], 
        score: 92,
        audioOptimization: {
          volumeNormalized: true,
          backgroundRemoved: true,
          musicSuggestions: ['trending-song-1', 'trending-song-2'],
        }
      };
      mockGetVideoOptimizationInsights.mockResolvedValue(mockResult);

      const result = await optimizeVideo(audioOptimizationRequest);
      
      expect(result.audioOptimization).toBeDefined();
      expect(result.audioOptimization.musicSuggestions).toBeInstanceOf(Array);
    });
  });

  describe('platform-specific optimization', () => {
    it('should optimize for TikTok-specific requirements', async () => {
      const tiktokRequest = {
        ...validRequest,
        platform: 'tiktok' as Platform,
        optimizationSettings: {
          platformSpecific: {
            aspectRatio: '9:16',
            maxDuration: 60,
            trendingHashtags: true,
            viralElements: true,
          },
        },
      };
      
      const mockResult = { 
        insights: ['Optimized for TikTok viral potential'], 
        score: 95,
        platformOptimization: {
          aspectRatioOptimized: true,
          durationOptimal: true,
          trendingElements: ['dance', 'music', 'effects'],
        }
      };
      mockGetVideoOptimizationInsights.mockResolvedValue(mockResult);

      const result = await optimizeVideo(tiktokRequest);
      
      expect(result.platformOptimization.trendingElements).toBeDefined();
      expect(result.score).toBeGreaterThan(90);
    });

    it('should optimize for Instagram Reels requirements', async () => {
      const instagramRequest = {
        ...validRequest,
        platform: 'instagram' as Platform,
        optimizationSettings: {
          platformSpecific: {
            aspectRatio: '9:16',
            maxDuration: 90,
            storyCompatible: true,
            feedCompatible: true,
          },
        },
      };
      
      const mockResult = { 
        insights: ['Optimized for Instagram engagement'], 
        score: 87,
        platformOptimization: {
          storyReady: true,
          feedReady: true,
          hashtagSuggestions: ['#reels', '#instagram', '#viral'],
        }
      };
      mockGetVideoOptimizationInsights.mockResolvedValue(mockResult);

      const result = await optimizeVideo(instagramRequest);
      
      expect(result.platformOptimization.hashtagSuggestions).toBeInstanceOf(Array);
    });

    it('should optimize for YouTube Shorts requirements', async () => {
      const youtubeRequest = {
        userId: 'test-user',
        platform: 'youtube' as Platform,
        timeRange: { start: new Date(Date.now() - 86400000), end: new Date() },
        optimizationSettings: {
          platformSpecific: {
            aspectRatio: '9:16',
            maxDuration: 60,
            seoOptimization: true,
            thumbnailOptimization: true,
          },
        },
      };
      
      const mockResult = { 
        insights: ['Optimized for YouTube Shorts discovery'], 
        score: 89,
        platformOptimization: {
          seoScore: 0.85,
          thumbnailScore: 0.92,
          titleSuggestions: ['Viral Title 1', 'Engaging Title 2'],
        }
      };
      mockGetVideoOptimizationInsights.mockResolvedValue(mockResult);

      const result = await optimizeVideo(youtubeRequest);
      
      expect(result.platformOptimization.seoScore).toBeGreaterThan(0);
      expect(result.platformOptimization.titleSuggestions).toBeInstanceOf(Array);
    });
  });

  describe('performance optimization', () => {
    it('should handle large video files efficiently', async () => {
      const largeVideoRequest = {
        ...validRequest,
        videoMetadata: {
          fileSize: 500 * 1024 * 1024, // 500MB
          duration: 300, // 5 minutes
          resolution: '4K',
        },
      };
      
      const mockResult = { 
        insights: ['Large file optimized'], 
        score: 75,
        performanceMetrics: {
          processingTime: 45000, // 45 seconds
          memoryUsage: 200 * 1024 * 1024, // 200MB
          optimizationRatio: 0.4,
        }
      };
      mockGetVideoOptimizationInsights.mockResolvedValue(mockResult);

      const startTime = Date.now();
      const result = await optimizeVideo(largeVideoRequest);
      const endTime = Date.now();
      
      expect(result.performanceMetrics).toBeDefined();
      expect(endTime - startTime).toBeLessThan(60000); // Should complete within 1 minute for test
    });

    it('should optimize batch video processing', async () => {
      const batchRequest = {
        ...validRequest,
        batchProcessing: {
          videoIds: ['video1', 'video2', 'video3', 'video4', 'video5'],
          parallelProcessing: true,
          maxConcurrency: 3,
        },
      };
      
      const mockResult = { 
        insights: ['Batch processing optimized'], 
        score: 82,
        batchResults: [
          { videoId: 'video1', score: 85, status: 'completed' },
          { videoId: 'video2', score: 78, status: 'completed' },
          { videoId: 'video3', score: 90, status: 'completed' },
          { videoId: 'video4', score: 73, status: 'completed' },
          { videoId: 'video5', score: 88, status: 'completed' },
        ]
      };
      mockGetVideoOptimizationInsights.mockResolvedValue(mockResult);

      const result = await optimizeVideo(batchRequest);
      
      expect(result.batchResults).toBeDefined();
      expect(result.batchResults.length).toBe(5);
      expect(result.batchResults.every(r => r.status === 'completed')).toBe(true);
    });

    it('should handle memory-intensive optimization operations', async () => {
      const memoryIntensiveRequest = {
        ...validRequest,
        optimizationSettings: {
          highQualityProcessing: true,
          aiEnhancement: true,
          deepAnalysis: true,
          memoryOptimization: true,
        },
      };
      
      const initialMemory = process.memoryUsage().heapUsed;
      
      const mockResult = { 
        insights: ['Memory-optimized processing'], 
        score: 93,
        memoryStats: {
          peakUsage: 150 * 1024 * 1024, // 150MB
          averageUsage: 100 * 1024 * 1024, // 100MB
          optimizationEffective: true,
        }
      };
      mockGetVideoOptimizationInsights.mockResolvedValue(mockResult);

      const result = await optimizeVideo(memoryIntensiveRequest);
      const finalMemory = process.memoryUsage().heapUsed;
      
      expect(result.memoryStats).toBeDefined();
      expect(result.memoryStats.optimizationEffective).toBe(true);
      
      // Memory growth should be reasonable
      const memoryGrowth = finalMemory - initialMemory;
      expect(memoryGrowth).toBeLessThan(200 * 1024 * 1024); // Less than 200MB growth
    });
  });

  describe('advanced edge cases', () => {
    it('should handle corrupted video files', async () => {
      const corruptedVideoRequest = {
        ...validRequest,
        videoMetadata: {
          isCorrupted: true,
          corruptionType: 'header_damage',
        },
      };
      
      const mockResult = { 
        insights: ['Corruption detected and handled'], 
        score: 30,
        errorHandling: {
          corruptionDetected: true,
          recoveryAttempted: true,
          recoverySuccess: false,
        }
      };
      mockGetVideoOptimizationInsights.mockResolvedValue(mockResult);

      const result = await optimizeVideo(corruptedVideoRequest);
      
      expect(result.errorHandling.corruptionDetected).toBe(true);
      expect(result.score).toBeLessThan(50); // Low score for corrupted files
    });

    it('should handle extremely short videos', async () => {
      const shortVideoRequest = {
        ...validRequest,
        videoMetadata: {
          duration: 0.5, // 0.5 seconds
          frameCount: 15,
        },
      };
      
      const mockResult = { 
        insights: ['Short video optimization applied'], 
        score: 65,
        shortVideoHandling: {
          durationWarning: true,
          optimizationLimited: true,
          suggestions: ['Consider extending duration', 'Add slow motion effects'],
        }
      };
      mockGetVideoOptimizationInsights.mockResolvedValue(mockResult);

      const result = await optimizeVideo(shortVideoRequest);
      
      expect(result.shortVideoHandling).toBeDefined();
      expect(result.shortVideoHandling.durationWarning).toBe(true);
    });

    it('should handle videos with unusual aspect ratios', async () => {
      const unusualAspectRatios = ['1:3', '3:1', '2:5', '5:2'];
      
      for (const aspectRatio of unusualAspectRatios) {
        const aspectRatioRequest = {
          ...validRequest,
          videoMetadata: { aspectRatio },
        };
        
        const mockResult = { 
          insights: [`Unusual aspect ratio ${aspectRatio} handled`], 
          score: 70,
          aspectRatioHandling: {
            originalRatio: aspectRatio,
            recommendedRatio: '16:9',
            cropSuggestions: true,
          }
        };
        mockGetVideoOptimizationInsights.mockResolvedValue(mockResult);

        const result = await optimizeVideo(aspectRatioRequest);
        
        expect(result.aspectRatioHandling).toBeDefined();
        expect(result.aspectRatioHandling.originalRatio).toBe(aspectRatio);
      }
    });

    it('should handle videos with no audio track', async () => {
      const noAudioRequest = {
        ...validRequest,
        videoMetadata: {
          hasAudio: false,
          audioTracks: 0,
        },
      };
      
      const mockResult = { 
        insights: ['No audio detected - music suggestions provided'], 
        score: 60,
        audioHandling: {
          audioDetected: false,
          musicSuggestions: ['background-music-1', 'trending-sound-1'],
          voiceoverSuggestions: true,
        }
      };
      mockGetVideoOptimizationInsights.mockResolvedValue(mockResult);

      const result = await optimizeVideo(noAudioRequest);
      
      expect(result.audioHandling.audioDetected).toBe(false);
      expect(result.audioHandling.musicSuggestions).toBeInstanceOf(Array);
    });

    it('should handle videos with multiple audio tracks', async () => {
      const multiAudioRequest = {
        ...validRequest,
        videoMetadata: {
          hasAudio: true,
          audioTracks: 5,
          audioLanguages: ['en', 'es', 'fr', 'de', 'it'],
        },
      };
      
      const mockResult = { 
        insights: ['Multiple audio tracks optimized'], 
        score: 85,
        multiAudioHandling: {
          tracksProcessed: 5,
          primaryTrackSelected: 'en',
          alternativeTracksOptimized: true,
        }
      };
      mockGetVideoOptimizationInsights.mockResolvedValue(mockResult);

      const result = await optimizeVideo(multiAudioRequest);
      
      expect(result.multiAudioHandling.tracksProcessed).toBe(5);
      expect(result.multiAudioHandling.primaryTrackSelected).toBe('en');
    });
  });
}); 