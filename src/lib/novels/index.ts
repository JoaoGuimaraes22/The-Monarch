// src/lib/novels/index.ts
// Main service aggregator and exports for backward compatibility

import { NovelService } from "./novel-service";
import { SceneService } from "./scene-service";
import { ChapterService } from "./chapter-service";
import { ActService } from "./act-service";
import {
  CreateNovelData,
  ImportStructureData,
  UpdateSceneMetadata,
  UpdateActData,
  UpdateChapterData,
} from "./types";

// Re-export all types
export * from "./types";

// Re-export utility functions
export * from "./utils/word-count";
export * from "./utils/order-management";

/**
 * Main service aggregator that provides access to all novel-related operations
 * This maintains backward compatibility with the old monolithic novelService
 */
export class NovelServiceAggregator {
  // Individual service instances
  public novels = new NovelService();
  public scenes = new SceneService();
  public chapters = new ChapterService();
  public acts = new ActService();

  // ==========================================
  // INDIVIDUAL ENTITY GETTERS
  // ==========================================

  /**
   * Get novel by ID (basic info only)
   */
  async getNovelById(id: string) {
    return this.novels.getNovelById(id);
  }

  /**
   * Get novel with full structure (acts, chapters, scenes)
   */
  async getNovelWithStructure(id: string) {
    return this.novels.getNovelWithStructure(id);
  }

  /**
   * Get scene by ID
   */
  async getSceneById(sceneId: string) {
    return this.scenes.getSceneById(sceneId);
  }

  /**
   * Get chapter by ID with scenes
   */
  async getChapterById(chapterId: string) {
    return this.chapters.getChapterById(chapterId);
  }

  /**
   * Get act by ID with full structure
   */
  async getActById(actId: string) {
    return this.acts.getActById(actId);
  }

  // ==========================================
  // NOVEL OPERATIONS
  // ==========================================

  /**
   * Get all novels (basic info only)
   */
  async getAllNovels() {
    return this.novels.getAllNovels();
  }

  /**
   * Create a new novel
   */
  async createNovel(data: CreateNovelData) {
    return this.novels.createNovel(data);
  }

  /**
   * Update a novel
   */
  async updateNovel(id: string, data: Partial<CreateNovelData>) {
    return this.novels.updateNovel(id, data);
  }

  /**
   * Delete a novel (cascades to all content)
   */
  async deleteNovel(id: string) {
    return this.novels.deleteNovel(id);
  }

  /**
   * Import structure into existing novel
   */
  async importStructure(novelId: string, structure: ImportStructureData) {
    return this.novels.importStructure(novelId, structure);
  }

  /**
   * Clear all structure from a novel (acts, chapters, scenes)
   */
  async clearNovelStructure(novelId: string): Promise<void> {
    return this.novels.clearNovelStructure(novelId);
  }

  /**
   * @deprecated Use clearNovelStructure instead
   */
  async deleteManuscriptStructure(novelId: string) {
    return this.novels.deleteManuscriptStructure(novelId);
  }

  /**
   * Recalculate novel word count from a scene change
   */
  async recalculateNovelWordCount(sceneId: string) {
    return this.novels.recalculateNovelWordCountFromScene(sceneId);
  }

  // ==========================================
  // SCENE OPERATIONS
  // ==========================================

  /**
   * Update scene content and metadata (triggers word count recalculation)
   */
  async updateScene(
    sceneId: string,
    content: string,
    metadata?: UpdateSceneMetadata
  ) {
    return this.scenes.updateScene(sceneId, content, metadata);
  }

  /**
   * Update scene content and metadata (alias for clarity)
   */
  async updateSceneContent(
    sceneId: string,
    content: string,
    metadata?: UpdateSceneMetadata
  ) {
    return this.scenes.updateScene(sceneId, content, metadata);
  }

  /**
   * Update scene metadata only (no content/word count changes)
   */
  async updateSceneMetadata(sceneId: string, data: UpdateSceneMetadata) {
    return this.scenes.updateSceneMetadata(sceneId, data);
  }

  /**
   * Create a new scene in a chapter
   */
  async createScene(
    chapterId: string,
    insertAfterSceneId?: string,
    title?: string
  ) {
    return this.scenes.createScene({
      chapterId,
      insertAfterSceneId,
      title,
    });
  }

  /**
   * Delete a scene
   */
  async deleteScene(sceneId: string) {
    return this.scenes.deleteScene(sceneId);
  }

  /**
   * Reorder scene for drag-and-drop
   */
  async reorderScene(
    sceneId: string,
    targetChapterId: string,
    newOrder: number
  ) {
    return this.scenes.reorderScene(sceneId, targetChapterId, newOrder);
  }

  // ==========================================
  // CHAPTER OPERATIONS
  // ==========================================

