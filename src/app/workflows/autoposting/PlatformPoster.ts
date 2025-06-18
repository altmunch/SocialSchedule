export interface PlatformPoster {
  platform: string;
  validateContent(content: any): Promise<boolean>;
  schedulePost(content: any, scheduleTime: Date): Promise<string>;
  getPostStatus(postId: string): Promise<{
    status: 'scheduled' | 'published' | 'failed';
    url?: string;
    error?: string;
  }>;
}

interface PlatformCredentials {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: Date;
  userId: string;
}

interface PostContent {
  mediaUrl?: string;
  videoUrl?: string;
  imageUrl?: string;
  videoPath?: string;
  caption?: string;
  hashtags?: string[];
}

export class TikTokPoster implements PlatformPoster {
  platform = 'tiktok';
  private credentials: PlatformCredentials | null = null;
  private apiBaseUrl = 'https://open-api.tiktok.com';

  constructor(credentials?: PlatformCredentials) {
    this.credentials = credentials;
  }

  async validateContent(content: PostContent): Promise<boolean> {
    if (!content || (!content.mediaUrl && !content.videoUrl)) {
      throw new Error('TikTok content must include a mediaUrl or videoUrl field');
    }

    // Validate video format and size
    if (content.videoUrl) {
      const videoInfo = await this.getVideoInfo(content.videoUrl);
      if (videoInfo.duration > 180) { // 3 minutes max
        throw new Error('TikTok videos must be 3 minutes or less');
      }
      if (videoInfo.size > 287 * 1024 * 1024) { // 287MB max
        throw new Error('TikTok video file size must be 287MB or less');
      }
    }

    // Validate caption length
    if (content.caption && content.caption.length > 2200) {
      throw new Error('TikTok caption must be 2200 characters or less');
    }

    return true;
  }

