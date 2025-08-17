// src/lib/doc-parse/auto-fix-service.ts
// Auto-fix functionality (moved from DocumentAutoFixService)

import {
  ParsedStructure,
  ParsedAct,
  ParsedChapter,
  ParsedScene,
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

  // Enhanced renumberChapters method with detailed debugging
  // Replace this method in your AutoFixService

  /**
   * Renumber all chapters sequentially within each act
   */
  private static renumberChapters(structure: ParsedStructure): AutoFixResult {
    try {
      console.log("🔢 Starting chapter renumbering...");
      console.log("📊 Original structure:", {
        acts: structure.acts.length,
        chapters: structure.acts.reduce(
          (sum, act) => sum + act.chapters.length,
          0
        ),
      });

      const fixedStructure = this.deepCloneStructure(structure);
      let totalRenamed = 0;
      let totalReordered = 0;

      fixedStructure.acts.forEach((act: ParsedAct, actIndex: number) => {
        console.log(`\n🎭 Processing Act ${actIndex + 1}: "${act.title}"`);
        console.log(`📚 Chapters in this act: ${act.chapters.length}`);

        act.chapters.forEach((chapter: ParsedChapter, index: number) => {
          const newOrder = index + 1;
          const oldOrder = chapter.order;
          const oldTitle = chapter.title;

          console.log(`\n  📖 Chapter ${index + 1}:`);
          console.log(`     Original: order=${oldOrder}, title="${oldTitle}"`);

          // Update the order
          chapter.order = newOrder;
          if (oldOrder !== newOrder) {
            totalReordered++;
            console.log(`     🔄 Order changed: ${oldOrder} → ${newOrder}`);
          }

          // Try to update the title if it contains "Chapter X"
          // Enhanced regex to catch more patterns
          const titlePatterns = [
            /^(chapter\s+)(\d+|[ivx]+)(.*)$/i, // "Chapter 1", "Chapter I"
            /^(ch\.?\s+)(\d+|[ivx]+)(.*)$/i, // "Ch. 1", "Ch 1"
            /^(chap\.?\s+)(\d+|[ivx]+)(.*)$/i, // "Chap. 1", "Chap 1"
            /^(\d+|[ivx]+)(\.\s*|:\s*|-\s*)(.*)$/i, // "1. Title", "1: Title", "1 - Title"
          ];

          let titleUpdated = false;
          for (const pattern of titlePatterns) {
            const titleMatch = oldTitle.match(pattern);
            if (titleMatch) {
              let newTitle;
              if (pattern === titlePatterns[3]) {
                // Pattern for "1. Title"
                newTitle = `${newOrder}${titleMatch[2]}${titleMatch[3]}`;
              } else {
                newTitle = `${titleMatch[1]}${newOrder}${titleMatch[3] || ""}`;
              }

              console.log(`     📝 Title pattern matched: ${pattern}`);
              console.log(
                `     📝 Title changed: "${oldTitle}" → "${newTitle}"`
              );
              chapter.title = newTitle;
              totalRenamed++;
              titleUpdated = true;
              break;
            }
          }

          if (!titleUpdated && oldOrder !== newOrder) {
            console.log(
              `     ⚠️  Order changed but title pattern not recognized`
            );
            console.log(`     ⚠️  Title: "${oldTitle}"`);
            // Still count as a change even if we didn't update the title
          }

          console.log(
            `     Final: order=${chapter.order}, title="${chapter.title}"`
          );
        });
      });

      console.log(`\n✅ Renumbering summary:`);
      console.log(`   📝 Titles renamed: ${totalRenamed}`);
      console.log(`   🔄 Orders changed: ${totalReordered}`);
      console.log(
        `   📊 Total changes: ${Math.max(totalRenamed, totalReordered)}`
      );

      const totalChanges = Math.max(totalRenamed, totalReordered);

      return {
        success: true,
        message:
          totalChanges > 0
            ? `Successfully renumbered ${totalChanges} chapters (${totalRenamed} titles updated, ${totalReordered} orders fixed)`
            : "No chapters needed renumbering - all were already sequential",
        fixedStructure,
      };
    } catch (error) {
      console.error("❌ Chapter renumbering failed:", error);
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

      fixedStructure.acts.forEach((act: ParsedAct) => {
        act.chapters.forEach((chapter: ParsedChapter) => {
          chapter.scenes.forEach((scene: ParsedScene, index: number) => {
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

      fixedStructure.acts.forEach((act: ParsedAct) => {
        act.chapters.forEach((chapter: ParsedChapter) => {
          const newScenes: ParsedScene[] = [];
          let currentCombinedScene: ParsedScene | null = null;

          for (const scene of chapter.scenes) {
            if (scene.wordCount < (options.minimumSceneLength || 50)) {
              if (currentCombinedScene) {
                // Combine with previous short scene
                currentCombinedScene.content +=
                  '\n\n<div class="scene-break" style="margin: 1rem 0; text-align: center; color: #9ca3af;">* * *</div>\n\n' +
                  scene.content;
                currentCombinedScene.wordCount += scene.wordCount;
                combinedCount++;
              } else {
                // Start a new combined scene
                currentCombinedScene = { ...scene };
              }
            } else {
              // Regular length scene
              if (currentCombinedScene) {
                newScenes.push(currentCombinedScene);
                currentCombinedScene = null;
              }
              newScenes.push(scene);
            }
          }

          // Don't forget the last combined scene if it exists
          if (currentCombinedScene) {
            newScenes.push(currentCombinedScene);
          }

          // Renumber all scenes sequentially
          newScenes.forEach((scene: ParsedScene, index: number) => {
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

      fixedStructure.acts.forEach((act: ParsedAct) => {
        // Handle duplicate act titles
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

        // Handle duplicate chapter titles within this act and globally
        const actChapterTitles = new Set<string>();
        act.chapters.forEach((chapter: ParsedChapter) => {
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
  private static calculateTotalWordCount(acts: ParsedAct[]): number {
    return acts.reduce(
      (total: number, act: ParsedAct) =>
        total +
        act.chapters.reduce(
          (actTotal: number, chapter: ParsedChapter) =>
            actTotal +
            chapter.scenes.reduce(
              (chapterTotal: number, scene: ParsedScene) =>
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
        const chapterCounts = structure.acts.map(
          (act: ParsedAct) => act.chapters.length
        );
        const totalChapters = chapterCounts.reduce(
          (sum: number, count: number) => sum + count,
          0
        );
        return `Will renumber ${totalChapters} chapters sequentially within their acts`;

      case "renumber_scenes":
        const sceneCounts = structure.acts.flatMap((act: ParsedAct) =>
          act.chapters.map((ch: ParsedChapter) => ch.scenes.length)
        );
        const totalScenes = sceneCounts.reduce(
          (sum: number, count: number) => sum + count,
          0
        );
        return `Will renumber ${totalScenes} scenes sequentially within their chapters`;

      case "combine_scenes":
        const shortScenes = structure.acts.flatMap((act: ParsedAct) =>
          act.chapters.flatMap((ch: ParsedChapter) =>
            ch.scenes.filter((scene: ParsedScene) => scene.wordCount < 50)
          )
        );
        return `Will combine ${shortScenes.length} scenes that are under 50 words`;

      case "rename_duplicate":
        const allTitles = [
          ...structure.acts.map((act: ParsedAct) => act.title.toLowerCase()),
          ...structure.acts.flatMap((act: ParsedAct) =>
            act.chapters.map((ch: ParsedChapter) => ch.title.toLowerCase())
          ),
        ];
        const duplicates = allTitles.filter(
          (title: string, index: number) => allTitles.indexOf(title) !== index
        );
        return `Will rename ${
          new Set(duplicates).size
        } duplicate titles by adding suffixes`;

      default:
        return "Unknown fix type";
    }
  }
}
