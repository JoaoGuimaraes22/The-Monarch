// src/lib/doc-parse/enhanced-docx-parser.ts
// Main parser class (simplified and clean)

import {
  ParsedStructure,
  ParsedAct,
  ParsedChapter,
  ParseContext,
} from "./types";
import { HtmlConverter } from "./utils/html-converter";
import { ActDetector } from "./detectors/act-detector";
import { ChapterDetector } from "./detectors/chapter-detector";
import { SceneDetector } from "./detectors/scene-detector";
import { StructureAnalyzer } from "./structure-analyzer";

export class EnhancedDocxParser {
  /**
   * Parse document from File
   */
  static async parseDocx(file: File): Promise<ParsedStructure> {
    try {
      console.log("🔍 Starting enhanced parsing...");

      // Convert to HTML
      const html = await HtmlConverter.convertFileToHtml(file);

      // Parse structure
      const structure = this.parseHtmlStructure(html);

      // Analyze issues
      const issues = StructureAnalyzer.analyzeIssues(structure);

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
        acts: structure.acts,
        wordCount: structure.wordCount,
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
   * Parse document from ArrayBuffer
   */
  static async parseFromBuffer(buffer: ArrayBuffer): Promise<ParsedStructure> {
    try {
      console.log("🔍 Starting buffer-based parsing...");

      // Convert to HTML
      const html = await HtmlConverter.convertBufferToHtml(buffer);

      // Parse structure
      const structure = this.parseHtmlStructure(html);

      // Analyze issues
      const issues = StructureAnalyzer.analyzeIssues(structure);

      console.log("✅ Buffer-based parsing completed:", {
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
        acts: structure.acts,
        wordCount: structure.wordCount,
        issues: issues.length > 0 ? issues : undefined,
      };
    } catch (error) {
      console.error("❌ Buffer-based parsing failed:", error);
      throw new Error(
        error instanceof Error
          ? `Buffer parsing failed: ${error.message}`
          : "Buffer parsing failed"
      );
    }
  }

  /**
   * Parse HTML structure into acts, chapters, and scenes
   */
  private static parseHtmlStructure(
    html: string
  ): ParsedStructure & { _originalChapterTitles?: string[] } {
    const lines = HtmlConverter.splitHtmlIntoLines(html);
    const context: ParseContext = {
      acts: [],
      currentAct: null,
      currentChapter: null,
      currentSceneContent: [],
      actOrder: 1,
      chapterOrder: 1,
      sceneOrder: 1,
      originalChapterTitles: [],
    };

    console.log("🔍 Parsing lines:", lines.length);

    for (const line of lines) {
      const textContent = HtmlConverter.extractTextContent(line);

      // Debug logging for headings and acts
      if (textContent.toLowerCase().includes("act") || line.match(/^<h[12]/i)) {
        console.log("🔍 Checking line:", {
          line: line.substring(0, 100),
          textContent,
        });
      }

      // Try to detect act
      const actDetection = ActDetector.detect(line, textContent);
      if (actDetection.detected) {
        console.log("✅ Detected ACT:", textContent);
        this.handleActDetection(context, actDetection.extractedTitle!);
        continue;
      }

      // Try to detect chapter
      const chapterDetection = ChapterDetector.detect(line, textContent);
      if (chapterDetection.detected) {
        console.log("✅ Detected CHAPTER:", textContent);
        this.handleChapterDetection(
          context,
          textContent,
          chapterDetection.extractedTitle!
        );
        continue;
      }

      // Try to detect scene break
      const sceneBreakDetection = SceneDetector.detectBreak(line, textContent);
      if (sceneBreakDetection.detected) {
        this.handleSceneBreak(context);
        continue;
      }

      // Accumulate scene content
      if (SceneDetector.isSceneContent(line, textContent)) {
        this.handleSceneContent(context, line);
      }
    }

    // Save final scene
    this.saveCurrentScene(context);

    console.log("📊 Final structure:", {
      acts: context.acts.map((a) => ({
        title: a.title,
        chapters: a.chapters.length,
      })),
    });

    return {
      acts: context.acts,
      wordCount: this.calculateTotalWordCount(context.acts),
      _originalChapterTitles: context.originalChapterTitles,
    };
  }

  /**
   * Handle act detection
   */
  private static handleActDetection(
    context: ParseContext,
    actTitle: string
  ): void {
    this.saveCurrentScene(context);
    context.currentSceneContent = [];

    context.currentAct = {
      title: actTitle,
      order: context.actOrder++,
      chapters: [],
    };
    context.acts.push(context.currentAct);

    context.chapterOrder = 1;
    context.sceneOrder = 1;
    context.currentChapter = null;
  }

  /**
   * Handle chapter detection
   */
  private static handleChapterDetection(
    context: ParseContext,
    originalText: string,
    chapterTitle: string
  ): void {
    // Store original title for duplicate detection
    context.originalChapterTitles.push(originalText);

    this.saveCurrentScene(context);
    context.currentSceneContent = [];

    // Create default act if needed
    if (!context.currentAct) {
      context.currentAct = {
        title: `Act ${context.actOrder++}`,
        order: context.actOrder - 1,
        chapters: [],
      };
      context.acts.push(context.currentAct);
    }

    context.currentChapter = {
      title: chapterTitle,
      order: context.chapterOrder++,
      scenes: [],
    };
    context.currentAct.chapters.push(context.currentChapter);
    context.sceneOrder = 1;
  }

  /**
   * Handle scene break
   */
  private static handleSceneBreak(context: ParseContext): void {
    if (context.currentSceneContent.length > 0 && context.currentChapter) {
      this.saveCurrentScene(context);
      context.currentSceneContent = [];
    }
  }

  /**
   * Handle scene content accumulation
   */
  private static handleSceneContent(context: ParseContext, line: string): void {
    // Create default structure if needed
    if (!context.currentAct) {
      context.currentAct = {
        title: `Act ${context.actOrder++}`,
        order: context.actOrder - 1,
        chapters: [],
      };
      context.acts.push(context.currentAct);
    }

    if (!context.currentChapter) {
      context.currentChapter = {
        title: `Chapter ${context.chapterOrder++}`,
        order: context.chapterOrder - 1,
        scenes: [],
      };
      context.currentAct.chapters.push(context.currentChapter);
    }

    context.currentSceneContent.push(line);
  }

  /**
   * Save current scene to current chapter
   */
  private static saveCurrentScene(context: ParseContext): void {
    if (!context.currentChapter || context.currentSceneContent.length === 0)
      return;

    const sceneHtml = context.currentSceneContent.join("");
    const wordCount = HtmlConverter.countWordsInHtml(sceneHtml);

    context.currentChapter.scenes.push({
      content: sceneHtml,
      order: context.sceneOrder++,
      wordCount,
    });
  }

  /**
   * Calculate total word count
   */
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
   * Validate parsed structure
   */
  static validateStructure(structure: ParsedStructure) {
    return StructureAnalyzer.validateStructure(structure);
  }
}
