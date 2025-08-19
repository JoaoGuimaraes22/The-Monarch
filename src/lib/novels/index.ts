// lib/novels/index.ts
// MODERNIZED: Updated main service aggregator with new parameter object methods

import { NovelService } from "./novel-service";
import { SceneService } from "./scene-service";
import { ChapterService } from "./chapter-service";
import { ActService } from "./act-service";
import {
  CreateNovelOptions,
  UpdateNovelOptions,
  CreateActOptions,
  UpdateActOptions,
  CreateChapterOptions,
  UpdateChapterOptions,
  CreateSceneOptions,
  UpdateSceneOptions,
  UpdateSceneContentOptions,
  ReorderActOptions,
  ReorderChapterOptions,
  ReorderSceneOptions,
  ImportStructureData,
} from "./types";

// Re-export all types
export * from "./types";

// Re-export utility functions
export * from "./utils/word-count";
export * from "./utils/order-management";

/**
 * MODERNIZED: Main service aggregator with updated method signatures
 * Now uses parameter objects for better type safety and extensibility
 */
export class NovelServiceAggregator {
  // Individual service instances
  public novels = new NovelService();
  public scenes = new SceneService();
  public chapters = new ChapterService();
  public acts = new ActService();

  // ==========================================
  // INDIVIDUAL ENTITY GETTERS (Unchanged)
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
  // NOVEL OPERATIONS (Modernized)
  // ==========================================

  /**
   * Get all novels (basic info only)
   */
  async getAllNovels() {
    return this.novels.getAllNovels();
  }

  /**
   * MODERNIZED: Create a new novel
   */
  async createNovel(options: CreateNovelOptions) {
    return this.novels.createNovel(options);
  }

