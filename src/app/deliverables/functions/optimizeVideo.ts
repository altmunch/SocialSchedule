import { Video as AnalysisVideo } from '@/app/analysis/types/analysis_types';
import { 
  OptimizedContentResult, 
  Platform, 
  OptimizedHashtag, 
  OptimizedCaption, 
  ProductLinkPlacement, 
  AudioOptimizationSuggestion 
} from '../types/deliverables_types';
import { hashtagService } from './hashtagService';
import { CaptionGeneratorService } from './caption_generator';
import { ProductLinkOptimizerService } from './product_link_optimizer';
import { AudioOptimizerService } from './audio_optimizer';

// Define a minimal Video interface with required properties
interface Video {
  id: string;
  title: string | null;
  caption: string | null;
  audio_url?: string | null;
  tags?: string[] | null;
  platform?: Platform;
  description?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  user_id?: string | null;
  competitor_id?: string | null;
  platform_id?: string;
  // Add other optional properties that might be needed
  [key: string]: any; // For any additional properties
}

interface Product { 
  id: string; 
  name: string; 
  url: string; 
  keywords: string[]; 
}

export class VideoOptimizationOrchestrator {
  private captionGenerator: CaptionGeneratorService;
  private productLinkOptimizer: ProductLinkOptimizerService;
  private audioOptimizer: AudioOptimizerService;

  constructor() {
    this.captionGenerator = new CaptionGeneratorService();
    this.productLinkOptimizer = new ProductLinkOptimizerService();
    this.audioOptimizer = new AudioOptimizerService();
  }

  async optimizeVideo(
    video: Video, 
    platform: Platform, 
    products: Product[] = []
  ): Promise<OptimizedContentResult> {
    try {
      // 1. Generate optimized hashtags using the new service
      const optimizedHashtags = await hashtagService.optimizeHashtags(
        video.caption || '',
        platform as 'tiktok' | 'instagram' | 'youtube', // Cast to supported platforms
        15
      );

      // 2. Generate captions
      const captions = await this.captionGenerator.generateCaptions(
        {
          currentCaption: video.caption || '',
          title: video.title || '',
          keyPoints: video.description ? [video.description] : []
        },
        platform as 'tiktok' | 'instagram' | 'youtube',
        'informative',
        3
      );

      // 3. Optimize product links - simplified to match expected types
      let productLinkPlacements: ProductLinkPlacement[] = [];
      try {
        // Create a video content object that matches what optimizeProductLinks expects
        const videoContent = {
          id: video.id,
          title: video.title || '',
          caption: video.caption || '',
          description: video.description || video.caption || '',
          platform: platform as 'tiktok' | 'instagram' | 'youtube'
        };
        
        const result = await this.productLinkOptimizer.optimizeProductLinks(
          videoContent,
          products
        );
        
        // Ensure we always return an array of ProductLinkPlacement
        productLinkPlacements = Array.isArray(result) ? result : [];
      } catch (error) {
        console.error('Error optimizing product links:', error);
      }

      // 4. Generate audio optimization suggestions
      let audioSuggestions: AudioOptimizationSuggestion[] = [];
      if (video.audio_url) {
        try {
          // Create a complete video object with all required properties for optimizeAudio
          const videoForAudio = {
            // Required properties
            id: video.id,
            user_id: video.user_id || null,
            competitor_id: video.competitor_id || null,
            platform: platform as 'tiktok' | 'instagram' | 'youtube',
            platform_id: video.platform_id || '',
            title: video.title || '',
            caption: video.caption || '',
            // Audio properties
            audio_url: video.audio_url,
            // Engagement metrics
            like_count: 0,
            comment_count: 0,
            share_count: 0,
            view_count: 0,
            engagement_rate: 0,
            // Additional required properties with defaults
            created_at: video.created_at || new Date().toISOString(),
            updated_at: video.updated_at || new Date().toISOString(),
            // Add missing required properties
            duration_seconds: 0,
            published_at: video.created_at || new Date().toISOString(),
            niche: video.tags?.[0] || 'general',
            // Other properties with defaults
            description: video.description || null,
            duration: 0,
            thumbnail_url: null,
            video_url: null,
            width: 0,
            height: 0,
            aspect_ratio: '16:9',
            tags: video.tags || [],
            is_private: false,
            is_pinned: false,
            is_remix: false,
            is_stitch: false,
            has_audio: !!video.audio_url,
            has_captions: false,
            has_lyrics: false,
            has_effect: false,
            has_filter: false,
            has_sticker: false,
            has_text: false,
            has_transition: false,
            has_voiceover: false,
            has_duet: false,
            has_react: false,
            // Add any other required properties from the Video type
            embedding: null
          } as const;
          
          const suggestions = await this.audioOptimizer.optimizeAudio(
            videoForAudio,
            platform as 'tiktok' | 'instagram' | 'youtube'
          );
          
          if (suggestions && Array.isArray(suggestions)) {
            audioSuggestions = suggestions;
          }
        } catch (error) {
          console.error('Error optimizing audio:', error);
        }
      }

      // Ensure all arrays are properly typed and not undefined
      const result: OptimizedContentResult = {
        videoId: video.id,
        optimizedHashtags: Array.isArray(optimizedHashtags) ? optimizedHashtags : [],
        generatedCaptions: Array.isArray(captions) ? captions : [captions],
        productLinkPlacements: Array.isArray(productLinkPlacements) ? productLinkPlacements : [],
        audioSuggestions: Array.isArray(audioSuggestions) ? audioSuggestions : []
      };
      
      return result;
    } catch (error) {
      console.error('Error optimizing video:', error);
      throw new Error(`Failed to optimize video: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export const videoOptimizationOrchestrator = new VideoOptimizationOrchestrator();