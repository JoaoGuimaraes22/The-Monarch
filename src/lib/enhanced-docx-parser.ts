// src/lib/enhanced-docx-parser.ts
// Step 1: Drop-in replacement for existing DocxParser with better detection

import * as mammoth from "mammoth";

export interface ParsedStructure {
  acts: ParsedAct[];
  wordCount: number;
}

export interface ParsedAct {
  title: string;
  order: number;
  chapters: ParsedChapter[];
}

export interface ParsedChapter {
  title: string;
  order: number;
  scenes: ParsedScene[];
}

export interface ParsedScene {
  content: string;
  order: number;
  wordCount: number;
}

export class EnhancedDocxParser {
  /**
   * Enhanced parsing - drop-in replacement for DocxParser.parseDocx()
   * Returns same format as original, but with better detection
   */
  static async parseDocx(
    file: File
  ): Promise<ParsedStructure & { issues?: string[] }> {
    try {
      console.log("🔍 Starting enhanced parsing...");

      // Convert document to HTML (same as before)
      const html = await this.convertToHtml(file);

      // Enhanced structure parsing (better detection)
      const structure = this.parseHtmlStructureEnhanced(html);

      // NEW: Analyze issues
      const issues = this.analyzeBasicIssues(structure);

      console.log("✅ Enhanced parsing completed:", {
        acts: structure.acts.length,
        chapters: structure.acts.reduce(
          (sum, act) => sum + act.chapters.length,
          0
        ),
        scenes: structure.acts.reduce(
          (sum, act) =>
            sum +
            act.chapters.reduce((chSum, ch) => chSum + ch.scenes.length, 0),
          0
        ),
        wordCount: structure.wordCount,
        issues: issues.length,
      });

      return {
        ...structure,
        issues: issues.length > 0 ? issues : undefined,
      };
    } catch (error) {
      console.error("❌ Enhanced parsing failed:", error);
      throw new Error(
        error instanceof Error
          ? `Enhanced parsing failed: ${error.message}`
          : "Enhanced parsing failed"
      );
    }
  }

  /**
   * Convert .docx to HTML (same as original)
   */
  private static async convertToHtml(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const result = await mammoth.convertToHtml({ buffer });

    if (!result.value || result.value.trim().length === 0) {
      throw new Error("Document appears to be empty or unreadable");
    }

    return result.value;
  }

  /**
   * Enhanced HTML parsing with better detection strategies
   */
  private static parseHtmlStructureEnhanced(html: string): ParsedStructure {
    const acts: ParsedAct[] = [];
    let currentAct: ParsedAct | null = null;
    let currentChapter: ParsedChapter | null = null;
    let currentSceneContent: string[] = [];

    let actOrder = 1;
    let chapterOrder = 1;
    let sceneOrder = 1;

    // Better line splitting
    const lines = html
      .split(/(?=<[h1h2h3hr]|<p)/i)
      .filter((line) => line.trim());

    console.log("🔍 Parsing lines:", lines.length);

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const textContent = line.replace(/<[^>]*>/g, "").trim();

      // Debug logging
      if (textContent.toLowerCase().includes("act") || line.match(/^<h[12]/i)) {
        console.log("🔍 Checking line:", {
          line: line.substring(0, 100),
          textContent,
        });
      }

      // Enhanced Act Detection
      if (this.isActLine(line, textContent)) {
        console.log("✅ Detected ACT:", textContent);
        this.saveCurrentScene(
          currentChapter,
          currentSceneContent,
          sceneOrder++
        );
        currentSceneContent = [];

        const actTitle = this.extractActTitle(textContent);
        currentAct = {
          title: actTitle,
          order: actOrder++,
          chapters: [],
        };
        acts.push(currentAct);

        chapterOrder = 1;
        sceneOrder = 1;
        currentChapter = null;
        continue;
      }

      // Enhanced Chapter Detection
      if (this.isChapterLine(line, textContent)) {
        console.log("✅ Detected CHAPTER:", textContent);
        this.saveCurrentScene(
          currentChapter,
          currentSceneContent,
          sceneOrder++
        );
        currentSceneContent = [];

        if (!currentAct) {
          currentAct = this.createDefaultAct(actOrder++);
          acts.push(currentAct);
        }

        const chapterTitle = this.extractChapterTitle(textContent);
        currentChapter = {
          title: chapterTitle,
          order: chapterOrder++,
          scenes: [],
        };
        currentAct.chapters.push(currentChapter);
        sceneOrder = 1;
        continue;
      }

      // Enhanced Scene Break Detection
      if (this.isSceneBreak(line, textContent)) {
        if (currentSceneContent.length > 0 && currentChapter) {
          this.saveCurrentScene(
            currentChapter,
            currentSceneContent,
            sceneOrder++
          );
          currentSceneContent = [];
        }
        continue;
      }

      // Content accumulation
      if (textContent && !this.isSceneBreak(line, textContent)) {
        // Create default structure if needed
        if (!currentAct) {
          currentAct = this.createDefaultAct(actOrder++);
          acts.push(currentAct);
        }

        if (!currentChapter) {
          currentChapter = this.createDefaultChapter(chapterOrder++);
          currentAct.chapters.push(currentChapter);
        }

        currentSceneContent.push(line);
      }
    }

