// src/lib/novels/chapter-service.ts
// Chapter operations including create, update, delete, and reorder

import { prisma } from "@/lib/prisma";
import { Chapter, UpdateChapterData, CreateChapterOptions } from "./types";
import { closeOrderGaps, getNextOrder } from "./utils/order-management";

export class ChapterService {
  /**
   * Update chapter metadata
   */
  async updateChapter(
    chapterId: string,
    data: UpdateChapterData
  ): Promise<Chapter> {
    try {
      const updatedChapter = await prisma.chapter.update({
        where: { id: chapterId },
        data: {
          ...data,
          updatedAt: new Date(),
        },
        include: {
          scenes: {
            orderBy: { order: "asc" },
          },
        },
      });

      return updatedChapter;
    } catch (error) {
      console.error("Error updating chapter:", error);
      throw new Error("Failed to update chapter");
    }
  }

  /**
   * Create a new chapter in an act
   */
  async createChapter(options: CreateChapterOptions): Promise<Chapter> {
    try {
      return await prisma.$transaction(async (tx) => {
        // Verify act exists
        const act = await tx.act.findUnique({
          where: { id: options.actId },
          include: {
            chapters: {
              orderBy: { order: "asc" },
            },
          },
        });

        if (!act) {
          throw new Error("Act not found");
        }

        // Determine the order for the new chapter
        let newOrder = 1;

        if (options.insertAfterChapterId) {
          // Insert after specific chapter
          const afterChapter = act.chapters.find(
            (c) => c.id === options.insertAfterChapterId
          );
          if (afterChapter) {
            newOrder = afterChapter.order + 1;

            // Shift all chapters after this position
            await tx.chapter.updateMany({
              where: {
                actId: options.actId,
                order: {
                  gte: newOrder,
                },
              },
              data: {
                order: {
                  increment: 1,
                },
              },
            });
          }
        } else {
          // Add at the end
          newOrder = getNextOrder(act.chapters);
        }

        // Generate default title if not provided
        const chapterTitle = options.title || `Chapter ${newOrder}`;

        // Create the new chapter
        const newChapter = await tx.chapter.create({
          data: {
            title: chapterTitle,
            order: newOrder,
            actId: options.actId,
          },
          include: {
            scenes: {
              orderBy: { order: "asc" },
            },
          },
        });

        // Automatically create Scene 1 for the new chapter
        await tx.scene.create({
          data: {
            title: "Scene 1",
            content: "", // Empty content initially
            wordCount: 0,
            order: 1, // First scene
            chapterId: newChapter.id,
            status: "draft",
            povCharacter: null,
            sceneType: "",
            notes: "",
          },
        });

        // Return the chapter with the newly created scene
        const chapterWithScene = await tx.chapter.findUnique({
          where: { id: newChapter.id },
          include: {
            scenes: {
              orderBy: { order: "asc" },
            },
          },
        });

        return chapterWithScene!;
      });
    } catch (error) {
      console.error("Error creating chapter:", error);
      throw new Error("Failed to create chapter");
    }
  }

  /**
   * Delete a specific chapter and all its scenes
   */
  async deleteChapter(chapterId: string): Promise<void> {
    try {
      await prisma.$transaction(async (tx) => {
        // Get the chapter to find the act and novel IDs
        const chapter = await tx.chapter.findUnique({
          where: { id: chapterId },
          include: {
            act: true,
            scenes: true,
          },
        });

        if (!chapter) {
          throw new Error("Chapter not found");
        }

        const deletedOrder = chapter.order;
        const actId = chapter.actId;

        // Delete all scenes in this chapter
        await tx.scene.deleteMany({
          where: { chapterId: chapterId },
        });

        // Delete the chapter
        await tx.chapter.delete({
          where: { id: chapterId },
        });

        // Get remaining chapters in the act
        const remainingChapters = await tx.chapter.findMany({
          where: { actId },
          orderBy: { order: "asc" },
        });

        // Close gaps in the order sequence
        await closeOrderGaps(
          remainingChapters,
          deletedOrder,
          async (id: string, order: number) => {
            await tx.chapter.update({
              where: { id },
              data: { order, updatedAt: new Date() },
            });
          }
        );

        // Recalculate novel word count
        const result = await tx.scene.aggregate({
          where: {
            chapter: {
              act: {
                novelId: chapter.act.novelId,
              },
            },
          },
          _sum: {
            wordCount: true,
          },
        });

        const totalWordCount = result._sum.wordCount || 0;

        await tx.novel.update({
          where: { id: chapter.act.novelId },
          data: { wordCount: totalWordCount },
        });
      });
    } catch (error) {
      console.error("Error deleting chapter:", error);
      throw new Error("Failed to delete chapter");
    }
  }

