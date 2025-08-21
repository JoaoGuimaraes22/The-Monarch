// src/lib/utils/chapter-numbering.ts
// ✨ NEW: Utility functions for chapter numbering display

import { NovelWithStructure, Act, Chapter } from "@/lib/novels";

/**
 * Calculate the display number for a chapter based on numbering mode
 */
export function getChapterDisplayNumber(
  chapter: Chapter,
  novel: NovelWithStructure | null | undefined,
  continuousNumbering: boolean
): number {
  if (!novel?.acts) {
    // Fallback to chapter.order if novel is not available
    return chapter.order;
  }

  if (!continuousNumbering) {
    // Per-act numbering: just use the chapter's order within its act
    return chapter.order;
  }

  // Continuous numbering: calculate position across all acts
  const sortedActs = [...novel.acts].sort((a, b) => a.order - b.order);
  let chapterCount = 0;

  for (const act of sortedActs) {
    const sortedChapters = [...act.chapters].sort((a, b) => a.order - b.order);

    for (const ch of sortedChapters) {
      chapterCount++;
      if (ch.id === chapter.id) {
        return chapterCount;
      }
    }
  }

  // Fallback to chapter.order if not found
  return chapter.order;
}

/**
 * Get the act that contains a specific chapter
 */
export function findActForChapter(
  chapterId: string,
  novel: NovelWithStructure | null | undefined
): Act | null {
  if (!novel?.acts) return null;
  return (
    novel.acts.find((act) =>
      act.chapters.some((chapter) => chapter.id === chapterId)
    ) || null
  );
}

/**
 * Calculate chapter numbers for all chapters in the novel
 * Returns a map of chapterId -> displayNumber
 */
export function calculateAllChapterNumbers(
  novel: NovelWithStructure | null | undefined,
  continuousNumbering: boolean
): Map<string, number> {
  const chapterNumbers = new Map<string, number>();

  if (!novel?.acts) {
    return chapterNumbers;
  }

  if (!continuousNumbering) {
    // Per-act numbering: each act starts from 1
    novel.acts.forEach((act) => {
      const sortedChapters = [...act.chapters].sort(
        (a, b) => a.order - b.order
      );
      sortedChapters.forEach((chapter) => {
        chapterNumbers.set(chapter.id, chapter.order);
      });
    });
  } else {
    // Continuous numbering: count across all acts
    const sortedActs = [...novel.acts].sort((a, b) => a.order - b.order);
    let globalChapterNumber = 0;

    sortedActs.forEach((act) => {
      const sortedChapters = [...act.chapters].sort(
        (a, b) => a.order - b.order
      );
      sortedChapters.forEach((chapter) => {
        globalChapterNumber++;
        chapterNumbers.set(chapter.id, globalChapterNumber);
      });
    });
  }

  return chapterNumbers;
}

/**
 * Format chapter display text with proper numbering
 */
export function formatChapterDisplay(
  chapter: Chapter,
  novel: NovelWithStructure | null | undefined,
  continuousNumbering: boolean,
  format: "short" | "long" = "short"
): string {
  const displayNumber = getChapterDisplayNumber(
    chapter,
    novel,
    continuousNumbering
  );

  if (format === "short") {
    return `CH${displayNumber}`;
  } else {
    return `Chapter ${displayNumber}`;
  }
}

/**
 * Format act and chapter display text
 */
export function formatActChapterDisplay(
  chapter: Chapter,
  novel: NovelWithStructure | null | undefined,
  continuousNumbering: boolean
): string {
  const act = findActForChapter(chapter.id, novel);
  const chapterNumber = getChapterDisplayNumber(
    chapter,
    novel,
    continuousNumbering
  );

  if (!act) {
    return `CH${chapterNumber}`;
  }

  return `ACT${act.order} - ${act.title}, CH${chapterNumber}`;
}

/**
 * Get preview text for the numbering toggle
 */
export function getNumberingPreviewText(
  novel: NovelWithStructure | null | undefined,
  continuousNumbering: boolean
): string {
  if (!novel?.acts || novel.acts.length < 2) {
    return continuousNumbering ? "Ch 1,2,3..." : "Ch 1,2,3...";
  }

  const sortedActs = [...novel.acts].sort((a, b) => a.order - b.order);

  if (!continuousNumbering) {
    // Show per-act numbering
    const firstAct = sortedActs[0];
    const secondAct = sortedActs[1];
    const firstActChapters = Math.min(firstAct.chapters.length, 3);
    const secondActChapters = Math.min(secondAct.chapters.length, 3);

    const firstActText = Array.from(
      { length: firstActChapters },
      (_, i) => i + 1
    ).join(",");
    const secondActText = Array.from(
      { length: secondActChapters },
      (_, i) => i + 1
    ).join(",");

    return `ACT 1: Ch ${firstActText} • ACT 2: Ch ${secondActText}`;
  } else {
    // Show continuous numbering
    const firstActChapters = Math.min(sortedActs[0].chapters.length, 3);
    const secondActStart = firstActChapters + 1;
    const secondActChapters = Math.min(sortedActs[1].chapters.length, 3);

    const firstActText = Array.from(
      { length: firstActChapters },
      (_, i) => i + 1
    ).join(",");
    const secondActText = Array.from(
      { length: secondActChapters },
      (_, i) => secondActStart + i
    ).join(",");

    return `ACT 1: Ch ${firstActText} • ACT 2: Ch ${secondActText}`;
  }
}
