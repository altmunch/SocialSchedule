import { SupabaseClient } from '@supabase/supabase-js';
import { ComprehensiveAnalysisService } from '../functions/comprehensive_analysis_service';
import { CompetitorAnalysisService } from '../functions/competitor_analysis_service';
import { HistoricalAnalysisService } from '../functions/historical_analysis_service';
import {
  CompetitorAnalysis,
  PerformanceTrends,
  TimeRange,
  ContentAnalysis,
  EngagementMetrics,
  Recommendation,
  Video,
  EngagementTrendPoint,
  EngagementTrends,
  ContentPerformance,
  AudienceGrowth,
  Benchmark,
  TopPerformingContent,
} from '../types/analysis_types';

// Mock dependent services at the top level
jest.mock('./competitor_analysis_service');
jest.mock('./historical_analysis_service');

const mockSupabaseClient = {} as SupabaseClient; // Minimal mock for Supabase

describe('ComprehensiveAnalysisService', () => {
  let comprehensiveAnalysisService: ComprehensiveAnalysisService;
  // Hold onto the mocked class constructors
  let MockedCompetitorAnalysisService: jest.MockedClass<typeof CompetitorAnalysisService>;
  let MockedHistoricalAnalysisService: jest.MockedClass<typeof HistoricalAnalysisService>;

  beforeEach(() => {
    jest.clearAllMocks(); // Clears all mocks, including call counts and implementations

    // Assign the mocked classes
    MockedCompetitorAnalysisService = CompetitorAnalysisService as jest.MockedClass<typeof CompetitorAnalysisService>;
    MockedHistoricalAnalysisService = HistoricalAnalysisService as jest.MockedClass<typeof HistoricalAnalysisService>;
    
    // Instantiate the service under test. It will use the mocked versions of its dependencies.
    comprehensiveAnalysisService = new ComprehensiveAnalysisService(mockSupabaseClient);
  });

  describe('getCompetitorInsights', () => {
    const competitorId = 'test-competitor-id';
    const niche = 'test-niche';
    const mockContentAnalysis: ContentAnalysis = {
      commonTopics: ['fitness', 'workout', 'health'],
      popularHashtags: ['#fitness', '#workout', '#health'],
      postingFrequency: 5, // posts per week
      bestPerformingFormats: ['short-form', 'tutorial'],
      sentimentDistribution: { positive: 0.6, neutral: 0.3, negative: 0.1 }
    };
    const mockEngagementMetrics: EngagementMetrics = {
      averageViews: 5000,
      averageLikes: 250,
      averageComments: 100,
      averageShares: 50,
      averageEngagementRate: 0.08,
      followerGrowthRate: 0.05
    };
    const mockTopPerformingContent: TopPerformingContent = {
      videos: [],
      keySuccessFactors: [
        'High engagement in first 3 seconds',
        'Clear call-to-action in description',
        'Trending audio usage'
      ]
    };

    const mockCompetitorAnalysisData: CompetitorAnalysis = {
      competitorId,
      competitorName: 'Test Competitor',
      niche,
      contentAnalysis: mockContentAnalysis,
      topPerformingContent: mockTopPerformingContent,
      engagementMetrics: mockEngagementMetrics,
      recommendations: [] as Recommendation[],
      lastAnalyzed: new Date().toISOString()
    };

    it('should return competitor analysis data on success', async () => {
      // Setup the mock implementation on the prototype
      MockedCompetitorAnalysisService.prototype.analyzeCompetitor = jest.fn().mockResolvedValue(mockCompetitorAnalysisData);

      const result = await comprehensiveAnalysisService.getCompetitorInsights(competitorId, niche);

      expect(result).toEqual(mockCompetitorAnalysisData);
      // Check if the method on the prototype (which backs all instances) was called
      expect(MockedCompetitorAnalysisService.prototype.analyzeCompetitor).toHaveBeenCalledWith(competitorId, niche);
    });

    it('should return null and log an error if CompetitorAnalysisService fails', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      MockedCompetitorAnalysisService.prototype.analyzeCompetitor = jest.fn().mockRejectedValue(new Error('Competitor service error'));

      const result = await comprehensiveAnalysisService.getCompetitorInsights(competitorId, niche);

      expect(result).toBeNull();
      expect(MockedCompetitorAnalysisService.prototype.analyzeCompetitor).toHaveBeenCalledWith(competitorId, niche);
      expect(consoleErrorSpy).toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });
  });

  describe('getUserPerformanceTrends', () => {
    const userId = 'test-user-id';
    const timeRange: TimeRange = { start: '2023-01-01', end: '2023-03-31' };
    const mockEngagementTrend: EngagementTrendPoint[] = [
      { timestamp: '2023-01-01T00:00:00Z', value: 100 },
      { timestamp: '2023-02-01T00:00:00Z', value: 120 },
      { timestamp: '2023-03-01T00:00:00Z', value: 150 },
    ];
    
    const mockEngagementTrends: EngagementTrends = {
      likesTrend: mockEngagementTrend,
      commentsTrend: mockEngagementTrend,
      viewsTrend: mockEngagementTrend,
      engagementRateTrend: mockEngagementTrend
    };
    
    const mockContentPerformance: ContentPerformance = {
      topPerformingVideos: [],
      bottomPerformingVideos: [],
      contentTypePerformance: {
        'short-form': {
          averageLikes: 200,
          averageComments: 80,
          averageShares: 40,
          averageViews: 4000,
          averageEngagementRate: 0.08
        }
      }
    };
    
    const mockPerformanceTrendsData: PerformanceTrends = {
      userId,
      timeRange,
      overallSummary: 'Performance is trending upward with consistent growth in engagement metrics.',
      engagementTrends: mockEngagementTrends,
      contentPerformance: mockContentPerformance,
      audienceGrowth: {
        followerCountTrend: mockEngagementTrend
      },
      benchmarks: [
        {
          metricName: 'Engagement Rate',
          currentValue: 0.08,
          averageValue: 0.05,
          percentile: 75
        }
      ],
      keyInsights: [
        'Videos posted on weekdays perform 20% better than weekend posts',
        'Short-form content has higher engagement rates'
      ],
      actionableRecommendations: [
        {
          type: 'content',
          description: 'Increase production of short-form tutorial content',
          priority: 'high',
          actionableSteps: [
            'Create 3-5 short tutorials per week',
            'Focus on trending topics in fitness and health'
          ]
        }
      ]
    };

    it('should return user performance trends on success', async () => {
      MockedHistoricalAnalysisService.prototype.analyzePerformanceTrends = jest.fn().mockResolvedValue(mockPerformanceTrendsData);

      const result = await comprehensiveAnalysisService.getUserPerformanceTrends(userId, timeRange);

      expect(result).toEqual(mockPerformanceTrendsData);
      expect(MockedHistoricalAnalysisService.prototype.analyzePerformanceTrends).toHaveBeenCalledWith(userId, timeRange);
    });

    it('should return null and log an error if HistoricalAnalysisService fails', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      MockedHistoricalAnalysisService.prototype.analyzePerformanceTrends = jest.fn().mockRejectedValue(new Error('Historical service error'));

      const result = await comprehensiveAnalysisService.getUserPerformanceTrends(userId, timeRange);

      expect(result).toBeNull();
      expect(MockedHistoricalAnalysisService.prototype.analyzePerformanceTrends).toHaveBeenCalledWith(userId, timeRange);
      expect(consoleErrorSpy).toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });
  });
});
