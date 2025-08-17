// src/lib/doc-parse/detectors/act-detector.ts
// Act detection logic

import { DetectionResult } from "../types";

export class ActDetector {
  /**
   * Detect if a line represents an act
   */
  static detect(htmlLine: string, textContent: string): DetectionResult {
    // Strategy 1: H1 headings that contain "ACT" keyword
    if (
      htmlLine.match(/^<h1[^>]*>/i) &&
      textContent.match(/^(act|book|part|volume)\s+/i)
    ) {
      return {
        detected: true,
        content: textContent,
        extractedTitle: this.extractTitle(textContent),
      };
    }

    // Strategy 2: H1 headings with roman numerals at the start
    if (
      htmlLine.match(/^<h1[^>]*>/i) &&
      textContent.match(/^(I|II|III|IV|V|VI|VII|VIII|IX|X)[:\.\s]/i)
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
   * Extract and clean act title
   */
  static extractTitle(textContent: string): string {
    // If it has "Act" keyword, use as-is
    if (textContent.match(/^(act|book|part|volume)/i)) {
      return textContent;
    }

    // If it's a roman numeral, format nicely
    const romanMatch = textContent.match(
      /^(I|II|III|IV|V|VI|VII|VIII|IX|X)\.?\s*(.+)?$/i
    );
    if (romanMatch) {
      const subtitle = romanMatch[2] ? `: ${romanMatch[2].trim()}` : "";
      return `Act ${romanMatch[1]}${subtitle}`;
    }

    // Otherwise use as-is
    return textContent || "Untitled Act";
  }
}