    // Save final scene
    if (currentSceneContent.length > 0 && currentChapter) {
      this.saveCurrentScene(currentChapter, currentSceneContent, sceneOrder);
    }

    console.log("📊 Final structure:", {
      acts: acts.map((a) => ({ title: a.title, chapters: a.chapters.length })),
    });

    return {
      acts,
      wordCount: this.calculateTotalWordCount(acts),
    };
  }

  /**
   * Enhanced act detection with multiple strategies
   */
  private static isActLine(line: string, textContent: string): boolean {
    // Only detect acts if they are VERY clearly acts

    // Strategy 1: H1 headings that contain "ACT" keyword
    if (
      line.match(/^<h1[^>]*>/i) &&
      textContent.match(/^(act|book|part|volume)\s+/i)
    ) {
      return true;
    }

    // Strategy 2: H1 headings with roman numerals at the start
    if (
      line.match(/^<h1[^>]*>/i) &&
      textContent.match(/^(I|II|III|IV|V|VI|VII|VIII|IX|X)[:\.\s]/i)
    ) {
      return true;
    }

    // No other detection - be very conservative
    return false;
  }

  /**
   * Enhanced chapter detection with multiple strategies
   */
  private static isChapterLine(line: string, textContent: string): boolean {
    // Strategy 1: H2 headings
    if (line.match(/^<h2[^>]*>/i) && textContent.trim()) {
      return true;
    }

    // Strategy 2: "Chapter" keyword with number (must be at start of paragraph/heading)
    if (
      line.match(/^<(h[2-4]|p)[^>]*>/i) &&
      textContent.match(/^chapter\s+(\d+|[ivx]+)[\s\-\—\:]*(.*)$/i)
    ) {
      return true;
    }

    // Strategy 3: Standalone numbers only if they're in headings and short
    if (
      line.match(/^<h[2-4][^>]*>/i) &&
      textContent.match(/^\s*(\d+)\s*\.?\s*$/) &&
      textContent.length < 10
    ) {
      return true;
    }

    return false;
  }

  /**
   * Enhanced scene break detection
   */
  private static isSceneBreak(line: string, textContent: string): boolean {
    // HR tags
    if (line.match(/^<hr[^>]*>/i)) return true;

    // Common scene break markers
    const breakMarkers = ["***", "---", "* * *", "- - -", "~~~"];
    if (breakMarkers.includes(textContent.trim())) return true;

    return false;
  }

  /**
   * Extract and clean act title
   */
  private static extractActTitle(textContent: string): string {
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

  /**
   * Extract and clean chapter title
   */
  private static extractChapterTitle(textContent: string): string {
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

  // Helper methods (same logic as before)
  private static createDefaultAct(order: number): ParsedAct {
    return {
      title: `Act ${order}`,
      order,
      chapters: [],
    };
  }

  private static createDefaultChapter(order: number): ParsedChapter {
    return {
      title: `Chapter ${order}`,
      order,
      scenes: [],
    };
  }

  private static saveCurrentScene(
    chapter: ParsedChapter | null,
    content: string[],
    order: number
  ): void {
    if (!chapter || content.length === 0) return;

    const sceneHtml = content.join("");
    const wordCount = this.countWords(sceneHtml);

    chapter.scenes.push({
      content: sceneHtml,
      order,
      wordCount,
    });
  }

  private static countWords(html: string): number {
    const text = html.replace(/<[^>]*>/g, " ").trim();
    if (!text) return 0;
    return text.split(/\s+/).filter((word) => word.length > 0).length;
  }

  private static calculateTotalWordCount(acts: ParsedAct[]): number {
    return acts.reduce(
      (total, act) =>
        total +
        act.chapters.reduce(
          (actTotal, chapter) =>
            actTotal +
            chapter.scenes.reduce(
              (chapterTotal, scene) => chapterTotal + scene.wordCount,
              0
            ),
          0
        ),
      0
    );
  }

  /**
   * Validate parsed structure (enhanced with basic issue detection)
   */
  static validateStructure(
    structure: ParsedStructure & { issues?: string[] }
  ): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (structure.acts.length === 0) {
      errors.push("No acts found in document");
    }

    structure.acts.forEach((act, actIndex) => {
      if (!act.title.trim()) {
        errors.push(`Act ${actIndex + 1} has no title`);
      }

      if (act.chapters.length === 0) {
        errors.push(`Act "${act.title}" has no chapters`);
      }

      act.chapters.forEach((chapter, chapterIndex) => {
        if (!chapter.title.trim()) {
          errors.push(
            `Chapter ${chapterIndex + 1} in Act "${act.title}" has no title`
          );
        }

        if (chapter.scenes.length === 0) {
          errors.push(`Chapter "${chapter.title}" has no scenes`);
        }
      });
    });

    // Add detected issues as warnings
    if (structure.issues) {
      warnings.push(...structure.issues);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * NEW: Analyze basic issues in the parsed structure
   */
  private static analyzeBasicIssues(structure: ParsedStructure): string[] {
    const issues: string[] = [];

    // Check each act
    structure.acts.forEach((act) => {
      // Empty acts
      if (act.chapters.length === 0) {
        issues.push(`"${act.title}" contains no chapters`);
      }

      act.chapters.forEach((chapter) => {
        // Empty chapters
        if (chapter.scenes.length === 0) {
          issues.push(`"${chapter.title}" contains no scenes`);
        }

        // Check scenes
        chapter.scenes.forEach((scene) => {
          // Very short scenes
          if (scene.wordCount < 50) {
            issues.push(
              `Scene ${scene.order} in "${chapter.title}" is very short (${scene.wordCount} words)`
            );
          }

          // Very long scenes
          if (scene.wordCount > 5000) {
            issues.push(
              `Scene ${scene.order} in "${chapter.title}" is very long (${scene.wordCount} words) - consider splitting`
            );
          }

          // Empty scenes
          if (scene.wordCount === 0) {
            issues.push(`Scene ${scene.order} in "${chapter.title}" is empty`);
          }
        });
      });
    });

    // Overall document issues
    if (structure.wordCount < 1000) {
      issues.push(
        `Document is quite short (${structure.wordCount} words) - verify this is complete`
      );
    }

    const totalScenes = structure.acts.reduce(
      (sum, act) =>
        sum + act.chapters.reduce((chSum, ch) => chSum + ch.scenes.length, 0),
      0
    );

    if (totalScenes < 3) {
      issues.push(
        `Only ${totalScenes} scenes detected - document may need more scene breaks (use *** or ---)`
      );
    }

    const avgWordsPerScene =
      totalScenes > 0 ? Math.round(structure.wordCount / totalScenes) : 0;
    if (avgWordsPerScene < 100) {
      issues.push(
        `Average scene length is quite short (${avgWordsPerScene} words) - consider combining scenes`
      );
    }

    return issues;
  }
}
