// src/lib/novels/chapter-service.ts
// ✅ ENHANCED: Chapter creation now automatically includes a default scene

import { prisma } from "@/lib/prisma";
import { Chapter, Scene } from "@prisma/client";
import {
  CreateChapterOptions,
  UpdateChapterOptions,
  ReorderChapterOptions,
} from "./types";

export class ChapterService {
  /**
   * ✅ ENHANCED: Create a chapter with automatic scene creation
   * Creates a chapter and automatically adds a default "Scene 1" to it
   */
  async createChapter(options: CreateChapterOptions): Promise<Chapter> {
    const { actId, title = "New Chapter", insertAfterChapterId } = options;

    return await prisma.$transaction(async (tx) => {
      // 1. Determine the order for the new chapter
      let order = 1;

      if (insertAfterChapterId) {
        const afterChapter = await tx.chapter.findUnique({
          where: { id: insertAfterChapterId },
        });

        if (afterChapter && afterChapter.actId === actId) {
          order = afterChapter.order + 1;

          // Shift existing chapters down
          await tx.chapter.updateMany({
            where: {
              actId,
              order: { gte: afterChapter.order + 1 },
            },
            data: {
              order: { increment: 1 },
            },
          });
        }
      } else {
        // Get the highest order in this act
        const lastChapter = await tx.chapter.findFirst({
          where: { actId },
          orderBy: { order: "desc" },
        });

        if (lastChapter) {
          order = lastChapter.order + 1;
        }
      }

      // 2. Create the chapter
      const chapter = await tx.chapter.create({
        data: {
          title,
          actId,
          order,
        },
        include: {
          scenes: true,
        },
      });

      // 3. ✅ NEW: Automatically create a default scene in the chapter
      const defaultScene = await tx.scene.create({
        data: {
          title: "Scene 1",
          content: "",
          chapterId: chapter.id,
          order: 1,
          wordCount: 0,
          status: "draft",
          sceneType: "",
          notes: "",
        },
      });

      // 4. Return chapter with the scene included
      return {
        ...chapter,
        scenes: [defaultScene],
      };
    });
  }

  /**
   * Get a chapter by ID with all its scenes
   */
  async getChapterById(chapterId: string): Promise<Chapter | null> {
    return await prisma.chapter.findUnique({
      where: { id: chapterId },
      include: {
        scenes: {
          orderBy: { order: "asc" },
        },
        act: true,
      },
    });
  }

  /**
   * Update a chapter's metadata
   */
  async updateChapter(
    chapterId: string,
    options: UpdateChapterOptions
  ): Promise<Chapter> {
    const { title } = options;

    const chapter = await prisma.chapter.update({
      where: { id: chapterId },
      data: {
        ...(title && { title }),
        updatedAt: new Date(),
      },
      include: {
        scenes: {
          orderBy: { order: "asc" },
        },
      },
    });

    return chapter;
  }

  /**
   * Delete a chapter and all its scenes
   */
  async deleteChapter(chapterId: string): Promise<void> {
    return await prisma.$transaction(async (tx) => {
      // Get chapter info before deletion
      const chapter = await tx.chapter.findUnique({
        where: { id: chapterId },
        include: { act: true },
      });

      if (!chapter) {
        throw new Error("Chapter not found");
      }

      // Delete the chapter (cascades to scenes due to schema)
      await tx.chapter.delete({
        where: { id: chapterId },
      });

      // Reorder remaining chapters in the act
      await tx.chapter.updateMany({
        where: {
          actId: chapter.actId,
          order: { gt: chapter.order },
        },
        data: {
          order: { decrement: 1 },
        },
      });

      // Recalculate novel word count
      await this.recalculateNovelWordCount(chapter.act.novelId);
    });
  }