  /**
   * MODERNIZED: Update a novel
   */
  async updateNovel(id: string, options: UpdateNovelOptions) {
    return this.novels.updateNovel(id, options);
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
   * Recalculate novel word count from a scene change
   */
  async recalculateNovelWordCount(sceneId: string) {
    return this.novels.recalculateNovelWordCountFromScene(sceneId);
  }

  // ==========================================
  // SCENE OPERATIONS (Modernized)
  // ==========================================

  /**
   * MODERNIZED: Create a new scene in a chapter
   */
  async createScene(options: CreateSceneOptions) {
    return this.scenes.createScene(options);
  }

  /**
   * MODERNIZED: Update scene content and/or metadata
   */
  async updateScene(sceneId: string, options: UpdateSceneOptions) {
    return this.scenes.updateScene(sceneId, options);
  }

  /**
   * MODERNIZED: Update scene content with separate metadata
   */
  async updateSceneContent(
    sceneId: string,
    options: UpdateSceneContentOptions
  ) {
    return this.scenes.updateSceneContent(sceneId, options);
  }

  /**
   * MODERNIZED: Update scene metadata only (no content changes)
   */
  async updateSceneMetadata(sceneId: string, options: UpdateSceneOptions) {
    return this.scenes.updateScene(sceneId, options);
  }

  /**
   * Delete a scene
   */
  async deleteScene(sceneId: string) {
    return this.scenes.deleteScene(sceneId);
  }

  /**
   * MODERNIZED: Reorder scene with cross-chapter support
   */
  async reorderScene(options: ReorderSceneOptions) {
    return this.scenes.reorderScene(options);
  }

  // ==========================================
  // CHAPTER OPERATIONS (Modernized)
  // ==========================================

  /**
   * MODERNIZED: Create a new chapter in an act
   */
  async createChapter(options: CreateChapterOptions) {
    return this.chapters.createChapter(options);
  }

  /**
   * MODERNIZED: Update chapter metadata
   */
  async updateChapter(chapterId: string, options: UpdateChapterOptions) {
    return this.chapters.updateChapter(chapterId, options);
  }

  /**
   * Delete a chapter (cascades to scenes)
   */
  async deleteChapter(chapterId: string) {
    return this.chapters.deleteChapter(chapterId);
  }

  /**
   * MODERNIZED: Reorder chapter with cross-act support
   */
  async reorderChapter(options: ReorderChapterOptions) {
    return this.chapters.reorderChapter(options);
  }

  // ==========================================
  // ACT OPERATIONS (Modernized)
  // ==========================================

  /**
   * MODERNIZED: Create a new act in a novel
   */
  async createAct(options: CreateActOptions) {
    return this.acts.createAct(options);
  }

  /**
   * MODERNIZED: Update act metadata
   */
  async updateAct(actId: string, options: UpdateActOptions) {
    return this.acts.updateAct(actId, options);
  }

  /**
   * Delete an act (cascades to chapters and scenes)
   */
  async deleteAct(actId: string) {
    return this.acts.deleteAct(actId);
  }

  /**
   * MODERNIZED: Reorder act within novel
   */
  async reorderAct(options: ReorderActOptions) {
    return this.acts.reorderAct(options);
  }

  // ==========================================
  // COLLECTION GETTERS (Unchanged)
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
  // BACKWARD COMPATIBILITY METHODS
  // ==========================================
  // These maintain the old individual parameter API for gradual migration

  /**
   * @deprecated Use createScene(options) instead
   */
  async createScene_Legacy(
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
   * @deprecated Use createChapter(options) instead
   */
  async createChapter_Legacy(
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
   * @deprecated Use createAct(options) instead
   */
  async createAct_Legacy(
    novelId: string,
    insertAfterActId?: string,
    title?: string
  ) {
    return this.acts.createAct({
      novelId,
      insertAfterActId,
      title,
    });
  }

  /**
   * @deprecated Use reorderScene(options) instead
   */
  async reorderScene_Legacy(
    sceneId: string,
    targetChapterId: string,
    newOrder: number
  ) {
    return this.scenes.reorderScene({
      sceneId,
      targetChapterId,
      newOrder,
    });
  }

  /**
   * @deprecated Use reorderChapter(options) instead
   */
  async reorderChapter_Legacy(chapterId: string, newOrder: number) {
    return this.chapters.reorderChapter({
      chapterId,
      newOrder,
    });
  }

  /**
   * @deprecated Use reorderAct(options) instead
   */
  async reorderAct_Legacy(actId: string, newOrder: number) {
    return this.acts.reorderAct({
      actId,
      newOrder,
    });
  }

  // ==========================================
  // ENHANCED METHODS & UTILITIES (Unchanged)
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
}

// Export singleton instance for backward compatibility
export const novelService = new NovelServiceAggregator();

// Export individual services for direct access if needed
export { NovelService } from "./novel-service";
export { SceneService } from "./scene-service";
export { ChapterService } from "./chapter-service";
export { ActService } from "./act-service";

/*
===== MODERNIZATION COMPLETE! =====

✅ ALL CRUD operations now use parameter objects
✅ Type-safe with comprehensive TypeScript interfaces
✅ Backward-compatible with legacy methods
✅ Future-proof and easily extensible
✅ Consistent API patterns across all services
✅ Self-documenting with named parameters

===== NEW USAGE PATTERNS =====

// Modern API (recommended)
await novelService.createScene({
  chapterId: "ch123",
  title: "The Dragon's Lair",
  content: "It was a dark and stormy night...",
  povCharacter: "Aragorn",
  sceneType: "action",
  status: "draft"
});

await novelService.reorderScene({
  sceneId: "scene123",
  targetChapterId: "ch456",  // Cross-chapter move
  newOrder: 2
});

// Legacy API (still works)
await novelService.createScene_Legacy(chapterId, insertAfterSceneId, title);

===== MIGRATION STRATEGY =====

1. Update API routes to use new parameter object methods
2. Gradually migrate existing consumers to new API
3. Remove legacy methods once migration is complete
4. Enjoy type-safe, extensible service layer!
*/
