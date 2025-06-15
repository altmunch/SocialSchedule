import { generateContent } from './contentGeneration';
import { getCompetitorTactics } from './competitorTactics';
import { Platform } from '../app/workflows/deliverables/types/deliverables_types';
import { v4 as uuidv4 } from 'uuid';

interface IdeationRequest {
  workflowId?: string;
  platform: Platform;
  baseCaption: string;
  hashtags?: string[];
  targetAudience?: string;
  competitorHandle?: string;
  lookbackDays?: number;
}

interface IdeationResult {
  requestId: string;
  ideation: ReturnType<typeof generateContent>;
  tactics?: Awaited<ReturnType<typeof getCompetitorTactics>>;
  noveltyScore: number; // 0-1
}

export class ContentIdeationWorkflow {
  constructor(private concurrency = 10) {}

  async executeBulk(requests: IdeationRequest[]): Promise<IdeationResult[]> {
    const results: IdeationResult[] = [];
    const queue = [...requests];

    const workers = Array.from({ length: this.concurrency }, () =>
      this.worker(queue, results),
    );
    await Promise.all(workers);
    // Rank by noveltyScore descending and keep top 1000
    return results
      .sort((a, b) => b.noveltyScore - a.noveltyScore)
      .slice(0, 1000);
  }

  private async worker(queue: IdeationRequest[], sink: IdeationResult[]): Promise<void> {
    while (true) {
      const req = queue.shift();
      if (!req) break;
      const requestId = req.workflowId ?? uuidv4();

      const ideation = await generateContent({
        caption: req.baseCaption,
        hashtags: req.hashtags,
        platform: req.platform,
        targetAudience: req.targetAudience,
      });

      const tactics = req.competitorHandle
        ? await getCompetitorTactics({
            platform: req.platform,
            usernameOrId: req.competitorHandle,
            lookbackDays: req.lookbackDays ?? 30,
          })
        : undefined;

      const noveltyScore = this.calculateNovelty(ideation.optimization.improvements, tactics);
      sink.push({ requestId, ideation, tactics, noveltyScore });
    }
  }

  private calculateNovelty(improvements: string[], tactics?: any): number {
    // Simple heuristic: proportion of improvements not seen in competitor tactics
    if (!tactics) return 1;
    const tacticTexts = JSON.stringify(tactics);
    const novel = improvements.filter((i) => !tacticTexts.includes(i)).length;
    return novel / improvements.length;
  }
} 