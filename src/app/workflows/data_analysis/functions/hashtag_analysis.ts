// Hashtag analysis utility for extracting and ranking hashtags from content
// Simple, modular, and easily extensible

/**
 * Extracts hashtags from a given string.
 * Returns unique, lowercased hashtags (without the # symbol).
 */
export function extractHashtags(content: string): string[] {
  if (!content) return [];
  // Match hashtags (words starting with #, allow unicode)
  const matches = content.match(/#([\w\p{L}\p{N}_]+)/gu);
  if (!matches) return [];
  // Remove #, lowercase, and deduplicate
  const tags = Array.from(new Set(matches.map(tag => tag.slice(1).toLowerCase())));
  return tags;
}

/**
 * Analyzes a list of captions or content strings and returns the top N hashtags by frequency.
 * @param contents Array of strings (e.g., captions)
 * @param topN Number of top hashtags to return
 */
export function analyzeHashtags(contents: string[], topN: number = 5): string[] {
  const hashtagCounts: Record<string, number> = {};
  contents.forEach(content => {
    extractHashtags(content).forEach(tag => {
      hashtagCounts[tag] = (hashtagCounts[tag] || 0) + 1;
    });
  });
  // Sort by frequency, descending
  return Object.entries(hashtagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN)
    .map(([tag]) => `#${tag}`);
}
