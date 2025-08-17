// src/lib/doc-parse/auto-fix-service.ts
// Auto-fix functionality (moved from DocumentAutoFixService)

import {
  ParsedStructure,
  StructureIssue,
  AutoFixResult,
  AutoFixOptions,
} from "./types";
import { EnhancedDocxParser } from "./enhanced-docx-parser";

export class AutoFixService {
  private static readonly DEFAULT_OPTIONS: AutoFixOptions = {
    combineShortScenes: true,
    splitLongScenes: false,
    renumberChapters: true,
    renumberScenes: true,
    renameDuplicates: true,
    minimumSceneLength: 50,
    maximumSceneLength: 5000,
  };

  /**
   * Parse document from ArrayBuffer (for client-side auto-fix)
   */
  static async parseFromBuffer(buffer: ArrayBuffer): Promise<ParsedStructure> {
    return EnhancedDocxParser.parseFromBuffer(buffer);
  }

  /**
   * Apply a specific auto-fix to a document structure
   */
  static async applyAutoFix(
    originalStructure: ParsedStructure,
    issue: StructureIssue
  ): Promise<AutoFixResult> {
    try {
      console.log("🔧 Applying auto-fix:", issue.type, issue.fixAction?.type);

      switch (issue.fixAction?.type) {
        case "renumber_chapters":
          return this.renumberChapters(originalStructure);

        case "renumber_scenes":
          return this.renumberScenes(originalStructure);

        case "combine_scenes":
          return this.combineShortScenes(
            originalStructure,
            this.DEFAULT_OPTIONS
          );

        case "rename_duplicate":
          return this.renameDuplicates(originalStructure);

        default:
          return {
            success: false,
            message: `Auto-fix type "${issue.fixAction?.type}" is not implemented yet`,
            error: "Unsupported fix type",
          };
      }
    } catch (error) {
      console.error("❌ Auto-fix failed:", error);
      return {
        success: false,
        message: "Auto-fix failed due to an unexpected error",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Apply all applicable auto-fixes to a document
   */
  static async applyAllAutoFixes(
    originalStructure: ParsedStructure,
    options: Partial<AutoFixOptions> = {}
  ): Promise<AutoFixResult> {
    const mergedOptions = { ...this.DEFAULT_OPTIONS, ...options };
    let currentStructure = this.deepCloneStructure(originalStructure);
    const appliedFixes: string[] = [];
    const errors: string[] = [];

    try {
      // 1. Renumber chapters first
      if (mergedOptions.renumberChapters) {
        const result = this.renumberChapters(currentStructure);
        if (result.success && result.fixedStructure) {
          currentStructure = result.fixedStructure;
          appliedFixes.push("Renumbered chapters sequentially");
        } else if (result.error) {
          errors.push(result.error);
        }
      }

      // 2. Renumber scenes
      if (mergedOptions.renumberScenes) {
        const result = this.renumberScenes(currentStructure);
        if (result.success && result.fixedStructure) {
          currentStructure = result.fixedStructure;
          appliedFixes.push("Renumbered scenes sequentially");
        } else if (result.error) {
          errors.push(result.error);
        }
      }

      // 3. Rename duplicates
      if (mergedOptions.renameDuplicates) {
        const result = this.renameDuplicates(currentStructure);
        if (result.success && result.fixedStructure) {
          currentStructure = result.fixedStructure;
          appliedFixes.push("Renamed duplicate titles");
        } else if (result.error) {
          errors.push(result.error);
        }
      }

      // 4. Combine short scenes
      if (mergedOptions.combineShortScenes) {
        const result = this.combineShortScenes(currentStructure, mergedOptions);
        if (result.success && result.fixedStructure) {
          currentStructure = result.fixedStructure;
          appliedFixes.push("Combined short scenes");
        } else if (result.error) {
          errors.push(result.error);
        }
      }

      // Recalculate word count and clear old issues
      currentStructure.wordCount = this.calculateTotalWordCount(
        currentStructure.acts
      );
      currentStructure.issues = undefined;

      return {
        success: appliedFixes.length > 0,
        message:
          appliedFixes.length > 0
            ? `Applied ${appliedFixes.length} fixes: ${appliedFixes.join(", ")}`
            : "No fixes were applied",
        fixedStructure: currentStructure,
        error: errors.length > 0 ? errors.join("; ") : undefined,
      };
    } catch (error) {
      console.error("❌ Bulk auto-fix failed:", error);
      return {
        success: false,
        message: "Bulk auto-fix failed",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Renumber all chapters sequentially within each act
   */
  private static renumberChapters(structure: ParsedStructure): AutoFixResult {
    try {
      const fixedStructure = this.deepCloneStructure(structure);
      let totalRenamed = 0;

      fixedStructure.acts.forEach((act) => {
        act.chapters.forEach((chapter, index) => {
          const newOrder = index + 1;
          const oldOrder = chapter.order;

          chapter.order = newOrder;

          const titleMatch = chapter.title.match(
            /^(chapter\s+)(\d+|[ivx]+)(.*)$/i
          );
          if (titleMatch) {
            const newTitle = `${titleMatch[1]}${newOrder}${
              titleMatch[3] || ""
            }`;
            console.log(`📝 Renaming: "${chapter.title}" → "${newTitle}"`);
            chapter.title = newTitle;
            totalRenamed++;
          } else if (oldOrder !== newOrder) {
            totalRenamed++;
          }
        });
      });

      return {
        success: true,
        message: `Successfully renumbered ${totalRenamed} chapters sequentially`,
        fixedStructure,
      };
    } catch (error) {
      return {
        success: false,
        message: "Failed to renumber chapters",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Renumber all scenes sequentially within each chapter
   */
  private static renumberScenes(structure: ParsedStructure): AutoFixResult {
    try {
      const fixedStructure = this.deepCloneStructure(structure);

      fixedStructure.acts.forEach((act) => {
        act.chapters.forEach((chapter) => {
          chapter.scenes.forEach((scene, index) => {
            scene.order = index + 1;
          });
        });
      });

      return {
        success: true,
        message: "Successfully renumbered all scenes sequentially",
        fixedStructure,
      };
    } catch (error) {
      return {
        success: false,
        message: "Failed to renumber scenes",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Combine short scenes that are adjacent to each other
   */
  private static combineShortScenes(
    structure: ParsedStructure,
    options: AutoFixOptions
  ): AutoFixResult {
    try {
      const fixedStructure = this.deepCloneStructure(structure);
      let combinedCount = 0;

      fixedStructure.acts.forEach((act) => {
        act.chapters.forEach((chapter) => {
          const newScenes: any[] = [];
          let currentCombinedScene: any = null;

          for (const scene of chapter.scenes) {
            if (scene.wordCount < (options.minimumSceneLength || 50)) {
              if (currentCombinedScene) {
                currentCombinedScene.content +=
                  '\n\n<div class="scene-break" style="margin: 1rem 0; text-align: center; color: #9ca3af;">* * *</div>\n\n' +
                  scene.content;
                currentCombinedScene.wordCount += scene.wordCount;
                combinedCount++;
              } else {
                currentCombinedScene = { ...scene };
              }
            } else {
              if (currentCombinedScene) {
                newScenes.push(currentCombinedScene);
                currentCombinedScene = null;
              }
              newScenes.push(scene);
            }
          }

          if (currentCombinedScene) {
            newScenes.push(currentCombinedScene);
          }

          newScenes.forEach((scene, index) => {
            scene.order = index + 1;
          });

          chapter.scenes = newScenes;
        });
      });

      return {
        success: combinedCount > 0,
        message:
          combinedCount > 0
            ? `Successfully combined ${combinedCount} short scenes`
            : "No short scenes found to combine",
        fixedStructure,
      };
    } catch (error) {
      return {
        success: false,
        message: "Failed to combine short scenes",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Rename duplicate chapter and act titles by adding suffixes
   */
  private static renameDuplicates(structure: ParsedStructure): AutoFixResult {
    try {
      const fixedStructure = this.deepCloneStructure(structure);
      let renamedCount = 0;

      const seenActTitles = new Set<string>();
      const seenChapterTitles = new Set<string>();

      fixedStructure.acts.forEach((act) => {
        const originalTitle = act.title.toLowerCase();
        if (seenActTitles.has(originalTitle)) {
          let counter = 2;
          let newTitle = `${act.title} (${counter})`;
          while (seenActTitles.has(newTitle.toLowerCase())) {
            counter++;
            newTitle = `${act.title} (${counter})`;
          }
          act.title = newTitle;
          seenActTitles.add(newTitle.toLowerCase());
          renamedCount++;
        } else {
          seenActTitles.add(originalTitle);
        }

        const actChapterTitles = new Set<string>();
        act.chapters.forEach((chapter) => {
          const originalChapterTitle = chapter.title.toLowerCase();
          if (
            actChapterTitles.has(originalChapterTitle) ||
            seenChapterTitles.has(originalChapterTitle)
          ) {
            let counter = 2;
            let newTitle = `${chapter.title} (${counter})`;
            while (
              actChapterTitles.has(newTitle.toLowerCase()) ||
              seenChapterTitles.has(newTitle.toLowerCase())
            ) {
              counter++;
              newTitle = `${chapter.title} (${counter})`;
            }
            chapter.title = newTitle;
            actChapterTitles.add(newTitle.toLowerCase());
            seenChapterTitles.add(newTitle.toLowerCase());
            renamedCount++;
          } else {
            actChapterTitles.add(originalChapterTitle);
            seenChapterTitles.add(originalChapterTitle);
          }
        });
      });

      return {
        success: renamedCount > 0,
        message:
          renamedCount > 0
            ? `Successfully renamed ${renamedCount} duplicate titles`
            : "No duplicate titles found",
        fixedStructure,
      };
    } catch (error) {
      return {
        success: false,
        message: "Failed to rename duplicates",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Calculate total word count across all acts
   */
  private static calculateTotalWordCount(acts: any[]): number {
    return acts.reduce(
      (total, act) =>
        total +
        act.chapters.reduce(
          (actTotal: number, chapter: any) =>
            actTotal +
            chapter.scenes.reduce(
              (chapterTotal: number, scene: any) =>
                chapterTotal + scene.wordCount,
              0
            ),
          0
        ),
      0
    );
  }

  /**
   * Deep clone a ParsedStructure to avoid mutations
   */
  private static deepCloneStructure(
    structure: ParsedStructure
  ): ParsedStructure {
    return JSON.parse(JSON.stringify(structure));
  }

  /**
   * Get a preview of what an auto-fix would do without applying it
   */
  static getAutoFixPreview(
    structure: ParsedStructure,
    issue: StructureIssue
  ): string {
    switch (issue.fixAction?.type) {
      case "renumber_chapters":
        const chapterCounts = structure.acts.map((act) => act.chapters.length);
        const totalChapters = chapterCounts.reduce(
          (sum, count) => sum + count,
          0
        );
        return `Will renumber ${totalChapters} chapters sequentially within their acts`;

      case "renumber_scenes":
        const sceneCounts = structure.acts.flatMap((act) =>
          act.chapters.map((ch) => ch.scenes.length)
        );
        const totalScenes = sceneCounts.reduce((sum, count) => sum + count, 0);
        return `Will renumber ${totalScenes} scenes sequentially within their chapters`;

      case "combine_scenes":
        const shortScenes = structure.acts.flatMap((act) =>
          act.chapters.flatMap((ch) =>
            ch.scenes.filter((scene) => scene.wordCount < 50)
          )
        );
        return `Will combine ${shortScenes.length} scenes that are under 50 words`;

      case "rename_duplicate":
        const allTitles = [
          ...structure.acts.map((act) => act.title.toLowerCase()),
          ...structure.acts.flatMap((act) =>
            act.chapters.map((ch) => ch.title.toLowerCase())
          ),
        ];
        const duplicates = allTitles.filter(
          (title, index) => allTitles.indexOf(title) !== index
        );
        return `Will rename ${
          new Set(duplicates).size
        } duplicate titles by adding suffixes`;

      default:
        return "Unknown fix type";
    }
  }
}