  /**
   * Update chapter metadata
   */
  async updateChapter(chapterId: string, data: UpdateChapterData) {
    return this.chapters.updateChapter(chapterId, data);
  }

  /**
   * Create a new chapter in an act
   */
  async createChapter(
    actId: string,
    insertAfterChapterId?: string,
    title?: string
  ) {
    return this.chapters.createChapter({
      actId,
      insertAfterChapterId,
      title,
    });
  }

  /**
   * Delete a chapter (cascades to scenes)
   */
  async deleteChapter(chapterId: string) {
    return this.chapters.deleteChapter(chapterId);
  }

  /**
   * Reorder chapter for drag-and-drop
   */
  async reorderChapter(chapterId: string, newOrder: number) {
    return this.chapters.reorderChapter(chapterId, newOrder);
  }

  // ==========================================
  // ACT OPERATIONS
  // ==========================================

  /**
   * Update act metadata
   */
  async updateAct(actId: string, data: UpdateActData) {
    return this.acts.updateAct(actId, data);
  }

  /**
   * Create a new act in a novel
   */
  async createAct(novelId: string, insertAfterActId?: string, title?: string) {
    return this.acts.createAct({
      novelId,
      insertAfterActId,
      title,
    });
  }

  /**
   * Delete an act (cascades to chapters and scenes)
   */
  async deleteAct(actId: string) {
    return this.acts.deleteAct(actId);
  }

  /**
   * Reorder act for drag-and-drop
   */
  async reorderAct(actId: string, newOrder: number) {
    return this.acts.reorderAct(actId, newOrder);
  }

  // ==========================================
  // COLLECTION GETTERS (Utility Methods)
  // ==========================================

  /**
   * Get all scenes in a chapter
   */
  async getScenesByChapter(chapterId: string) {
    return this.scenes.getScenesByChapter(chapterId);
  }

  /**
   * Get all chapters in an act
   */
  async getChaptersByAct(actId: string) {
    return this.chapters.getChaptersByAct(actId);
  }

  /**
   * Get all acts in a novel
   */
  async getActsByNovel(novelId: string) {
    return this.acts.getActsByNovel(novelId);
  }

  // ==========================================
  // ENHANCED METHODS & UTILITIES
  // ==========================================

  /**
   * Get detailed statistics for a novel
   */
  async getNovelStatistics(novelId: string) {
    const novel = await this.getNovelWithStructure(novelId);
    if (!novel) return null;

    const stats = {
      totalActs: novel.acts.length,
      totalChapters: novel.acts.reduce(
        (sum, act) => sum + act.chapters.length,
        0
      ),
      totalScenes: novel.acts.reduce(
        (sum, act) =>
          sum + act.chapters.reduce((chSum, ch) => chSum + ch.scenes.length, 0),
        0
      ),
      totalWords: novel.wordCount,
      averageWordsPerScene: 0,
      longestChapter: null as {
        id: string;
        title: string;
        actTitle: string;
        wordCount: number;
      } | null,
      shortestChapter: null as {
        id: string;
        title: string;
        actTitle: string;
        wordCount: number;
      } | null,
    };

    if (stats.totalScenes > 0) {
      stats.averageWordsPerScene = Math.round(
        stats.totalWords / stats.totalScenes
      );
    }

    // Find longest and shortest chapters by word count
    const allChapters = novel.acts.flatMap((act) =>
      act.chapters.map((ch) => ({
        ...ch,
        actTitle: act.title,
        wordCount: ch.scenes.reduce((sum, scene) => sum + scene.wordCount, 0),
      }))
    );

    if (allChapters.length > 0) {
      stats.longestChapter = allChapters.reduce((max, ch) =>
        ch.wordCount > max.wordCount ? ch : max
      );
      stats.shortestChapter = allChapters.reduce((min, ch) =>
        ch.wordCount < min.wordCount ? ch : min
      );
    }

    return stats;
  }

  /**
   * Batch update multiple scenes efficiently
   */
  async batchUpdateScenes(
    updates: Array<{
      sceneId: string;
      content?: string;
      metadata?: UpdateSceneMetadata;
    }>
  ) {
    const results = [];
    for (const update of updates) {
      if (update.content !== undefined) {
        const result = await this.scenes.updateScene(
          update.sceneId,
          update.content,
          update.metadata
        );
        results.push(result);
      } else if (update.metadata) {
        const result = await this.scenes.updateSceneMetadata(
          update.sceneId,
          update.metadata
        );
        results.push(result);
      }
    }
    return results;
  }

