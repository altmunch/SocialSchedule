import { Platform, PlatformClient, ApiCredentials, ApiConfig } from './types';
import { TikTokClient } from './tiktok-client';
import { InstagramClient } from './instagram-client';
import { YouTubeClient } from './youtube-client';

/**
 * Factory class to create platform-specific clients
 */
export class PlatformClientFactory {
  /**
   * Creates a platform client based on the specified platform
   * @param platform The social media platform
   * @param credentials API credentials for the platform
   * @param config Optional custom configuration
   * @returns PlatformClient instance
   */
  static createClient(
    platform: Platform,
    credentials: ApiCredentials,
    config: Partial<ApiConfig> = {}
  ): PlatformClient {
    switch (platform) {
      case Platform.TIKTOK:
        return new TikTokClient(credentials, config);
      case Platform.INSTAGRAM:
        return new InstagramClient(credentials, config);
      case Platform.YOUTUBE:
        return new YouTubeClient(credentials, config);
      default:
        throw new Error(`Unsupported platform: ${platform}`);
    }
  }

  /**
   * Creates multiple platform clients at once
   * @param platformConfigs Array of platform configurations
   * @returns Record of platform to client mappings
   */
  static createClients(
    platformConfigs: Array<{
      platform: Platform;
      credentials: ApiCredentials;
      config?: Partial<ApiConfig>;
    }>
  ): Record<Platform, PlatformClient> {
    return platformConfigs.reduce((acc, { platform, credentials, config = {} }) => {
      acc[platform] = this.createClient(platform, credentials, config);
      return acc;
    }, {} as Record<Platform, PlatformClient>);
  }
}
