import { CompetitorApiIntegrator, Platform } from '../CompetitorApiIntegrator';
import type { PostMetrics, PaginatedResponse } from '../../../data_collection/functions/types';

describe('CompetitorApiIntegrator', () => {
  const mockTikTok = { getCompetitorPosts: jest.fn() };
  const mockInstagram = { getCompetitorPosts: jest.fn() };
  const mockYouTube = { getCompetitorPosts: jest.fn() };

  const config = {
    tiktokToken: 'tiktok',
    instagramToken: 'instagram',
    youtubeToken: 'youtube',
  };

  // Patch the class for testability
  class TestableCompetitorApiIntegrator extends CompetitorApiIntegrator {
    constructor() {
      super(config);
      // @ts-ignore
      this.tiktok = mockTikTok;
      // @ts-ignore
      this.instagram = mockInstagram;
      // @ts-ignore
      this.youtube = mockYouTube;
    }
  }

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const validPagination = { hasMore: false, pageSize: 0, page: 1, total: 0, cursor: null };

  it('fetches competitor posts for TikTok', async () => {
    const expected = { data: [], pagination: validPagination } as PaginatedResponse<PostMetrics>;
    mockTikTok.getCompetitorPosts.mockResolvedValue(expected);
    const integrator = new TestableCompetitorApiIntegrator();
    const result = await integrator.fetchCompetitorPosts('tiktok', 'user');
    expect(result).toBe(expected);
    expect(mockTikTok.getCompetitorPosts).toHaveBeenCalledWith('user', 30);
  });

  it('fetches competitor posts for Instagram', async () => {
    const expected = { data: [], pagination: validPagination } as PaginatedResponse<PostMetrics>;
    mockInstagram.getCompetitorPosts.mockResolvedValue(expected);
    const integrator = new TestableCompetitorApiIntegrator();
    const result = await integrator.fetchCompetitorPosts('instagram', 'user');
    expect(result).toBe(expected);
    expect(mockInstagram.getCompetitorPosts).toHaveBeenCalledWith('user', 30);
  });

  it('fetches competitor posts for YouTube', async () => {
    const expected = [] as PostMetrics[];
    mockYouTube.getCompetitorPosts.mockResolvedValue(expected);
    const integrator = new TestableCompetitorApiIntegrator();
    const result = await integrator.fetchCompetitorPosts('youtube', 'user');
    expect(result).toBe(expected);
    expect(mockYouTube.getCompetitorPosts).toHaveBeenCalledWith('user', 30);
  });

  it('runs dailyBatchSync for multiple competitors', async () => {
    mockTikTok.getCompetitorPosts.mockResolvedValue([{ id: '1' }] as any);
    mockInstagram.getCompetitorPosts.mockResolvedValue([{ id: '2' }] as any);
    mockYouTube.getCompetitorPosts.mockResolvedValue([{ id: '3' }] as any);
    const integrator = new TestableCompetitorApiIntegrator();
    const competitors = [
      { platform: 'tiktok' as Platform, usernameOrId: 'a' },
      { platform: 'instagram' as Platform, usernameOrId: 'b' },
      { platform: 'youtube' as Platform, usernameOrId: 'c' },
    ];
    const result = await integrator.dailyBatchSync(competitors);
    expect(result['tiktok:a']).toEqual([{ id: '1' }]);
    expect(result['instagram:b']).toEqual([{ id: '2' }]);
    expect(result['youtube:c']).toEqual([{ id: '3' }]);
  });

  it('throws on unsupported platform', async () => {
    const integrator = new TestableCompetitorApiIntegrator();
    await expect(
      integrator.fetchCompetitorPosts('unknown' as Platform, 'user')
    ).rejects.toThrow('Unsupported platform');
  });
}); 