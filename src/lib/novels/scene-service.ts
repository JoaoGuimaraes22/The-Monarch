// lib/novels/scene-service.ts
// MODERNIZED: Updated to use parameter objects instead of individual parameters

import { prisma } from "@/lib/prisma";
import {
  Scene,
  CreateSceneOptions,
  UpdateSceneOptions,
  UpdateSceneContentOptions,
  ReorderSceneOptions,
} from "./types";
import { calculateWordCount } from "./utils/word-count";
import {
  closeOrderGaps,
  makeOrderSpace,
  getNextOrder,
} from "./utils/order-management";

export class SceneService {
  /**
   * MODERNIZED: Create a new scene in a chapter
   */
  async createScene(options: CreateSceneOptions): Promise<Scene> {
    try {
      return await prisma.$transaction(async (tx) => {
        // Destructure options object
        const {
          chapterId,
          title,
          content = "",
          insertAfterSceneId,
          order: manualOrder,
          povCharacter = null,
          sceneType = "",
          notes = "",
          status = "draft",
        } = options;

        // Verify chapter exists
        const chapter = await tx.chapter.findUnique({
          where: { id: chapterId },
          include: {
            scenes: {
              orderBy: { order: "asc" },
            },
            act: true, // Need this for word count recalculation
          },
        });

        if (!chapter) {
          throw new Error("Chapter not found");
        }

        // Determine the order for the new scene
        let newOrder = manualOrder || 1;

        if (!manualOrder) {
          if (insertAfterSceneId) {
            // Insert after specific scene
            const afterScene = chapter.scenes.find(
              (s) => s.id === insertAfterSceneId
            );
            if (afterScene) {
              newOrder = afterScene.order + 1;

              // Shift all scenes after this position
              await tx.scene.updateMany({
                where: {
                  chapterId: chapterId,
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
            newOrder = getNextOrder(chapter.scenes);
          }
        }

        // Generate default title if not provided
        const sceneTitle = title || `Scene ${newOrder}`;

        // Calculate word count from content
        const wordCount = calculateWordCount(content);

        // Create the new scene with all options
        const newScene = await tx.scene.create({
          data: {
            title: sceneTitle,
            content,
            wordCount,
            order: newOrder,
            chapterId: chapterId,
            povCharacter,
            sceneType,
            notes,
            status,
          },
        });

        return newScene;
      });
    } catch (error) {
      console.error("Error creating scene:", error);
      throw new Error("Failed to create scene");
    }
  }

  /**
   * MODERNIZED: Update scene content and/or metadata
   */
  async updateScene(
    sceneId: string,
    options: UpdateSceneOptions
  ): Promise<Scene> {
    try {
      const { title, content, povCharacter, sceneType, notes, status } =
        options;

      // Build update data with proper typing
      const updateData: {
        updatedAt: Date;
        title?: string;
        content?: string;
        wordCount?: number;
        povCharacter?: string | null;
        sceneType?: string;
        notes?: string;
        status?: string;
      } = {
        updatedAt: new Date(),
      };

      // Add provided fields
      if (title !== undefined) updateData.title = title;
      if (content !== undefined) {
        updateData.content = content;
        updateData.wordCount = calculateWordCount(content);
      }
      if (povCharacter !== undefined) updateData.povCharacter = povCharacter;
      if (sceneType !== undefined) updateData.sceneType = sceneType;
      if (notes !== undefined) updateData.notes = notes;
      if (status !== undefined) updateData.status = status;

      const scene = await prisma.scene.update({
        where: { id: sceneId },
        data: updateData,
      });

      // Update novel's total word count if content changed
      if (content !== undefined) {
        await this.recalculateNovelWordCount(sceneId);
      }

      return scene;
    } catch (error) {
      console.error("Error updating scene:", error);
      throw new Error("Failed to update scene");
    }
  }

  /**
   * MODERNIZED: Update scene content with separate metadata
   */
  async updateSceneContent(
    sceneId: string,
    options: UpdateSceneContentOptions
  ): Promise<Scene> {
    try {
      const { content, metadata } = options;

      // Calculate word count from content
      const wordCount = calculateWordCount(content);

      // Build update data with proper typing
      const updateData: {
        content: string;
        wordCount: number;
        updatedAt: Date;
        title?: string;
        povCharacter?: string | null;
        sceneType?: string;
        notes?: string;
        status?: string;
      } = {
        content,
        wordCount,
        updatedAt: new Date(),
      };

      // Add metadata if provided
      if (metadata) {
        if (metadata.title !== undefined) updateData.title = metadata.title;
        if (metadata.povCharacter !== undefined)
          updateData.povCharacter = metadata.povCharacter;
        if (metadata.sceneType !== undefined)
          updateData.sceneType = metadata.sceneType;
        if (metadata.notes !== undefined) updateData.notes = metadata.notes;
        if (metadata.status !== undefined) updateData.status = metadata.status;
      }

      const scene = await prisma.scene.update({
        where: { id: sceneId },
        data: updateData,
      });

      // Update novel's total word count
      await this.recalculateNovelWordCount(sceneId);

      return scene;
    } catch (error) {
      console.error("Error updating scene content:", error);
      throw new Error("Failed to update scene content");
    }
  }

  /**
   * MODERNIZED: Reorder scene with cross-chapter support
   */
  async reorderScene(options: ReorderSceneOptions): Promise<Scene> {
    try {
      const { sceneId, newOrder, targetChapterId } = options;

      console.log("🔄 Starting scene reorder:", options);

      return await prisma.$transaction(async (tx) => {
        // Get the scene to move
        const sceneToMove = await tx.scene.findUnique({
          where: { id: sceneId },
        });

        if (!sceneToMove) {
          throw new Error("Scene not found");
        }

        const sourceChapterId = sceneToMove.chapterId;
        const actualTargetChapterId = targetChapterId || sourceChapterId;
        const oldOrder = sceneToMove.order;

        console.log("📊 Scene move details:", {
          sceneId,
          from: `${sourceChapterId}:${oldOrder}`,
          to: `${actualTargetChapterId}:${newOrder}`,
          crossChapter: sourceChapterId !== actualTargetChapterId,
        });

        if (
          sourceChapterId === actualTargetChapterId &&
          oldOrder === newOrder
        ) {
          console.log("⚡ No change needed - same position");
          return sceneToMove;
        }

        // Handle cross-chapter move
        if (sourceChapterId !== actualTargetChapterId) {
          // Verify target chapter exists
          const targetChapter = await tx.chapter.findUnique({
            where: { id: actualTargetChapterId },
          });

          if (!targetChapter) {
            throw new Error("Target chapter not found");
          }

          // Remove gap in source chapter
          await tx.scene.updateMany({
            where: {
              chapterId: sourceChapterId,
              order: { gt: oldOrder },
            },
            data: { order: { decrement: 1 } },
          });

          // Make space in target chapter
          await tx.scene.updateMany({
            where: {
              chapterId: actualTargetChapterId,
              order: { gte: newOrder },
            },
            data: { order: { increment: 1 } },
          });

          // Move scene to new chapter
          return await tx.scene.update({
            where: { id: sceneId },
            data: {
              chapterId: actualTargetChapterId,
              order: newOrder,
              updatedAt: new Date(),
            },
          });
        } else {
          // Same chapter reordering
          if (oldOrder < newOrder) {
            // Moving down
            await tx.scene.updateMany({
              where: {
                chapterId: sourceChapterId,
                order: { gt: oldOrder, lte: newOrder },
              },
              data: { order: { decrement: 1 } },
            });
          } else {
            // Moving up
            await tx.scene.updateMany({
              where: {
                chapterId: sourceChapterId,
                order: { gte: newOrder, lt: oldOrder },
              },
              data: { order: { increment: 1 } },
            });
          }

          return await tx.scene.update({
            where: { id: sceneId },
            data: {
              order: newOrder,
              updatedAt: new Date(),
            },
          });
        }
      });
    } catch (error) {
      console.error("❌ Scene reorder failed:", error);
      throw new Error(
        `Failed to reorder scene: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Delete a scene
   */
  async deleteScene(sceneId: string): Promise<void> {
    try {
      await prisma.$transaction(async (tx) => {
        // Get scene info before deletion
        const scene = await tx.scene.findUnique({
          where: { id: sceneId },
          include: { chapter: { include: { act: true } } },
        });

        if (!scene) {
          throw new Error("Scene not found");
        }

        const chapterId = scene.chapterId;
        const novelId = scene.chapter.act.novelId;
        const sceneOrder = scene.order;

        // Delete the scene
        await tx.scene.delete({
          where: { id: sceneId },
        });

        // Close the gap in ordering
        await tx.scene.updateMany({
          where: {
            chapterId: chapterId,
            order: { gt: sceneOrder },
          },
          data: {
            order: { decrement: 1 },
          },
        });

        // Recalculate novel word count
        const result = await tx.scene.aggregate({
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

        await tx.novel.update({
          where: { id: novelId },
          data: { wordCount: totalWordCount },
        });
      });
    } catch (error) {
      console.error("Error deleting scene:", error);
      throw new Error("Failed to delete scene");
    }
  }

  /**
   * Get scene by ID
   */
  async getSceneById(sceneId: string): Promise<Scene | null> {
    try {
      const scene = await prisma.scene.findUnique({
        where: { id: sceneId },
      });
      return scene;
    } catch (error) {
      console.error("Error fetching scene:", error);
      throw new Error("Failed to fetch scene");
    }
  }

  /**
   * Get all scenes in a chapter
   */
  async getScenesByChapter(chapterId: string): Promise<Scene[]> {
    try {
      const scenes = await prisma.scene.findMany({
        where: { chapterId },
        orderBy: { order: "asc" },
      });
      return scenes;
    } catch (error) {
      console.error("Error fetching scenes by chapter:", error);
      throw new Error("Failed to fetch scenes");
    }
  }

  /**
   * Recalculate novel word count from scene change
   */
  private async recalculateNovelWordCount(sceneId: string): Promise<void> {
    try {
      // Get the scene's chapter and act to find the novel
      const scene = await prisma.scene.findUnique({
        where: { id: sceneId },
        include: {
          chapter: {
            include: {
              act: true,
            },
          },
        },
      });

      if (!scene) return;

      const novelId = scene.chapter.act.novelId;

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
  // These maintain the old API while transitioning

  /**
   * @deprecated Use createScene(options) instead
   */
  async createScene_Legacy(
    chapterId: string,
    insertAfterSceneId?: string,
    title?: string
  ): Promise<Scene> {
    return this.createScene({
      chapterId,
      insertAfterSceneId,
      title,
    });
  }

  /**
   * @deprecated Use updateScene(sceneId, options) instead
   */
  async updateSceneMetadata(
    sceneId: string,
    metadata: UpdateSceneOptions
  ): Promise<Scene> {
    return this.updateScene(sceneId, metadata);
  }

  /**
   * @deprecated Use reorderScene(options) instead
   */
  async reorderScene_Legacy(
    sceneId: string,
    targetChapterId: string,
    newOrder: number
  ): Promise<Scene> {
    return this.reorderScene({
      sceneId,
      targetChapterId,
      newOrder,
    });
  }
}

/*
===== MODERNIZATION SUMMARY =====

✅ ENHANCED: createScene now supports all scene properties at creation
✅ TYPE-SAFE: All methods use typed options objects
✅ FLEXIBLE: updateScene handles any combination of updates
✅ CROSS-CHAPTER: reorderScene supports moving between chapters
✅ BACKWARD-COMPATIBLE: Legacy methods maintain existing API
✅ COMPREHENSIVE: Full CRUD operations with proper error handling

Key improvements:
- Scene creation can set initial content, POV, type, status, notes
- Update methods are flexible and type-safe
- Reordering supports cross-chapter moves
- Word count recalculation is automatic
- Error handling is comprehensive
- Performance optimized with transactions
*/
