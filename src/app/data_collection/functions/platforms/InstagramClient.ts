// difficult: Instagram Graph API client implementation
import { BasePlatformClient } from './BasePlatformClient';
import { PostMetrics, Platform } from '../types';

interface InstagramMedia {
  id: string;
  caption?: string;
  media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM';
  media_url: string;
  permalink: string;
  timestamp: string;
  username: string;
  insights?: {
    data: Array<{
      name: string;
      period: string;
      values: Array<{ value: number }>;
      title: string;
      description: string;
      id: string;
    }>;
  };
  children?: {
    data: Array<{ id: string }>;
  };
}

export class InstagramClient extends BasePlatformClient {
  private readonly API_BASE = 'https://graph.instagram.com/v16.0';
  private readonly API_VERSION = 'v16.0';
  private readonly FIELDS = [
    'id',
    'caption',
    'media_type',
    'media_url',
    'permalink',
    'timestamp',
    'username',
    'children{media_url,media_type}',
  ].join(',');
  
  constructor(accessToken: string) {
    super(accessToken, 'instagram');
  }

  async getPostMetrics(postId: string): Promise<PostMetrics> {
    return this.throttleRequest(async () => {
      // First, get the basic media data
      const mediaUrl = `${this.API_BASE}/${postId}?fields=${this.FIELDS}&access_token=${this.accessToken}`;
      const mediaResponse = await fetch(mediaUrl);
      
      if (!mediaResponse.ok) {
        throw new Error(`Instagram API error: ${mediaResponse.statusText}`);
      }
      
      const media = await mediaResponse.json() as InstagramMedia;
      
      // Then get the insights
      const insightsUrl = `${this.API_BASE}/${postId}/insights?metric=engagement,impressions,reach,saved,video_views&access_token=${this.accessToken}`;
      const insightsResponse = await fetch(insightsUrl);
      
      if (!insightsResponse.ok) {
        console.warn('Could not fetch insights for post', postId);
      }
      
      const insights = await insightsResponse.json();
      
      return this.mapToPostMetrics(media, insights);
    });
  }

  async getUserPosts(userId: string, lookbackDays: number = 30): Promise<PostMetrics[]> {
    return this.throttleRequest(async () => {
      const endTime = Math.floor(Date.now() / 1000);
      const startTime = endTime - (lookbackDays * 24 * 60 * 60);
      
      // First, get the Instagram Business Account ID if we don't have it
      const accountInfoUrl = `${this.API_BASE}/me/accounts?fields=instagram_business_account&access_token=${this.accessToken}`;
      const accountResponse = await fetch(accountInfoUrl);
      
      if (!accountResponse.ok) {
        throw new Error(`Failed to get Instagram Business Account: ${accountResponse.statusText}`);
      }
      
      const accountData = await accountResponse.json();
      const businessAccountId = accountData.data[0]?.instagram_business_account?.id;
      
      if (!businessAccountId) {
        throw new Error('No Instagram Business Account found');
      }
      
      // Get the user's media
      const mediaUrl = `${this.API_BASE}/${businessAccountId}/media?fields=${this.FIELDS}&since=${startTime}&until=${endTime}&access_token=${this.accessToken}`;
      const mediaResponse = await fetch(mediaUrl);
      
      if (!mediaResponse.ok) {
        throw new Error(`Failed to get user media: ${mediaResponse.statusText}`);
      }
      
      const mediaData = await mediaResponse.json();
      const posts: PostMetrics[] = [];
      
      // Process each media item
      for (const media of mediaData.data) {
        try {
          const postMetrics = await this.getPostMetrics(media.id);
          posts.push(postMetrics);
        } catch (error) {
          console.error(`Error processing post ${media.id}:`, error);
        }
      }
      
      return posts;
    });
  }

  async getCompetitorPosts(username: string, lookbackDays: number = 30): Promise<PostMetrics[]> {
    return this.throttleRequest(async () => {
      // Note: Instagram's API doesn't directly support searching by username for competitors
      // In a real implementation, you would need to have the competitor's user ID
      // This is a simplified example that would need to be adapted based on your requirements
      
      // For the purpose of this example, we'll return an empty array
      // In a real implementation, you might:
      // 1. Look up the user ID by username (if you have that permission)
      // 2. Use the Instagram Basic Display API with proper permissions
      // 3. Or use a third-party service that has the necessary permissions
      
      console.warn('Instagram API does not support direct competitor lookup by username');
      return [];
    });
  }

  private mapToPostMetrics(media: InstagramMedia, insights: any): PostMetrics {
    // Extract metrics from insights
    const metrics = {
      impressions: this.getMetricValue(insights, 'impressions'),
      reach: this.getMetricValue(insights, 'reach'),
      engagement: this.getMetricValue(insights, 'engagement'),
      saved: this.getMetricValue(insights, 'saved'),
      video_views: this.getMetricValue(insights, 'video_views'),
    };

    // Calculate engagement rate (simplified)
    const engagementRate = metrics.engagement / (metrics.reach || 1) * 100;
    
    // Extract hashtags from caption
    const hashtags = media.caption ? this.extractHashtags(media.caption) : [];
    
    return {
      id: media.id,
      platform: 'instagram',
      views: metrics.video_views || metrics.impressions,
      likes: this.getEngagementMetric(insights, 'like'),
      comments: this.getEngagementMetric(insights, 'comments'),
      shares: this.getEngagementMetric(insights, 'shares'),
      engagementRate,
      timestamp: new Date(media.timestamp),
      caption: media.caption,
      hashtags,
      url: media.permalink,
    };
  }

  private getMetricValue(insights: any, metricName: string): number {
    if (!insights?.data) return 0;
    
    const metric = insights.data.find((item: any) => item.name === metricName);
    return metric?.values?.[0]?.value || 0;
  }

  private getEngagementMetric(insights: any, metricType: string): number {
    if (!insights?.data) return 0;
    
    const engagementMetric = insights.data.find((item: any) => 
      item.name === 'engagement' && item.title.toLowerCase().includes(metricType)
    );
    
    return engagementMetric?.values?.[0]?.value || 0;
  }

  private extractHashtags(caption: string): string[] {
    const hashtagRegex = /#([\w\d]+)/g;
    const matches = caption.match(hashtagRegex) || [];
    return matches.map(tag => tag.substring(1)); // Remove the '#'
  }
}
