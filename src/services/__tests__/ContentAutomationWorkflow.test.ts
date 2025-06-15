import { ContentAutomationWorkflow } from '../contentAutomationWorkflow';

describe('ContentAutomationWorkflow', () => {
  it('should process bulk requests and return results', async () => {
    const workflow = new ContentAutomationWorkflow(2);
    const mockRequests = Array.from({ length: 5 }).map((_, idx) => ({
      userId: `user-${idx}`,
      videoUrl: 'https://example.com/video.mp4',
      platform: 'tiktok' as const,
      timeRange: { start: new Date(Date.now() - 86400000), end: new Date() },
    }));

    const results = await workflow.executeBulk(mockRequests as any);
    expect(results.length).toBe(mockRequests.length);
  });
}); 