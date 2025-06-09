import { TikTokPoster, InstagramPoster, YouTubePoster } from '../PlatformPoster';

describe('PlatformPoster classes', () => {
  it('TikTokPoster validates and schedules content', async () => {
    const poster = new TikTokPoster();
    expect(await poster.validateContent({})).toBe(true);
    const postId = await poster.schedulePost({}, new Date());
    expect(typeof postId).toBe('string');
    const status = await poster.getPostStatus(postId);
    expect(['scheduled', 'published', 'failed']).toContain(status.status);
  });

  it('InstagramPoster validates and schedules content', async () => {
    const poster = new InstagramPoster();
    expect(await poster.validateContent({})).toBe(true);
    const postId = await poster.schedulePost({}, new Date());
    expect(typeof postId).toBe('string');
    const status = await poster.getPostStatus(postId);
    expect(['scheduled', 'published', 'failed']).toContain(status.status);
  });

  it('YouTubePoster validates and schedules content', async () => {
    const poster = new YouTubePoster();
    expect(await poster.validateContent({})).toBe(true);
    const postId = await poster.schedulePost({}, new Date());
    expect(typeof postId).toBe('string');
    const status = await poster.getPostStatus(postId);
    expect(['scheduled', 'published', 'failed']).toContain(status.status);
  });
}); 