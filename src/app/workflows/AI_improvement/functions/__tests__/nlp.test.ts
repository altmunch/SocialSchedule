import { analyzeSentiment, analyzeTone, suggestCaptionsAndHashtags } from '../nlp';

describe('NLP Utilities', () => {
  it('should detect positive sentiment', () => {
    const result = analyzeSentiment('This is amazing!');
    expect(result.sentiment).toBe('positive');
    expect(result.score).toBeGreaterThan(0);
  });

  it('should detect negative sentiment', () => {
    const result = analyzeSentiment('This is terrible.');
    expect(result.sentiment).toBe('negative');
    expect(result.score).toBeLessThan(0);
  });

  it('should detect neutral sentiment', () => {
    const result = analyzeSentiment('This is a post.');
    expect(result.sentiment).toBe('neutral');
    expect(result.score).toBe(0);
  });

  it('should detect excited tone', () => {
    const result = analyzeTone('Wow!! This is great!!');
    expect(result.tone).toBe('excited');
  });

  it('should detect formal tone', () => {
    const result = analyzeTone('Please see the attached. Regards, John');
    expect(result.tone).toBe('formal');
  });

  it('should detect casual tone', () => {
    const result = analyzeTone('Hey, check this out lol');
    expect(result.tone).toBe('casual');
  });

  it('should generate caption variations and hashtags', () => {
    const post = { caption: 'This is the best product', hashtags: ['#sale'] };
    const { captions, hashtags } = suggestCaptionsAndHashtags(post);
    expect(captions.length).toBeGreaterThan(1);
    expect(hashtags).toContain('#trending');
    expect(hashtags).toContain('#sale');
  });
}); 