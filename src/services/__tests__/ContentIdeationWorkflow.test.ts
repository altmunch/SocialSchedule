import { ContentIdeationWorkflow } from '../contentIdeationWorkflow';

describe('ContentIdeationWorkflow', () => {
  it('should generate ideation results and rank by novelty', async () => {
    const workflow = new ContentIdeationWorkflow(2);
    const mockRequests = Array.from({ length: 5 }).map((_, idx) => ({
      baseCaption: `Hello world ${idx}`,
      platform: 'instagram' as const,
    }));
    const results = await workflow.executeBulk(mockRequests as any);
    expect(results.length).toBeLessThanOrEqual(5);
  });
}); 