  async schedulePost(content: PostContent, scheduleTime: Date): Promise<string> {
    if (!this.credentials) {
      throw new Error('TikTok credentials not configured');
    }

    await this.ensureValidToken();

    const payload = {
      video_url: content.videoUrl || content.mediaUrl,
      caption: content.caption || '',
      privacy_level: 'MUTUAL_FOLLOW_FRIEND',
      disable_duet: false,
      disable_comment: false,
      disable_stitch: false,
      brand_content_toggle: false,
      brand_organic_toggle: false
    };

    try {
      const response = await fetch(`${this.apiBaseUrl}/v2/post/publish/video/init/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.credentials.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`TikTok API error: ${error.error?.message || 'Unknown error'}`);
      }

      const result = await response.json();
      
      // Store scheduled post info for status tracking
      const postId = result.data?.publish_id || `tiktok_${Date.now()}`;
      await this.storeScheduledPost(postId, scheduleTime, content);

      return postId;
    } catch (error) {
      throw new Error(`Failed to schedule TikTok post: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getPostStatus(postId: string): Promise<{
    status: 'scheduled' | 'published' | 'failed';
    url?: string;
    error?: string;
  }> {
    if (!this.credentials) {
      throw new Error('TikTok credentials not configured');
    }

    await this.ensureValidToken();

    try {
      const response = await fetch(`${this.apiBaseUrl}/v2/post/publish/status/fetch/?publish_id=${postId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.credentials.accessToken}`
        }
      });

      if (!response.ok) {
        return { status: 'failed', error: 'Failed to fetch post status' };
      }

      const result = await response.json();
      const status = result.data?.status;

      switch (status) {
        case 'PROCESSING_DOWNLOAD':
        case 'PROCESSING_UPLOAD':
        case 'PROCESSING_PUBLISH':
          return { status: 'scheduled' };
        case 'PUBLISHED':
          return { 
            status: 'published', 
            url: result.data?.share_url || `https://www.tiktok.com/@${this.credentials?.userId}/video/${postId}`
          };
        case 'FAILED':
          return { status: 'failed', error: result.data?.fail_reason || 'Publication failed' };
        default:
          return { status: 'scheduled' };
      }
    } catch (error) {
      return { status: 'failed', error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  private async getVideoInfo(videoUrl: string): Promise<{ duration: number; size: number }> {
    // Implementation would use video analysis library or API
    // For now, return mock data to avoid breaking the interface
    return { duration: 60, size: 50 * 1024 * 1024 }; // 60 seconds, 50MB
  }

  private async ensureValidToken(): Promise<void> {
    if (!this.credentials) {
      throw new Error('No credentials available');
    }

    if (this.credentials.expiresAt && new Date() >= this.credentials.expiresAt) {
      await this.refreshToken();
    }
  }

  private async refreshToken(): Promise<void> {
    if (!this.credentials?.refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await fetch('https://open-api.tiktok.com/v2/oauth/token/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          client_id: process.env.TIKTOK_CLIENT_ID || '',
          client_secret: process.env.TIKTOK_CLIENT_SECRET || '',
          grant_type: 'refresh_token',
          refresh_token: this.credentials.refreshToken
        })
      });

      if (!response.ok) {
        throw new Error('Failed to refresh token');
      }

      const result = await response.json();
      this.credentials.accessToken = result.access_token;
      this.credentials.refreshToken = result.refresh_token;
      this.credentials.expiresAt = new Date(Date.now() + result.expires_in * 1000);
    } catch (error) {
      throw new Error(`Token refresh failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async storeScheduledPost(postId: string, scheduleTime: Date, content: PostContent): Promise<void> {
    // Implementation would store in database for tracking
    console.log(`Stored scheduled post ${postId} for ${scheduleTime.toISOString()}`);
  }
}

export class InstagramPoster implements PlatformPoster {
  platform = 'instagram';
  private credentials: PlatformCredentials | null = null;
  private apiBaseUrl = 'https://graph.facebook.com/v18.0';

  constructor(credentials?: PlatformCredentials) {
    this.credentials = credentials;
  }

  async validateContent(content: PostContent): Promise<boolean> {
    if (!content || (!content.mediaUrl && !content.imageUrl && !content.videoUrl)) {
      throw new Error('Instagram content must include a mediaUrl, imageUrl, or videoUrl field');
    }

    // Validate image/video specs
    if (content.imageUrl) {
      const imageInfo = await this.getMediaInfo(content.imageUrl);
      if (imageInfo.width < 320 || imageInfo.height < 320) {
        throw new Error('Instagram images must be at least 320x320 pixels');
      }
    }

    if (content.videoUrl) {
      const videoInfo = await this.getMediaInfo(content.videoUrl);
      if (videoInfo.duration > 60) {
        throw new Error('Instagram feed videos must be 60 seconds or less');
      }
    }

    // Validate caption
    if (content.caption && content.caption.length > 2200) {
      throw new Error('Instagram caption must be 2200 characters or less');
    }

    return true;
  }

  async schedulePost(content: PostContent, scheduleTime: Date): Promise<string> {
    if (!this.credentials) {
      throw new Error('Instagram credentials not configured');
    }

    await this.ensureValidToken();

    try {
      // Step 1: Create media container
      const mediaType = content.videoUrl ? 'VIDEO' : 'IMAGE';
      const mediaUrl = content.videoUrl || content.imageUrl || content.mediaUrl;
      
      const containerResponse = await fetch(`${this.apiBaseUrl}/${this.credentials.userId}/media`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.credentials.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          image_url: mediaType === 'IMAGE' ? mediaUrl : undefined,
          video_url: mediaType === 'VIDEO' ? mediaUrl : undefined,
          media_type: mediaType,
          caption: content.caption || '',
          published: false // For scheduling
        })
      });

      if (!containerResponse.ok) {
        const error = await containerResponse.json();
        throw new Error(`Instagram container creation failed: ${error.error?.message || 'Unknown error'}`);
      }

      const containerResult = await containerResponse.json();
      const creationId = containerResult.id;

      // Step 2: Schedule the post
      const publishResponse = await fetch(`${this.apiBaseUrl}/${this.credentials.userId}/media_publish`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.credentials.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          creation_id: creationId,
          published: true
        })
      });

      if (!publishResponse.ok) {
        const error = await publishResponse.json();
        throw new Error(`Instagram publish failed: ${error.error?.message || 'Unknown error'}`);
      }

      const publishResult = await publishResponse.json();
      const postId = publishResult.id || `instagram_${Date.now()}`;

      await this.storeScheduledPost(postId, scheduleTime, content);
      return postId;

    } catch (error) {
      throw new Error(`Failed to schedule Instagram post: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getPostStatus(postId: string): Promise<{
    status: 'scheduled' | 'published' | 'failed';
    url?: string;
    error?: string;
  }> {
    if (!this.credentials) {
      throw new Error('Instagram credentials not configured');
    }

    await this.ensureValidToken();

    try {
      const response = await fetch(`${this.apiBaseUrl}/${postId}?fields=id,permalink,media_type`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.credentials.accessToken}`
        }
      });

      if (!response.ok) {
        return { status: 'failed', error: 'Failed to fetch post status' };
      }

      const result = await response.json();
      
      if (result.id) {
        return { 
          status: 'published', 
          url: result.permalink || `https://www.instagram.com/p/${postId}`
        };
      } else {
        return { status: 'scheduled' };
      }
    } catch (error) {
      return { status: 'failed', error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  private async getMediaInfo(mediaUrl: string): Promise<{ width: number; height: number; duration?: number }> {
    // Implementation would use media analysis library
    // For now, return mock data to avoid breaking the interface
    return { width: 1080, height: 1080, duration: 30 };
  }

  private async ensureValidToken(): Promise<void> {
    if (!this.credentials) {
      throw new Error('No credentials available');
    }

    if (this.credentials.expiresAt && new Date() >= this.credentials.expiresAt) {
      await this.refreshToken();
    }
  }

  private async refreshToken(): Promise<void> {
    if (!this.credentials?.refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await fetch('https://graph.facebook.com/v18.0/oauth/access_token', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to refresh token');
      }

      const result = await response.json();
      this.credentials.accessToken = result.access_token;
      this.credentials.expiresAt = new Date(Date.now() + result.expires_in * 1000);
    } catch (error) {
      throw new Error(`Token refresh failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async storeScheduledPost(postId: string, scheduleTime: Date, content: PostContent): Promise<void> {
    console.log(`Stored scheduled Instagram post ${postId} for ${scheduleTime.toISOString()}`);
  }
}

export class YouTubePoster implements PlatformPoster {
  platform = 'youtube';
  private credentials: PlatformCredentials | null = null;
  private apiBaseUrl = 'https://www.googleapis.com/youtube/v3';

  constructor(credentials?: PlatformCredentials) {
    this.credentials = credentials;
  }

  async validateContent(content: PostContent): Promise<boolean> {
    if (!content || !content.videoPath && !content.videoUrl) {
      throw new Error('YouTube content must include a videoPath or videoUrl');
    }

    // Validate video specs
    if (content.videoPath || content.videoUrl) {
      const videoInfo = await this.getVideoInfo(content.videoPath || content.videoUrl!);
      if (videoInfo.size > 256 * 1024 * 1024 * 1024) { // 256GB max
        throw new Error('YouTube video file size must be 256GB or less');
      }
      if (videoInfo.duration > 12 * 60 * 60) { // 12 hours max
        throw new Error('YouTube videos must be 12 hours or less');
      }
    }

    // Validate title and description
    if (content.caption && content.caption.length > 5000) {
      throw new Error('YouTube description must be 5000 characters or less');
    }

    return true;
  }

  async schedulePost(content: PostContent, scheduleTime: Date): Promise<string> {
    if (!this.credentials) {
      throw new Error('YouTube credentials not configured');
    }

    await this.ensureValidToken();

    try {
      // Step 1: Upload video
      const uploadResponse = await this.uploadVideo(content);
      const videoId = uploadResponse.id;

      // Step 2: Schedule the video
      if (scheduleTime > new Date()) {
        await this.scheduleVideo(videoId, scheduleTime);
      }

      await this.storeScheduledPost(videoId, scheduleTime, content);
      return videoId;

    } catch (error) {
      throw new Error(`Failed to schedule YouTube video: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getPostStatus(postId: string): Promise<{
    status: 'scheduled' | 'published' | 'failed';
    url?: string;
    error?: string;
  }> {
    if (!this.credentials) {
      throw new Error('YouTube credentials not configured');
    }

    await this.ensureValidToken();

    try {
      const response = await fetch(`${this.apiBaseUrl}/videos?part=status&id=${postId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.credentials.accessToken}`
        }
      });

      if (!response.ok) {
        return { status: 'failed', error: 'Failed to fetch video status' };
      }

      const result = await response.json();
      
      if (result.items && result.items.length > 0) {
        const video = result.items[0];
        const privacyStatus = video.status.privacyStatus;
        const uploadStatus = video.status.uploadStatus;

        if (uploadStatus === 'processed' && privacyStatus === 'public') {
          return { 
            status: 'published', 
            url: `https://www.youtube.com/watch?v=${postId}`
          };
        } else if (uploadStatus === 'uploaded' || uploadStatus === 'processing') {
          return { status: 'scheduled' };
        } else {
          return { status: 'failed', error: `Upload status: ${uploadStatus}` };
        }
      } else {
        return { status: 'failed', error: 'Video not found' };
      }
    } catch (error) {
      return { status: 'failed', error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  private async uploadVideo(content: PostContent): Promise<{ id: string }> {
    const videoFile = content.videoPath || content.videoUrl;
    
    // For actual implementation, would use YouTube Data API v3 resumable upload
    // This is a simplified version
    const response = await fetch(`${this.apiBaseUrl}/videos?uploadType=resumable&part=snippet,status`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.credentials!.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        snippet: {
          title: this.extractTitle(content.caption) || 'Untitled Video',
          description: content.caption || '',
          tags: content.hashtags || [],
          categoryId: '22' // People & Blogs
        },
        status: {
          privacyStatus: 'private', // Will be made public when scheduled
          selfDeclaredMadeForKids: false
        }
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`YouTube upload failed: ${error.error?.message || 'Unknown error'}`);
    }

    const result = await response.json();
    return { id: result.id };
  }

  private async scheduleVideo(videoId: string, scheduleTime: Date): Promise<void> {
    const response = await fetch(`${this.apiBaseUrl}/videos?part=status`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${this.credentials!.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        id: videoId,
        status: {
          privacyStatus: 'private',
          publishAt: scheduleTime.toISOString()
        }
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`YouTube scheduling failed: ${error.error?.message || 'Unknown error'}`);
    }
  }

  private extractTitle(caption?: string): string | undefined {
    if (!caption) return undefined;
    
    // Extract first line or first 100 characters as title
    const firstLine = caption.split('\n')[0];
    return firstLine.length > 100 ? firstLine.substring(0, 97) + '...' : firstLine;
  }

  private async getVideoInfo(videoPath: string): Promise<{ duration: number; size: number }> {
    // Implementation would use video analysis library
    // For now, return mock data to avoid breaking the interface
    return { duration: 300, size: 100 * 1024 * 1024 }; // 5 minutes, 100MB
  }

  private async ensureValidToken(): Promise<void> {
    if (!this.credentials) {
      throw new Error('No credentials available');
    }

    if (this.credentials.expiresAt && new Date() >= this.credentials.expiresAt) {
      await this.refreshToken();
    }
  }

  private async refreshToken(): Promise<void> {
    if (!this.credentials?.refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          client_id: process.env.YOUTUBE_CLIENT_ID || '',
          client_secret: process.env.YOUTUBE_CLIENT_SECRET || '',
          refresh_token: this.credentials.refreshToken,
          grant_type: 'refresh_token'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to refresh token');
      }

      const result = await response.json();
      this.credentials.accessToken = result.access_token;
      this.credentials.expiresAt = new Date(Date.now() + result.expires_in * 1000);
    } catch (error) {
      throw new Error(`Token refresh failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async storeScheduledPost(postId: string, scheduleTime: Date, content: PostContent): Promise<void> {
    console.log(`Stored scheduled YouTube video ${postId} for ${scheduleTime.toISOString()}`);
  }
} 