// import { ApiCredentials } from '../base-platform'; // Not used or not exported, comment out for now
import InstagramClient from './InstagramClient';
import TikTokClient from './TikTokClient';
import { ApiConfig, ApiCredentials, Platform } from '../types';

export type PlatformType = 'instagram' | 'tiktok' | 'youtube';

/**
 * Factory class for creating platform-specific API clients
 */
class PlatformFactory {
  /**
   * Creates a platform client based on the specified platform type
   * @param platform The platform type (e.g., 'instagram', 'tiktok')
   * @param authTokenManager Platform API credentials
   * @param userId Optional user ID
   * @param config Optional configuration
   * @returns An instance of the platform client
   * @throws {Error} If the platform is not supported
   */
  static createClient(platform: Platform, authTokenManager: any, userId?: string, config: Partial<ApiConfig> = {}) {
    switch (platform) {
      case Platform.INSTAGRAM:
        return new InstagramClient(authTokenManager, userId, config);
      case Platform.TIKTOK:
        return new TikTokClient(authTokenManager, userId, config);
      case 'youtube':
        throw new Error('YouTube client is not yet implemented');
      default:
        throw new Error(`Unsupported platform: ${platform}`);
    }
  }

  /**
   * Creates multiple platform clients at once
   * @param platformCredentials Array of objects containing platform type, authTokenManager, userId, and config
   * @returns Object mapping platforms to their respective clients
   */
  static createClients(platformCredentials: Array<{ platform: Platform; authTokenManager: any; userId?: string; config?: Partial<ApiConfig> }>) {
    const clients: Record<string, any> = {};
    
    for (const { platform, authTokenManager, userId, config } of platformCredentials) {
      clients[platform] = this.createClient(platform, authTokenManager, userId, config);
    }
    
    return clients as Record<Platform, any>;
  }

  /**
   * Validates if a platform is supported
   * @param platform The platform type to validate
   * @returns boolean indicating if the platform is supported
   */
  static isPlatformSupported(platform: string): platform is PlatformType {
    return ['instagram', 'tiktok', 'youtube'].includes(platform);
  }
}

export default PlatformFactory;