  /**
   * Reorder a chapter within an act or move it to a different act
   */
  async reorderChapter(options: ReorderChapterOptions): Promise<Chapter> {
    const { chapterId, newOrder, targetActId } = options;

    return await prisma.$transaction(async (tx) => {
      // Get the current chapter
      const chapter = await tx.chapter.findUnique({
        where: { id: chapterId },
        include: { act: true },
      });

      if (!chapter) {
        throw new Error("Chapter not found");
      }

      const sourceActId = chapter.actId;
      const destinationActId = targetActId || sourceActId;
      const isMovingBetweenActs = sourceActId !== destinationActId;

      if (isMovingBetweenActs) {
        // Moving to a different act
        if (!targetActId) {
          throw new Error("Target act ID is required for cross-act moves");
        }

        // Verify target act exists
        const targetAct = await tx.act.findUnique({
          where: { id: targetActId },
        });

        if (!targetAct) {
          throw new Error("Target act not found");
        }

        // Remove from source act (close gaps)
        await tx.chapter.updateMany({
          where: {
            actId: sourceActId,
            order: { gt: chapter.order },
          },
          data: {
            order: { decrement: 1 },
          },
        });

        // Make space in destination act
        await tx.chapter.updateMany({
          where: {
            actId: destinationActId,
            order: { gte: newOrder },
          },
          data: {
            order: { increment: 1 },
          },
        });

        // Move the chapter
        const updatedChapter = await tx.chapter.update({
          where: { id: chapterId },
          data: {
            actId: destinationActId,
            order: newOrder,
            updatedAt: new Date(),
          },
          include: {
            scenes: {
              orderBy: { order: "asc" },
            },
          },
        });

        return updatedChapter;
      } else {
        // Reordering within the same act
        const currentOrder = chapter.order;

        if (currentOrder === newOrder) {
          return chapter; // No change needed
        }

        if (newOrder > currentOrder) {
          // Moving down: shift chapters up
          await tx.chapter.updateMany({
            where: {
              actId: sourceActId,
              order: {
                gt: currentOrder,
                lte: newOrder,
              },
            },
            data: {
              order: { decrement: 1 },
            },
          });
        } else {
          // Moving up: shift chapters down
          await tx.chapter.updateMany({
            where: {
              actId: sourceActId,
              order: {
                gte: newOrder,
                lt: currentOrder,
              },
            },
            data: {
              order: { increment: 1 },
            },
          });
        }

        // Update the chapter's order
        const updatedChapter = await tx.chapter.update({
          where: { id: chapterId },
          data: {
            order: newOrder,
            updatedAt: new Date(),
          },
          include: {
            scenes: {
              orderBy: { order: "asc" },
            },
          },
        });

        return updatedChapter;
      }
    });
  }

  /**
   * Recalculate and update the novel's total word count
   */
  private async recalculateNovelWordCount(novelId: string): Promise<void> {
    try {
      // Calculate total word count for the novel
      const result = await prisma.scene.aggregate({
        where: {
          chapter: {
            act: {
              novelId: novelId,
            },
          },
        },
        _sum: {
          wordCount: true,
        },
      });

      const totalWordCount = result._sum.wordCount || 0;

      // Update the novel's word count
      await prisma.novel.update({
        where: { id: novelId },
        data: { wordCount: totalWordCount },
      });

      console.log(`📊 Updated novel ${novelId} word count: ${totalWordCount}`);
    } catch (error) {
      console.error("Error recalculating novel word count:", error);
      // Don't throw here - this is a background operation
    }
  }

  // ===== BACKWARD COMPATIBILITY METHODS =====

  /**
   * @deprecated Use createChapter(options) instead
   */
  async createChapter_Legacy(
    actId: string,
    insertAfterChapterId?: string,
    title?: string
  ): Promise<Chapter> {
    return this.createChapter({
      actId,
      insertAfterChapterId,
      title,
    });
  }

  /**
   * @deprecated Use reorderChapter(options) instead
   */
  async reorderChapter_Legacy(
    chapterId: string,
    newOrder: number
  ): Promise<Chapter> {
    return this.reorderChapter({
      chapterId,
      newOrder,
    });
  }

  /**
   * Move chapter to different act (cross-act reordering)
   * @deprecated Use reorderChapter with targetActId instead
   */
  async moveChapterToAct(
    chapterId: string,
    targetActId: string,
    newOrder?: number
  ): Promise<Chapter> {
    return this.reorderChapter({
      chapterId,
      targetActId,
      newOrder: newOrder || 1,
    });
  }
}

/*
===== KEY ENHANCEMENT =====

✅ AUTOMATIC SCENE CREATION: Every new chapter now gets a "Scene 1" automatically
✅ TRANSACTION SAFETY: Chapter + scene creation is atomic
✅ PROPER ORDERING: Scene gets order: 1, chapter gets proper order in act
✅ DEFAULT VALUES: Scene created with sensible defaults (draft status, empty content)
✅ RETURN VALUE: Chapter returned with its scenes array populated

===== WHAT HAPPENS NOW =====

When createChapter() is called:
1. Creates the chapter with proper order
2. Automatically creates "Scene 1" in that chapter  
3. Returns chapter with scenes array containing the new scene
4. Frontend can immediately select the chapter and its first scene

===== BENEFITS =====

- ✅ Chapters always have content to display
- ✅ No empty chapter edge cases in UI
- ✅ Consistent user experience 
- ✅ Immediate content area population
- ✅ No additional API calls needed

===== BACKWARD COMPATIBILITY =====

- All existing code continues to work
- Legacy methods still supported
- Response format includes scenes array as expected
- No breaking changes to existing functionality
*/
