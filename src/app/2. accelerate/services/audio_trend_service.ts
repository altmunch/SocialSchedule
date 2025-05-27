// difficult
// Audio Trend Detection Service: TikTok API, Librosa, CNN, Shazam
export class AudioTrendService {
  /**
   * Get trending audio for a platform, filter by velocity, analyze BPM/mood, and check copyright.
   * @param platform TikTok, Instagram, etc.
   * @param tiktokClient TikTok API client
   * @param librosa Librosa audio analysis client
   * @param cnnModel CNN model for mood classification
   * @param shazamClient Shazam API client
   */
  async getTrendingAudio(
    platform: string,
    tiktokClient: any,
    librosa: any,
    cnnModel: any,
    shazamClient: any
  ): Promise<any[]> {
    try {
      // Step 1: Get trending sounds from TikTok API
      const trending = await tiktokClient.getTrendingSounds(platform); // [{sound_id, url, velocity, ...}]
      // Step 2: Filter for velocity > 15% daily growth
      const fastGrowing = trending.filter(a => a.velocity > 0.15);
      // Step 3: Analyze BPM, mood, and copyright for each sound
      const results = await Promise.all(fastGrowing.map(async sound => {
        try {
          const bpm = await librosa.getBPM(sound.url);
          const mood = await cnnModel.classifyMood(sound.url);
          // Cross-check copyright with Shazam
          const shazamResult = await shazamClient.checkCopyright(sound.url);
          const isCopyrightSafe = shazamResult && shazamResult.status === 'clear';
          return { ...sound, bpm, mood, isCopyrightSafe };
        } catch (err) {
          console.error('Audio analysis error for sound', sound.sound_id, err);
          return { ...sound, bpm: null, mood: null, isCopyrightSafe: false };
        }
      }));
      // Only return copyright-safe sounds
      return results.filter(r => r.isCopyrightSafe);
    } catch (err) {
      console.error('AudioTrendService error:', err);
      return [];
    }
  }
}
