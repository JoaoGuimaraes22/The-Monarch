// src/lib/novels/utils/word-count.ts
// Word count calculation utilities

/**
 * Calculate word count from HTML content
 * Strips HTML tags and counts meaningful words
 */
export function calculateWordCount(content: string): number {
  if (!content || typeof content !== "string") {
    return 0;
  }

  // Remove HTML tags
  const textOnly = content.replace(/<[^>]*>/g, " ");

  // Split by whitespace and filter out empty strings
  const words = textOnly
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0);

  return words.length;
}

/**
 * Format word count for display
 */
export function formatWordCount(count: number): string {
  if (count === 0) return "0 words";
  if (count === 1) return "1 word";
  if (count < 1000) return `${count} words`;
  if (count < 1000000) return `${(count / 1000).toFixed(1)}k words`;
  return `${(count / 1000000).toFixed(1)}M words`;
}

/**
 * Calculate total word count for multiple scenes
 */
export function calculateTotalWordCount(
  scenes: { wordCount: number }[]
): number {
  return scenes.reduce((total, scene) => total + scene.wordCount, 0);
}

/**
 * Estimate reading time in minutes
 */
export function estimateReadingTime(
  wordCount: number,
  wordsPerMinute: number = 200
): number {
  return Math.ceil(wordCount / wordsPerMinute);
}

/**
 * Format reading time for display
 */
export function formatReadingTime(wordCount: number): string {
  const minutes = estimateReadingTime(wordCount);

  if (minutes < 1) return "Less than 1 min";
  if (minutes === 1) return "1 min";
  if (minutes < 60) return `${minutes} mins`;

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours === 1 && remainingMinutes === 0) return "1 hour";
  if (remainingMinutes === 0) return `${hours} hours`;
  if (hours === 1) return `1 hour ${remainingMinutes} mins`;

  return `${hours} hours ${remainingMinutes} mins`;
}