  /**
   * Reorder a chapter within the same act (DRAG-AND-DROP)
   */
  async reorderChapter(chapterId: string, newOrder: number): Promise<Chapter> {
    try {
      console.log("🔄 Starting chapter reorder transaction:", {
        chapterId,
        newOrder,
      });

      const result = await prisma.$transaction(async (tx) => {
        // Get the chapter to move with its current act relationship
        const chapterToMove = await tx.chapter.findUnique({
          where: { id: chapterId },
        });

        if (!chapterToMove) {
          throw new Error("Chapter not found");
        }

        const actId = chapterToMove.actId;
        const oldOrder = chapterToMove.order;

        console.log("📊 Chapter move details:", {
          actId,
          oldOrder,
          newOrder,
        });

        if (oldOrder === newOrder) {
          console.log("⚡ No change needed - same position");
          // Still need to return with scenes included
          return await tx.chapter.findUnique({
            where: { id: chapterId },
            include: {
              scenes: {
                orderBy: { order: "asc" },
              },
            },
          });
        }

        if (oldOrder < newOrder) {
          // Moving down: shift chapters between oldOrder+1 and newOrder down by 1
          await tx.chapter.updateMany({
            where: {
              actId: actId,
              order: {
                gt: oldOrder,
                lte: newOrder,
              },
            },
            data: {
              order: { decrement: 1 },
            },
          });
        } else {
          // Moving up: shift chapters between newOrder and oldOrder-1 up by 1
          await tx.chapter.updateMany({
            where: {
              actId: actId,
              order: {
                gte: newOrder,
                lt: oldOrder,
              },
            },
            data: {
              order: { increment: 1 },
            },
          });
        }

        // Update the moved chapter and include scenes to match interface
        return await tx.chapter.update({
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
      });

      if (!result) {
        throw new Error("Failed to reorder chapter");
      }

      console.log("✅ Chapter reorder completed");
      return result;
    } catch (error) {
      console.error("❌ Chapter reorder failed:", error);
      throw new Error(
        `Failed to reorder chapter: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Get chapter by ID
   */
  async getChapterById(chapterId: string): Promise<Chapter | null> {
    try {
      const chapter = await prisma.chapter.findUnique({
        where: { id: chapterId },
        include: {
          scenes: {
            orderBy: { order: "asc" },
          },
        },
      });
      return chapter;
    } catch (error) {
      console.error("Error fetching chapter:", error);
      throw new Error("Failed to fetch chapter");
    }
  }

  /**
   * Get all chapters in an act
   */
  async getChaptersByAct(actId: string): Promise<Chapter[]> {
    try {
      const chapters = await prisma.chapter.findMany({
        where: { actId },
        orderBy: { order: "asc" },
        include: {
          scenes: {
            orderBy: { order: "asc" },
          },
        },
      });
      return chapters;
    } catch (error) {
      console.error("Error fetching chapters by act:", error);
      throw new Error("Failed to fetch chapters");
    }
  }

  /**
   * Move chapter to different act (cross-act reordering)
   */
  async moveChapterToAct(
    chapterId: string,
    targetActId: string,
    newOrder?: number
  ): Promise<Chapter> {
    try {
      return await prisma.$transaction(async (tx) => {
        // Get the chapter to move
        const chapterToMove = await tx.chapter.findUnique({
          where: { id: chapterId },
          include: { scenes: true },
        });

        if (!chapterToMove) {
          throw new Error("Chapter not found");
        }

        // Get target act to verify it exists
        const targetAct = await tx.act.findUnique({
          where: { id: targetActId },
          include: { chapters: { orderBy: { order: "asc" } } },
        });

        if (!targetAct) {
          throw new Error("Target act not found");
        }

        const sourceActId = chapterToMove.actId;
        const oldOrder = chapterToMove.order;

        // Determine new order if not specified
        const finalNewOrder = newOrder || getNextOrder(targetAct.chapters);

        // Step 1: Remove from source act (close gap)
        await tx.chapter.updateMany({
          where: {
            actId: sourceActId,
            order: { gt: oldOrder },
          },
          data: {
            order: { decrement: 1 },
          },
        });

        // Step 2: Make space in target act
        await tx.chapter.updateMany({
          where: {
            actId: targetActId,
            order: { gte: finalNewOrder },
          },
          data: {
            order: { increment: 1 },
          },
        });

        // Step 3: Move the chapter
        const movedChapter = await tx.chapter.update({
          where: { id: chapterId },
          data: {
            actId: targetActId,
            order: finalNewOrder,
            updatedAt: new Date(),
          },
          include: {
            scenes: {
              orderBy: { order: "asc" },
            },
          },
        });

        return movedChapter;
      });
    } catch (error) {
      console.error("Error moving chapter to act:", error);
      throw new Error("Failed to move chapter to act");
    }
  }
}
