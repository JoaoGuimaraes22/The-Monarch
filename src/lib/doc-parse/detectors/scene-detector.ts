// src/lib/doc-parse/detectors/scene-detector.ts
// Scene break detection logic

import { DetectionResult } from "../types";

export class SceneDetector {
  private static readonly BREAK_MARKERS = [
    "***",
    "---",
    "* * *",
    "- - -",
    "~~~",
    "• • •",
    "◦ ◦ ◦",
    "§ § §",
  ];

  /**
   * Detect if a line represents a scene break
   */
  static detectBreak(htmlLine: string, textContent: string): DetectionResult {
    // HR tags (horizontal rules)
    if (htmlLine.match(/^<hr[^>]*>/i)) {
      return { detected: true, content: textContent };
    }

    // Common scene break markers
    const trimmedContent = textContent.trim();
    if (this.BREAK_MARKERS.includes(trimmedContent)) {
      return { detected: true, content: textContent };
    }

    // Check for repeated characters that might be scene breaks
    if (this.isRepeatedCharacterBreak(trimmedContent)) {
      return { detected: true, content: textContent };
    }

    // Check for centered symbols or special formatting
    if (this.isCenteredBreak(htmlLine, trimmedContent)) {
      return { detected: true, content: textContent };
    }

    return { detected: false };
  }

  /**
   * Check if content should be accumulated as scene content
   */
  static isSceneContent(htmlLine: string, textContent: string): boolean {
    // Explicit boolean conversion to fix TypeScript error
    return (
      Boolean(textContent) && !this.detectBreak(htmlLine, textContent).detected
    );
  }

  /**
   * Detect repeated character patterns that might be scene breaks
   */
  private static isRepeatedCharacterBreak(content: string): boolean {
    if (content.length < 3 || content.length > 20) {
      return false;
    }

    // Check for patterns like "***", "---", "~~~", etc.
    const repeatedPatterns = [
      /^[*]{3,10}$/, // 3-10 asterisks
      /^[-]{3,10}$/, // 3-10 dashes
      /^[~]{3,10}$/, // 3-10 tildes
      /^[=]{3,10}$/, // 3-10 equals
      /^[#]{3,10}$/, // 3-10 hashes
      /^[.]{3,10}$/, // 3-10 dots
      /^[_]{3,10}$/, // 3-10 underscores
    ];

    return repeatedPatterns.some((pattern) => pattern.test(content));
  }

  /**
   * Detect centered content that might be a scene break
   */
  private static isCenteredBreak(htmlLine: string, content: string): boolean {
    // Check for HTML with center styling
    if (
      htmlLine.includes("text-align: center") ||
      htmlLine.includes("<center>")
    ) {
      // If it's short and contains break-like characters, it's probably a scene break
      return content.length <= 20 && /[*\-~•◦§=.#_]/.test(content);
    }

    return false;
  }

  /**
   * Extract scene content from HTML, removing any scene breaks
   */
  static extractSceneContent(htmlLines: string[]): string {
    const contentLines: string[] = [];

    for (const line of htmlLines) {
      const textContent = line.replace(/<[^>]*>/g, "").trim();

      // Skip empty lines and scene breaks
      if (!textContent || this.detectBreak(line, textContent).detected) {
        continue;
      }

      contentLines.push(line);
    }

    return contentLines.join("\n");
  }

  /**
   * Count words in scene content, excluding scene breaks
   */
  static countSceneWords(htmlContent: string): number {
    const textContent = htmlContent.replace(/<[^>]*>/g, " ").trim();
    if (!textContent) return 0;

    const words = textContent.split(/\s+/).filter((word) => {
      const trimmed = word.trim();
      // Skip empty words and scene break markers
      return trimmed.length > 0 && !this.BREAK_MARKERS.includes(trimmed);
    });

    return words.length;
  }

  /**
   * Validate that content contains actual text (not just scene breaks)
   */
  static hasActualContent(htmlContent: string): boolean {
    const textContent = htmlContent.replace(/<[^>]*>/g, " ").trim();
    if (!textContent) return false;

    // Remove all known scene break markers
    let cleanContent = textContent;
    for (const marker of this.BREAK_MARKERS) {
      cleanContent = cleanContent.replace(
        new RegExp(marker.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"),
        ""
      );
    }

    // Check if there's still meaningful content
    const remainingText = cleanContent.trim().replace(/\s+/g, " ");
    return remainingText.length > 0;
  }
}
