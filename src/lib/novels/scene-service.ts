// src/lib/novels/scene-service.ts
// Scene operations including create, update, delete, and reorder (drag-and-drop)

import { prisma } from "@/lib/prisma";
import { Scene, UpdateSceneMetadata, CreateSceneOptions } from "./types";
import { calculateWordCount } from "./utils/word-count";
import {
  closeOrderGaps,
  makeOrderSpace,
  getNextOrder,
} from "./utils/order-management";

export class SceneService {
  /**
   * Update scene content and/or metadata
   */
  async updateScene(
    sceneId: string,
    content: string,
    metadata?: UpdateSceneMetadata
  ): Promise<Scene> {
    try {
      // Calculate word count from content
      const wordCount = calculateWordCount(content);

      // Build update data
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
        Object.assign(updateData, metadata);
      }

      const scene = await prisma.scene.update({
        where: { id: sceneId },
        data: updateData,
      });

      // Update novel's total word count
      await this.recalculateNovelWordCount(sceneId);

      return scene;
    } catch (error) {
      console.error("Error updating scene:", error);
      throw new Error("Failed to update scene");
    }
  }

  /**
   * Update scene metadata only (without content/word count changes)
   */
  async updateSceneMetadata(
    sceneId: string,
    data: UpdateSceneMetadata
  ): Promise<Scene> {
    try {
      const updatedScene = await prisma.scene.update({
        where: { id: sceneId },
        data: {
          ...data,
          updatedAt: new Date(),
        },
      });

      return updatedScene;
    } catch (error) {
      console.error("Error updating scene metadata:", error);
      throw new Error("Failed to update scene metadata");
    }
  }

  /**
   * Create a new scene in a chapter
   */
  async createScene(options: CreateSceneOptions): Promise<Scene> {
    try {
      return await prisma.$transaction(async (tx) => {
        // Verify chapter exists
        const chapter = await tx.chapter.findUnique({
          where: { id: options.chapterId },
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
        let newOrder = 1;

        if (options.insertAfterSceneId) {
          // Insert after specific scene
          const afterScene = chapter.scenes.find(
            (s) => s.id === options.insertAfterSceneId
          );
          if (afterScene) {
            newOrder = afterScene.order + 1;

            // Shift all scenes after this position
            await tx.scene.updateMany({
              where: {
                chapterId: options.chapterId,
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

        // Generate title
        const title = options.title || `Scene ${newOrder}`;

        // Create the new scene
        const newScene = await tx.scene.create({
          data: {
            title,
            content: "", // Empty content initially
            wordCount: 0,
            order: newOrder,
            chapterId: options.chapterId,
            status: "draft",
            povCharacter: null,
            sceneType: "",
            notes: "",
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
   * Delete a specific scene
   */
  async deleteScene(sceneId: string): Promise<void> {
    try {
      await prisma.$transaction(async (tx) => {
        // Get the scene to find the chapter, act, and novel IDs
        const scene = await tx.scene.findUnique({
          where: { id: sceneId },
          include: {
            chapter: {
              include: {
                act: true,
              },
            },
          },
        });

        if (!scene) {
          throw new Error("Scene not found");
        }

        const deletedOrder = scene.order;
        const chapterId = scene.chapterId;

        // Delete the scene
        await tx.scene.delete({
          where: { id: sceneId },
        });

        // Get remaining scenes in the chapter
        const remainingScenes = await tx.scene.findMany({
          where: { chapterId },
          orderBy: { order: "asc" },
        });

        // Close gaps in the order sequence
        await closeOrderGaps(
          remainingScenes,
          deletedOrder,
          async (id: string, order: number) => {
            await tx.scene.update({
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
                novelId: scene.chapter.act.novelId,
              },
            },
          },
          _sum: {
            wordCount: true,
          },
        });

        const totalWordCount = result._sum.wordCount || 0;

        await tx.novel.update({
          where: { id: scene.chapter.act.novelId },
          data: { wordCount: totalWordCount },
        });
      });
    } catch (error) {
      console.error("Error deleting scene:", error);
      throw new Error("Failed to delete scene");
    }
  }

  /**
   * Reorder a scene within or between chapters (DRAG-AND-DROP)
   * This is the key method your DraggableManuscriptTree calls
   */
  async reorderScene(
    sceneId: string,
    targetChapterId: string,
    newOrder: number
  ): Promise<Scene> {
    try {
      console.log("🔄 Starting scene reorder transaction:", {
        sceneId,
        targetChapterId,
        newOrder,
      });

      return await prisma.$transaction(async (tx) => {
        // Get the scene to move with its current chapter relationship
        const sceneToMove = await tx.scene.findUnique({
          where: { id: sceneId },
        });

        if (!sceneToMove) {
          throw new Error("Scene not found");
        }

        const sourceChapterId = sceneToMove.chapterId;
        const oldOrder = sceneToMove.order;

        console.log("📊 Scene move details:", {
          sourceChapter: sourceChapterId,
          targetChapter: targetChapterId,
          oldOrder,
          newOrder,
          crossChapter: sourceChapterId !== targetChapterId,
        });

        // Case 1: Moving to a different chapter
        if (sourceChapterId !== targetChapterId) {
          console.log("🔀 Cross-chapter move");

          // Verify target chapter exists
          const targetChapter = await tx.chapter.findUnique({
            where: { id: targetChapterId },
            include: { scenes: { orderBy: { order: "asc" } } },
          });

          if (!targetChapter) {
            throw new Error("Target chapter not found");
          }

          // Step 1: Remove from source chapter (close gap)
          await tx.scene.updateMany({
            where: {
              chapterId: sourceChapterId,
              order: { gt: oldOrder },
            },
            data: {
              order: { decrement: 1 },
            },
          });

          // Step 2: Make space in target chapter
          await tx.scene.updateMany({
            where: {
              chapterId: targetChapterId,
              order: { gte: newOrder },
            },
            data: {
              order: { increment: 1 },
            },
          });

          // Step 3: Move the scene
          const updatedScene = await tx.scene.update({
            where: { id: sceneId },
            data: {
              chapterId: targetChapterId,
              order: newOrder,
              updatedAt: new Date(),
            },
          });

          console.log("✅ Cross-chapter move completed");
          return updatedScene;
        }

        // Case 2: Reordering within the same chapter
        console.log("🔄 Same-chapter reorder");

        if (oldOrder === newOrder) {
          console.log("⚡ No change needed - same position");
          return sceneToMove;
        }

        if (oldOrder < newOrder) {
          // Moving down: shift scenes between oldOrder+1 and newOrder down by 1
          await tx.scene.updateMany({
            where: {
              chapterId: sourceChapterId,
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
          // Moving up: shift scenes between newOrder and oldOrder-1 up by 1
          await tx.scene.updateMany({
            where: {
              chapterId: sourceChapterId,
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

        // Update the moved scene
        const updatedScene = await tx.scene.update({
          where: { id: sceneId },
          data: {
            order: newOrder,
            updatedAt: new Date(),
          },
        });

        console.log("✅ Same-chapter reorder completed");
        return updatedScene;
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
   * Private helper: Recalculate novel word count from scene ID
   */
  private async recalculateNovelWordCount(sceneId: string): Promise<void> {
    try {
      // Get the novel ID through the scene's chapter and act
      const sceneWithRelations = await prisma.scene.findUnique({
        where: { id: sceneId },
        include: {
          chapter: {
            include: {
              act: true,
            },
          },
        },
      });

      if (!sceneWithRelations) return;

      const novelId = sceneWithRelations.chapter.act.novelId;

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
    } catch (error) {
      console.error("Error recalculating word count:", error);
    }
  }
}