  /**
   * Validate structure integrity for a novel
   */
  async validateStructureIntegrity(novelId: string) {
    const novel = await this.getNovelWithStructure(novelId);
    if (!novel) return { valid: false, errors: ["Novel not found"] };

    const errors: string[] = [];
    const warnings: string[] = [];

    // Check act ordering
    novel.acts.forEach((act, index) => {
      const expectedOrder = index + 1;
      if (act.order !== expectedOrder) {
        errors.push(
          `Act "${act.title}" has order ${act.order}, expected ${expectedOrder}`
        );
      }

      // Check chapter ordering within act
      act.chapters.forEach((chapter, chIndex) => {
        const expectedChOrder = chIndex + 1;
        if (chapter.order !== expectedChOrder) {
          errors.push(
            `Chapter "${chapter.title}" in act "${act.title}" has order ${chapter.order}, expected ${expectedChOrder}`
          );
        }

        // Check scene ordering within chapter
        chapter.scenes.forEach((scene, scIndex) => {
          const expectedScOrder = scIndex + 1;
          if (scene.order !== expectedScOrder) {
            errors.push(
              `Scene "${scene.title}" in chapter "${chapter.title}" has order ${scene.order}, expected ${expectedScOrder}`
            );
          }

          // Check for empty scenes
          if (scene.wordCount === 0 && scene.content.trim() === "") {
            warnings.push(
              `Scene "${scene.title}" in chapter "${chapter.title}" is empty`
            );
          }
        });

        // Warn about chapters with no scenes
        if (chapter.scenes.length === 0) {
          warnings.push(
            `Chapter "${chapter.title}" in act "${act.title}" has no scenes`
          );
        }
      });

      // Warn about acts with no chapters
      if (act.chapters.length === 0) {
        warnings.push(`Act "${act.title}" has no chapters`);
      }
    });

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      statistics: await this.getNovelStatistics(novelId),
    };
  }

  /**
   * Auto-fix structure ordering issues
   */
  async autoFixStructureOrdering(novelId: string) {
    const novel = await this.getNovelWithStructure(novelId);
    if (!novel) throw new Error("Novel not found");

    let fixedCount = 0;

    // Fix act ordering
    for (let i = 0; i < novel.acts.length; i++) {
      const act = novel.acts[i];
      const expectedOrder = i + 1;
      if (act.order !== expectedOrder) {
        await this.acts.reorderAct(act.id, expectedOrder);
        fixedCount++;
      }

      // Fix chapter ordering within act
      for (let j = 0; j < act.chapters.length; j++) {
        const chapter = act.chapters[j];
        const expectedChOrder = j + 1;
        if (chapter.order !== expectedChOrder) {
          await this.chapters.reorderChapter(chapter.id, expectedChOrder);
          fixedCount++;
        }

        // Fix scene ordering within chapter
        for (let k = 0; k < chapter.scenes.length; k++) {
          const scene = chapter.scenes[k];
          const expectedScOrder = k + 1;
          if (scene.order !== expectedScOrder) {
            await this.scenes.reorderScene(
              scene.id,
              chapter.id,
              expectedScOrder
            );
            fixedCount++;
          }
        }
      }
    }

    // Recalculate word count
    await this.novels.recalculateNovelWordCount(novelId);

    return {
      success: true,
      fixedCount,
      message: `Fixed ${fixedCount} ordering issues`,
    };
  }

  /**
   * Clone/duplicate a novel structure (without content)
   */
  async cloneNovelStructure(
    sourceNovelId: string,
    newTitle: string,
    newDescription: string
  ) {
    const sourceNovel = await this.getNovelWithStructure(sourceNovelId);
    if (!sourceNovel) throw new Error("Source novel not found");

    // Create new novel
    const newNovel = await this.createNovel({
      title: newTitle,
      description: newDescription,
    });

    // Clone structure
    for (const act of sourceNovel.acts) {
      const newAct = await this.createAct(newNovel.id, undefined, act.title);

      // Remove the auto-created chapter since we'll create our own
      const autoChapter = newAct.chapters[0];
      if (autoChapter) {
        await this.deleteChapter(autoChapter.id);
      }

      for (const chapter of act.chapters) {
        const newChapter = await this.createChapter(
          newAct.id,
          undefined,
          chapter.title
        );

        // Remove the auto-created scene since we'll create our own
        const autoScene = newChapter.scenes[0];
        if (autoScene) {
          await this.deleteScene(autoScene.id);
        }

        for (const scene of chapter.scenes) {
          await this.createScene(newChapter.id, undefined, scene.title);
        }
      }
    }

    return await this.getNovelWithStructure(newNovel.id);
  }
}

// Export singleton instance for backward compatibility
export const novelService = new NovelServiceAggregator();

// Export individual services for direct access if needed
export { NovelService } from "./novel-service";
export { SceneService } from "./scene-service";
export { ChapterService } from "./chapter-service";
export { ActService } from "./act-service";
