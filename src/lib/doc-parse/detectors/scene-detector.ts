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
  ];

  /**
   * Detect if a line represents a scene break
   */
  static detectBreak(htmlLine: string, textContent: string): DetectionResult {
    // HR tags
    if (htmlLine.match(/^<hr[^>]*>/i)) {
      return { detected: true, content: textContent };
    }

    // Common scene break markers
    if (this.BREAK_MARKERS.includes(textContent.trim())) {
      return { detected: true, content: textContent };
    }

    return { detected: false };
  }

  /**
   * Check if content should be accumulated as scene content
   */
  static isSceneContent(htmlLine: string, textContent: string): boolean {
    return textContent && !this.detectBreak(htmlLine, textContent).detected;
  }
}
