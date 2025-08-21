// src/hooks/manuscript/useChapterNumbering.ts
// ✨ NEW: Hook for chapter numbering functionality

import { useMemo } from "react";
import { NovelWithStructure, Chapter } from "@/lib/novels";
import {
  getChapterDisplayNumber,
  calculateAllChapterNumbers,
  formatChapterDisplay,
  formatActChapterDisplay,
} from "@/lib/utils/chapter-numbering";

export interface ChapterNumberingHook {
  /**
   * Get the display number for a specific chapter
   */
  getDisplayNumber: (chapter: Chapter) => number;

  /**
   * Format chapter display text (e.g., "CH5" or "Chapter 5")
   */
  formatDisplay: (chapter: Chapter, format?: "short" | "long") => string;

  /**
   * Format act and chapter display text (e.g., "ACT1 - Title, CH5")
   */
  formatActChapterDisplay: (chapter: Chapter) => string;

  /**
   * Get all chapter numbers as a map (chapterId -> displayNumber)
   */
  allChapterNumbers: Map<string, number>;
}

/**
 * Hook for chapter numbering functionality
 */
export function useChapterNumbering(
  novel: NovelWithStructure | null | undefined,
  continuousNumbering: boolean
): ChapterNumberingHook {
  // Memoize the chapter numbers calculation
  const allChapterNumbers = useMemo(() => {
    if (!novel) return new Map<string, number>();
    return calculateAllChapterNumbers(novel, continuousNumbering);
  }, [novel, continuousNumbering]);

  // Memoize the hook functions
  return useMemo(
    () => ({
      getDisplayNumber: (chapter: Chapter) => {
        if (!novel) return chapter.order;
        return getChapterDisplayNumber(chapter, novel, continuousNumbering);
      },

      formatDisplay: (chapter: Chapter, format: "short" | "long" = "short") => {
        if (!novel)
          return format === "short"
            ? `CH${chapter.order}`
            : `Chapter ${chapter.order}`;
        return formatChapterDisplay(
          chapter,
          novel,
          continuousNumbering,
          format
        );
      },

      formatActChapterDisplay: (chapter: Chapter) => {
        if (!novel) return `CH${chapter.order}`;
        return formatActChapterDisplay(chapter, novel, continuousNumbering);
      },

      allChapterNumbers,
    }),
    [novel, continuousNumbering, allChapterNumbers]
  );
}
