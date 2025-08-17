// src/lib/doc-parse/detectors/chapter-detector.ts
// Chapter detection logic

import { DetectionResult } from "../types";

export class ChapterDetector {
  /**
   * Detect if a line represents a chapter
   */
  static detect(htmlLine: string, textContent: string): DetectionResult {
    // Strategy 1: H2 headings
    if (htmlLine.match(/^<h2[^>]*>/i) && textContent.trim()) {
      return {
        detected: true,
        content: textContent,
        extractedTitle: this.extractTitle(textContent),
      };
    }

    // Strategy 2: "Chapter" keyword with number
    if (
      htmlLine.match(/^<(h[2-4]|p)[^>]*>/i) &&
      textContent.match(/^chapter\s+(\d+|[ivx]+)[\s\-\—\:]*(.*)$/i)
    ) {
      return {
        detected: true,
        content: textContent,
        extractedTitle: this.extractTitle(textContent),
      };
    }

    // Strategy 3: Standalone numbers in headings
    if (
      htmlLine.match(/^<h[2-4][^>]*>/i) &&
      textContent.match(/^\s*(\d+)\s*\.?\s*$/) &&
      textContent.length < 10
    ) {
      return {
        detected: true,
        content: textContent,
        extractedTitle: this.extractTitle(textContent),
      };
    }

    return { detected: false };
  }

  /**
   * Extract and clean chapter title
   */
  static extractTitle(textContent: string): string {
    // If it has "Chapter" keyword, use as-is
    const chapterMatch = textContent.match(
      /^chapter\s+(\d+|[ivx]+)[\s\-\—\:]*(.*)$/i
    );
    if (chapterMatch) {
      const subtitle = chapterMatch[2] ? `: ${chapterMatch[2].trim()}` : "";
      return `Chapter ${chapterMatch[1]}${subtitle}`;
    }

    // If it's just a number, format as chapter
    const numberMatch = textContent.match(/^\s*(\d+)\s*\.?\s*$/);
    if (numberMatch) {
      return `Chapter ${numberMatch[1]}`;
    }

    // Otherwise use as-is
    return textContent || "Untitled Chapter";
  }
}
