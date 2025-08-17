// src/lib/doc-parse/structure-analyzer.ts
// Issue detection and analysis (moved from EnhancedDocxParser)

import {
  ParsedStructure,
  ParsedAct,
  ParsedChapter,
  ParsedScene,
  StructureIssue,
  ValidationResult,
} from "./types";

export class StructureAnalyzer {
  /**
   * Validate parsed structure
   */
  static validateStructure(structure: ParsedStructure): ValidationResult {
    const errors: string[] = [];
    const warnings = structure.issues || [];

    if (structure.acts.length === 0) {
      errors.push("No acts found in document");
    }

    structure.acts.forEach((act: ParsedAct, actIndex: number) => {
      if (!act.title.trim()) {
        errors.push(`Act ${actIndex + 1} has no title`);
      }

      if (act.chapters.length === 0) {
        errors.push(`Act "${act.title}" has no chapters`);
      }

      act.chapters.forEach((chapter: ParsedChapter, chapterIndex: number) => {
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

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Analyze advanced issues with auto-fix suggestions
   */
  static analyzeIssues(
    structure: ParsedStructure & { _originalChapterTitles?: string[] }
  ): StructureIssue[] {
    const issues: StructureIssue[] = [];

    // Check original chapter titles first
    if (structure._originalChapterTitles) {
      this.checkOriginalChapterTitles(structure._originalChapterTitles, issues);
    }

    // Check each act
    structure.acts.forEach((act: ParsedAct) => {
      this.analyzeAct(act, issues);
    });

    // Check overall document
    this.analyzeDocumentLevel(structure, issues);

    return issues;
  }

  /**
   * Check original chapter titles for issues
   */
  private static checkOriginalChapterTitles(
    originalTitles: string[],
    issues: StructureIssue[]
  ): void {
    if (!originalTitles || originalTitles.length <= 1) return;

    // Extract chapter numbers
    const chapterNumbers: number[] = [];
    originalTitles.forEach((title: string) => {
      const match = title.match(/chapter\s+(\d+)/i);
      if (match) {
        chapterNumbers.push(parseInt(match[1], 10));
      }
    });

    if (chapterNumbers.length > 1) {
      // Check for duplicates
      const duplicates = chapterNumbers.filter(
        (num: number, index: number) => chapterNumbers.indexOf(num) !== index
      );
      if (duplicates.length > 0) {
        issues.push({
          type: "duplicate_chapter_numbers",
          severity: "warning",
          message: `Original document has duplicate chapter numbers: ${[
            ...new Set(duplicates),
          ].join(", ")}`,
          suggestion: "Auto-fixed during import with sequential numbering",
          autoFixable: true,
          fixAction: {
            type: "renumber_chapters",
            description: "Renumber all chapters sequentially (1, 2, 3...)",
          },
        });
      }

      // Check for gaps
      const sortedNumbers = [...new Set(chapterNumbers)].sort(
        (a: number, b: number) => a - b
      );
      for (let i = 1; i < sortedNumbers.length; i++) {
        if (sortedNumbers[i] - sortedNumbers[i - 1] > 1) {
          issues.push({
            type: "chapter_numbering_gaps",
            severity: "warning",
            message: `Original document has chapter numbering gaps: ${sortedNumbers.join(
              ", "
            )}`,
            suggestion: "Auto-fixed during import with sequential numbering",
            autoFixable: true,
            fixAction: {
              type: "renumber_chapters",
              description: "Renumber all chapters to remove gaps",
            },
          });
          break;
        }
      }
    }

    // Check for duplicate titles
    const lowerTitles = originalTitles.map((t: string) => t.toLowerCase());
    const duplicateTitles = lowerTitles.filter(
      (title: string, index: number) => lowerTitles.indexOf(title) !== index
    );
    if (duplicateTitles.length > 0) {
      issues.push({
        type: "duplicate_chapter_titles",
        severity: "warning",
        message: `Document has duplicate chapter titles`,
        suggestion: "Auto-fixed during import by adding numbers to duplicates",
        autoFixable: true,
        fixAction: {
          type: "rename_duplicate",
          description: "Rename duplicate chapters with unique suffixes",
        },
      });
    }
  }

  /**
   * Analyze a single act
   */
  private static analyzeAct(act: ParsedAct, issues: StructureIssue[]): void {
    // Empty acts
    if (act.chapters.length === 0) {
      issues.push({
        type: "empty_act",
        severity: "warning",
        message: `"${act.title}" contains no chapters`,
        suggestion: "Add content or remove this act",
        autoFixable: false,
      });
    }

    act.chapters.forEach((chapter: ParsedChapter) => {
      this.analyzeChapter(chapter, issues);
    });
  }

  /**
   * Analyze a single chapter
   */
  private static analyzeChapter(
    chapter: ParsedChapter,
    issues: StructureIssue[]
  ): void {
    // Empty chapters
    if (chapter.scenes.length === 0) {
      issues.push({
        type: "empty_chapter",
        severity: "warning",
        message: `"${chapter.title}" contains no scenes`,
        suggestion: "Add content or remove this chapter",
        autoFixable: false,
      });
      return;
    }

    const veryShortScenes: number[] = [];
    const veryLongScenes: number[] = [];

    chapter.scenes.forEach((scene: ParsedScene) => {
      // Very short scenes
      if (scene.wordCount < 50 && scene.wordCount > 0) {
        veryShortScenes.push(scene.order);
      }

      // Very long scenes
      if (scene.wordCount > 5000) {
        veryLongScenes.push(scene.order);
      }

      // Empty scenes
      if (scene.wordCount === 0) {
        issues.push({
          type: "empty_scene",
          severity: "warning",
          message: `Scene ${scene.order} in "${chapter.title}" is empty`,
          suggestion: "Remove this empty scene or add content",
          autoFixable: false,
        });
      }
    });

    // Short scenes
    if (veryShortScenes.length > 1) {
      issues.push({
        type: "short_scenes",
        severity: "info",
        message: `Multiple short scenes in "${
          chapter.title
        }": ${veryShortScenes.join(", ")} (< 50 words each)`,
        suggestion: "Consider combining these short scenes",
        autoFixable: true,
        fixAction: {
          type: "combine_scenes",
          description: `Combine scenes ${veryShortScenes.join(", ")} in "${
            chapter.title
          }"`,
          targetId: chapter.title,
        },
      });
    }

    // Long scenes
    veryLongScenes.forEach((sceneOrder: number) => {
      const scene = chapter.scenes.find(
        (s: ParsedScene) => s.order === sceneOrder
      );
      issues.push({
        type: "long_scene",
        severity: "info",
        message: `Scene ${sceneOrder} in "${chapter.title}" is very long (${
          scene?.wordCount || 0
        } words)`,
        suggestion: "Consider splitting this scene",
        autoFixable: true,
        fixAction: {
          type: "split_scenes",
          description: `Split scene ${sceneOrder} in "${chapter.title}"`,
          targetId: `${chapter.title}-scene-${sceneOrder}`,
        },
      });
    });
  }

  /**
   * Analyze document-level issues
   */
  private static analyzeDocumentLevel(
    structure: ParsedStructure,
    issues: StructureIssue[]
  ): void {
    // Document length
    if (structure.wordCount < 1000) {
      issues.push({
        type: "short_document",
        severity: "info",
        message: `Document is quite short (${structure.wordCount} words)`,
        suggestion: "Verify this is the complete manuscript",
        autoFixable: false,
      });
    }

    if (structure.wordCount > 200000) {
      issues.push({
        type: "long_document",
        severity: "info",
        message: `Document is very long (${structure.wordCount} words)`,
        suggestion: "Consider splitting into multiple volumes",
        autoFixable: false,
      });
    }

    // Scene count
    const totalScenes = structure.acts.reduce(
      (sum: number, act: ParsedAct) =>
        sum +
        act.chapters.reduce(
          (chSum: number, ch: ParsedChapter) => chSum + ch.scenes.length,
          0
        ),
      0
    );

    if (totalScenes < 3) {
      issues.push({
        type: "few_scenes",
        severity: "warning",
        message: `Only ${totalScenes} scenes detected`,
        suggestion: "Add more scene breaks using *** or ---",
        autoFixable: false,
      });
    }

    // Average scene length
    const avgWordsPerScene =
      totalScenes > 0 ? Math.round(structure.wordCount / totalScenes) : 0;

    if (avgWordsPerScene < 100) {
      issues.push({
        type: "short_average_scenes",
        severity: "info",
        message: `Average scene length is quite short (${avgWordsPerScene} words)`,
        suggestion: "Consider combining scenes",
        autoFixable: true,
        fixAction: {
          type: "combine_scenes",
          description:
            "Auto-combine scenes under 100 words with adjacent scenes",
        },
      });
    }

    if (avgWordsPerScene > 3000) {
      issues.push({
        type: "long_average_scenes",
        severity: "info",
        message: `Average scene length is quite long (${avgWordsPerScene} words)`,
        suggestion: "Consider adding more scene breaks",
        autoFixable: false,
      });
    }
  }

  /**
   * Get issue counts by severity
   */
  static getIssueSummary(issues: StructureIssue[]): {
    errors: number;
    warnings: number;
    info: number;
    total: number;
  } {
    const errors = issues.filter(
      (issue: StructureIssue) => issue.severity === "error"
    ).length;
    const warnings = issues.filter(
      (issue: StructureIssue) => issue.severity === "warning"
    ).length;
    const info = issues.filter(
      (issue: StructureIssue) => issue.severity === "info"
    ).length;

    return {
      errors,
      warnings,
      info,
      total: issues.length,
    };
  }

  /**
   * Filter issues by severity
   */
  static filterIssuesBySeverity(
    issues: StructureIssue[],
    severity: "error" | "warning" | "info"
  ): StructureIssue[] {
    return issues.filter(
      (issue: StructureIssue) => issue.severity === severity
    );
  }

  /**
   * Check if structure has critical errors that prevent import
   */
  static hasCriticalErrors(structure: ParsedStructure): boolean {
    const validation = this.validateStructure(structure);
    return !validation.isValid;
  }
}
