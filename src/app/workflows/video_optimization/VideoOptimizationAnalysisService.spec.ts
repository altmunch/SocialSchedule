import { VideoOptimizationAnalysisService } from './VideoOptimizationAnalysisService';
import { ContentInsightsEngine } from '../data_analysis/engines/ContentInsightsEngine';
import { ViralityEngine } from '../data_analysis/engines/ViralityEngine';
import { SentimentAnalysisEngine } from './engines/SentimentAnalysisEngine';
import { AudioRecommendationEngine } from './engines/AudioRecommendationEngine';
import { OptimizedVideoGenerator, ProductLink, OptimizedVideoContent, UserPreferences } from './OptimizedVideoGenerator';
import { 
  AnalysisResult, 
  VideoOptimizationAnalysisData, 
  BaseAnalysisRequest,
  TimeRange,
  Platform,
  AudioVirality,
  AudioFeaturesInput,
  TopPerformingContent,
  DetailedPlatformMetrics,
  SentimentAnalysisResult,
  AudioRecommendationResult
} from '../data_analysis/types/analysis_types';
import * as HashtagAnalysis from '../data_analysis/functions/hashtag_analysis'; // For spying

// Mocking the engines and generator
jest.mock('../data_analysis/engines/ContentInsightsEngine');
jest.mock('../data_analysis/engines/ViralityEngine');
jest.mock('./engines/SentimentAnalysisEngine');
jest.mock('./engines/AudioRecommendationEngine');
jest.mock('./OptimizedVideoGenerator');
jest.mock('../data_analysis/functions/hashtag_analysis');


