import { optimizeVideo } from './videoOptimization';
import { autopost, AutoPostRequest } from './autoposting';
import { Platform, TimeRange } from '../app/workflows/data_analysis/types/analysis_types';
import { v4 as uuidv4 } from 'uuid';

interface ContentAutomationRequest {
  workflowId?: string; // Optional external correlation identifier
  userId: string;
  platform: Platform;
  videoUrl: string;
  caption?: string;
  hashtags?: string[];
  timeRange: TimeRange;
  scheduleTime?: Date;
  mode?: 'fast' | 'thorough';
}

interface ContentAutomationResult {
  requestId: string;
  optimization: ReturnType<typeof optimizeVideo>;
  autopostId: string;
}

/**
 * Executes bulk content automation requests by chaining video optimization → autoposting.
 * Uses a simple concurrency limiter (default 10) to avoid exhausting resources.
 */
export class ContentAutomationWorkflow {
  constructor(private concurrency = 10) {}

  async executeBulk(
    requests: ContentAutomationRequest[],
  ): Promise<ContentAutomationResult[]> {
    const results: ContentAutomationResult[] = [];
    const queue = [...requests];

    const workers = Array.from({ length: this.concurrency }, () =>
      this.worker(queue, results),
    );
    await Promise.all(workers);
    return results;
  }

  private async worker(
    queue: ContentAutomationRequest[],
    sink: ContentAutomationResult[],
  ): Promise<void> {
    while (true) {
      const req = queue.shift();
      if (!req) break;
      const requestId = req.workflowId ?? uuidv4();

      // 1) Video optimization
      const optimization = await optimizeVideo({
        userId: req.userId,
        platform: req.platform,
        timeRange: req.timeRange,
        audioIds: undefined,
        correlationId: requestId,
        mode: req.mode,
      });

      // 2) Autoposting (fire-and-forget inside autoposting)
      const autopostRequest: AutoPostRequest = {
        content: {
          videoUrl: req.videoUrl,
          caption: optimization.optimizedCaption ?? req.caption,
          hashtags: optimization.trendingHashtags?.map((h) => h.tag) ?? req.hashtags,
        },
        platforms: [req.platform.toLowerCase() as any],
        scheduleTime: req.scheduleTime,
      };
      const autopostResult = await autopost(autopostRequest);

      sink.push({ requestId, optimization, autopostId: autopostResult.id });
    }
  }
} 