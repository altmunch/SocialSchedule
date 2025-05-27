// difficult: Tests for platform client implementations
import { TikTokClient } from '../services/platforms/TikTokClient';
import { InstagramClient } from '../services/platforms/InstagramClient';
import { YouTubeClient } from '../services/platforms/YouTubeClient';
import { generateMockPostMetrics } from './testHelpers';

// Mock the global fetch
const mockFetch = jest.fn();
global.fetch = mockFetch as any;

describe('Platform Clients', () => {
  describe('TikTokClient', () => {
    let tiktokClient: TikTokClient;
    
    beforeEach(() => {
      tiktokClient = new TikTokClient('test-access-token');
      mockFetch.mockClear();
    });
    
    it('should fetch user posts', async () => {
      const mockPost = generateMockPostMetrics({ platform: 'tiktok' });
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            videos: [{
              id: mockPost.id,
              create_time: Math.floor(mockPost.timestamp.getTime() / 1000),
              stats: {
                play_count: mockPost.views,
                digg_count: mockPost.likes,
                comment_count: mockPost.comments,
                share_count: mockPost.shares,
                play_time: mockPost.watchTime
              },
              desc: mockPost.caption,
              video_url: mockPost.url
            }]
          }
        }),
      });
      
      const posts = await tiktokClient.getUserPosts('testuser');
      
      expect(posts).toHaveLength(1);
      expect(posts[0].platform).toBe('tiktok');
      expect(mockFetch).toHaveBeenCalled();
    });
    
    it('should handle API errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
        statusText: 'Too Many Requests',
      });
      
      await expect(tiktokClient.getUserPosts('testuser'))
        .rejects
        .toThrow('TikTok API error: Too Many Requests');
    });
  });
  
  describe('InstagramClient', () => {
    let instagramClient: InstagramClient;
    
    beforeEach(() => {
      instagramClient = new InstagramClient('test-access-token');
      mockFetch.mockClear();
    });
    
    it('should fetch user posts with media data', async () => {
      const mockPost = generateMockPostMetrics({ platform: 'instagram' });
      
      // Mock media response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: '123',
          media_type: 'IMAGE',
          media_url: 'https://example.com/image.jpg',
          permalink: 'https://instagram.com/p/123',
          timestamp: mockPost.timestamp.toISOString(),
          caption: mockPost.caption,
          username: 'testuser',
        }),
      });
      
      // Mock insights response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: [
            { name: 'likes', values: [{ value: mockPost.likes }] },
            { name: 'comments', values: [{ value: mockPost.comments }] }
          ]
        }),
      });
      
      const posts = await instagramClient.getUserPosts('testuser');
      
      expect(posts).toHaveLength(1);
      expect(posts[0].platform).toBe('instagram');
      expect(posts[0].likes).toBe(mockPost.likes);
      expect(posts[0].comments).toBe(mockPost.comments);
    });
  });
  
  describe('YouTubeClient', () => {
    let youtubeClient: YouTubeClient;
    
    beforeEach(() => {
      youtubeClient = new YouTubeClient('test-api-key');
      mockFetch.mockClear();
    });
    
    it('should fetch channel videos with statistics', async () => {
      const mockPost = generateMockPostMetrics({ platform: 'youtube' });
      
      // Mock channel response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          items: [{
            id: 'test-channel-id',
            contentDetails: {
              relatedPlaylists: {
                uploads: 'test-playlist-id'
              }
            }
          }]
        }),
      });
      
      // Mock playlist items response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          items: [{
            contentDetails: {
              videoId: 'test-video-id'
            },
            snippet: {
              publishedAt: mockPost.timestamp.toISOString(),
              title: 'Test Video',
              description: 'Test Description',
              thumbnails: {
                default: { url: 'http://example.com/thumb.jpg' }
              }
            }
          }]
        }),
      });
      
      // Mock video details response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          items: [{
            id: 'test-video-id',
            snippet: {
              title: 'Test Video',
              description: 'Test Description',
              publishedAt: mockPost.timestamp.toISOString(),
              thumbnails: { default: { url: 'http://example.com/thumb.jpg' } },
              channelTitle: 'Test Channel',
              tags: ['test', 'video']
            },
            contentDetails: {
              duration: 'PT5M30S',
              dimension: '2d',
              definition: 'hd',
              caption: 'true'
            },
            statistics: {
              viewCount: mockPost.views.toString(),
              likeCount: mockPost.likes.toString(),
              commentCount: mockPost.comments.toString(),
              favoriteCount: '50'
            },
            player: {
              embedHtml: '<iframe>...</iframe>'
            }
          }]
        }),
      });
      
      const videos = await youtubeClient.getUserPosts('testchannel');
      
      expect(videos).toHaveLength(1);
      expect(videos[0].platform).toBe('youtube');
      expect(videos[0].views).toBe(mockPost.views);
      expect(videos[0].likes).toBe(mockPost.likes);
    });
    
    it('should handle video duration format', () => {
      // Test the parseDuration method
      const mockDuration = 'PT1H5M30S';
      const duration = (youtubeClient as any).parseDuration(mockDuration);
      
      expect(duration).toBe(3930); // 1*3600 + 5*60 + 30 = 3930 seconds
    });
  });
});
