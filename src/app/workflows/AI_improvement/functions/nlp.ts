// Core NLP utilities for AI Improvement Workflow

export function analyzeSentiment(text: string): { sentiment: 'positive' | 'neutral' | 'negative', score: number } {
  // Placeholder: simple rule-based sentiment
  const lower = text.toLowerCase();
  if (lower.includes('love') || lower.includes('great') || lower.includes('amazing')) return { sentiment: 'positive', score: 0.9 };
  if (lower.includes('bad') || lower.includes('hate') || lower.includes('terrible')) return { sentiment: 'negative', score: -0.8 };
  return { sentiment: 'neutral', score: 0 };
}

export function analyzeTone(text: string): { tone: 'formal' | 'casual' | 'excited' | 'neutral' } {
  // Placeholder: simple keyword-based tone detection
  if (text.match(/[!]{2,}/)) return { tone: 'excited' };
  if (text.match(/\b(please|regards|sincerely)\b/i)) return { tone: 'formal' };
  if (text.match(/\b(hey|yo|lol|cool)\b/i)) return { tone: 'casual' };
  return { tone: 'neutral' };
}

export function suggestCaptionsAndHashtags(post: { caption: string, hashtags?: string[] }): { captions: string[], hashtags: string[] } {
  // Placeholder: generate variations and recommend hashtags
  const base = post.caption;
  const captions = [
    base,
    base + ' 🚀',
    'Check this out: ' + base,
    base.replace(/\b(great|amazing|best)\b/gi, 'awesome'),
  ];
  const hashtags = (post.hashtags || []).concat(['#trending', '#viral']).slice(0, 5);
  return { captions, hashtags };
} 