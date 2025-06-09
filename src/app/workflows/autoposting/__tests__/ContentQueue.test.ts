import { ContentQueue, QueuedContent } from '../ContentQueue';

describe('ContentQueue', () => {
  let queue: ContentQueue;

  beforeEach(() => {
    queue = new ContentQueue();
  });

  it('adds content to the queue and assigns an id', () => {
    const id = queue.addToQueue({
      content: { data: 'test' },
      platforms: ['tiktok'],
      metadata: { scheduledTime: new Date() },
    });
    expect(typeof id).toBe('string');
    const batch = queue.getNextBatch();
    expect(batch.length).toBe(1);
    expect(batch[0].id).toBe(id);
    expect(batch[0].metadata.status).toBe('pending');
  });

  it('updates status of a queued item', () => {
    const id = queue.addToQueue({
      content: { data: 'test2' },
      platforms: ['instagram'],
      metadata: { scheduledTime: new Date() },
    });
    queue.updateStatus(id, 'scheduled');
    const batch = queue.getNextBatch();
    expect(batch.find(item => item.id === id)).toBeUndefined();
  });
}); 