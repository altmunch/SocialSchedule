// TargetFile: c:\SocialSchedule\src\app\deliverables\functions\optimizeSchedule.ts
import { SupabaseClient } from '@supabase/supabase-js';
import { Database, Tables } from '@/types/supabase';
import { EngagementPredictorService } from './engagement_predictor';
import { SchedulerCore, InternalPost } from './SchedulerCore'; // Assuming SchedulerCore and InternalPost are exported
import { ScheduledPost, OptimalPostingSchedule, EngagementPrediction, Platform, OptimizedContentResult } from '../types/deliverables_types'; 
import { Video as AnalysisVideo } from '@/app/analysis/types/analysis_types'; // Video is imported as AnalysisVideo from its source

// Define a type for content items to be scheduled
// Define a type for content items to be scheduled, ensuring platform compatibility
// Omit 'platform' from Video if it exists and has a conflicting type, then add our own 'platform'.
interface ContentToSchedule extends Omit<AnalysisVideo, 'platform'> { 
  platform: Platform; // Use the Platform type from deliverables_types
  // Add other relevant fields like pre-calculated viralityScore, trendVelocity, specific content for the post
  postText?: string;
  mediaUrlsToPost?: string[];
  viralityScore?: number; // Could come from ViralityPredictionService
  trendVelocity?: number; // Could come from analysis
  engagement_rate?: number | null; // Make engagement_rate optional as it might not always be present directly on Video
}

export class ScheduleOptimizerService {
  private supabase: SupabaseClient<Database>;
  private engagementPredictor: EngagementPredictorService;
  private schedulerCore: SchedulerCore;

  constructor(supabaseClient: SupabaseClient<Database>, schedulerCore: SchedulerCore) {
    this.supabase = supabaseClient;
    this.schedulerCore = schedulerCore; // Inject SchedulerCore instance
    this.engagementPredictor = new EngagementPredictorService(supabaseClient);
  }

  async optimizeAndSchedulePosts(
    userId: string,
    contentsToSchedule: ContentToSchedule[],
    userPreferences?: { postsPerDay?: number; preferredTimeWindows?: any[] } // Define more detailed preferences
  ): Promise<OptimalPostingSchedule> {
    const allScheduledPosts: ScheduledPost[] = [];
    const now = new Date();

    for (const content of contentsToSchedule) {
      // 1. Get engagement predictions for the content's platform
      const engagementPredictions = await this.engagementPredictor.predictEngagement(
        userId,
        content.platform,
        7 // Look ahead 7 days
      );

      if (engagementPredictions.length === 0) {
        console.warn(`No engagement predictions for ${content.platform}, using default time for content ID ${content.id}`);
        // Fallback: schedule for a generic 'good' time or a few hours from now
        const fallbackTime = new Date(now.getTime() + 4 * 60 * 60 * 1000); // 4 hours from now
        engagementPredictions.push({ timestamp: fallbackTime.toISOString(), predictedEngagementScore: 0.3, platform: content.platform });
      }

      // 2. Select the best time slot based on predictions, preferences, and content characteristics
      // Simple strategy: pick the top predicted slot that hasn't been filled and meets basic criteria
      // TODO: Implement more sophisticated slot selection (e.g., considering post frequency, avoiding conflicts)
      let bestSlot: EngagementPrediction | undefined = engagementPredictions[0];
      // Add logic here to filter slots based on userPreferences.postsPerDay, avoid too many posts close together, etc.

      if (!bestSlot) {
        console.error(`Could not find a suitable slot for content ID ${content.id} on ${content.platform}. Skipping.`);
        continue;
      }

      const scheduledTime = new Date(bestSlot.timestamp);

      // 3. Prepare post data for SchedulerCore
      // The structure should align with what SchedulerCore's schedulePost expects
      const postDataForScheduler = {
        content: content.postText || content.caption || 'Check out this new video!',
        platform: content.platform,
        scheduledTime: scheduledTime,
        viralityScore: content.viralityScore || content.engagement_rate || 0, // Use available metrics
        trendVelocity: content.trendVelocity || 0, // Pass if available
        mediaUrls: content.mediaUrlsToPost || (content.video_url ? [content.video_url] : []),
        metadata: {
          originalVideoId: content.id,
          predictedEngagement: bestSlot.predictedEngagementScore,
          source: 'ScheduleOptimizerService',
        },
      };

      try {
        // 4. Call SchedulerCore to actually schedule the post
        const { postId, conflicts } = await this.schedulerCore.schedulePost(postDataForScheduler);
        console.log(`Post ${postId} scheduled for ${content.platform} at ${scheduledTime}. Conflicts: ${conflicts.join(', ')}`);
        
        allScheduledPosts.push({
          videoId: content.id, // or postId from schedulerCore if preferred
          platform: content.platform,
          publishAt: scheduledTime.toISOString(),
          contentDetails: { // Store some details of what was scheduled
            generatedCaptions: [{text: postDataForScheduler.content, platform: content.platform }]
          }
        });

      } catch (error) {
        console.error(`Error scheduling post for content ID ${content.id} via SchedulerCore:`, error);
      }
    }

    return {
      userId,
      schedule: allScheduledPosts,
      generatedAt: now.toISOString(),
    };
  }
}
