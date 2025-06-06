// difficult: TikTok API client implementation
import { BasePlatformClient } from './BasePlatformClient';
import { PostMetrics, Platform } from '../types';

interface TikTokVideo {
  id: string;
  create_time: number;
  stats: {
    play_count: number;
    digg_count: number;
    comment_count: number;
    share_count: number;
    play_time: number;
  };
  desc?: string;
  video_url: string;
}

export class TikTokClient extends BasePlatformClient {
  private readonly API_BASE = 'https://open.tiktokapis.com/v2';
  
  constructor(accessToken: string) {
    super(accessToken, 'tiktok');
  }

  async getPostMetrics(postId: string): Promise<PostMetrics> {
    return this.throttleRequest(async () => {
      const response = await fetch(`${this.API_BASE}/video/query/?video_ids=${postId}`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`TikTok API error: ${response.statusText}`);
      }

      const data = await response.json();
      const video = data.data.videos[0] as TikTokVideo;
      
      return this.mapToPostMetrics(video);
    });
  }

  async getUserPosts(userId: string, lookbackDays: number = 30): Promise<PostMetrics[]> {
    return this.throttleRequest(async () => {
      const endTime = Math.floor(Date.now() / 1000);
      const startTime = endTime - (lookbackDays * 24 * 60 * 60);
      
      const response = await fetch(
        `${this.API_BASE}/video/list/?user_id=${userId}&start_time=${startTime}&end_time=${endTime}`, 
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`TikTok API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.data.videos.map((video: TikTokVideo) => this.mapToPostMetrics(video));
    });
  }

  async getCompetitorPosts(username: string, lookbackDays: number = 30): Promise<PostMetrics[]> {
    // First, get the user ID from username
    const userResponse = await fetch(`${this.API_BASE}/user/info/username/${username}`, {
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!userResponse.ok) {
      throw new Error(`Failed to get user ID for ${username}: ${userResponse.statusText}`);
    }

    const userData = await userResponse.json();
    const userId = userData.data.user.id;
    
    // Then get their posts
    return this.getUserPosts(userId, lookbackDays);
  }

  private mapToPostMetrics(video: TikTokVideo): PostMetrics {
    const hashtags = video.desc ? this.extractHashtags(video.desc) : [];
    
    return {
      id: video.id,
      platform: 'tiktok',
      views: video.stats.play_count,
      likes: video.stats.digg_count,
      comments: video.stats.comment_count,
      shares: video.stats.share_count,
      watchTime: video.stats.play_time,
      engagementRate: this.calculateEngagementRate({
        likes: video.stats.digg_count,
        comments: video.stats.comment_count,
        shares: video.stats.share_count,
        views: video.stats.play_count,
        followerCount: 0, // This would come from user data
      }),
      timestamp: new Date(video.create_time * 1000),
      caption: video.desc,
      hashtags,
      url: video.video_url,
    };
  }

  private extractHashtags(caption: string): string[] {
    const hashtagRegex = /#([\w\d]+)/g;
    const matches = caption.match(hashtagRegex) || [];
    return matches.map(tag => tag.substring(1)); // Remove the '#'
  }
}
