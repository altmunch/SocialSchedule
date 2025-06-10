import { validateTemplates } from '../validateTemplates';
import type { ContentTemplateBatch } from '../schema';

describe('validateTemplates', () => {
  it('returns error for missing required fields', () => {
    const batches: ContentTemplateBatch[] = [
      {
        templates: [
          { hook: '', script: 's', visuals: 'v', audio: 'a' },
          { hook: 'h', script: '', visuals: 'v', audio: 'a' },
        ],
        productDescription: 'desc',
        platform: 'tiktok',
      },
    ];
    const errors = validateTemplates(batches);
    expect(errors.length).toBe(2);
    expect(errors[0].message).toMatch(/Missing required/);
  });

  it('returns error for TikTok script too long', () => {
    const batches: ContentTemplateBatch[] = [
      {
        templates: [
          { hook: 'h', script: 'x'.repeat(501), visuals: 'v', audio: 'a' },
        ],
        productDescription: 'desc',
        platform: 'tiktok',
      },
    ];
    const errors = validateTemplates(batches);
    expect(errors.length).toBe(1);
    expect(errors[0].message).toMatch(/TikTok: Script exceeds 500 characters/);
  });

  it('returns error for Instagram script too long and missing visuals', () => {
    const batches: ContentTemplateBatch[] = [
      {
        templates: [
          { hook: 'h', script: 'x'.repeat(2201), visuals: '', audio: 'a' },
          { hook: 'h', script: 'short', visuals: '', audio: 'a' },
        ],
        productDescription: 'desc',
        platform: 'instagram',
      },
    ];
    const errors = validateTemplates(batches);
    expect(errors.length).toBe(2);
    expect(errors[0].message).toMatch(/Missing required field/);
    expect(errors[1].message).toMatch(/Missing required field/);
  });

  it('returns error for YouTube script too long and missing audio', () => {
    const batches: ContentTemplateBatch[] = [
      {
        templates: [
          { hook: 'h', script: 'x'.repeat(5001), visuals: 'v', audio: '' },
          { hook: 'h', script: 'short', visuals: 'v', audio: '' },
        ],
        productDescription: 'desc',
        platform: 'youtube',
      },
    ];
    const errors = validateTemplates(batches);
    expect(errors.length).toBe(2);
    expect(errors[0].message).toMatch(/Missing required field/);
    expect(errors[1].message).toMatch(/Missing required field/);
  });

  it('returns no errors for valid templates', () => {
    const batches: ContentTemplateBatch[] = [
      {
        templates: [
          { hook: 'h', script: 's', visuals: 'v', audio: 'a' },
        ],
        productDescription: 'desc',
        platform: 'tiktok',
      },
      {
        templates: [
          { hook: 'h', script: 's', visuals: 'v', audio: 'a' },
        ],
        productDescription: 'desc',
        platform: 'instagram',
      },
      {
        templates: [
          { hook: 'h', script: 's', visuals: 'v', audio: 'a' },
        ],
        productDescription: 'desc',
        platform: 'youtube',
      },
    ];
    const errors = validateTemplates(batches);
    expect(errors.length).toBe(0);
  });
}); 