describe('VideoOptimizationAnalysisService', () => {
  let service: VideoOptimizationAnalysisService;
  let mockContentInsightsEngine: jest.Mocked<ContentInsightsEngine>;
  let mockViralityEngine: jest.Mocked<ViralityEngine>;
  let mockSentimentAnalysisEngine: jest.Mocked<SentimentAnalysisEngine>;
  let mockAudioRecommendationEngine: jest.Mocked<AudioRecommendationEngine>;
  let mockOptimizedVideoGenerator: jest.Mocked<OptimizedVideoGenerator>;
  let mockAnalyzeHashtags: jest.SpyInstance;

  const MOCK_API_KEY = 'test-key';

  beforeEach(() => {
    jest.clearAllMocks();

    mockContentInsightsEngine = new (ContentInsightsEngine as any)() as jest.Mocked<ContentInsightsEngine>;
    mockViralityEngine = new (ViralityEngine as any)() as jest.Mocked<ViralityEngine>;
    mockSentimentAnalysisEngine = new (SentimentAnalysisEngine as any)(MOCK_API_KEY) as jest.Mocked<SentimentAnalysisEngine>;
    mockAudioRecommendationEngine = new (AudioRecommendationEngine as any)(MOCK_API_KEY) as jest.Mocked<AudioRecommendationEngine>;
    
    mockOptimizedVideoGenerator = new (OptimizedVideoGenerator as any)(MOCK_API_KEY) as jest.Mocked<OptimizedVideoGenerator>;
    (OptimizedVideoGenerator as jest.MockedClass<typeof OptimizedVideoGenerator>).mockImplementation(() => mockOptimizedVideoGenerator);


    service = new VideoOptimizationAnalysisService(
      MOCK_API_KEY,
      mockContentInsightsEngine,
      mockViralityEngine,
      mockSentimentAnalysisEngine,
      mockAudioRecommendationEngine
    );
    
    mockAnalyzeHashtags = jest.spyOn(HashtagAnalysis, 'analyzeHashtags');

    // Setup default successful mock responses
    mockContentInsightsEngine.getTopPerformingContentInsights.mockResolvedValue({
      success: true, data: { topPerformingVideoCaptions: ['caption1', 'hashtag #cool'], keySuccessFactors: [] } as TopPerformingContent,
      metadata: { generatedAt: new Date(), source: 'mock' }
    });
    mockContentInsightsEngine.getDetailedPlatformAnalytics.mockResolvedValue({
      success: true, data: { audienceDemographics: {} } as DetailedPlatformMetrics, // Provide minimal valid data
      metadata: { generatedAt: new Date(), source: 'mock' }
    });
    mockViralityEngine.analyzeAudioVirality.mockResolvedValue({
      success: true, data: [] as AudioVirality[],
      metadata: { generatedAt: new Date(), source: 'mock' }
    });
    mockSentimentAnalysisEngine.analyzeTextSentiment.mockResolvedValue({
      success: true, data: { overallSentiment: 'neutral' } as SentimentAnalysisResult,
      metadata: { generatedAt: new Date(), source: 'mock' }
    });
    mockAudioRecommendationEngine.recommendAudio.mockResolvedValue({
      success: true, data: { recommendations: [] } as AudioRecommendationResult,
      metadata: { generatedAt: new Date(), source: 'mock' }
    });
    mockOptimizedVideoGenerator.generateOptimizedContent.mockResolvedValue({
       title: 'Optimized Title', script: 'Optimized script'
    } as OptimizedVideoContent);
    mockAnalyzeHashtags.mockReturnValue(['#cool']);
  });

  describe('constructor', () => {
    it('should throw error if no API key is provided', () => {
      expect(() => new VideoOptimizationAnalysisService('', mockContentInsightsEngine, mockViralityEngine, mockSentimentAnalysisEngine, mockAudioRecommendationEngine)).toThrow('OpenAI API key is required');
    });
    it('should instantiate OptimizedVideoGenerator with the API key', () => {
        service = new VideoOptimizationAnalysisService(MOCK_API_KEY, mockContentInsightsEngine, mockViralityEngine, mockSentimentAnalysisEngine, mockAudioRecommendationEngine); // Re-instantiate to trigger constructor logic for this test
        expect(OptimizedVideoGenerator).toHaveBeenCalledWith(MOCK_API_KEY);
    });
  });

  describe('getVideoOptimizationInsights', () => {
    const baseRequest: BaseAnalysisRequest = {
      userId: 'testUser',
      platform: 'Instagram' as Platform,
      timeRange: { start: new Date().toISOString(), end: new Date().toISOString() },
      correlationId: 'test-corr-id'
    };

    it('should call all relevant engines and combine their data', async () => {
      const result = await service.getVideoOptimizationInsights(baseRequest);

      expect(mockContentInsightsEngine.getTopPerformingContentInsights).toHaveBeenCalledWith(expect.objectContaining({ userId: baseRequest.userId }));
      expect(mockContentInsightsEngine.getDetailedPlatformAnalytics).toHaveBeenCalledWith(baseRequest);
      expect(mockViralityEngine.analyzeAudioVirality).toHaveBeenCalledWith(expect.objectContaining({ userId: baseRequest.userId }), undefined); // No audioIds in baseRequest
      expect(mockSentimentAnalysisEngine.analyzeTextSentiment).toHaveBeenCalledWith('caption1 hashtag #cool', baseRequest.correlationId);
      expect(mockAudioRecommendationEngine.recommendAudio).toHaveBeenCalled();
      expect(mockAnalyzeHashtags).toHaveBeenCalledWith(['caption1', 'hashtag #cool']);
      
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.topPerformingVideoCaptions).toEqual(['caption1', 'hashtag #cool']);
      expect(result.data?.trendingHashtags).toEqual([{ tag: '#cool' }]);
      expect(result.data?.detailedPlatformAnalytics).toBeDefined();
      expect(result.data?.realTimeSentiment).toBeDefined();
      expect(result.data?.audioRecommendations).toBeDefined();
    });

    // TODO: Add more tests for:
    // - Failure in one or more engines
    // - No captions found (sentiment analysis and hashtag analysis should be skipped or handle empty input)
    // - Error handling (e.g., if an engine throws an unexpected error)
  });

  describe('generateOptimizedContent', () => {
    const mockAnalysisData: VideoOptimizationAnalysisData = {
        topPerformingVideoCaptions: [], trendingHashtags: [], audioViralityAnalysis: []
    };
    const mockUserPreferences: UserPreferences = { userId: 'testUser', videoLength: 'short' };

    it('should call OptimizedVideoGenerator with correct parameters', async () => {
      const result = await service.generateOptimizedContent(mockAnalysisData, mockUserPreferences);
      expect(mockOptimizedVideoGenerator.generateOptimizedContent).toHaveBeenCalledWith(mockAnalysisData, mockUserPreferences, undefined);
      expect(result.success).toBe(true);
      expect(result.data?.title).toBe('Optimized Title');
    });
    
    // TODO: Add more tests for:
    // - Invalid input (missing analysis or userPreferences)
    // - Generator failure
  });
});
