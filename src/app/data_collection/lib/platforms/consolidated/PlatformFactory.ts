import { ApiCredentials } from '../base-platform';
import InstagramClient from './InstagramClient';
import TikTokClient from './TikTokClient';

export type PlatformType = 'instagram' | 'tiktok' | 'youtube';

/**
 * Factory class for creating platform-specific API clients
 */
class PlatformFactory {
  /**
   * Creates a platform client based on the specified platform type
   * @param platform The platform type (e.g., 'instagram', 'tiktok')
   * @param credentials Platform API credentials
   * @returns An instance of the platform client
   * @throws {Error} If the platform is not supported
   */
  static createClient(platform: PlatformType, credentials: ApiCredentials) {
    switch (platform) {
      case 'instagram':
        return new InstagramClient(credentials);
      case 'tiktok':
        return new TikTokClient(credentials);
      case 'youtube':
        throw new Error('YouTube client is not yet implemented');
      default:
        throw new Error(`Unsupported platform: ${platform}`);
    }
  }

  /**
   * Creates multiple platform clients at once
   * @param platformCredentials Array of objects containing platform type and credentials
   * @returns Object mapping platform types to their respective clients
   */
  static createClients(platformCredentials: Array<{ platform: PlatformType; credentials: ApiCredentials }>) {
    const clients: Record<string, any> = {};
    
    for (const { platform, credentials } of platformCredentials) {
      clients[platform] = this.createClient(platform, credentials);
    }
    
    return clients as Record<PlatformType, any>;
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
