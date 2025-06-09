import { analyzeThumbnail, analyzeVideoContent } from '../vision';

describe('Vision Utilities', () => {
  it('should analyze thumbnail and return valid features', () => {
    const result = analyzeThumbnail('http://example.com/image.jpg');
    expect(typeof result.score).toBe('number');
    expect(result.facesDetected).toBeGreaterThanOrEqual(0);
    expect(result.objectsDetected).toBeGreaterThanOrEqual(0);
  });

  it('should analyze video content and return pacing and drop-off points', () => {
    const result = analyzeVideoContent('http://example.com/video.mp4');
    expect(['fast', 'medium', 'slow']).toContain(result.pacing);
    expect(Array.isArray(result.dropOffPoints)).toBe(true);
    expect(result.dropOffPoints.length).toBeGreaterThan(0);
    result.dropOffPoints.forEach(point => expect(typeof point).toBe('number'));
  });
}); 