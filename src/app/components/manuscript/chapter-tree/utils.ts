// src/app/components/manuscript/chapter-tree/utils.ts
// Updated to use shared StatusIndicator configurations

import { SceneStatus } from "./types";
import { STATUS_CONFIGS } from "@/app/components/ui";

/**
 * Format word count for display in the UI
 * Note: Consider using WordCountDisplay component instead for consistency
 */
export function formatWordCount(count: number): string {
  if (count === 0) return "0 words";
  if (count === 1) return "1 word";
  if (count < 1000) return `${count} words`;
  if (count < 1000000) return `${(count / 1000).toFixed(1)}k words`;
  return `${(count / 1000000).toFixed(1)}M words`;
}

/**
 * Get scene status with icon and color styling
 * Updated to use shared STATUS_CONFIGS for consistency
 */
export function getSceneStatus(scene: { status: string }): SceneStatus {
  const config =
    STATUS_CONFIGS[scene.status.toLowerCase()] || STATUS_CONFIGS.draft;

  return {
    icon: config.icon,
    color: config.color,
  };
}

/**
 * Calculate total word count for an array of scenes
 */
export function calculateTotalWords(scenes: { wordCount: number }[]): number {
  return scenes.reduce((total, scene) => total + scene.wordCount, 0);
}

/**
 * Generate a shortened title for display (truncate if too long)
 */
export function truncateTitle(title: string, maxLength: number = 30): string {
  if (title.length <= maxLength) return title;
  return title.substring(0, maxLength - 3) + "...";
}

/**
 * Get reading time estimate for word count
 * Note: Consider using WordCountDisplay component with showReadingTime for consistency
 */
export function getReadingTime(
  wordCount: number,
  wordsPerMinute: number = 200
): string {
  if (wordCount === 0) return "No content";

  const minutes = Math.ceil(wordCount / wordsPerMinute);

  if (minutes < 1) return "< 1 min";
  if (minutes === 1) return "1 min";
  if (minutes < 60) return `${minutes} mins`;

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours === 1 && remainingMinutes === 0) return "1 hour";
  if (remainingMinutes === 0) return `${hours} hours`;
  if (hours === 1) return `1 hr ${remainingMinutes} min`;

  return `${hours} hrs ${remainingMinutes} min`;
}

/**
 * Check if a scene is considered "short" (under a certain word count)
 */
export function isShortScene(
  wordCount: number,
  threshold: number = 100
): boolean {
  return wordCount < threshold;
}

/**
 * Get a visual indicator for scene length
 */
export function getSceneLengthIndicator(wordCount: number): {
  indicator: string;
  color: string;
  description: string;
} {
  if (wordCount === 0) {
    return {
      indicator: "⚪",
      color: "text-gray-500",
      description: "Empty scene",
    };
  }

  if (wordCount < 100) {
    return {
      indicator: "🔸",
      color: "text-orange-400",
      description: "Short scene",
    };
  }

  if (wordCount < 500) {
    return {
      indicator: "🔵",
      color: "text-blue-400",
      description: "Brief scene",
    };
  }

  if (wordCount < 1500) {
    return {
      indicator: "🟢",
      color: "text-green-400",
      description: "Standard scene",
    };
  }

  return {
    indicator: "🔴",
    color: "text-purple-400",
    description: "Long scene",
  };
}

/**
 * Sort scenes by order
 */
export function sortScenesByOrder<T extends { order: number }>(
  scenes: T[]
): T[] {
  return [...scenes].sort((a, b) => a.order - b.order);
}

/**
 * Sort chapters by order
 */
export function sortChaptersByOrder<T extends { order: number }>(
  chapters: T[]
): T[] {
  return [...chapters].sort((a, b) => a.order - b.order);
}

/**
 * Sort acts by order
 */
export function sortActsByOrder<T extends { order: number }>(acts: T[]): T[] {
  return [...acts].sort((a, b) => a.order - b.order);
}
